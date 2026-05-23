"use client";

import { cn } from "@/lib/cn";

export type StatusFilter = "all" | "active" | "inactive";

type StatusFilterTabsProps = {
  value: StatusFilter;
  onChange: (value: StatusFilter) => void;
};

const statusFilters: StatusFilter[] = ["all", "active", "inactive"];

export function StatusFilterTabs({ value, onChange }: StatusFilterTabsProps) {
  return (
    <div className="flex items-center gap-1 pt-[29px]">
      {statusFilters.map((status) => (
        <button
          key={status}
          type="button"
          aria-pressed={value === status}
          onClick={() => onChange(status)}
          className={cn(
            "flex h-[44px] min-w-[78px] items-center justify-center rounded-lg px-4 text-[13px] font-semibold capitalize transition-colors",
            value === status
              ? "bg-[#F0FDF4] text-[color:var(--color-primary)]"
              : "text-[#6B7280] hover:bg-[#F8FAFC] hover:text-[#1F2937]",
          )}
        >
          {status}
        </button>
      ))}
    </div>
  );
}
