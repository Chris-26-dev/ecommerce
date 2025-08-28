import React from "react";
import OrderSuccess from "@/components/OrderSuccess";
import { getOrder } from "@/lib/actions/orders";
import ClearCartOnSuccess from "@/components/ClearCartOnSuccess";

type Props = { searchParams: any };

export default async function Page({ searchParams }: Props) {
  // searchParams may be a promise in App Router — await before use
  const params = await searchParams;
  const sessionId = params?.session_id;
  const order = sessionId ? await getOrder(sessionId) : null;
  return (
    <>
      <OrderSuccess order={order} />
      <ClearCartOnSuccess />
    </>
  );
}