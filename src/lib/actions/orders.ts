"use server";

import { stripe } from "@/lib/stripe/client";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema/index";
import { eq, inArray } from "drizzle-orm";

function isUuid(val: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val);
}

export async function createOrder(stripeSessionId: string) {
  const existingPayments = await db.select().from(schema.payments).where(eq(schema.payments.transactionId, stripeSessionId));
  if (existingPayments.length > 0) {
    const p = existingPayments[0] as any;
    const orderRows = await db.select().from(schema.orders).where(eq(schema.orders.id, p.orderId));
    return orderRows[0] ?? null;
  }

  const session = await stripe.checkout.sessions.retrieve(stripeSessionId, { expand: ["line_items.data.price.product"] });
  if (!session) throw new Error("Stripe session not found");

  const metadata: any = session.metadata ?? {};
  const userId = metadata.userId ?? null;
  const guestToken = metadata.guestSession ?? null;

  // attempt to find cartId (same logic as checkout)
  let cartId: string | null = null;
  if (userId) {
    const cartsRes = await db.select().from(schema.carts).where(eq(schema.carts.userId, userId));
    if (cartsRes.length > 0) cartId = cartsRes[0].id;
  } else if (guestToken) {
    const guestRows = await db.select().from(schema.guests).where(eq((schema.guests as any).sessionToken, guestToken));
    if (guestRows.length > 0) {
      const guestId = guestRows[0].id;
      const cartsRes = await db.select().from(schema.carts).where(eq(schema.carts.guestId, guestId));
      if (cartsRes.length > 0) cartId = cartsRes[0].id;
    }
  }

  const itemsToInsert: { productVariantId: string; quantity: number; priceAtPurchase: number }[] = [];

  if (cartId) {
    const cartItemRows = await db.select().from(schema.cartItems).where(eq(schema.cartItems.cartId, cartId));
    for (const ci of cartItemRows) {
      const pvRows = await db.select().from(schema.productVariants).where(eq(schema.productVariants.id, ci.productVariantId));
      if (!pvRows || pvRows.length === 0) continue;
      const pv = pvRows[0] as any;
      const price = Number(pv.price ?? 0);
      itemsToInsert.push({
        productVariantId: ci.productVariantId,
        quantity: Number(ci.quantity),
        priceAtPurchase: price,
      });
    }
  } else {
    // fallback: use Stripe line items and try to map to productVariant UUID
    const stripeLineItems = (session.line_items?.data ?? []) as any[];
    for (const li of stripeLineItems) {
      const qty = Number(li.quantity ?? 1);
      const unitAmount = Number(li.price?.unit_amount ?? 0) / 100;

      // Prefer product metadata set at checkout time
      const pvFromMeta = (li.price?.product as any)?.metadata?.productVariantId ?? (li.price?.product as any)?.metadata?.productvariantid;
      let mappedVariantId: string | null = null;

      if (pvFromMeta && isUuid(pvFromMeta)) {
        mappedVariantId = pvFromMeta;
      } else {
        // try to find product by name and then its first variant
        const productName = li.description ?? (li.price?.product as any)?.name ?? null;
        if (productName) {
          const prodRows = await db.select().from((schema as any).products).where(eq((schema as any).products.name, productName));
          if (prodRows && prodRows.length > 0) {
            const pvRows = await db.select().from(schema.productVariants).where(eq(schema.productVariants.productId, prodRows[0].id));
            if (pvRows && pvRows.length > 0) {
              mappedVariantId = pvRows[0].id;
            }
          }
        }
      }

      // final fallback: take any existing variant id to ensure valid UUID for insert
      if (!mappedVariantId) {
        const anyPv = await db.select().from(schema.productVariants).limit(1);
        if (anyPv && anyPv.length > 0) mappedVariantId = anyPv[0].id;
      }

      if (!mappedVariantId) {
        throw new Error("Unable to map line item to product variant id (no variants exist)");
      }

      itemsToInsert.push({
        productVariantId: mappedVariantId,
        quantity: qty,
        priceAtPurchase: unitAmount,
      });
    }
  }

  if (itemsToInsert.length === 0) throw new Error("No order items found for session");

  const totalAmount = itemsToInsert.reduce((s, it) => s + it.priceAtPurchase * it.quantity, 0);

  const orderRow: any = {
    userId: userId ?? null,
    status: "paid",
    totalAmount: totalAmount.toFixed(2),
    createdAt: new Date(),
  };

  const insertedArr = await db.insert(schema.orders).values(orderRow).returning();
  const inserted = insertedArr[0];

  const orderItemsRows = itemsToInsert.map((it) => ({
    orderId: inserted.id,
    productVariantId: it.productVariantId,
    quantity: it.quantity,
    priceAtPurchase: it.priceAtPurchase.toFixed(2),
  }));

  if (orderItemsRows.length > 0) {
    await db.insert(schema.orderItems).values(orderItemsRows);
  }

  await db.insert(schema.payments).values({
    orderId: inserted.id,
    method: "stripe",
    status: "completed",
    paidAt: new Date(),
    transactionId: stripeSessionId,
  });

  // CLEAR CART: try to remove cart items for this user or guest (covers client-side fallback case)
  try {
    // collect cart ids for user or guest
    const cartIds: string[] = [];

    if (cartId) {
      cartIds.push(cartId);
    } else {
      if (userId) {
        const userCarts = await db.select().from(schema.carts).where(eq(schema.carts.userId, userId));
        for (const c of userCarts) cartIds.push(c.id);
      }
      if (guestToken) {
        const guestRows = await db.select().from(schema.guests).where(eq((schema.guests as any).sessionToken, guestToken));
        if (guestRows.length > 0) {
          const guestId = guestRows[0].id;
          const guestCarts = await db.select().from(schema.carts).where(eq(schema.carts.guestId, guestId));
          for (const c of guestCarts) cartIds.push(c.id);
        }
      }
    }

    if (cartIds.length > 0) {
      // delete cart items and optionally carts
      await db.delete(schema.cartItems).where(inArray(schema.cartItems.cartId, cartIds));
      await db.delete(schema.carts).where(inArray(schema.carts.id, cartIds));
    }
  } catch (clearErr) {
    console.warn("Failed to clear carts after order:", clearErr);
  }

  return inserted;
}

export async function getOrder(orderIdOrSessionId: string) {
  let orderRows: any[] = [];

  if (isUuid(orderIdOrSessionId)) {
    orderRows = await db.select().from(schema.orders).where(eq(schema.orders.id, orderIdOrSessionId));
  } else {
    const payments = await db.select().from(schema.payments).where(eq(schema.payments.transactionId, orderIdOrSessionId));
    if (payments.length > 0) {
      orderRows = await db.select().from(schema.orders).where(eq(schema.orders.id, payments[0].orderId));
    }
  }

  if (orderRows.length === 0) return null;
  const order = orderRows[0];

  // coerce numeric strings to numbers for UI
  const parsedOrder = {
    ...order,
    totalAmount: typeof order.totalAmount === "string" ? Number(order.totalAmount) : order.totalAmount,
  };

  // load raw order items
  const itemsRaw = await db.select().from(schema.orderItems).where(eq(schema.orderItems.orderId, order.id));

  // enrich each item with product/variant info (name, image) and normalize numeric types
  const items: any[] = [];
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

  for (const itRow of itemsRaw) {
    const it: any = itRow;
    const normalizedPrice = typeof it.priceAtPurchase === "string" ? Number(it.priceAtPurchase) : it.priceAtPurchase;

    // load variant -> product
    let productName: string | undefined = undefined;
    let productImage: string | undefined = undefined;
    try {
      const pvRows = await db.select().from(schema.productVariants).where(eq(schema.productVariants.id, it.productVariantId));
      if (pvRows && pvRows.length > 0) {
        const pv = pvRows[0] as any;
        if ((pv as any).productId) {
          const prodRows = await db.select().from((schema as any).products).where(eq((schema as any).products.id, (pv as any).productId));
          if (prodRows && prodRows.length > 0) {
            productName = prodRows[0]?.name;
            // prefer product_images.primary -> url, fallback to first product_images entry, then legacy products.image
            const productId = prodRows[0].id;
            const imgRows = await db.select().from((schema as any).productImages).where(eq((schema as any).productImages.productId, productId));
            if (imgRows && imgRows.length > 0) {
              const primary = imgRows.find((r: any) => r.isPrimary) ?? imgRows[0];
              productImage = (primary as any).url;
            } else {
              productImage = prodRows[0]?.image;
            }
          }
        }
      }
    } catch (err) {
      // ignore enrichment errors, still return item
    }

    // ensure image is absolute URL for client <img>
    if (productImage && !productImage.startsWith("http")) {
      const path = productImage.startsWith("/") ? productImage : `/${productImage}`;
      productImage = `${baseUrl}${path}`;
    }

    // fallback placeholder when no image in DB
    const finalImage = productImage ?? "https://via.placeholder.com/300?text=No+image";

    // ensure there's a top-level name property UI will use
    const displayName = productName ?? it.product_name ?? it.title ?? `Item ${String(it.productVariantId).slice(0, 8)}`;

    items.push({
      ...it,
      priceAtPurchase: normalizedPrice,
      product_name: productName ?? undefined,
      image: productImage ?? undefined,
      // add aliases so front-end finds the field regardless of naming
      img: finalImage,
      image_url: finalImage,
      images: productImage ? [productImage] : [],
      name: displayName,
    });
  }

  // debug: log the items returned for the order (check server terminal)
  console.log("getOrder items for", order.id, items.map((i) => ({ id: i.id, name: i.name, image: i.img })));

  return { order: parsedOrder, items };
}