"use client";

import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { cn } from "@/lib/cn";
import { addWishlistItem, removeWishlistItem } from "@/lib/api/wishlist";
import type { HomeProduct } from "@/lib/types/storefront";
import { notifyWishlistUpdated } from "@/lib/store-events";
import { toast } from "sonner";

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
      if (isFavorite) {
        await removeWishlistItem(product.id);
      } else {
        await addWishlistItem(product.id);
      }
      setIsFavorite((value) => !value);
      notifyWishlistUpdated();
      toast.success(
        isFavorite
          ? `${product.name} removed from wishlist.`
          : `${product.name} saved to wishlist.`,
      );
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
          "flex h-9 w-9 items-center justify-center rounded-full border transition-colors duration-300",
          isFavorite
            ? "border-[#3B9C3C] bg-[#3B9C3C] text-white hover:bg-[#158947] hover:text-white"
            : "border-transparent bg-white/90 text-[#151515] hover:border-[#3B9C3C] hover:text-[#3B9C3C]",
          isCheckingAuth && "cursor-not-allowed opacity-60",
        )}
      >
        <Heart size={15} fill={isFavorite ? "currentColor" : "none"} />
      </button>
    </div>
  );
}
