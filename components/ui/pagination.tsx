"use client";

import type { ReactNode } from "react";

import { SvgIcon } from "@/components/ui/svg-icon";
import { cn } from "@/lib/cn";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  disabled?: boolean;
  onPageChange: (page: number) => void;
};

type PaginationItem = number | "ellipsis";

export function Pagination({
  currentPage,
  totalPages,
  disabled = false,
  onPageChange,
}: PaginationProps) {
  const safeTotalPages = Math.max(totalPages, 1);
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), safeTotalPages);
  const items = getPaginationItems(safeCurrentPage, safeTotalPages);

  return (
    <div className="flex items-center gap-1">
      <PaginationButton
        label="First page"
        disabled={disabled || safeCurrentPage <= 1}
        onClick={() => onPageChange(1)}
      >
        <SvgIcon src="/icons/chevrons-left.svg" size={16} />
      </PaginationButton>
      <PaginationButton
        label="Previous page"
        disabled={disabled || safeCurrentPage <= 1}
        onClick={() => onPageChange(Math.max(safeCurrentPage - 1, 1))}
      >
        <SvgIcon src="/icons/chevron-left.svg" size={14} />
      </PaginationButton>

      {items.map((item, index) =>
        item === "ellipsis" ? (
          <span
            key={`ellipsis-${index}`}
            className="flex h-8 min-w-8 items-center justify-center rounded-md border border-[#E5E7EB] bg-white px-2 text-[13px] font-semibold text-[#111827]"
          >
            ...
          </span>
        ) : (
          <PaginationButton
            key={item}
            label={`Page ${item}`}
            active={item === safeCurrentPage}
            disabled={disabled}
            onClick={() => onPageChange(item)}
          >
            {item}
          </PaginationButton>
        ),
      )}

      <PaginationButton
        label="Next page"
        disabled={disabled || safeCurrentPage >= safeTotalPages}
        onClick={() =>
          onPageChange(Math.min(safeCurrentPage + 1, safeTotalPages))
        }
      >
        <SvgIcon src="/icons/chevron-right.svg" size={14} />
      </PaginationButton>
      <PaginationButton
        label="Last page"
        disabled={disabled || safeCurrentPage >= safeTotalPages}
        onClick={() => onPageChange(safeTotalPages)}
      >
        <SvgIcon src="/icons/chevrons-right.svg" size={16} />
      </PaginationButton>
    </div>
  );
}

function getPaginationItems(
  currentPage: number,
  totalPages: number,
): PaginationItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "ellipsis", totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [
      1,
      "ellipsis",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    "ellipsis",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "ellipsis",
    totalPages,
  ];
}

function PaginationButton({
  active = false,
  children,
  disabled,
  label,
  onClick,
}: {
  active?: boolean;
  children: ReactNode;
  disabled?: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-current={active ? "page" : undefined}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex h-8 min-w-8 items-center justify-center rounded-md border px-2 text-[13px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-45",
        active
          ? "border-[color:var(--color-primary)] bg-[color:var(--color-primary)] text-white"
          : "border-[#E5E7EB] bg-white text-[#4B5563] hover:border-[color:var(--color-primary)] hover:text-[color:var(--color-primary)]",
      )}
    >
      {children}
    </button>
  );
}
