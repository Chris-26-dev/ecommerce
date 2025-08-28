"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart";
import { LogOut } from "lucide-react";

const NAV_LINKS = [
  { label: "Men", href: "/products?gender=men" },
  { label: "Women", href: "/products?gender=women" },
  { label: "Kids", href: "/products?gender=unisex" },
  { label: "Collections", href: "/collections" },
  { label: "Contact", href: "/contact" },
] as const;

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const itemCount = useCartStore((s) => s.items.length);
  const pathname = usePathname();
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const router = useRouter();

  // start unknown and show a neutral state until check completes
  const [authReady, setAuthReady] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/auth/check", { method: "GET", credentials: "include", cache: "no-store" });
        if (!mounted) return;
        if (!res.ok) {
          setLoggedIn(false);
        } else {
          const data = await res.json();
          setLoggedIn(Boolean(data?.loggedIn));

          // debug: log current user's id and name (only in dev)
          if (data?.user) {
            console.log("Current user:", { id: data.user.id, name: data.user.name });
          }
        }
      } catch {
        if (!mounted) return;
        setLoggedIn(false);
      } finally {
        if (mounted) setAuthReady(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  async function handleLogout() {
    try {
      await fetch("/api/auth/signout", { method: "POST", credentials: "include" });
      await fetch("/api/cart/clear", { method: "POST", credentials: "include" });
      useCartStore.getState().clearCart();
    } catch {
      // ignore
    } finally {
      setLoggedIn(false);
      router.push("/");
    }
  }

  // while we don't know auth state, show a neutral navbar to avoid wrong "Logout"
  if (!authReady) {
    return (
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-light-300">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8" aria-label="Primary">
          <Link href="/" aria-label="Home" className="flex items-center gap-3">
            <Image src="/logo.svg" alt="Logo" width={28} height={28} priority className="invert" />
          </Link>
          <div />
        </nav>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-light-300">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8" aria-label="Primary">
        <Link href="/" aria-label="Home" className="flex items-center gap-3">
          <Image src="/logo.svg" alt="Logo" width={60} height={60} priority className="invert" />
        </Link>

        <ul className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="text-sm text-dark-900 hover:text-dark-700">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex items-center gap-4">
          <button className="text-sm text-dark-900 hover:text-dark-700">Search</button>

          <Link href="/cart" className="relative inline-flex items-center gap-2 text-sm text-dark-900 hover:text-dark-700" aria-label={`Open cart, ${itemCount} items`}>
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M3 3h2l1 14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-14h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="ml-1 inline-flex h-5 min-w-[20px] px-1 items-center justify-center rounded-full bg-dark-900 text-xs text-white">{itemCount}</span>
          </Link>

          {loggedIn ? (
            <button onClick={handleLogout} className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm text-dark-900 hover:bg-gray-100">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          ) : (
            <Link href="/sign-up" className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm text-dark-900 hover:bg-gray-100">
              Sign up / Log in
            </Link>
          )}
        </div>

        {/* mobile hamburger (simplified for brevity) */}
        <button
          ref={btnRef}
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 md:hidden focus:outline-none"
          aria-controls="mobile-menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">Toggle navigation</span>
          <span className="relative block h-6 w-6">
            <span aria-hidden className={`absolute left-0 block h-0.5 w-6 bg-dark-900 transform transition duration-200 ${open ? "rotate-45 top-2.5" : "-translate-y-1.5 top-1.5"}`} />
            <span aria-hidden className={`absolute left-0 block h-0.5 w-6 bg-dark-900 transition-opacity duration-150 ${open ? "opacity-0" : "top-2.5"}`} />
            <span aria-hidden className={`absolute left-0 block h-0.5 w-6 bg-dark-900 transform transition duration-200 ${open ? "-rotate-45 top-2.5" : "translate-y-1.5 top-3.5"}`} />
          </span>
        </button>
      </nav>
    </header>
  );
}