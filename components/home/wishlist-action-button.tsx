"use client";

import { Heart, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { addWishlistItem, getWishlist } from "@/lib/api/wishlist";
import { WISHLIST_UPDATED_EVENT, notifyWishlistUpdated } from "@/lib/store-events";

export function WishlistActionButton({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadWishlistState() {
      try {
        const wishlist = await getWishlist();
        if (active) {
          setIsSaved(
            wishlist.items.some((item) => item.product.id === productId),
          );
        }
      } catch {
        if (active) {
          setIsSaved(false);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadWishlistState();
    window.addEventListener(WISHLIST_UPDATED_EVENT, loadWishlistState);

    return () => {
      active = false;
      window.removeEventListener(WISHLIST_UPDATED_EVENT, loadWishlistState);
    };
  }, [productId]);

  async function handleAddToWishlist() {
    setIsAdding(true);
    try {
      await addWishlistItem(productId);
      setIsSaved(true);
      notifyWishlistUpdated();
      toast.success(`${productName} saved to wishlist.`);
    } catch {
      router.push("/wishlist");
    } finally {
      setIsAdding(false);
    }
  }

  if (isSaved) {
    return (
      <Link
        href="/wishlist"
        className="rounded-full border border-[#063C28]/30 px-8 py-3 text-center text-sm font-semibold text-[#063C28] transition-colors hover:border-[#3B9C3C] hover:text-[#3B9C3C]"
      >
        View wishlist
      </Link>
    );
  }

  return (
    <button
      type="button"
      disabled={isLoading || isAdding}
      onClick={() => void handleAddToWishlist()}
      className="rounded-full border border-[#063C28]/30 px-8 py-3 text-center text-sm font-semibold text-[#063C28] transition-colors hover:border-[#3B9C3C] hover:text-[#3B9C3C] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isLoading || isAdding ? (
        <Loader2 className="mr-2 inline-flex h-4 w-4 animate-spin" />
      ) : (
        <Heart className="mr-2 inline-flex h-4 w-4" />
      )}
      {isAdding ? "Adding..." : "Add to wishlist"}
    </button>
  );
}
