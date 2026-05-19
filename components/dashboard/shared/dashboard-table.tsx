"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type DashboardTableProps = {
  columns: string;
  headers: ReactNode[];
  children: ReactNode;
  emptyState: ReactNode;
  hasData: boolean;
  isLoading: boolean;
  minWidth?: number;
  skeletonRows?: number;
};

export function DashboardTable({
  columns,
  headers,
  children,
  emptyState,
  hasData,
  isLoading,
  minWidth = 760,
  skeletonRows = 4,
}: DashboardTableProps) {
  const gridStyle = {
    gridTemplateColumns: columns,
    minWidth,
  };

  return (
    <div
      className={cn(
        "mt-5 overflow-x-auto rounded-2xl border border-[#E5E7EB] transition-opacity",
        isLoading && hasData ? "opacity-60" : "opacity-100",
      )}
    >
      <div
        className="grid bg-[#F8FAFC] px-4 py-3 text-[12px] font-bold uppercase tracking-[0.08em] text-[#7C8794]"
        style={gridStyle}
      >
        {headers.map((header, index) => (
          <span key={index}>{header}</span>
        ))}
      </div>

      {isLoading && !hasData ? (
        <div className="grid gap-3 p-4">
          {Array.from({ length: skeletonRows }).map((_, index) => (
            <div
              key={index}
              className="h-[58px] animate-pulse rounded-xl bg-[#F3F4F6]"
            />
          ))}
        </div>
      ) : hasData ? (
        <div className="divide-y divide-[#E5E7EB]">{children}</div>
      ) : (
        emptyState
      )}
    </div>
  );
}

type DashboardTableRowProps = {
  columns: string;
  children: ReactNode;
  minWidth?: number;
};

export function DashboardTableRow({
  columns,
  children,
  minWidth = 760,
}: DashboardTableRowProps) {
  return (
    <div
      className="grid items-center gap-3 px-4 py-4 text-[14px]"
      style={{
        gridTemplateColumns: columns,
        minWidth,
      }}
    >
      {children}
    </div>
  );
}
