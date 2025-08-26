import fs from "fs";
import path from "path";

export type CartItem = { id: string; name: string; price: number; quantity: number; image?: string };
export type CartData = { items: CartItem[] };

const DATA_DIR = path.join(process.cwd(), "data", "carts");

export function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

export function readFile(filename: string): CartData {
  ensureDataDir();
  const p = path.join(DATA_DIR, filename);
  if (!fs.existsSync(p)) return { items: [] };
  try {
    return JSON.parse(fs.readFileSync(p, "utf8")) as CartData;
  } catch {
    return { items: [] };
  }
}

export function writeFile(filename: string, data: CartData) {
  ensureDataDir();
  fs.writeFileSync(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2), "utf8");
}