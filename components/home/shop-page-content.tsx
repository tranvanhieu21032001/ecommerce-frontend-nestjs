"use client";

import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";

import { HomeProductCard } from "@/components/home/home-product-card";
import { ShopFilterList } from "@/components/home/shop-filter-list";
import { ShopContainer } from "@/components/home/shop-container";
import { Title } from "@/components/home/title";
import {
  brands,
  categories,
  priceRanges,
  products,
  type HomeProduct,
} from "@/lib/mock/home";

export function ShopPageContent() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const filteredProducts = useMemo(
    () =>
      products.filter((product) => {
        const categoryMatch = selectedCategory
          ? product.category === selectedCategory
          : true;
        const brandMatch = selectedBrand
          ? getProductBrand(product) === selectedBrand
          : true;
        const priceRange = priceRanges.find(
          (range) => range.value === selectedPrice,
        );
        const priceMatch = priceRange
          ? product.price >= priceRange.min && product.price <= priceRange.max
          : true;

        return categoryMatch && brandMatch && priceMatch;
      }),
    [selectedBrand, selectedCategory, selectedPrice],
  );

  function resetFilters() {
    setSelectedCategory(null);
    setSelectedBrand(null);
    setSelectedPrice(null);
  }

  function updateFilter(callback: () => void) {
    setIsLoading(true);
    callback();
    window.setTimeout(() => setIsLoading(false), 180);
  }

  const hasFilters = selectedCategory || selectedBrand || selectedPrice;

  return (
    <div className="border-t bg-white">
      <ShopContainer className="mt-5">
        <div className="sticky top-0 z-10 mb-5 bg-white/90 py-3 backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <Title className="text-lg uppercase tracking-wide">
              Get the products as your needs
            </Title>
            {hasFilters ? (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-2 text-sm font-medium text-[#063C28] underline transition-colors duration-300 hover:text-red-700"
              >
                Reset Filters
              </button>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-5 border-t border-t-[#063C28]/50 md:flex-row">
          <aside className="scrollbar-hide pb-5 md:sticky md:top-20 md:h-[calc(100vh-160px)] md:min-w-64 md:self-start md:overflow-y-auto md:border-r md:border-r-[#063D29]/50">
            <ShopFilterList
              title="Product Categories"
              items={categories.map((category) => ({
                label: category.title,
                value: category.title,
              }))}
              selectedValue={selectedCategory}
              onSelect={(value) =>
                updateFilter(() => setSelectedCategory(value))
              }
              onClear={() => updateFilter(() => setSelectedCategory(null))}
            />
            <ShopFilterList
              title="Brands"
              items={brands.map((brand) => ({
                label: brand.title,
                value: brand.title,
              }))}
              selectedValue={selectedBrand}
              onSelect={(value) => updateFilter(() => setSelectedBrand(value))}
              onClear={() => updateFilter(() => setSelectedBrand(null))}
            />
            <ShopFilterList
              title="Price"
              items={priceRanges.map((price) => ({
                label: price.title,
                value: price.value,
              }))}
              selectedValue={selectedPrice}
              onSelect={(value) => updateFilter(() => setSelectedPrice(value))}
              onClear={() => updateFilter(() => setSelectedPrice(null))}
            />
          </aside>

          <section className="flex-1 pt-5">
            <div className="scrollbar-hide pr-2 md:h-[calc(100vh-160px)] md:overflow-y-auto">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center gap-2 bg-white p-20">
                  <Loader2 className="h-10 w-10 animate-spin text-[#063C28]" />
                  <p className="text-base font-semibold tracking-wide">
                    Product is loading . . .
                  </p>
                </div>
              ) : filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 lg:grid-cols-4">
                  {filteredProducts.map((product) => (
                    <HomeProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <NoProductAvailable />
              )}
            </div>
          </section>
        </div>
      </ShopContainer>
    </div>
  );
}

function NoProductAvailable() {
  return (
    <div className="mt-0 flex min-h-80 flex-col items-center justify-center rounded-lg bg-white p-10 text-center">
      <p className="text-lg font-bold text-[#151515]">No product available</p>
      <p className="mt-2 max-w-md text-sm text-[#52525B]">
        Try resetting filters or choosing a different category, brand, or price
        range.
      </p>
    </div>
  );
}

function getProductBrand(product: HomeProduct) {
  const index = Number(product.id.replace("product-", "")) - 1;
  return brands[index % brands.length]?.title ?? brands[0].title;
}
