"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { HomeProductCard } from "@/components/home/home-product-card";
import { ShopFilterList } from "@/components/home/shop-filter-list";
import { ShopContainer } from "@/components/home/shop-container";
import { Title } from "@/components/home/title";
import { getBrands, type Brand } from "@/lib/api/brands";
import { getCategories, type Category } from "@/lib/api/categories";
import { getProducts, type Product } from "@/lib/api/products";
import { priceRanges, type HomeProduct } from "@/lib/mock/home";

export function ShopPageContent({
  initialSearch = "",
  initialCategoryId = null,
  initialBrandId = null,
}: {
  initialSearch?: string;
  initialCategoryId?: string | null;
  initialBrandId?: string | null;
}) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [products, setProducts] = useState<HomeProduct[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    initialCategoryId,
  );
  const [selectedBrand, setSelectedBrand] = useState<string | null>(
    initialBrandId,
  );
  const [selectedPrice, setSelectedPrice] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadOptions() {
      try {
        const [categoryResponse, brandResponse] = await Promise.all([
          getCategories({ isActive: true, page: 1, limit: 100 }),
          getBrands({ isActive: true, page: 1, limit: 100 }),
        ]);
        if (active) {
          setCategories(categoryResponse.data);
          setBrands(brandResponse.data);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Could not load filters.");
        }
      } finally {
        if (active) {
          setIsLoadingOptions(false);
        }
      }
    }

    void loadOptions();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      setIsLoading(true);
      setError("");

      try {
        const response = await getProducts({
          search: searchTerm || undefined,
          categoryId: selectedCategory ?? undefined,
          brandId: selectedBrand ?? undefined,
          isActive: true,
          page: 1,
          limit: 100,
        });
        if (active) {
          setProducts(response.data.map(toHomeProduct));
        }
      } catch (err) {
        if (active) {
          setProducts([]);
          setError(err instanceof Error ? err.message : "Could not load products.");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadProducts();

    return () => {
      active = false;
    };
  }, [searchTerm, selectedBrand, selectedCategory]);

  const filteredProducts = useMemo(() => {
    const range = priceRanges.find((price) => price.value === selectedPrice);

    return range
      ? products.filter((product) => product.price >= range.min && product.price <= range.max)
      : products;
  }, [products, selectedPrice]);

  function resetFilters() {
    setSelectedCategory(null);
    setSelectedBrand(null);
    setSelectedPrice(null);
    setSearchTerm("");
  }

  const hasFilters = searchTerm || selectedCategory || selectedBrand || selectedPrice;

  return (
    <div className="border-t bg-white">
      <ShopContainer className="mt-5">
        <div className="sticky top-0 z-10 mb-5 bg-white/90 py-3 backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div>
              <Title className="text-lg uppercase tracking-wide">
                Get the products as your needs
              </Title>
              {searchTerm ? (
                <p className="mt-2 text-sm text-[#52525B]">
                  Results for <span className="font-semibold text-[#063C28]">&quot;{searchTerm}&quot;</span>
                </p>
              ) : null}
            </div>
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
                label: category.name,
                value: category.id,
              }))}
              selectedValue={selectedCategory}
              onSelect={setSelectedCategory}
              onClear={() => setSelectedCategory(null)}
            />
            <ShopFilterList
              title="Brands"
              items={brands.map((brand) => ({
                label: brand.name,
                value: brand.id,
              }))}
              selectedValue={selectedBrand}
              onSelect={setSelectedBrand}
              onClear={() => setSelectedBrand(null)}
            />
            <ShopFilterList
              title="Price"
              items={priceRanges.map((price) => ({
                label: price.title,
                value: price.value,
              }))}
              selectedValue={selectedPrice}
              onSelect={setSelectedPrice}
              onClear={() => setSelectedPrice(null)}
            />
            {isLoadingOptions ? (
              <p className="mt-4 flex items-center gap-2 text-sm text-[#52525B]">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading filters...
              </p>
            ) : null}
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
                <NoProductAvailable error={error} />
              )}
            </div>
          </section>
        </div>
      </ShopContainer>
    </div>
  );
}

function NoProductAvailable({ error }: { error?: string }) {
  return (
    <div className="mt-0 flex min-h-80 flex-col items-center justify-center rounded-lg bg-white p-10 text-center">
      <p className="text-lg font-bold text-[#151515]">No product available</p>
      <p className="mt-2 max-w-md text-sm text-[#52525B]">
        {error || "Try resetting filters or choosing a different category, brand, or price range."}
      </p>
    </div>
  );
}

function toHomeProduct(product: Product): HomeProduct {
  return {
    id: product.id,
    name: product.name,
    category: product.category ?? "Uncategorized",
    image:
      product.images?.find((image) => image.isPrimary)?.imageUrl ??
      product.imageUrl ??
      "/icons/product-list.svg",
    price: product.price,
    stock: product.stock,
    variations: product.variations,
  };
}
