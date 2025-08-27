"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart";
import { ShoppingCart } from "lucide-react";

export default function CartSummary() {
  const router = useRouter();
  const total = useCartStore((s) => s.total);
  const items = useCartStore((s) => s.items);

  function onCheckout() {
    if (!items || items.length === 0) {
      alert("Your cart is empty");
      return;
    }
    // route to cart page — CartClient handles auth check & final checkout
    router.push("/cart");
  }

  return (
    <div className="rounded-lg bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="text-sm text-dark-700">Subtotal</div>
        <div className="text-lg font-semibold">${(total || 0).toFixed(2)}</div>
      </div>

      <button
        onClick={onCheckout}
        disabled={items.length === 0}
        className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-md bg-[--color-dark-900] px-4 py-3 text-white disabled:opacity-50"
      >
        <ShoppingCart className="h-4 w-4" />
        Checkout
      </button>
    </div>
  );
}