"use client";

import { Loader2, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { addCartItem } from "@/lib/api/cart";
import { notifyCartUpdated } from "@/lib/store-events";

export function AddToCartButton({
  productId,
  productName,
  disabled = false,
}: {
  productId: string;
  productName: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);

  async function handleClick() {
    setIsAdding(true);
    try {
      await addCartItem(productId);
      notifyCartUpdated();
      toast.success(`${productName} added to cart.`);
    } catch {
      router.push("/cart");
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <button
      type="button"
      disabled={disabled || isAdding}
      onClick={() => void handleClick()}
      className="rounded-full bg-[#063C28] px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#3B9C3C] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isAdding ? (
        <Loader2 className="mr-2 inline-flex h-4 w-4 animate-spin" />
      ) : (
        <ShoppingBag className="mr-2 inline-flex h-4 w-4" />
      )}
      {isAdding ? "Adding..." : "Add to cart"}
    </button>
  );
}
