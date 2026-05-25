"use client";

import { Title } from "@/components/home/title";
import { cn } from "@/lib/cn";

export function ShopFilterList({
  items,
  onClear,
  onSelect,
  selectedValue,
  title,
}: {
  items: Array<{ label: string; value: string }>;
  onClear: () => void;
  onSelect: (value: string) => void;
  selectedValue: string | null;
  title: string;
}) {
  return (
    <div className="w-full bg-white p-5">
      <Title className="text-base font-black">{title}</Title>
      <div className="mt-2 space-y-1">
        {items.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => onSelect(item.value)}
            className="flex w-full items-center gap-2 text-left"
          >
            <span
              className={cn(
                "flex h-4 w-4 items-center justify-center rounded-sm border",
                selectedValue === item.value
                  ? "border-[#063C28] bg-[#063C28]"
                  : "border-[#CBD5E1] bg-white",
              )}
            >
              {selectedValue === item.value ? (
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
              ) : null}
            </span>
            <span
              className={cn(
                "text-sm",
                selectedValue === item.value
                  ? "font-semibold text-[#063C28]"
                  : "font-normal text-[#151515]",
              )}
            >
              {item.label}
            </span>
          </button>
        ))}
      </div>
      {selectedValue ? (
        <button
          type="button"
          onClick={onClear}
          className="mt-2 text-left text-sm font-medium underline decoration-[1px] underline-offset-2 transition-colors duration-300 hover:text-[#063C28]"
        >
          Reset selection
        </button>
      ) : null}
    </div>
  );
}
