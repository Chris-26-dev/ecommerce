"use client";

import Image from "next/image";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useVariantStore } from "@/store/variant";
import { useEffect, useRef, useState, useCallback } from "react";

type Variant = { color: string; images: string[] };

export interface ColorSwatchesProps {
  productId: string;
  variants: Variant[];
  className?: string;
}

function firstValidImage(images: string[]) {
  return images.find((s) => typeof s === "string" && s.trim().length > 0);
}

export default function ColorSwatches({ productId, variants, className = "" }: ColorSwatchesProps) {
  const setSelected = useVariantStore((s) => s.setSelected);
  const selected = useVariantStore((s) => s.getSelected(productId, 0));

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const update = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollWidth - el.clientWidth - el.scrollLeft > 1);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    update();
    el.addEventListener("scroll", update);
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [variants, update]);

  const handleScroll = (dir: -1 | 1) => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = Math.max(120, Math.floor(el.clientWidth * 0.7));
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
    // update will run on scroll event; also optimistic update
    setTimeout(update, 200);
  };

  return (
    <div className={`relative ${className}`}>
      {/* left fade */}
      <div
        aria-hidden
        className={`pointer-events-none absolute left-0 top-0 z-10 h-full w-8 transition-opacity ${
          canScrollLeft ? "opacity-100" : "opacity-0"
        }`}
        style={{ background: "linear-gradient(to right, rgba(255,255,255,1), rgba(255,255,255,0))" }}
      />

      {/* right fade */}
      <div
        aria-hidden
        className={`pointer-events-none absolute right-0 top-0 z-10 h-full w-8 transition-opacity ${
          canScrollRight ? "opacity-100" : "opacity-0"
        }`}
        style={{ background: "linear-gradient(to left, rgba(255,255,255,1), rgba(255,255,255,0))" }}
      />

      {/* left arrow */}
      <button
        aria-label="Scroll left"
        onClick={() => handleScroll(-1)}
        disabled={!canScrollLeft}
        className="absolute left-1 top-1/2 z-20 -translate-y-1/2 rounded-full bg-light-100 p-1 shadow-sm ring-1 ring-light-300 disabled:opacity-40"
        type="button"
      >
        <ChevronLeft className="h-5 w-5 text-dark-900" />
      </button>

      {/* right arrow */}
      <button
        aria-label="Scroll right"
        onClick={() => handleScroll(1)}
        disabled={!canScrollRight}
        className="absolute right-1 top-1/2 z-20 -translate-y-1/2 rounded-full bg-light-100 p-1 shadow-sm ring-1 ring-light-300 disabled:opacity-40"
        type="button"
      >
        <ChevronRight className="h-5 w-5 text-dark-900" />
      </button>

      <div
        ref={scrollRef}
        role="listbox"
        aria-label="Choose color"
        tabIndex={0}
        className="flex gap-3 overflow-x-auto scrollbar-none whitespace-nowrap py-1 px-1"
        // hide native scrollbar on Firefox
        style={{ scrollbarWidth: "none" as const }}
      >
        {variants.map((v, i) => {
          const src = firstValidImage(v.images);
          if (!src) return null;
          const isActive = selected === i;
          return (
            <button
              key={`${v.color}-${i}`}
              onClick={() => setSelected(productId, i)}
              aria-label={`Color ${v.color}`}
              aria-selected={isActive}
              role="option"
              className={`relative inline-block h-[72px] w-[120px] flex-shrink-0 overflow-hidden rounded-lg ring-1 ring-light-300 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[--color-dark-500] ${
                isActive ? "ring-[--color-dark-500]" : "hover:ring-dark-500"
              }`}
            >
              <Image src={src} alt={v.color} fill sizes="120px" className="object-cover" />
              {isActive && (
                <span className="absolute right-1 top-1 rounded-full bg-light-100 p-1">
                  <Check className="h-4 w-4 text-dark-900" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}