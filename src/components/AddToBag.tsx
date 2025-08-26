"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cart";

interface Props {
  productId: string;
  variantId?: string | null;
  name: string;
  price: number;
  image?: string | null;
  className?: string;
  redirectToCart?: boolean;
}

export default function AddToBag({
  productId,
  variantId,
  name,
  price,
  image,
  className = "",
  redirectToCart = true,
}: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const persistServer = async () => {
    try {
      const state = useCartStore.getState();
      await fetch("/api/cart", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: state.items }),
      });
    } catch (e) {
      // swallow network errors
      console.warn("cart persist failed", e);
    }
  };

  const handleAdd = async () => {
    setLoading(true);
    try {
      const id = variantId ? `${productId}::${variantId}` : productId;
      const img = image ?? undefined;
      addItem({ id, name, price, image: img });

      // persist immediately so server cart is up-to-date before navigation
      await persistServer();

      // short delay for UX / persistence
      await new Promise((r) => setTimeout(r, 120));

      if (redirectToCart) router.push("/cart");
    } catch (e) {
      console.error("Add to bag failed", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleAdd}
      disabled={loading}
      type="button"
      className={`flex items-center justify-center gap-2 rounded-full bg-dark-900 px-6 py-4 text-body-medium text-light-100 transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[--color-dark-500] ${className}`}
      aria-live="polite"
    >
      <ShoppingBag className="h-5 w-5" />
      {loading ? "Adding…" : "Add to Bag"}
    </button>
  );
}