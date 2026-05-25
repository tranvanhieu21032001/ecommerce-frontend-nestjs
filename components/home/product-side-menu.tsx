"use client";

import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { cn } from "@/lib/cn";
import { getCurrentUser } from "@/lib/api/auth";
import type { HomeProduct } from "@/lib/mock/home";

export function ProductSideMenu({
  product,
  className,
}: {
  product: HomeProduct;
  className?: string;
}) {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);

  async function handleWishlistClick() {
    if (isCheckingAuth) {
      return;
    }

    setIsCheckingAuth(true);

    try {
      await getCurrentUser();
      setIsFavorite((value) => !value);
    } catch {
      router.push("/wishlist");
    } finally {
      setIsCheckingAuth(false);
    }
  }

  return (
    <div className={cn("absolute right-2 top-2 z-10", className)}>
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          void handleWishlistClick();
        }}
        disabled={isCheckingAuth}
        aria-pressed={isFavorite}
        aria-label={`${isFavorite ? "Remove" : "Add"} ${product.name} ${
          isFavorite ? "from" : "to"
        } wishlist`}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-[#151515] transition-colors duration-300 hover:bg-[#063C28]/80 hover:text-white",
          isFavorite && "bg-[#063C28]/80 text-white",
          isCheckingAuth && "cursor-not-allowed opacity-60",
        )}
      >
        <Heart size={15} fill={isFavorite ? "currentColor" : "none"} />
      </button>
    </div>
  );
}
