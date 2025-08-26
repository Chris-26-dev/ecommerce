"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/cart";
import { ShoppingBag } from "lucide-react";

const NAV_LINKS = [
  { label: "Men", href: "/products?gender=men" },
  { label: "Women", href: "/products?gender=women" },
  { label: "Kids", href: "/products?gender=unisex" },
  { label: "Collections", href: "/collections" },
  { label: "Contact", href: "/contact" },
] as const;

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const itemCount = useCartStore((s) => s.getItemCount());

  // avoid hydration mismatch for numeric content, but keep the badge visible always
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-50 bg-light-100">
      <nav
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
        aria-label="Primary"
      >
        <Link href="/" aria-label="Home" className="flex items-center">
          <Image src="/logo.svg" alt="Logo" width={28} height={28} priority className="invert" />
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="text-body text-dark-900 transition-colors hover:text-dark-700">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-6 md:flex">
          <button className="text-body text-dark-900 transition-colors hover:text-dark-700">Search</button>

          <Link
            href="/cart"
            className="relative inline-flex items-center gap-2 text-body text-dark-900 transition-colors hover:text-dark-700"
            aria-label={mounted ? `Open cart, ${itemCount} items` : "Open cart"}
          >
            <ShoppingBag className="h-5 w-5" />
            {/* keep badge visible even when there are 0 items */}
            <span
              className="ml-1 inline-flex h-5 min-w-[20px] px-1 items-center justify-center rounded-full bg-dark-900 text-xs text-white"
              aria-hidden
            >
              {mounted ? itemCount : "\u00A0"}
            </span>
            <span className="sr-only">My Cart</span>
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 md:hidden"
          aria-controls="mobile-menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">Toggle navigation</span>
          <span className="mb-1 block h-0.5 w-6 bg-dark-900"></span>
          <span className="mb-1 block h-0.5 w-6 bg-dark-900"></span>
          <span className="block h-0.5 w-6 bg-dark-900"></span>
        </button>
      </nav>

      <div id="mobile-menu" className={`border-t border-light-300 md:hidden ${open ? "block" : "hidden"}`}>
        <ul className="space-y-2 px-4 py-3">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="block py-2 text-body text-dark-900 hover:text-dark-700" onClick={() => setOpen(false)}>
                {l.label}
              </Link>
            </li>
          ))}
          <li className="flex items-center justify-between pt-2">
            <button className="text-body">Search</button>
            <Link
              href="/cart"
              className="text-body inline-flex items-center gap-2"
              onClick={() => setOpen(false)}
              aria-label={mounted ? `Open cart, ${itemCount} items` : "Open cart"}
            >
              <ShoppingBag className="h-5 w-5" />
              <span className="ml-1 inline-flex h-5 min-w-[20px] px-1 items-center justify-center rounded-full bg-dark-900 text-xs text-white">
                {mounted ? itemCount : "\u00A0"}
              </span>
              <span className="sr-only">My Cart</span>
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
}