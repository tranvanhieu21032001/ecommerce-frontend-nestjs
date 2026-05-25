"use client";

import Link from "next/link";

import type { Category } from "@/lib/api/categories";
import { cn } from "@/lib/cn";

export function HomeTabbar({
  categories,
  selectedCategoryId,
  onCategorySelect,
}: {
  categories: Category[];
  selectedCategoryId: string;
  onCategorySelect: (categoryId: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-5">
      <div className="flex flex-wrap items-center gap-1.5 text-sm font-semibold md:gap-3">
        {categories.map((category) => (
          <button
            type="button"
            onClick={() => onCategorySelect(category.id)}
            key={category.id}
            className={cn(
              "rounded-full border border-[#3B9C3C]/30 px-4 py-1.5 transition-all duration-300 hover:border-[#3B9C3C] hover:bg-[#3B9C3C] hover:text-white md:px-6 md:py-2",
              selectedCategoryId === category.id
                ? "border-[#3B9C3C] bg-[#3B9C3C] text-white"
                : "bg-[#3B9C3C]/10 text-[#151515]",
            )}
          >
            {category.name}
          </button>
        ))}
      </div>
      <Link
        href="/shop"
        className="rounded-full border border-[#151515] px-4 py-1 text-sm font-semibold transition-all duration-300 hover:border-[#3B9C3C] hover:bg-[#3B9C3C] hover:text-white"
      >
        See all
      </Link>
    </div>
  );
}
