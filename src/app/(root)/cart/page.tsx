import React from "react";
import CartClient from "@/components/CartClient";

const CartPage = async () => {
  // server component just renders the client cart UI
  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="mb-6 text-heading-2 text-dark-900">Your cart</h1>
      {/* Hydrated client component handles sync, auth / guest, and persistence */}
      {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
      {/* @ts-ignore */}
      <CartClient />
    </main>
  );
};

export default CartPage;