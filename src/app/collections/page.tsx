"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Trash2, Check } from "lucide-react";
import { useWishlistStore } from "@/store/wishlist";
import { useCartStore } from "@/store/cart";
import Navbar from "@/components/Navbar";
import Footer from "@/components/footer";

export default function CollectionsPage() {
  const items = useWishlistStore((s) => s.items);
  const remove = useWishlistStore((s) => s.remove);
  const clear = useWishlistStore((s) => s.clear);
  const addItem = useCartStore((s) => s.addItem);

  // subscribe to cart items so we can show "Added" state when an item exists in cart
  const cartItems = useCartStore((s) => s.items);
  const [addingIds, setAddingIds] = useState<Record<string, boolean>>({});

  if (!items.length) {
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-3xl min-h-[calc(90vh-8rem)] px-4 py-12">
          <div className="rounded-xl bg-white p-8 text-center shadow-sm">
            <svg className="mx-auto mb-4 h-12 w-12 text-gray-400" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M12 21s-7-4.5-7-10a7 7 0 1114 0c0 5.5-7 10-7 10z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h2 className="text-2xl font-semibold text-gray-900">No favorites yet</h2>
            <p className="mt-2 text-sm text-gray-600">Save items you love and find them here later.</p>
            <div className="mt-6">
              <Link href="/products" className="inline-flex items-center gap-2 rounded-md bg-gray-900 px-6 py-3 text-sm font-medium text-white shadow-sm hover:opacity-95">
                Browse products
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl min-h-[calc(90vh-8rem)] px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="mb-6 text-heading-3 sm:text-heading-2 text-dark-900">Your Favorites</h1>
            <p className="mt-1 text-sm text-dark-700">{items.length} saved {items.length === 1 ? "item" : "items"}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => clear()}
              className="rounded-md px-3 py-2 text-sm text-red-600 hover:underline"
              type="button"
            >
              Clear all
            </button>
            <Link href="/products" className="bg-gray-100 rounded-md px-3 py-2 text-sm hover:bg-gray-300">
              Continue <span className="hidden sm:inline-block">shopping</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => {
            const productId = it.id.split("::")[0];
            const isAdding = !!addingIds[it.id];
            const inCart = cartItems.some((c) => c.id === it.id);

            return (
              <article
                key={it.id}
                className="rounded-lg overflow-hidden border border-transparent bg-white shadow-sm transition-shadow hover:shadow-md hover:border-gray-200"
              >
                <Link href={`/products/${productId}`} className="block">
                  <div className="relative h-56 w-full bg-gray-50 overflow-hidden">
                    {it.image ? (
                      <Image
                        src={it.image}
                        alt={it.name}
                        fill
                        sizes="(min-width: 1024px) 33vw, 50vw"
                        className="object-cover transition-transform duration-300 hover:scale-105"
                        unoptimized
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-gray-400">
                        <svg className="h-12 w-12" viewBox="0 0 24 24" fill="none" aria-hidden>
                          <rect x="3" y="3" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
                          <path d="M7 15l3-3 4 4 3-4 3 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="px-4 py-3">
                    <h3 className="truncate text-base font-semibold text-dark-900 group-hover:underline">{it.name}</h3>
                    {typeof it.price === "number" && <div className="mt-1 text-sm text-dark-700">${it.price.toFixed(2)}</div>}
                  </div>
                </Link>

                <div className="px-4 pb-4">
                  <div className="mt-2 flex items-center gap-3">
                    {/* Add to bag - takes remaining space. Shows "Added" when item is in cart. */}
                    <button
                      onClick={async () => {
                        setAddingIds((s) => ({ ...s, [it.id]: true }));
                        try {
                          addItem({ id: it.id, name: it.name, price: it.price ?? 0, image: it.image ?? undefined });
                        } finally {
                          // keep adding state brief
                          setTimeout(() => setAddingIds((s) => {
                            const next = { ...s };
                            delete next[it.id];
                            return next;
                          }), 700);
                        }
                      }}
                      disabled={isAdding || inCart}
                      className={`flex-1 inline-flex items-center justify-center gap-3 rounded-md px-5 h-12 text-base font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[--color-dark-500] ${
                        isAdding
                          ? "bg-gray-200 text-gray-700"
                          : inCart
                          ? "bg-emerald-600 text-white cursor-default"
                          : "bg-dark-900 text-white hover:bg-dark-800"
                      }`}
                      type="button"
                    >
                      {isAdding ? (
                        <>
                          <ShoppingBag className="h-5 w-5" />
                          <span>Adding...</span>
                        </>
                      ) : inCart ? (
                        <>
                          <Check className="h-5 w-5" />
                          <span>Added</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="h-5 w-5" />
                          <span>Add to bag</span>
                        </>
                      )}
                    </button>

                    {/* Remove - same height square icon button */}
                    <button
                      onClick={() => remove(it.id)}
                      className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-red-600 text-white hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-[--color-dark-500]"
                      type="button"
                      aria-label="Remove favorite"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </main>
      <Footer />
    </>
  );
}