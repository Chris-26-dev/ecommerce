import { NextRequest, NextResponse } from "next/server";
import { createOrder } from "@/lib/actions/orders";

// read raw body as arrayBuffer and verify signature inside handler
export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature") ?? "";
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("Missing STRIPE_WEBHOOK_SECRET");
    return NextResponse.json({ error: "Missing webhook secret" }, { status: 500 });
  }

  try {
    const raw = await req.arrayBuffer();
    const payload = new TextDecoder().decode(new Uint8Array(raw));
    const stripe = (await import("@/lib/stripe/client")).stripe;
    let event;
    try {
      event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err?.message ?? err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as any;
          await createOrder(session.id);
          break;
        }
        case "payment_intent.payment_failed": {
          console.warn("Payment failed event:", event.data.object);
          break;
        }
        default:
          break;
      }
      return NextResponse.json({ received: true });
    } catch (e: any) {
      console.error("Webhook handler error:", e);
      return NextResponse.json({ error: String(e) }, { status: 500 });
    }
  } catch (e: any) {
    console.error("Webhook raw read error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}