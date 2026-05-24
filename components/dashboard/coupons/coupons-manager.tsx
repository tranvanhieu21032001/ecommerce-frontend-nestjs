"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { DashboardStat } from "@/components/dashboard/shared/dashboard-stat";
import {
  DashboardTable,
  DashboardTableRow,
} from "@/components/dashboard/shared/dashboard-table";
import {
  StatusFilterTabs,
  type StatusFilter,
} from "@/components/dashboard/shared/status-filter-tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { SvgIcon } from "@/components/ui/svg-icon";
import {
  createCoupon,
  deleteCoupon,
  getCoupons,
  updateCoupon,
  type Coupon,
  type CouponPayload,
  type DiscountType,
} from "@/lib/api/coupons";
import { cn } from "@/lib/cn";

type FormState = {
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: string;
  minOrderAmount: string;
  maxDiscountAmount: string;
  usageLimit: string;
  startsAt: string;
  expiresAt: string;
  isActive: boolean;
};

type DiscountFilter = "all" | DiscountType;

const emptyForm: FormState = {
  code: "",
  description: "",
  discountType: "PERCENTAGE",
  discountValue: "",
  minOrderAmount: "0",
  maxDiscountAmount: "",
  usageLimit: "",
  startsAt: "",
  expiresAt: "",
  isActive: true,
};

const pageSize = 10;
const tableColumns = "0.85fr 0.72fr 0.7fr 0.65fr 0.75fr 0.54fr 88px";

export function CouponsManager() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [discountFilter, setDiscountFilter] = useState<DiscountFilter>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCoupons, setTotalCoupons] = useState(0);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const activeCount = useMemo(
    () => coupons.filter((coupon) => coupon.isActive).length,
    [coupons],
  );

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    loadCoupons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, statusFilter, discountFilter, page]);

  async function loadCoupons() {
    setIsLoading(true);

    try {
      const response = await getCoupons({
        search: debouncedSearch,
        isActive:
          statusFilter === "all" ? undefined : statusFilter === "active",
        discountType: discountFilter === "all" ? undefined : discountFilter,
        page,
        limit: pageSize,
      });

      setCoupons(response.data);
      setTotalPages(Math.max(response.meta.totalPages, 1));
      setTotalCoupons(response.meta.total);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not load coupons.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function updateForm(patch: Partial<FormState>) {
    setForm((current) => ({
      ...current,
      ...patch,
    }));
  }

  function handleEdit(coupon: Coupon) {
    setEditingCoupon(coupon);
    setForm({
      code: coupon.code,
      description: coupon.description ?? "",
      discountType: coupon.discountType,
      discountValue: String(coupon.discountValue),
      minOrderAmount: String(coupon.minOrderAmount),
      maxDiscountAmount:
        coupon.maxDiscountAmount === null
          ? ""
          : String(coupon.maxDiscountAmount),
      usageLimit: coupon.usageLimit === null ? "" : String(coupon.usageLimit),
      startsAt: toDateTimeInput(coupon.startsAt),
      expiresAt: toDateTimeInput(coupon.expiresAt),
      isActive: coupon.isActive,
    });
  }

  function resetForm() {
    setEditingCoupon(null);
    setForm(emptyForm);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = buildPayload();
    if (!payload) {
      return;
    }

    setIsSaving(true);

    try {
      if (editingCoupon) {
        await updateCoupon(editingCoupon.id, payload);
        toast.success("Coupon updated successfully.");
      } else {
        await createCoupon(payload);
        toast.success("Coupon created successfully.");
      }

      resetForm();
      await loadCoupons();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not save coupon.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  function buildPayload(): CouponPayload | null {
    if (!form.code.trim()) {
      toast.error("Coupon code is required.");
      return null;
    }

    const discountValue = Number(form.discountValue);
    if (!Number.isFinite(discountValue) || discountValue <= 0) {
      toast.error("Discount value must be greater than 0.");
      return null;
    }

    if (form.discountType === "PERCENTAGE" && discountValue > 100) {
      toast.error("Percentage discount cannot exceed 100.");
      return null;
    }

    const minOrderAmount = numberOrUndefined(form.minOrderAmount);
    const maxDiscountAmount = numberOrUndefined(form.maxDiscountAmount);
    const usageLimit = numberOrUndefined(form.usageLimit);

    if (Number.isNaN(minOrderAmount)) {
      toast.error("Minimum order amount must be a valid number.");
      return null;
    }

    if (Number.isNaN(maxDiscountAmount)) {
      toast.error("Maximum discount amount must be a valid number.");
      return null;
    }

    if (Number.isNaN(usageLimit)) {
      toast.error("Usage limit must be a valid number.");
      return null;
    }

    if (minOrderAmount !== undefined && minOrderAmount < 0) {
      toast.error("Minimum order amount cannot be negative.");
      return null;
    }

    if (maxDiscountAmount !== undefined && maxDiscountAmount < 0) {
      toast.error("Maximum discount amount cannot be negative.");
      return null;
    }

    if (
      usageLimit !== undefined &&
      (!Number.isInteger(usageLimit) || usageLimit < 1)
    ) {
      toast.error("Usage limit must be a whole number greater than 0.");
      return null;
    }

    const startsAt = toIsoString(form.startsAt);
    const expiresAt = toIsoString(form.expiresAt);

    if (startsAt && expiresAt && new Date(startsAt) >= new Date(expiresAt)) {
      toast.error("Expiration date must be after start date.");
      return null;
    }

    return {
      code: form.code,
      description: form.description,
      discountType: form.discountType,
      discountValue,
      minOrderAmount,
      maxDiscountAmount,
      usageLimit,
      startsAt,
      expiresAt,
      isActive: form.isActive,
    };
  }

  async function handleDelete(coupon: Coupon) {
    const confirmed = window.confirm(`Delete coupon "${coupon.code}"?`);

    if (!confirmed) {
      return;
    }

    setDeletingId(coupon.id);

    try {
      await deleteCoupon(coupon.id);
      toast.success("Coupon deleted successfully.");
      if (coupons.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        await loadCoupons();
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not delete coupon.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
      <section className="min-w-0 rounded-[20px] border border-[#E5E7EB] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)] lg:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-subtext)]">
              Sales
            </p>
            <h2 className="mt-1 text-[24px] font-black text-[color:var(--color-maintext)]">
              Coupon codes
            </h2>
            <p className="mt-2 max-w-[620px] text-[14px] leading-6 text-[#6B7280]">
              Create and manage discount codes for campaigns, flash sales, and
              checkout promotions.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <DashboardStat label="Total" value={totalCoupons} />
            <DashboardStat label="Active" value={activeCount} />
            <DashboardStat label="Page" value={page} />
          </div>
        </div>

        <div className="mt-6 grid gap-3 xl:grid-cols-[1fr_auto_auto] xl:items-start">
          <Input
            label="Search coupons"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by code or description"
          />

          <DiscountFilterTabs
            value={discountFilter}
            onChange={(value) => {
              setDiscountFilter(value);
              setPage(1);
            }}
          />

          <StatusFilterTabs
            value={statusFilter}
            onChange={(status) => {
              setStatusFilter(status);
              setPage(1);
            }}
          />
        </div>

        <DashboardTable
          columns={tableColumns}
          headers={[
            "Code",
            "Discount",
            "Minimum",
            "Usage",
            "Validity",
            "Status",
            <span key="actions" className="text-right">
              Actions
            </span>,
          ]}
          hasData={coupons.length > 0}
          isLoading={isLoading}
          minWidth={980}
          emptyState={
            <div className="flex min-h-[260px] flex-col items-center justify-center px-4 py-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EAF7EF] text-[color:var(--color-primary)]">
                <SvgIcon src="/icons/coupon.svg" size={22} />
              </div>
              <p className="mt-3 text-[15px] font-bold text-[color:var(--color-maintext)]">
                No coupons found
              </p>
              <p className="mt-1 text-[13px] text-[#7C8794]">
                Create a coupon or adjust filters to see results.
              </p>
            </div>
          }
        >
          {coupons.map((coupon) => (
            <DashboardTableRow
              key={coupon.id}
              columns={tableColumns}
              minWidth={980}
            >
              <div className="min-w-0">
                <button
                  type="button"
                  onClick={() => handleEdit(coupon)}
                  className="block max-w-full truncate text-left font-black text-[color:var(--color-maintext)] transition-colors hover:text-[color:var(--color-primary)] focus:outline-none focus-visible:text-[color:var(--color-primary)]"
                >
                  {coupon.code}
                </button>
                <p className="mt-1 truncate text-[12px] text-[#7C8794]">
                  {coupon.description || "No description"}
                </p>
              </div>
              <span className="font-bold text-[#1F2937]">
                {formatDiscount(coupon)}
              </span>
              <span className="text-[#6B7280]">
                {formatMoney(coupon.minOrderAmount)}
              </span>
              <span className="text-[#6B7280]">
                {coupon.usageLimit
                  ? `${coupon.usedCount}/${coupon.usageLimit}`
                  : `${coupon.usedCount}/Unlimited`}
              </span>
              <span className="text-[12px] font-semibold text-[#6B7280]">
                {formatValidity(coupon)}
              </span>
              <span
                className={cn(
                  "w-fit rounded-full px-3 py-1 text-[12px] font-bold",
                  coupon.isActive
                    ? "bg-[#DCFCE7] text-[#166534]"
                    : "bg-[#F3F4F6] text-[#6B7280]",
                )}
              >
                {coupon.isActive ? "Active" : "Inactive"}
              </span>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => handleDelete(coupon)}
                  disabled={deletingId === coupon.id}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#FECACA] text-[#E11D48] transition-colors hover:bg-[#FFF1F2] disabled:opacity-50"
                  aria-label={`Delete ${coupon.code}`}
                  title="Delete"
                >
                  <SvgIcon src="/icons/trash.svg" size={18} />
                </button>
              </div>
            </DashboardTableRow>
          ))}
        </DashboardTable>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[13px] text-[#7C8794]">
            Page {page} of {totalPages}
          </p>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            disabled={isLoading}
            onPageChange={setPage}
          />
        </div>
      </section>

      <aside className="rounded-[20px] border border-[#E5E7EB] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)] lg:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-subtext)]">
              {editingCoupon ? "Edit coupon" : "New coupon"}
            </p>
            <h3 className="mt-1 text-[20px] font-black text-[color:var(--color-maintext)]">
              {editingCoupon ? editingCoupon.code : "Create coupon"}
            </h3>
          </div>
          {editingCoupon ? (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-[#E5E7EB] px-3 py-2 text-[12px] font-bold text-[#6B7280] transition-colors hover:bg-[#F8FAFC]"
            >
              Clear
            </button>
          ) : null}
        </div>

        <form className="mt-5 grid gap-3" onSubmit={handleSubmit}>
          <Input
            label="Code"
            isRequired
            value={form.code}
            onChange={(event) =>
              updateForm({ code: event.target.value.toUpperCase() })
            }
            placeholder="COUPONCODE"
            maxLength={50}
          />

          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
            Description
            <textarea
              value={form.description}
              onChange={(event) =>
                updateForm({ description: event.target.value })
              }
              placeholder="Enter coupon description"
              maxLength={255}
              className="min-h-[92px] resize-none rounded border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#1F2937] outline-none transition-colors placeholder:text-[color:var(--color-subtext)] focus:border-[#0088FF]"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
            Discount type
            <select
              value={form.discountType}
              onChange={(event) =>
                updateForm({ discountType: event.target.value as DiscountType })
              }
              className="h-[44px] rounded border border-[#E5E7EB] bg-white px-4 text-sm text-[#1F2937] outline-none transition-colors focus:border-[#0088FF]"
            >
              <option value="PERCENTAGE">Percentage</option>
              <option value="FIXED_AMOUNT">Fixed amount</option>
            </select>
            <span className="min-h-4 text-[11px] text-transparent">.</span>
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label={form.discountType === "PERCENTAGE" ? "Percent" : "Amount"}
              isRequired
              type="number"
              min="0"
              max={form.discountType === "PERCENTAGE" ? 100 : undefined}
              step="0.01"
              value={form.discountValue}
              onChange={(event) =>
                updateForm({ discountValue: event.target.value })
              }
              placeholder={form.discountType === "PERCENTAGE" ? "10" : "5.00"}
            />
            <Input
              label="Min order"
              type="number"
              min="0"
              step="0.01"
              value={form.minOrderAmount}
              onChange={(event) =>
                updateForm({ minOrderAmount: event.target.value })
              }
              placeholder="0.00"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Max discount"
              type="number"
              min="0"
              step="0.01"
              value={form.maxDiscountAmount}
              onChange={(event) =>
                updateForm({ maxDiscountAmount: event.target.value })
              }
              placeholder="No limit"
            />
            <Input
              label="Usage limit"
              type="number"
              min="1"
              step="1"
              value={form.usageLimit}
              onChange={(event) =>
                updateForm({ usageLimit: event.target.value })
              }
              placeholder="Unlimited"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Starts at"
              type="datetime-local"
              value={form.startsAt}
              onChange={(event) => updateForm({ startsAt: event.target.value })}
            />
            <Input
              label="Expires at"
              type="datetime-local"
              value={form.expiresAt}
              onChange={(event) =>
                updateForm({ expiresAt: event.target.value })
              }
            />
          </div>

          <label className="mt-1 flex items-center justify-between rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3">
            <span>
              <span className="block text-[14px] font-bold text-[#1F2937]">
                Active
              </span>
              <span className="block text-[12px] text-[#7C8794]">
                Allow customers to apply this code at checkout
              </span>
            </span>
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) =>
                updateForm({ isActive: event.target.checked })
              }
              className="h-5 w-5 accent-[color:var(--color-primary)]"
            />
          </label>

          <Button
            type="submit"
            variant="primary"
            className="mt-2"
            disabled={isSaving}
          >
            {isSaving
              ? "Saving..."
              : editingCoupon
                ? "Update coupon"
                : "Create coupon"}
          </Button>
        </form>
      </aside>
    </div>
  );
}

function DiscountFilterTabs({
  value,
  onChange,
}: {
  value: DiscountFilter;
  onChange: (value: DiscountFilter) => void;
}) {
  const filters: Array<{ label: string; value: DiscountFilter }> = [
    { label: "All types", value: "all" },
    { label: "%", value: "PERCENTAGE" },
    { label: "$", value: "FIXED_AMOUNT" },
  ];

  return (
    <div className="flex items-center gap-1 pt-[29px]">
      {filters.map((filter) => (
        <button
          key={filter.value}
          type="button"
          aria-pressed={value === filter.value}
          onClick={() => onChange(filter.value)}
          className={cn(
            "flex h-[44px] min-w-[48px] items-center justify-center rounded-lg px-4 text-[13px] font-semibold transition-colors",
            value === filter.value
              ? "bg-[#F0FDF4] text-[color:var(--color-primary)]"
              : "text-[#6B7280] hover:bg-[#F8FAFC] hover:text-[#1F2937]",
          )}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}

function numberOrUndefined(value: string) {
  if (!value.trim()) {
    return undefined;
  }

  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : Number.NaN;
}

function toIsoString(value: string) {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function toDateTimeInput(value: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function formatDiscount(coupon: Coupon) {
  if (coupon.discountType === "PERCENTAGE") {
    return `${coupon.discountValue}%`;
  }

  return formatMoney(coupon.discountValue);
}

function formatMoney(value: number) {
  return `$${value.toLocaleString("en-US", {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value: string | null) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function formatValidity(coupon: Coupon) {
  const startsAt = formatDate(coupon.startsAt);
  const expiresAt = formatDate(coupon.expiresAt);

  if (startsAt && expiresAt) {
    return `${startsAt} - ${expiresAt}`;
  }

  if (startsAt) {
    return `From ${startsAt}`;
  }

  if (expiresAt) {
    return `Until ${expiresAt}`;
  }

  return "No date limit";
}
