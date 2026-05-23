import {
  DashboardTable,
  DashboardTableRow,
} from "@/components/dashboard/shared/dashboard-table";
import { SvgIcon } from "@/components/ui/svg-icon";
import type { Variant } from "@/lib/api/variants";
import { cn } from "@/lib/cn";

import {
  getVariantAttribute,
  getVariantColorCode,
  groupVariants,
  isColorVariantName,
} from "./variant-utils";

const tableColumns = "1fr 1.4fr 0.55fr 88px";

type VariantsTableProps = {
  variants: Variant[];
  isLoading: boolean;
  deletingId: string | null;
  onEdit: (variant: Variant) => void;
  onDelete: (variant: Variant) => void;
};

export function VariantsTable({
  variants,
  isLoading,
  deletingId,
  onEdit,
  onDelete,
}: VariantsTableProps) {
  const groups = groupVariants(variants);

  return (
    <DashboardTable
      columns={tableColumns}
      headers={[
        "Variant",
        "Option",
        "Status",
        <span key="actions" className="text-right">
          Actions
        </span>,
      ]}
      hasData={variants.length > 0}
      isLoading={isLoading}
      minWidth={720}
      emptyState={
        <div className="flex min-h-[240px] flex-col items-center justify-center px-4 py-10 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EAF7EF] text-[color:var(--color-primary)]">
            <SvgIcon src="/icons/variant.svg" size={22} />
          </div>
          <p className="mt-3 text-[15px] font-bold text-[color:var(--color-maintext)]">
            No variant options found
          </p>
          <p className="mt-1 text-[13px] text-[#7C8794]">
            Create a variant name, then add its options.
          </p>
        </div>
      }
    >
      {groups.flatMap((group) =>
        group.items.map((variant, index) => {
          const [, optionValue] = getVariantAttribute(variant);
          const colorCode = getVariantColorCode(variant);
          const shouldShowColor = isColorVariantName(group.name) && colorCode;

          return (
            <DashboardTableRow
              key={variant.id}
              columns={tableColumns}
              minWidth={720}
            >
              <span className="font-bold text-[color:var(--color-maintext)]">
                {index === 0 ? group.name : ""}
              </span>
              <button
                type="button"
                onClick={() => onEdit(variant)}
                className="flex max-w-full items-center gap-2 truncate text-left font-bold text-[color:var(--color-maintext)] transition-colors hover:text-[color:var(--color-primary)] focus:outline-none focus-visible:text-[color:var(--color-primary)]"
              >
                {shouldShowColor ? (
                  <span
                    className="h-5 w-5 shrink-0 rounded-full border border-[#CBD5E1]"
                    style={{ backgroundColor: colorCode }}
                    aria-hidden="true"
                  />
                ) : null}
                {optionValue || variant.name}
              </button>
              <span
                className={cn(
                  "w-fit rounded-full px-3 py-1 text-[12px] font-bold",
                  variant.isActive
                    ? "bg-[#DCFCE7] text-[#166534]"
                    : "bg-[#F3F4F6] text-[#6B7280]",
                )}
              >
                {variant.isActive ? "Active" : "Inactive"}
              </span>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => onDelete(variant)}
                  disabled={deletingId === variant.id}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#FECACA] text-[#E11D48] transition-colors hover:bg-[#FFF1F2] disabled:opacity-50"
                  aria-label={`Delete ${variant.name}`}
                  title="Delete"
                >
                  <SvgIcon src="/icons/trash.svg" size={18} />
                </button>
              </div>
            </DashboardTableRow>
          );
        }),
      )}
    </DashboardTable>
  );
}
