import { NextRequest, NextResponse } from "next/server";
import { createStripeCheckoutSession } from "@/lib/actions/checkout";

export async function POST(req: NextRequest) {
  try {
    console.log("API /api/checkout invoked. STRIPE_SECRET_KEY present:", !!process.env.STRIPE_SECRET_KEY);

    let clientItems: any[] | undefined = undefined;
    try {
      const body = await req.json().catch(() => null);
      if (body && Array.isArray(body.items)) clientItems = body.items;
    } catch (err) {
      console.warn("/api/checkout body parse error", err);
    }

    const result = await createStripeCheckoutSession(clientItems);
    console.log("/api/checkout result:", { id: result?.id, urlExists: !!result?.url });

    if (!result?.url) {
      return NextResponse.json({ error: "No checkout URL", debug: result }, { status: 500 });
    }
    return NextResponse.json({ url: result.url, id: result.id }, { status: 200 });
  } catch (e: any) {
    console.error("API /api/checkout error:", e);
    
    // return proper 401 status for auth errors
    if (e?.status === 401) {
      return NextResponse.json({ error: e?.message ?? "Authentication required" }, { status: 401 });
    }
    
    return NextResponse.json({ error: e?.message ?? String(e), stack: e?.stack }, { status: e?.status ?? 500 });
  }
}