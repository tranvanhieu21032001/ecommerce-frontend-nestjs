"use client";

import { Heart, Loader2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PriceView } from "@/components/home/price-view";
import { ShopContainer } from "@/components/home/shop-container";
import { addCartItem } from "@/lib/api/cart";
import type { Product } from "@/lib/api/products";
import {
  clearWishlist,
  getWishlist,
  removeWishlistItem,
  type Wishlist,
} from "@/lib/api/wishlist";
import { notifyCartUpdated, notifyWishlistUpdated } from "@/lib/store-events";

export function WishlistPageContent() {
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [busyProductId, setBusyProductId] = useState<string | null>(null);
  const [isClearing, setIsClearing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadWishlist() {
      try {
        const response = await getWishlist();
        if (active) {
          setWishlist(response);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Could not load wishlist.");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadWishlist();

    return () => {
      active = false;
    };
  }, []);

  async function removeProduct(product: Product) {
    setBusyProductId(product.id);
    try {
      const response = await removeWishlistItem(product.id);
      setWishlist(response);
      notifyWishlistUpdated();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not remove product.");
    } finally {
      setBusyProductId(null);
    }
  }

  async function addToCart(product: Product) {
    setBusyProductId(product.id);
    try {
      await addCartItem(product.id);
      notifyCartUpdated();
      toast.success(`${product.name} added to cart.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add to cart.");
    } finally {
      setBusyProductId(null);
    }
  }

  async function handleClearWishlist() {
    setIsClearing(true);
    try {
      const response = await clearWishlist();
      setWishlist(response);
      notifyWishlistUpdated();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not clear wishlist.");
    } finally {
      setIsClearing(false);
    }
  }

  if (isLoading) {
    return (
      <ShopContainer className="py-16">
        <div className="flex min-h-[400px] items-center justify-center gap-2 text-sm text-[#52525B]">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading your wishlist...
        </div>
      </ShopContainer>
    );
  }

  if (error || !wishlist || wishlist.items.length === 0) {
    return <EmptyWishlist details={error || "Items added to your wishlist will appear here"} />;
  }

  return (
    <ShopContainer className="py-10">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#3B9C3C]">
            Wishlist
          </p>
          <h1 className="mt-2 text-3xl font-bold text-[#151515]">
            Saved products
          </h1>
        </div>
        <button
          type="button"
          disabled={isClearing}
          onClick={() => void handleClearWishlist()}
          className="rounded-full border border-red-200 px-5 py-2 text-sm font-semibold text-red-600 transition-colors hover:border-red-600 hover:bg-red-50 disabled:opacity-60"
        >
          {isClearing ? "Clearing..." : "Clear Wishlist"}
        </button>
      </div>

      <div className="overflow-x-auto rounded-md border border-[#151515]/10 bg-white">
        <table className="w-full border-collapse text-sm">
          <thead className="border-b bg-black/5 text-[#151515]">
            <tr>
              <th className="p-3 text-left">Image</th>
              <th className="hidden p-3 text-left md:table-cell">Category</th>
              <th className="hidden p-3 text-left md:table-cell">Status</th>
              <th className="p-3 text-left">Price</th>
              <th className="p-3 text-center md:text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {wishlist.items.map(({ id, product }) => {
              const hasVariations = Boolean(
                product.variations?.some((variation) => variation.isActive),
              );

              return (
              <tr key={id} className="border-b last:border-b-0">
                <td className="flex min-w-72 items-center gap-2 px-3 py-4">
                  <button
                    type="button"
                    disabled={busyProductId === product.id}
                    aria-label={`Remove ${product.name} from wishlist`}
                    onClick={() => void removeProduct(product)}
                    className="text-[#151515] transition-colors hover:text-red-600 disabled:opacity-50"
                  >
                    <X size={18} />
                  </button>
                  <Link
                    href={`/shop/product/${product.id}`}
                    className="hidden rounded-md border bg-[#F6F6F6] md:inline-flex"
                  >
                    <Image
                      src={getProductImage(product)}
                      alt={product.name}
                      width={80}
                      height={80}
                      unoptimized
                      className="h-20 w-20 rounded-md object-contain transition-transform duration-300 hover:scale-105"
                    />
                  </Link>
                  <p className="line-clamp-1 font-medium text-[#151515]">
                    {product.name}
                  </p>
                </td>
                <td className="hidden p-3 md:table-cell">
                  <p className="line-clamp-1 text-xs font-medium uppercase">
                    {product.category ?? "Uncategorized"}
                  </p>
                </td>
                <td className="hidden p-3 md:table-cell">
                  <span
                    className={
                      product.stock > 0
                        ? "font-medium text-green-600"
                        : "font-medium text-red-600"
                    }
                  >
                    {product.stock > 0 ? "In Stock" : "Out of Stock"}
                  </span>
                </td>
                <td className="p-3">
                  <PriceView price={product.price} className="whitespace-nowrap" />
                </td>
                <td className="p-3">
                  {hasVariations ? (
                    <Link
                      href={`/shop/product/${product.id}`}
                      className="block w-full rounded-full bg-[#063C28] px-4 py-2 text-center text-sm font-semibold text-white transition-colors hover:bg-[#3B9C3C]"
                    >
                      Select options
                    </Link>
                  ) : (
                    <button
                      type="button"
                      disabled={busyProductId === product.id || product.stock === 0}
                      onClick={() => void addToCart(product)}
                      className="w-full rounded-full bg-[#063C28] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#3B9C3C] disabled:opacity-50"
                    >
                      {busyProductId === product.id ? "Adding..." : "Add to cart"}
                    </button>
                  )}
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </ShopContainer>
  );
}

function EmptyWishlist({ details }: { details: string }) {
  return (
    <ShopContainer className="py-16">
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-6 px-4 text-center">
        <Heart className="h-12 w-12 text-[#52525B]" strokeWidth={1.5} />
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-[#151515]">
            Your wishlist is empty
          </h1>
          <p className="text-sm text-[#52525B]">{details}</p>
        </div>
        <Link
          href="/shop"
          className="rounded-full bg-[#063C28] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#3B9C3C]"
        >
          Continue Shopping
        </Link>
      </div>
    </ShopContainer>
  );
}

function getProductImage(product: Product) {
  return (
    product.images?.find((image) => image.isPrimary)?.imageUrl ??
    product.imageUrl ??
    "/icons/product-list.svg"
  );
}
