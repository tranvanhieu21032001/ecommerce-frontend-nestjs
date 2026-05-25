"use client";

import { Heart, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { PriceView } from "@/components/home/price-view";
import { ShopContainer } from "@/components/home/shop-container";
import { products } from "@/lib/mock/home";

const initialWishlist = products.slice(0, 7);

export function WishlistPageContent() {
  const [visibleCount, setVisibleCount] = useState(7);
  const [removedIds, setRemovedIds] = useState<string[]>([]);

  const wishlistProducts = useMemo(
    () => initialWishlist.filter((product) => !removedIds.includes(product.id)),
    [removedIds],
  );

  const visibleProducts = wishlistProducts.slice(0, visibleCount);

  if (wishlistProducts.length === 0) {
    return (
      <ShopContainer className="py-16">
        <div className="flex min-h-[400px] flex-col items-center justify-center space-y-6 px-4 text-center">
          <div className="relative mb-4">
            <div className="absolute -right-1 -top-1 h-4 w-4 animate-ping rounded-full bg-[#52525B]/20" />
            <Heart className="h-12 w-12 text-[#52525B]" strokeWidth={1.5} />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-[#151515]">
              Your wishlist is empty
            </h1>
            <p className="text-sm text-[#52525B]">
              Items added to your wishlist will appear here
            </p>
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
          onClick={() => setRemovedIds(initialWishlist.map((item) => item.id))}
          className="rounded-full border border-red-200 px-5 py-2 text-sm font-semibold text-red-600 transition-colors hover:border-red-600 hover:bg-red-50"
        >
          Reset Wishlist
        </button>
      </div>

      <div className="overflow-x-auto rounded-md border border-[#151515]/10 bg-white">
        <table className="w-full border-collapse text-sm">
          <thead className="border-b bg-black/5 text-[#151515]">
            <tr>
              <th className="p-3 text-left">Image</th>
              <th className="hidden p-3 text-left md:table-cell">Category</th>
              <th className="hidden p-3 text-left md:table-cell">Type</th>
              <th className="hidden p-3 text-left md:table-cell">Status</th>
              <th className="p-3 text-left">Price</th>
              <th className="p-3 text-center md:text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {visibleProducts.map((product) => (
              <tr key={product.id} className="border-b last:border-b-0">
                <td className="flex min-w-72 items-center gap-2 px-3 py-4">
                  <button
                    type="button"
                    aria-label={`Remove ${product.name} from wishlist`}
                    onClick={() =>
                      setRemovedIds((ids) => [...ids, product.id])
                    }
                    className="text-[#151515] transition-colors hover:text-red-600"
                  >
                    <X size={18} />
                  </button>
                  <Link
                    href={`/shop/product/${product.id}`}
                    className="hidden rounded-md border bg-[#F6F6F6] md:inline-flex"
                  >
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={80}
                      height={80}
                      className="h-20 w-20 rounded-md object-contain transition-transform duration-300 hover:scale-105"
                    />
                  </Link>
                  <p className="line-clamp-1 font-medium text-[#151515]">
                    {product.name}
                  </p>
                </td>
                <td className="hidden p-3 md:table-cell">
                  <p className="line-clamp-1 text-xs font-medium uppercase">
                    {product.category}
                  </p>
                </td>
                <td className="hidden p-3 capitalize md:table-cell">
                  {product.status ?? "regular"}
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
                  <PriceView
                    price={product.price}
                    discount={product.discount}
                    className="whitespace-nowrap"
                  />
                </td>
                <td className="p-3">
                  <button
                    type="button"
                    className="w-full rounded-full bg-[#063C28] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#3B9C3C]"
                  >
                    Add to cart
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5 flex items-center gap-2">
        {visibleCount < wishlistProducts.length ? (
          <button
            type="button"
            onClick={() =>
              setVisibleCount((count) =>
                Math.min(count + 5, wishlistProducts.length),
              )
            }
            className="rounded-full border border-[#151515]/20 px-5 py-2 text-sm font-semibold transition-colors hover:border-[#063C28] hover:text-[#063C28]"
          >
            Load More
          </button>
        ) : null}
        {visibleCount > 7 ? (
          <button
            type="button"
            onClick={() => setVisibleCount(7)}
            className="rounded-full border border-[#151515]/20 px-5 py-2 text-sm font-semibold transition-colors hover:border-[#063C28] hover:text-[#063C28]"
          >
            Load Less
          </button>
        ) : null}
      </div>
    </ShopContainer>
  );
}
