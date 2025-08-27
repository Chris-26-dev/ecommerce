"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useCartStore } from "@/store/cart";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Minus, Plus } from "lucide-react";
import Spinner from "@/components/Spinner";
import { useRouter } from "next/navigation";

type SyncPayload = { items: { id: string; name: string; price: number; quantity: number; image?: string }[] };

function formatPrice(n: number) {
  return `$${n.toFixed(2)}`;
}

export default function CartClient() {
  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.total);
  const addItem = useCartStore((s) => s.addItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCart = useCartStore((s) => s.clearCart);

  const router = useRouter();
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  async function handleCheckout() {
    setCheckoutLoading(true);
    try {
      // prepare cart items payload
      const payload = {
        items: items.map((item: any) => ({
          id: item.id || `item-${Math.random()}`,
          name: item.name || item.title || 'Item',
          price: item.price || item.unitPrice || 0,
          quantity: item.quantity || 1,
          image: item.image || item.img,
        })),
      };

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      // if not authenticated, redirect to signup
      if (res.status === 401) {
        router.push("/sign-up");
        return;
      }

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Checkout error:", errorData);
        // handle other errors here
        return;
      }

      const data = await res.json();
      if (data?.url) {
        // redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        console.error("No checkout URL received");
      }
    } catch (err) {
      console.error("Checkout failed:", err);
    } finally {
      setCheckoutLoading(false);
    }
  }

  const [loading, setLoading] = useState(true);
  const syncTimer = useRef<number | null>(null);
  const lastSynced = useRef<number>(0);

  // hydrate/merge server cart on mount (keep existing merge logic)
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch("/api/cart", { credentials: "same-origin" })
      .then((r) => r.json())
      .then((data: SyncPayload) => {
        if (!mounted) return;
        const serverItems = (data.items || []).map((it) => ({ ...it }));
        const curr = useCartStore.getState();
        const localItems = curr.items.slice();

        // Merge strategy: prefer local (recent client) values over server to avoid doubling.
        // Start from server, then overwrite with local entries (local wins).
        const map = new Map<string, { id: string; name: string; price: number; quantity: number; image?: string }>();
        serverItems.forEach((it) =>
          map.set(it.id, { id: it.id, name: it.name, price: it.price, quantity: it.quantity || 1, image: it.image })
        );
        localItems.forEach((lit) => {
          // local overrides server entry for same id (prevents summing/duplication)
          map.set(lit.id, { id: lit.id, name: lit.name, price: lit.price, quantity: lit.quantity, image: lit.image });
        });

        // write merged into store
        curr.clearCart();
        Array.from(map.values()).forEach((mi) => {
          curr.addItem({ id: mi.id, name: mi.name, price: mi.price, image: mi.image });
          if (mi.quantity && mi.quantity > 1) curr.updateQuantity(mi.id, mi.quantity);
        });
      })
      .catch(() => {
        // keep local cart on error
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // sync local -> server (debounced)
  useEffect(() => {
    if (loading) return;
    if (syncTimer.current) window.clearTimeout(syncTimer.current);

    syncTimer.current = window.setTimeout(() => {
      const payload: SyncPayload = { items: items.map((i) => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity, image: i.image })) };
      const now = Date.now();
      if (now - lastSynced.current < 300) return;
      lastSynced.current = now;

      fetch("/api/cart", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(() => {
        // ignore
      });
    }, 450);

    return () => {
      if (syncTimer.current) window.clearTimeout(syncTimer.current);
    };
  }, [items, loading]);

  const itemCount = useMemo(() => items.reduce((s, it) => s + it.quantity, 0), [items]);

  if (loading) {
    return (
      <div className="min-h-[calc(90vh-8rem)] py-12 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Spinner />
          <div className="text-sm text-dark-600">Loading cart…</div>
        </div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="mx-auto max-w-7xl min-h-[calc(90vh-8rem)] px-4 py-8">
        <div className="mx-auto max-w-2xl rounded-xl bg-white p-8 text-center shadow-sm">
          <svg className="mx-auto mb-4 h-12 w-12 text-gray-500" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M3 3h2l1 14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-14h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
            <circle cx="10" cy="20" r="1" fill="currentColor"></circle>
            <circle cx="18" cy="20" r="1" fill="currentColor"></circle>
          </svg>

          <h3 className="text-lg font-semibold text-gray-900">Your cart is empty</h3>
          <p className="mt-2 text-sm text-gray-600">Looks like you haven't added anything yet. Find your next pair below.</p>

          <div className="mt-6 flex items-center justify-center gap-3">
            <Link
              href="/products"
              className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:opacity-95"
            >
              Shop products
            </Link>

          </div>

        </div>
      </div>
    );
  }

  return (
    // ensure cart area is tall enough and centered; flex layout keeps summary visible on large screens
    <div className="mx-auto max-w-7xl min-h-[calc(90vh-8rem)] px-4 py-8">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {items.map((it) => (
            <div key={it.id} className="flex items-center gap-4 rounded-lg bg-white p-4 shadow-sm">
              <div className="relative flex-shrink-0 h-20 w-20 overflow-hidden rounded-md bg-light-100">
                {it.image ? (
                  <Image
                    src={it.image}
                    alt={it.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="h-full w-full" />
                )}
              </div>

              <div className="flex flex-1 flex-col gap-1">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium text-dark-900">{it.name}</div>
                    <div className="text-sm text-dark-600">Unit: {formatPrice(it.price)}</div>
                  </div>
                  <div className="text-sm font-semibold text-dark-700">{formatPrice(it.price * it.quantity)}</div>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <div className="inline-flex items-center rounded-md border bg-white">
                    <button
                      aria-label="Decrease quantity"
                      onClick={() => updateQuantity(it.id, it.quantity - 1)}
                      className="flex h-8 w-8 items-center justify-center px-2 text-dark-700 disabled:opacity-50"
                      type="button"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <div className="px-4 text-sm font-medium">{it.quantity}</div>
                    <button
                      aria-label="Increase quantity"
                      onClick={() => updateQuantity(it.id, it.quantity + 1)}
                      className="flex h-8 w-8 items-center justify-center px-2 text-dark-700"
                      type="button"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => removeItem(it.id)}
                      className="flex items-center gap-2 rounded-md px-3 py-1 text-sm text-red-600 hover:bg-red-50"
                      type="button"
                    >
                      <Trash2 className="h-4 w-4" /> Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm">
            <div className="text-sm text-dark-700">Items</div>
            <div className="font-medium">{itemCount}</div>
          </div>
        </div>

        <aside className="space-y-4 rounded-lg bg-white p-4 shadow-sm lg:sticky lg:top-24">
          <div className="flex items-center justify-between">
            <div className="text-sm text-dark-700">Subtotal</div>
            <div className="text-lg font-semibold">{formatPrice(total)}</div>
          </div>

          <div className="space-y-2">
            <button
              onClick={handleCheckout}
              disabled={checkoutLoading}
              className="w-full rounded-md bg-[--color-dark-900] px-4 py-3 text-black disabled:opacity-50"
              type="button"
            >
              {checkoutLoading ? "Redirecting…" : "Checkout"}
            </button>

            <button
              onClick={() => {
                clearCart();
              }}
              className="w-full rounded-md border px-4 py-3"
              type="button"
            >
              Clear cart
            </button>
          </div>

          <div className="text-xs text-dark-600">
            Cart synced to your account when signed in. Changes are saved to your session for guests.
          </div>
        </aside>
      </div>
    </div>
  );
}