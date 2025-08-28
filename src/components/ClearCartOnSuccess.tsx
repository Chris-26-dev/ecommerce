"use client";
import { useEffect } from "react";
import { useCartStore } from "@/store/cart";

export default function ClearCartOnSuccess() {
  useEffect(() => {
    fetch("/api/cart/clear", { method: "POST", credentials: "include" });
    useCartStore.getState().clearCart();
  }, []);
  return null;
}