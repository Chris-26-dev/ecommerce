import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const incomingHeaders = Object.fromEntries(req.headers.entries());
    await auth.api.signOut({ headers: incomingHeaders as any });

    // Optionally instruct client to clear anything local (client will handle)
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}