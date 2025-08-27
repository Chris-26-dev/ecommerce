import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    // pass the incoming request headers to the auth library so it checks the real session
    const incomingHeaders = Object.fromEntries(req.headers.entries());
    const session = await auth.api.getSession({ headers: incomingHeaders as any });

    if (!session?.user) {
      return NextResponse.json({ loggedIn: false }, { status: 401 });
    }

    return NextResponse.json({ loggedIn: true, user: session.user }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ loggedIn: false, error: String(e) }, { status: 401 });
  }
}