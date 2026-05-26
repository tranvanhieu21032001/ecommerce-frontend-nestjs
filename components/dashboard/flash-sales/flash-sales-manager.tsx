"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createFlashSale,
  getFlashSaleReports,
  type CreateFlashSalePayload,
  type FlashSaleReport,
} from "@/lib/api/flash-sales";
import { getProducts, type Product } from "@/lib/api/products";

type ItemForm = {
  key: number;
  productId: string;
  variationId: string;
  salePrice: string;
  stockLimit: string;
  perUserLimit: string;
};

let nextItemKey = 1;

function emptyItem(): ItemForm {
  return {
    key: nextItemKey++,
    productId: "",
    variationId: "",
    salePrice: "",
    stockLimit: "1",
    perUserLimit: "1",
  };
}

export function FlashSalesManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [items, setItems] = useState<ItemForm[]>(() => [emptyItem()]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [reports, setReports] = useState<FlashSaleReport[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(true);

  const totals = useMemo(
    () =>
      reports.reduce(
        (total, sale) => ({
          campaigns: total.campaigns + 1,
          soldCount: total.soldCount + sale.metrics.soldCount,
          orderCount: total.orderCount + sale.metrics.orderCount,
          revenue: total.revenue + sale.metrics.revenue,
        }),
        { campaigns: 0, soldCount: 0, orderCount: 0, revenue: 0 },
      ),
    [reports],
  );

  async function refreshReports() {
    setIsLoadingReports(true);
    try {
      setReports(await getFlashSaleReports());
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not load flash sale reports.",
      );
    } finally {
      setIsLoadingReports(false);
    }
  }

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      try {
        const response = await getProducts({ isActive: true, page: 1, limit: 100 });
        if (active) {
          setProducts(response.data.filter((product) => product.stock > 0));
        }
      } catch (error) {
        if (active) {
          toast.error(
            error instanceof Error ? error.message : "Could not load products.",
          );
        }
      } finally {
        if (active) {
          setIsLoadingProducts(false);
        }
      }
    }

    void loadProducts();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadReports() {
      try {
        const response = await getFlashSaleReports();
        if (active) {
          setReports(response);
        }
      } catch (error) {
        if (active) {
          toast.error(
            error instanceof Error ? error.message : "Could not load flash sale reports.",
          );
        }
      } finally {
        if (active) {
          setIsLoadingReports(false);
        }
      }
    }

    void loadReports();

    return () => {
      active = false;
    };
  }, []);

  function updateItem(key: number, patch: Partial<ItemForm>) {
    setItems((current) =>
      current.map((item) => (item.key === key ? { ...item, ...patch } : item)),
    );
  }

  function selectProduct(item: ItemForm, productId: string) {
    const product = products.find((candidate) => candidate.id === productId);
    const hasVariations = getActiveVariations(product).length > 0;

    updateItem(item.key, {
      productId,
      variationId: "",
      salePrice: product && !hasVariations ? String(product.price) : "",
      stockLimit: product && !hasVariations ? String(Math.min(product.stock, 1)) : "1",
    });
  }

  function selectVariation(item: ItemForm, variationId: string) {
    const product = products.find((candidate) => candidate.id === item.productId);
    const variation = getActiveVariations(product).find(
      (candidate) => candidate.id === variationId,
    );

    updateItem(item.key, {
      variationId,
      salePrice: variation ? String(variation.price) : "",
      stockLimit: variation ? String(Math.min(product?.stock ?? 0, variation.stock, 1)) : "1",
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = buildPayload();
    if (!payload) {
      return;
    }

    setIsSaving(true);
    try {
      await createFlashSale(payload);
      await refreshReports();
      toast.success("Flash sale campaign created.");
      setName("");
      setStartsAt("");
      setEndsAt("");
      setIsActive(true);
      setItems([emptyItem()]);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not create flash sale.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  function buildPayload(): CreateFlashSalePayload | null {
    if (!name.trim() || !startsAt || !endsAt) {
      toast.error("Campaign name, start time and end time are required.");
      return null;
    }

    const start = new Date(startsAt);
    const end = new Date(endsAt);
    if (start >= end) {
      toast.error("End time must be after start time.");
      return null;
    }

    const selections = new Set<string>();
    const payloadItems: CreateFlashSalePayload["items"] = [];

    for (const item of items) {
      const product = products.find((candidate) => candidate.id === item.productId);
      if (!product) {
        toast.error("Select a product for each flash sale item.");
        return null;
      }

      const variations = getActiveVariations(product);
      const variation = variations.find((candidate) => candidate.id === item.variationId);
      if (variations.length > 0 && !variation) {
        toast.error(`Select a variation for ${product.name}.`);
        return null;
      }

      const selection = `${product.id}:${variation?.id ?? ""}`;
      if (selections.has(selection)) {
        toast.error("A product selection can only be added once.");
        return null;
      }
      selections.add(selection);

      const salePrice = Number(item.salePrice);
      const stockLimit = Number(item.stockLimit);
      const perUserLimit = Number(item.perUserLimit);
      const regularPrice = variation?.price ?? product.price;
      const availableStock = Math.min(product.stock, variation?.stock ?? product.stock);

      if (!Number.isFinite(salePrice) || salePrice < 0 || salePrice > regularPrice) {
        toast.error(`Sale price for ${product.name} must be from 0 to ${regularPrice}.`);
        return null;
      }
      if (!Number.isInteger(stockLimit) || stockLimit < 1 || stockLimit > availableStock) {
        toast.error(`Stock limit for ${product.name} must be from 1 to ${availableStock}.`);
        return null;
      }
      if (!Number.isInteger(perUserLimit) || perUserLimit < 1) {
        toast.error("Per-customer limit must be a whole number greater than 0.");
        return null;
      }

      payloadItems.push({
        productId: product.id,
        variationId: variation?.id,
        salePrice,
        stockLimit,
        perUserLimit,
      });
    }

    return {
      name: name.trim(),
      startsAt: start.toISOString(),
      endsAt: end.toISOString(),
      isActive,
      items: payloadItems,
    };
  }

  return (
    <section className="rounded-[20px] border border-[#E5E7EB] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)] lg:p-6">
      <div>
        <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-subtext)]">
          Sales
        </p>
        <h2 className="mt-1 text-[24px] font-black text-[color:var(--color-maintext)]">
          Flash sale campaigns
        </h2>
        <p className="mt-2 max-w-[680px] text-[14px] leading-6 text-[#6B7280]">
          Schedule discounted inventory. Customers reserve a limited slot before
          proceeding to checkout.
        </p>
      </div>

      <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <ReportMetric label="Campaigns" value={String(totals.campaigns)} />
        <ReportMetric label="Items sold" value={String(totals.soldCount)} />
        <ReportMetric label="Orders" value={String(totals.orderCount)} />
        <ReportMetric label="Paid revenue" value={formatMoney(totals.revenue)} />
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-[#E5E7EB]">
        <div className="grid grid-cols-[1.3fr_1fr_0.7fr_0.7fr_1fr] gap-3 bg-[#F8FAFC] px-4 py-3 text-[12px] font-bold uppercase tracking-[0.08em] text-[#7C8794]">
          <span>Campaign</span>
          <span>Schedule</span>
          <span>Sold</span>
          <span>Orders</span>
          <span>Paid revenue</span>
        </div>
        {isLoadingReports ? (
          <div className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-[#6B7280]">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading saved metrics...
          </div>
        ) : reports.length ? (
          reports.map((sale) => (
            <div
              key={sale.id}
              className="grid grid-cols-[1.3fr_1fr_0.7fr_0.7fr_1fr] items-center gap-3 border-t border-[#E5E7EB] px-4 py-4 text-sm"
            >
              <div>
                <p className="font-semibold text-[#111827]">{sale.name}</p>
                <p className="mt-1 text-xs text-[#6B7280]">
                  Sell-through {sale.metrics.sellThroughRate}%
                </p>
              </div>
              <p className="text-xs text-[#6B7280]">{formatSchedule(sale)}</p>
              <p className="font-semibold text-[#111827]">
                {sale.metrics.soldCount}/{sale.metrics.stockLimit}
              </p>
              <p>{sale.metrics.orderCount}</p>
              <p className="font-semibold text-primary">
                {formatMoney(sale.metrics.revenue)}
              </p>
            </div>
          ))
        ) : (
          <p className="border-t border-[#E5E7EB] px-4 py-8 text-center text-sm text-[#6B7280]">
            No persisted campaign metrics yet.
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-7 space-y-6">
        <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr_1fr_auto]">
          <Input
            label="Campaign name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Lunch flash sale"
            isRequired
          />
          <Input
            label="Starts at"
            type="datetime-local"
            value={startsAt}
            onChange={(event) => setStartsAt(event.target.value)}
            isRequired
          />
          <Input
            label="Ends at"
            type="datetime-local"
            value={endsAt}
            onChange={(event) => setEndsAt(event.target.value)}
            isRequired
          />
          <label className="flex items-center gap-2 pt-8 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
              className="h-4 w-4 accent-[color:var(--color-primary)]"
            />
            Active
          </label>
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-[16px] font-bold text-[color:var(--color-maintext)]">
              Discounted items
            </h3>
            <button
              type="button"
              onClick={() => setItems((current) => [...current, emptyItem()])}
              className="inline-flex items-center gap-2 rounded-lg border border-[#D1FAE5] px-3 py-2 text-sm font-semibold text-primary hover:bg-[#ECFDF5]"
            >
              <Plus size={15} />
              Add item
            </button>
          </div>

          {items.map((item, index) => (
            <FlashSaleItemFields
              key={item.key}
              index={index}
              item={item}
              products={products}
              loading={isLoadingProducts}
              onProductChange={(productId) => selectProduct(item, productId)}
              onVariationChange={(variationId) => selectVariation(item, variationId)}
              onChange={(patch) => updateItem(item.key, patch)}
              onRemove={() =>
                setItems((current) => current.filter((candidate) => candidate.key !== item.key))
              }
              canRemove={items.length > 1}
            />
          ))}
        </div>

        <Button
          type="submit"
          variant="primary"
          disabled={isSaving || isLoadingProducts}
          className="w-auto px-7"
        >
          {isSaving ? "Creating campaign..." : "Create flash sale"}
        </Button>
      </form>
    </section>
  );
}

function ReportMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-[#FAFCFD] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#7C8794]">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold text-[#111827]">{value}</p>
    </div>
  );
}

function formatSchedule(sale: Pick<FlashSaleReport, "startsAt" | "endsAt">) {
  const date = new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${date.format(new Date(sale.startsAt))} - ${date.format(new Date(sale.endsAt))}`;
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 2,
  }).format(value);
}

function FlashSaleItemFields({
  canRemove,
  index,
  item,
  loading,
  onChange,
  onProductChange,
  onRemove,
  onVariationChange,
  products,
}: {
  canRemove: boolean;
  index: number;
  item: ItemForm;
  loading: boolean;
  onChange: (patch: Partial<ItemForm>) => void;
  onProductChange: (value: string) => void;
  onRemove: () => void;
  onVariationChange: (value: string) => void;
  products: Product[];
}) {
  const product = products.find((candidate) => candidate.id === item.productId);
  const variations = getActiveVariations(product);

  return (
    <div className="grid gap-3 rounded-xl border border-[#E5E7EB] bg-[#FAFCFD] p-4 lg:grid-cols-[1.25fr_1fr_120px_110px_120px_42px]">
      <SelectField
        label={`Product ${index + 1}`}
        value={item.productId}
        disabled={loading}
        placeholder={loading ? "Loading products..." : "Select product"}
        onChange={onProductChange}
        options={products.map((candidate) => ({
          value: candidate.id,
          label: candidate.name,
        }))}
      />
      <SelectField
        label="Variation"
        value={item.variationId}
        disabled={!product || variations.length === 0}
        placeholder={variations.length > 0 ? "Select option" : "No variation"}
        onChange={onVariationChange}
        options={variations.map((variation) => ({
          value: variation.id,
          label: variation.options.map((option) => option.name).join(" / "),
        }))}
      />
      <Input
        label="Sale price"
        type="number"
        min={0}
        step="0.01"
        value={item.salePrice}
        onChange={(event) => onChange({ salePrice: event.target.value })}
        isRequired
      />
      <Input
        label="Stock"
        type="number"
        min={1}
        value={item.stockLimit}
        onChange={(event) => onChange({ stockLimit: event.target.value })}
        isRequired
      />
      <Input
        label="Per customer"
        type="number"
        min={1}
        value={item.perUserLimit}
        onChange={(event) => onChange({ perUserLimit: event.target.value })}
        isRequired
      />
      <button
        type="button"
        aria-label={`Remove item ${index + 1}`}
        disabled={!canRemove}
        onClick={onRemove}
        className="mt-7 flex h-11 w-11 items-center justify-center rounded-lg border border-red-100 text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30"
      >
        <Trash2 size={17} />
      </button>
    </div>
  );
}

function SelectField({
  disabled,
  label,
  onChange,
  options,
  placeholder,
  value,
}: {
  disabled?: boolean;
  label: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder: string;
  value: string;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
      {label}
      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="h-[44px] rounded border border-[#E5E7EB] bg-white px-3 text-sm text-[#1F2937] outline-none transition-colors focus:border-[#0088FF] disabled:bg-[#F8FAFC]"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <span className="min-h-4 text-[11px] text-transparent">.</span>
    </label>
  );
}

function getActiveVariations(product?: Product) {
  return product?.variations?.filter((variation) => variation.isActive) ?? [];
}
