import Image from "next/image";
import Link from "next/link";

import { CartIcon, HeartIcon, StarIcon } from "@/components/home/shop-icons";
import { PriceView } from "@/components/home/price-view";
import type { HomeProduct } from "@/lib/mock/home";
import { cn } from "@/lib/cn";

export function HomeProductCard({ product }: { product: HomeProduct }) {
  return (
    <article className="group rounded-md border border-[#151515]/20 bg-white text-sm">
      <div className="relative overflow-hidden bg-[#F6F6F6]">
        <Link href="#products">
          <Image
            src={product.image}
            alt={product.name}
            width={500}
            height={500}
            className={cn(
              "h-64 w-full bg-[#F6F6F6] object-contain transition-transform duration-500",
              product.stock !== 0 ? "group-hover:scale-105" : "opacity-50",
            )}
          />
        </Link>
        <div className="absolute right-2 top-2 flex translate-x-12 flex-col gap-2 transition-transform duration-300 group-hover:translate-x-0">
          <button
            type="button"
            aria-label={`Add ${product.name} to wishlist`}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#151515] shadow-sm transition-colors hover:text-[#3B9C3C]"
          >
            <HeartIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label={`Quick add ${product.name}`}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#151515] shadow-sm transition-colors hover:text-[#3B9C3C]"
          >
            <CartIcon className="h-4 w-4" />
          </button>
        </div>
        {product.status === "sale" ? (
          <p className="absolute left-2 top-2 z-10 rounded-full border border-[#151515]/50 px-2 text-xs transition-colors group-hover:border-[#3B9C3C] group-hover:text-[#063C28]">
            Sale!
          </p>
        ) : (
          <p className="absolute left-2 top-2 z-10 rounded-full border border-[#FB6C08]/50 px-2 py-0.5 text-xs font-semibold text-[#FB6C08]">
            Hot
          </p>
        )}
      </div>
      <div className="flex flex-col gap-2 p-3">
        <p className="line-clamp-1 text-xs font-medium uppercase text-[#52525B]">
          {product.category}
        </p>
        <h3 className="line-clamp-1 text-sm font-semibold text-[#151515]">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, index) => (
              <StarIcon key={index} filled={index < 4} />
            ))}
          </div>
          <p className="text-xs tracking-wide text-[#52525B]">5 Reviews</p>
        </div>
        <div className="flex items-center gap-2.5">
          <p className="font-medium">In Stock</p>
          <p
            className={cn(
              product.stock === 0
                ? "text-red-600"
                : "font-semibold text-[#063C28]/80",
            )}
          >
            {product.stock > 0 ? product.stock : "unavailable"}
          </p>
        </div>
        <PriceView
          price={product.price}
          discount={product.discount}
          className="text-sm"
        />
        <button
          type="button"
          className="mt-1 flex h-9 w-36 items-center justify-center rounded-full bg-[#063C28] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#3B9C3C]"
        >
          Add to cart
        </button>
      </div>
    </article>
  );
}
