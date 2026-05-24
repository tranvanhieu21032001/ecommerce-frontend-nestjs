"use client";

import { productTabs } from "@/lib/mock/home";
import { cn } from "@/lib/cn";

export function HomeTabbar({
  selectedTab,
  onTabSelect,
}: {
  selectedTab: string;
  onTabSelect: (tab: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-5">
      <div className="flex flex-wrap items-center gap-1.5 text-sm font-semibold md:gap-3">
        {productTabs.map((item) => (
          <button
            type="button"
            onClick={() => onTabSelect(item)}
            key={item}
            className={cn(
              "rounded-full border border-[#3B9C3C]/30 px-4 py-1.5 transition-all duration-300 hover:border-[#3B9C3C] hover:bg-[#3B9C3C] hover:text-white md:px-6 md:py-2",
              selectedTab === item
                ? "border-[#3B9C3C] bg-[#3B9C3C] text-white"
                : "bg-[#3B9C3C]/10 text-[#151515]",
            )}
          >
            {item}
          </button>
        ))}
      </div>
      <a
        href="#products"
        className="rounded-full border border-[#151515] px-4 py-1 text-sm font-semibold transition-all duration-300 hover:border-[#3B9C3C] hover:bg-[#3B9C3C] hover:text-white"
      >
        See all
      </a>
    </div>
  );
}
