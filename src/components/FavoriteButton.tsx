"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { useWishlistStore } from "@/store/wishlist";

interface Props {
  id: string;
  name: string;
  price?: number;
  image?: string | null;
  className?: string;
}

export default function FavoriteButton({ id, name, price, image, className = "" }: Props) {
  // subscribe so we get live updates
  const isFav = useWishlistStore((s) => s.items.some((i) => i.id === id));
  const toggle = useWishlistStore((s) => s.toggle);

  // avoid hydration mismatch by hiding dynamic state until client mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const onClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      toggle({ id, name, price, image });
    },
    [toggle, id, name, price, image]
  );

  return (
    <button
      type="button"
      onClick={onClick}
      // keep aria attributes stable before mount to match server output
      aria-pressed={mounted ? isFav : false}
      aria-label={mounted ? (isFav ? "Remove from favorites" : "Add to favorites") : "Add to favorites"}
      className={`flex items-center justify-center gap-2 rounded-full border border-light-300 px-6 py-4 text-body-medium text-dark-900 duration-150 hover:bg-gray-100 hover:shadow-md hover:scale-[1.02] active:scale-95 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[--color-dark-500] ${className}`}
    >
      {/* only apply the "red" visual after mount to avoid mismatch */}
      <Heart className={`h-5 w-5 ${mounted && isFav ? "fill-red-600 text-red-600" : ""}`} />
      {/* stabilize text before mount to avoid hydration mismatch */}
      <span>{mounted ? (isFav ? "Favorited" : "Favorite") : "Favorite"}</span>
    </button>
  );
}