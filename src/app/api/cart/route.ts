import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/actions";
import { v4 as uuidv4 } from "uuid";

type CartItem = { id: string; name: string; price: number; quantity: number; image?: string };
type CartData = { items: CartItem[] };

const DATA_DIR = path.join(process.cwd(), "data", "carts");
function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}
function keyForUser(userId?: string, guestId?: string) {
  if (userId) return `user-${userId}.json`;
  if (guestId) return `guest-${guestId}.json`;
  return `guest-unknown.json`;
}
async function readCartFile(filename: string): Promise<CartData> {
  try {
    const p = path.join(DATA_DIR, filename);
    if (!fs.existsSync(p)) return { items: [] };
    const raw = await fs.promises.readFile(p, "utf8");
    return JSON.parse(raw) as CartData;
  } catch {
    return { items: [] };
  }
}
async function writeCartFile(filename: string, data: CartData) {
  await fs.promises.writeFile(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2), "utf8");
}

export async function GET(req: Request) {
  ensureDir();
  const user = await getCurrentUser().catch(() => null);
  const cookies = req.headers.get("cookie") || "";
  const match = cookies.match(/guest_cart_id=([^;]+)/);
  let guestId = match ? decodeURIComponent(match[1]) : undefined;

  if (!user && !guestId) {
    // create a guest id and return empty cart with Set-Cookie
    guestId = uuidv4();
    const res = NextResponse.json({ items: [] as CartItem[] });
    res.headers.set("Set-Cookie", `guest_cart_id=${guestId}; Path=/; HttpOnly; SameSite=Lax`);
    return res;
  }

  const filename = keyForUser(user?.id, guestId);
  const data = await readCartFile(filename);
  return NextResponse.json({ items: data.items });
}

export async function POST(req: Request) {
  ensureDir();
  const user = await getCurrentUser().catch(() => null);
  const cookies = req.headers.get("cookie") || "";
  const match = cookies.match(/guest_cart_id=([^;]+)/);
  let guestId = match ? decodeURIComponent(match[1]) : undefined;

  if (!user && !guestId) {
    guestId = uuidv4();
  }

  const filename = keyForUser(user?.id, guestId);
  const body = await req.json().catch(() => ({}));
  const items = Array.isArray(body.items) ? body.items : [];
  await writeCartFile(filename, { items });
  const res = NextResponse.json({ ok: true });
  if (!user) {
    // ensure guest cookie
    res.headers.set("Set-Cookie", `guest_cart_id=${guestId}; Path=/; HttpOnly; SameSite=Lax`);
  }
  return res;
}

export async function DELETE(req: Request) {
  ensureDir();
  const user = await getCurrentUser().catch(() => null);
  const cookies = req.headers.get("cookie") || "";
  const match = cookies.match(/guest_cart_id=([^;]+)/);
  const guestId = match ? decodeURIComponent(match[1]) : undefined;
  const filename = keyForUser(user?.id, guestId);
  await writeCartFile(filename, { items: [] });
  return NextResponse.json({ ok: true });
}