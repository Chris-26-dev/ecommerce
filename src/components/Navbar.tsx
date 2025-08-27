"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const NAV_LINKS = [
  { label: "Men", href: "/products?gender=men" },
  { label: "Women", href: "/products?gender=women" },
  { label: "Kids", href: "/products?gender=unisex" },
  { label: "Collections", href: "/collections" },
  { label: "Contact", href: "/contact" },
] as const;

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-light-100">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8" aria-label="Primary">
        <Link href="/" aria-label="Home" className="flex items-center">
          <Image src="/logo.svg" alt="Logo" width={28} height={28} priority className="invert" />
        </Link>

        <ul className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="text-body text-dark-900 transition-colors hover:text-dark-700">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex items-center gap-6">
          <button className="text-body text-dark-900 transition-colors hover:text-dark-700">Search</button>
          <Link href="/cart" className="relative inline-flex items-center gap-2 text-body text-dark-900 transition-colors hover:text-dark-700" aria-label="Open cart">
            {/* cart icon / badge handled elsewhere */}
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M3 3h2l1 14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-14h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="ml-1 inline-flex h-5 min-w-[20px] px-1 items-center justify-center rounded-full bg-dark-900 text-xs text-white">0</span>
          </Link>
        </div>

        {/* mobile hamburger */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 md:hidden"
          aria-controls="mobile-menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">Toggle navigation</span>

          {/* improved hamburger: three equal lines, centered X when open */}
          <span className="relative block h-6 w-6">
            <span
              aria-hidden
              className={`absolute left-0 h-0.5 w-6 bg-dark-900 transition-transform duration-200 ${open ? "top-1/2 -translate-y-1/2 rotate-45" : "top-1"}`}
            />
            <span
              aria-hidden
              className={`absolute left-0 h-0.5 w-6 bg-dark-900 transition-opacity duration-150 ${open ? "opacity-0" : "top-1/2 -translate-y-1/2"}`}
            />
            <span
              aria-hidden
              className={`absolute left-0 h-0.5 w-6 bg-dark-900 transition-transform duration-200 ${open ? "top-1/2 -translate-y-1/2 -rotate-45" : "bottom-1"}`}
            />
          </span>
        </button>
      </nav>

      {/* mobile menu */}
      <div id="mobile-menu" className={`md:hidden border-t border-light-300 ${open ? "block" : "hidden"}`}>
        <div className="space-y-2 px-4 py-3">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="block py-2 text-body text-dark-900 hover:text-dark-700">
              {l.label}
            </Link>
          ))}

          <div className="flex items-center justify-between pt-2">
            <button className="text-body">Search</button>
            <Link href="/cart" onClick={() => setOpen(false)} className="inline-flex items-center gap-2 text-body text-dark-900">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M3 3h2l1 14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-14h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="ml-1 inline-flex h-5 min-w-[20px] px-1 items-center justify-center rounded-full bg-dark-900 text-xs text-white">0</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}