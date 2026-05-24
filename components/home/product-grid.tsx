"use client";

import { useMemo, useState } from "react";

import { HomeProductCard } from "@/components/home/home-product-card";
import { HomeTabbar } from "@/components/home/home-tabbar";
import { ShopContainer } from "@/components/home/shop-container";
import { productTabs, products } from "@/lib/mock/home";

export function ProductGrid() {
  const [selectedTab, setSelectedTab] = useState(productTabs[0]);

  const filteredProducts = useMemo(
    () => products.filter((product) => product.category === selectedTab),
    [selectedTab],
  );

  return (
    <ShopContainer id="products" className="my-10 flex flex-col lg:px-0">
      <HomeTabbar selectedTab={selectedTab} onTabSelect={setSelectedTab} />
      {filteredProducts.length > 0 ? (
        <div className="mt-10 grid grid-cols-2 gap-2.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {filteredProducts.map((product) => (
            <HomeProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="mt-10 flex min-h-80 flex-col items-center justify-center rounded-lg bg-gray-100 py-10 text-center">
          <p className="font-semibold text-[#151515]">No product available</p>
          <p className="mt-1 text-sm text-[#52525B]">
            Try a different product type.
          </p>
        </div>
      )}
    </ShopContainer>
  );
}
