"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { SubTitle } from "@/components/home/title";
import { getCategories, type Category } from "@/lib/api/categories";

export function FooterCategories() {
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
          limit: 5,
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
    <div>
      <SubTitle className="text-white">Categories</SubTitle>
      {isLoading ? (
        <div className="mt-5 space-y-3" aria-label="Loading categories">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-5 w-32 animate-pulse rounded bg-white/10"
            />
          ))}
        </div>
      ) : categories.length > 0 ? (
        <ul className="mt-5 space-y-3">
          {categories.map((category) => (
            <li key={category.id}>
              <Link
                href={`/shop?categoryId=${encodeURIComponent(category.id)}`}
                className="text-sm font-medium text-white/65 transition-colors duration-300 hover:text-[#93D991]"
              >
                {category.name}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-5 text-sm text-white/55">
          {error || "No categories available."}
        </p>
      )}
    </div>
  );
}
