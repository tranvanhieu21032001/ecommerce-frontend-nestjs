"use client";

import { ImageIcon, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Title } from "@/components/home/title";
import { getCategories, type Category } from "@/lib/api/categories";

export function HomeCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadCategories() {
      try {
        const response = await getCategories({
          isActive: true,
          page: 1,
          limit: 6,
        });

        if (active) {
          setCategories(response.data);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Could not load categories.",
          );
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadCategories();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="my-10 rounded-md border border-[#3B9C3C]/20 bg-white p-5 md:my-20 lg:p-7">
      <Title className="border-b pb-3">Popular Categories</Title>
      {isLoading ? (
        <div className="mt-5 flex min-h-44 items-center justify-center gap-2 text-sm text-[#52525B]">
          <Loader2 className="h-5 w-5 animate-spin text-[#063C28]" />
          Loading categories...
        </div>
      ) : categories.length > 0 ? (
        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/shop?categoryId=${encodeURIComponent(category.id)}`}
              className="group flex items-center gap-3 bg-[#F6F6F6] p-5 transition-colors hover:bg-[#F0F7F1]"
            >
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden border border-[#FB6C08]/30 bg-white p-1 transition-colors duration-300 group-hover:border-[#FB6C08]">
                {category.imageUrl ? (
                  <Image
                    src={category.imageUrl}
                    alt={category.name}
                    width={100}
                    height={100}
                    unoptimized
                    className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-110"
                  />
                ) : (
                  <ImageIcon className="h-7 w-7 text-[#063C28]/35" />
                )}
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold">{category.name}</h3>
                <p className="text-sm">
                  <span className="font-bold text-[#063C28]">
                    ({category.productCount})
                  </span>{" "}
                  items Available
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-5 flex min-h-44 items-center justify-center text-sm text-[#52525B]">
          {error || "No popular categories available."}
        </div>
      )}
    </div>
  );
}
