"use server";

import { headers, cookies } from "next/headers";
import { stripe } from "@/lib/stripe/client";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema/index";
import { eq } from "drizzle-orm";
import { getCurrentUser, createGuestSession, mergeGuestCartWithUserCart } from "@/lib/auth/actions";

type ClientCartItem = { id: string; name: string; price: number; quantity: number; image?: string };

export async function createStripeCheckoutSession(clientItems?: ClientCartItem[]) {
  const hdrsObj = await headers();
  const user = await getCurrentUser(hdrsObj);
  
  // ensure baseUrl available for absolute image urls
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  
  // require authentication for checkout
  if (!user) {
    const err: any = new Error("Authentication required. Please sign up or log in to continue.");
    err.status = 401;
    throw err;
  }

  const cookieStore = await cookies();
  const guestToken = cookieStore.get("guest_session")?.value ?? undefined;

  // merge any guest cart with user cart
  await mergeGuestCartWithUserCart();

  // find cartId for authenticated user
  let cartId: string | null = null;
  const carts = await db.select().from(schema.carts).where(eq(schema.carts.userId, user.id));
  if (carts.length > 0) cartId = carts[0].id;

  // load cart items (DB) or fallback (clientItems)
  let cartItemRows: any[] = [];
  if (cartId) {
    cartItemRows = await db.select().from(schema.cartItems).where(eq(schema.cartItems.cartId, cartId));
  }

  const cartItems: {
    productVariantId?: string;
    quantity: number;
    priceCents: number;
    title?: string;
    image?: string;
  }[] = [];

  if (cartItemRows && cartItemRows.length > 0) {
    for (const ci of cartItemRows) {
      const pvRows = await db.select().from(schema.productVariants).where(eq(schema.productVariants.id, ci.productVariantId));
      if (!pvRows || pvRows.length === 0) continue;
      const pv = pvRows[0] as any;

      let title: string | undefined;
      let image: string | undefined;
      if ((pv as any).productId) {
        const prodRows = await db.select().from((schema as any).products).where(eq((schema as any).products.id, (pv as any).productId));
        if (prodRows && prodRows.length > 0) {
          title = (prodRows[0] as any).name ?? undefined;
          // get product image from product_images table
          const productId = prodRows[0].id;
          const imgRows = await db.select().from((schema as any).productImages).where(eq((schema as any).productImages.productId, productId));
          if (imgRows && imgRows.length > 0) {
            const primary = imgRows.find((r: any) => r.isPrimary) ?? imgRows[0];
            image = (primary as any).url;
          } else {
            image = (prodRows[0] as any).image;
          }
        }
      }

      if (image && !image.startsWith("http")) {
        const path = image.startsWith("/") ? image : `/${image}`;
        image = `${baseUrl}${path}`;
      }

      const priceDecimal = (pv as any).price ?? 0;
      const priceCents = Math.round(Number(priceDecimal) * 100);

      cartItems.push({
        productVariantId: String(ci.productVariantId),
        quantity: Number(ci.quantity),
        priceCents,
        title,
        image,
      });
    }
  } else if (clientItems && clientItems.length > 0) {
    for (const it of clientItems) {
      let image = it.image;
      if (image && !image.startsWith("http")) {
        const path = image.startsWith("/") ? image : `/${image}`;
        image = `${baseUrl}${path}`;
      }
      cartItems.push({
        productVariantId: undefined,
        quantity: Number(it.quantity),
        priceCents: Math.round(Number(it.price ?? 0) * 100),
        title: it.name,
        image,
      });
    }
  }

  if (cartItems.length === 0) {
    throw Object.assign(new Error("Cart is empty"), { status: 400 });
  }

  // Build Stripe line_items and include productVariantId inside product_data.metadata when available
  const line_items = cartItems.map((it) => {
    const productData: any = {
      name: it.title ?? `Item`,
      images: it.image ? [it.image] : [],
    };
    if (it.productVariantId) {
      productData.metadata = { productVariantId: it.productVariantId };
    }
    return {
      price_data: {
        currency: "usd",
        product_data: productData,
        unit_amount: it.priceCents,
      },
      quantity: it.quantity,
    };
  });

  const metadata: Record<string, string> = {};
  metadata.userId = String(user.id);

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items,
      metadata,
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cart`,
    });

    console.log("Stripe checkout session created:", { id: session.id, url: session.url, status: session.status });

    if (!session.url) return { id: session.id, url: null, session };
    return { url: session.url, id: session.id };
  } catch (err: any) {
    console.error("Stripe create session error:", err?.message ?? err);
    throw Object.assign(new Error("Stripe checkout session creation failed: " + (err?.message ?? String(err))), { stripeError: err });
  }
}