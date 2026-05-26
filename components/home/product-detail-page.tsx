import Image from "next/image";
import Link from "next/link";

import { ProductPurchaseActions } from "@/components/home/product-purchase-actions";
import { ProductSideMenu } from "@/components/home/product-side-menu";
import { ShopContainer } from "@/components/home/shop-container";
import { WishlistActionButton } from "@/components/home/wishlist-action-button";
import type { HomeProduct } from "@/lib/mock/home";

export function ProductDetailPage({ product }: { product: HomeProduct }) {
  const relatedImages = [product.image, product.image, product.image];

  return (
    <ShopContainer className="py-10">
      <div className="mb-6 text-sm text-[#52525B]">
        <Link href="/shop" className="transition-colors hover:text-[#3B9C3C]">
          Shop
        </Link>
        <span className="mx-2">/</span>
        <span className="text-[#151515]">{product.name}</span>
      </div>

      <section className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
        <div className="space-y-4">
          <div className="relative rounded-md border border-[#151515]/10 bg-[#F6F6F6]">
            <Image
              src={product.image}
              alt={product.name}
              width={900}
              height={900}
              priority
              unoptimized
              className="h-[360px] w-full object-contain p-8 md:h-[540px]"
            />
            <ProductSideMenu product={product} />
          </div>

          <div className="grid grid-cols-3 gap-3">
            {relatedImages.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                className="rounded-md border border-[#151515]/10 bg-[#F6F6F6] p-3 transition-colors hover:border-[#3B9C3C]"
              >
                <Image
                  src={image}
                  alt={`${product.name} thumbnail ${index + 1}`}
                  width={180}
                  height={180}
                  unoptimized
                  className="h-24 w-full object-contain"
                />
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#3B9C3C]">
            {product.category}
          </p>
          <h1 className="mt-3 text-4xl font-bold leading-tight text-[#151515] md:text-5xl">
            {product.name}
          </h1>

          <ProductPurchaseActions product={product} />

          <p className="mt-6 max-w-xl text-base leading-7 text-[#52525B]">
            A clean static product preview copied into the storefront style,
            ready to connect with the product detail API later.
          </p>

          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <WishlistActionButton
              productId={product.id}
              productName={product.name}
            />
          </div>
        </div>
      </section>
    </ShopContainer>
  );
}
