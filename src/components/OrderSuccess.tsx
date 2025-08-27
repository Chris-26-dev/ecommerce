"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle } from "lucide-react";

type RawItem = Record<string, any>;
type OrderProp = {
  order?: Record<string, any>;
  items?: RawItem[];
} | null;

function formatCurrency(cents: number) {
  return (cents / 100).toLocaleString(undefined, { style: "currency", currency: "USD" });
}

export default function OrderSuccess({ order }: { order: OrderProp }) {
  if (!order) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h2 className="text-2xl font-semibold">Order not found</h2>
        <p className="mt-4 text-sm text-gray-600">We couldn't find your order. If you completed payment, contact support.</p>
        <div className="mt-6">
          <Link href="/" className="inline-block rounded-md bg-gray-900 px-4 py-2 text-white">Continue shopping</Link>
        </div>
      </div>
    );
  }

  // normalise order object shapes from server
  const rootOrder = (order as any).order ?? (order as any);
  const itemsRaw: RawItem[] = (order as any).items ?? (rootOrder?.items ?? []);

  // attempt to normalise item fields for display
  const items = itemsRaw.map((it: RawItem) => {
    // unit cents may be in different fields/formats
    let unitCents = undefined;
    if (typeof it.unit_amount_cents === "number") unitCents = it.unit_amount_cents;
    else if (typeof it.unit_amount_cents === "string") unitCents = Math.round(Number(it.unit_amount_cents));
    else if (typeof it.priceAtPurchase === "number") unitCents = Math.round(it.priceAtPurchase * 100);
    else if (typeof it.priceAtPurchase === "string") unitCents = Math.round(Number(it.priceAtPurchase) * 100);
    else if (typeof it.price_at_purchase === "string") unitCents = Math.round(Number(it.price_at_purchase) * 100);
    else if (typeof it.price_at_purchase === "number") unitCents = Math.round(it.price_at_purchase);
    else unitCents = 0;

    const name =
      it.product_name ??
      it.name ??
      it.title ??
      it.productTitle ??
      (it.productVariantId ? `Item ${it.productVariantId.slice(0, 8)}` : "Item");

    const img =
      it.image ??
      it.image_url ??
      it.product_image ??
      (it.images && it.images.length ? it.images[0] : undefined);

    const qty = Number(it.quantity ?? it.qty ?? 1);

    return {
      id: it.id ?? `${name}-${Math.random().toString(36).slice(2, 9)}`,
      name,
      img,
      unitCents: unitCents ?? 0,
      qty,
      subtotalCents: (unitCents ?? 0) * qty,
    };
  });

  const totalCents =
    // prefer server total if available
    (rootOrder && (rootOrder.totalAmount || rootOrder.total_amount))
      ? Math.round(Number(rootOrder.totalAmount ?? rootOrder.total_amount) * (rootOrder.totalAmount && typeof rootOrder.totalAmount === "number" ? 100 : 1))
      : items.reduce((s, i) => s + i.subtotalCents, 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <div className="rounded-lg bg-white p-8 shadow-sm">
        <div className="text-center">
          <CheckCircle className="mx-auto mb-4 h-12 w-12 text-emerald-500" />
          <h2 className="text-2xl font-semibold">Thanks — your order is confirmed</h2>
          <p className="mt-2 text-sm text-gray-600">
            Order ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{rootOrder?.id ?? "—"}</span>
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="md:col-span-2 rounded border p-4">
            <h3 className="text-sm font-semibold mb-3">Items</h3>
            <ul className="space-y-4">
              {items.map((it) => (
                <li key={it.id} className="flex items-center gap-4">
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-gray-50">
                    {it.img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={it.img} alt={it.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">No image</div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="text-sm font-medium">{it.name}</div>
                    <div className="text-xs text-gray-500">Qty: {it.qty}</div>
                  </div>

                  <div className="text-sm font-medium text-gray-900">
                    {formatCurrency(it.unitCents)} × {it.qty}
                    <div className="text-xs text-gray-500">{formatCurrency(it.subtotalCents)}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <aside className="rounded border p-4">
            <h4 className="text-sm font-semibold">Summary</h4>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Items total</span>
                <span>{formatCurrency(items.reduce((s, i) => s + i.subtotalCents, 0))}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Shipping</span>
                <span>{formatCurrency(0)}</span>
              </div>
              <div className="flex justify-between text-base font-semibold">
                <span>Total</span>
                <span>{formatCurrency(totalCents)}</span>
              </div>
            </div>

            <div className="mt-6">
              <Link href="/" className="inline-block w-full rounded-md bg-gray-900 px-4 py-2 text-center text-white">
                Continue shopping
              </Link>
            </div>
          </aside>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          If you need help with your order, contact <a className="text-gray-900 underline" href="mailto:support@example.com">support@example.com</a>.
        </div>
      </div>
    </div>
  );
}