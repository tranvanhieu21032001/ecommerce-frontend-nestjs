"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { HomeProductCard } from "@/components/home/home-product-card";
import { HomeTabbar } from "@/components/home/home-tabbar";
import { ShopContainer } from "@/components/home/shop-container";
import { getCategories, type Category } from "@/lib/api/categories";
import { getProducts, type Product } from "@/lib/api/products";
import type { HomeProduct } from "@/lib/mock/home";

export function ProductGrid() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [products, setProducts] = useState<HomeProduct[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadCategories() {
      try {
        const response = await getCategories({
          isActive: true,
          page: 1,
          limit: 100,
        });

        if (!active) {
          return;
        }

        setCategories(response.data);
        setSelectedCategoryId(response.data[0]?.id ?? "");
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Could not load categories.",
          );
        }
      } finally {
        if (active) {
          setIsLoadingCategories(false);
        }
      }
    }

    void loadCategories();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    if (!selectedCategoryId) {
      return;
    }

    async function loadProducts() {
      setIsLoadingProducts(true);
      setError("");

      try {
        const response = await getProducts({
          categoryId: selectedCategoryId,
          isActive: true,
          page: 1,
          limit: 10,
        });

        if (active) {
          setProducts(response.data.map(toHomeProduct));
        }
      } catch (err) {
        if (active) {
          setProducts([]);
          setError(
            err instanceof Error ? err.message : "Could not load products.",
          );
        }
      } finally {
        if (active) {
          setIsLoadingProducts(false);
        }
      }
    }

    void loadProducts();

    return () => {
      active = false;
    };
  }, [selectedCategoryId]);

  return (
    <ShopContainer id="products" className="my-10 flex flex-col lg:px-0">
      {isLoadingCategories ? (
        <div className="flex min-h-12 items-center gap-2 text-sm text-[#52525B]">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading categories...
        </div>
      ) : (
        <HomeTabbar
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onCategorySelect={setSelectedCategoryId}
        />
      )}
      {isLoadingProducts ? (
        <div className="mt-10 flex min-h-80 flex-col items-center justify-center gap-2 rounded-lg bg-gray-100 py-10 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#063C28]" />
          <p className="text-sm font-semibold text-[#52525B]">
            Loading products...
          </p>
        </div>
      ) : products.length > 0 ? (
        <div className="mt-10 grid grid-cols-2 gap-2.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {products.map((product) => (
            <HomeProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="mt-10 flex min-h-80 flex-col items-center justify-center rounded-lg bg-gray-100 py-10 text-center">
          <p className="font-semibold text-[#151515]">No product available</p>
          <p className="mt-1 text-sm text-[#52525B]">
            {error || "Try a different product category."}
          </p>
        </div>
      )}
    </ShopContainer>
  );
}

function toHomeProduct(product: Product): HomeProduct {
  const primaryImage =
    product.images?.find((image) => image.isPrimary)?.imageUrl ??
    product.imageUrl ??
    "/icons/product-list.svg";

  return {
    id: product.id,
    name: product.name,
    category: product.category ?? "Uncategorized",
    image: primaryImage,
    price: product.price,
    stock: product.stock,
  };
}
