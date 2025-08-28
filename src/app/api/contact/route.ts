import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { name, email, subject, message, subscribe } = body ?? {};

    // simple validation
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Name is required." }, { status: 400 });
    }
    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
    }
    if (!message || typeof message !== "string" || message.trim().length < 5) {
      return NextResponse.json({ error: "Message is too short." }, { status: 400 });
    }

    // TODO: hook into real email service (SendGrid, SES, etc.) or store in DB
    // For now: log to server console (visible in Vercel/host logs or local terminal)
    console.info("Contact form submitted:", {
      name,
      email,
      subject: subject || "",
      message: message.slice(0, 200), // truncate for logs
      subscribe: Boolean(subscribe),
      receivedAt: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error in contact route:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}