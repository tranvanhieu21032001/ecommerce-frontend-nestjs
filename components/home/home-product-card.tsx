import Image from "next/image";
import Link from "next/link";
import { Flame, ShoppingBag, Star } from "lucide-react";

import { ProductSideMenu } from "@/components/home/product-side-menu";
import { PriceView } from "@/components/home/price-view";
import type { HomeProduct } from "@/lib/mock/home";
import { cn } from "@/lib/cn";

export function HomeProductCard({ product }: { product: HomeProduct }) {
  const productHref = `/shop/product/${product.id}`;

  return (
    <article className="group rounded-md border border-[#151515]/20 bg-white text-sm transition-shadow duration-300 hover:shadow-sm">
      <div className="relative overflow-hidden bg-[#F6F6F6]">
        <Link href={productHref} className="block">
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
        <ProductSideMenu product={product} />
        {product.status === "sale" ? (
          <p className="absolute left-2 top-2 z-10 rounded-full border border-[#151515]/50 px-2 text-xs transition-colors group-hover:border-[#3B9C3C] group-hover:text-[#063C28]">
            Sale!
          </p>
        ) : product.status === "hot" ? (
          <span className="absolute left-2 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-[#FB6C08]/50 bg-white text-[#FB6C08]/60 transition-colors duration-300 group-hover:border-[#FB6C08] group-hover:text-[#FB6C08]">
            <Flame
              size={18}
              fill="#fb6c08"
              className="text-[#FB6C08]/60 transition-colors duration-300 group-hover:text-[#FB6C08]"
            />
          </span>
        ) : null}
      </div>
      <div className="flex flex-col gap-2 p-3">
        <p className="line-clamp-1 text-xs font-medium uppercase text-[#52525B]">
          {product.category}
        </p>
        <Link
          href={productHref}
          className="line-clamp-1 text-sm font-semibold text-[#151515] transition-colors hover:text-[#3B9C3C]"
        >
          {product.name}
        </Link>
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, index) => (
              <Star
                key={index}
                size={16}
                fill={index < 4 ? "#93D991" : "#ababab"}
                className={index < 4 ? "text-[#93D991]" : "text-[#ababab]"}
              />
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
        <Link
          href="/cart"
          className="mt-1 flex h-9 w-36 items-center justify-center rounded-full bg-[#063C28] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#3B9C3C]"
        >
          <ShoppingBag className="mr-2 h-4 w-4" />
          Add to cart
        </Link>
      </div>
    </article>
  );
}
