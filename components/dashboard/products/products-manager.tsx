"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { SvgIcon } from "@/components/ui/svg-icon";
import { getBrands, type Brand } from "@/lib/api/brands";
import { getCategories, type Category } from "@/lib/api/categories";
import { deleteProduct, getProducts, type Product } from "@/lib/api/products";
import { cn } from "@/lib/cn";

const pageSize = 10;
const tableColumns = "1.4fr 0.65fr 0.75fr 0.6fr 0.52fr 0.55fr 0.55fr 88px";

export function ProductsManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const activeCount = useMemo(
    () => products.filter((product) => product.isActive).length,
    [products],
  );

  const totalStock = useMemo(
    () => products.reduce((total, product) => total + product.stock, 0),
    [products],
  );

  useEffect(() => {
    loadFilterOptions();
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, statusFilter, categoryFilter, brandFilter, page]);

  async function loadFilterOptions() {
    setIsLoadingOptions(true);

    try {
      const [categoryResponse, brandResponse] = await Promise.all([
        getCategories({ isActive: true, page: 1, limit: 100 }),
        getBrands({ isActive: true, page: 1, limit: 100 }),
      ]);

      setCategories(categoryResponse.data);
      setBrands(brandResponse.data);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not load product filters.",
      );
    } finally {
      setIsLoadingOptions(false);
    }
  }

  async function loadProducts() {
    setIsLoading(true);

    try {
      const response = await getProducts({
        search: debouncedSearch,
        categoryId: categoryFilter || undefined,
        brandId: brandFilter || undefined,
        isActive:
          statusFilter === "all" ? undefined : statusFilter === "active",
        page,
        limit: pageSize,
      });

      setProducts(response.data);
      setTotalPages(Math.max(response.meta.totalPages, 1));
      setTotalProducts(response.meta.total);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not load products.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(product: Product) {
    const confirmed = window.confirm(`Delete product "${product.name}"?`);

    if (!confirmed) {
      return;
    }

    setDeletingId(product.id);

    try {
      await deleteProduct(product.id);
      toast.success("Product deleted successfully.");
      if (products.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        await loadProducts();
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not delete product.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="grid gap-6">
      <section className="min-w-0 rounded-[20px] border border-[#E5E7EB] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)] lg:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-subtext)]">
              Product
            </p>
            <h2 className="mt-1 text-[24px] font-black text-[color:var(--color-maintext)]">
              Product list
            </h2>
            <p className="mt-2 max-w-[620px] text-[14px] leading-6 text-[#6B7280]">
              Review catalog items, inventory, media, variants, and publishing
              status.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <DashboardStat label="Total" value={totalProducts} />
            <DashboardStat label="Active" value={activeCount} />
            <DashboardStat label="Stock" value={totalStock} />
            <DashboardStat label="Page" value={page} />
          </div>
        </div>

        <div className="mt-6 grid gap-3 xl:grid-cols-[1fr_190px_190px_auto] xl:items-start">
          <Input
            label="Search products"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name or description"
          />

          <SelectFilter
            label="Category"
            value={categoryFilter}
            disabled={isLoadingOptions}
            onChange={(value) => {
              setCategoryFilter(value);
              setPage(1);
            }}
            options={categories.map((category) => ({
              value: category.id,
              label: category.name,
            }))}
            placeholder="All categories"
          />

          <SelectFilter
            label="Brand"
            value={brandFilter}
            disabled={isLoadingOptions}
            onChange={(value) => {
              setBrandFilter(value);
              setPage(1);
            }}
            options={brands.map((brand) => ({
              value: brand.id,
              label: brand.name,
            }))}
            placeholder="All brands"
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
            "Product",
            "SKU",
            "Category",
            "Price",
            "Stock",
            "Media",
            "Status",
            <span key="actions" className="text-right">
              Actions
            </span>,
          ]}
          hasData={products.length > 0}
          isLoading={isLoading}
          minWidth={1080}
          emptyState={
            <div className="flex min-h-[280px] flex-col items-center justify-center px-4 py-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EAF7EF] text-[color:var(--color-primary)]">
                <SvgIcon src="/icons/product-list.svg" size={22} />
              </div>
              <p className="mt-3 text-[15px] font-bold text-[color:var(--color-maintext)]">
                No products found
              </p>
              <p className="mt-1 text-[13px] text-[#7C8794]">
                Add a product or adjust filters to see results.
              </p>
              <Link
                href="/dashboard/products/add"
                className="mt-4 flex h-[44px] w-auto items-center rounded-lg bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-secondary"
              >
                Add product
              </Link>
            </div>
          }
        >
          {products.map((product) => (
            <DashboardTableRow
              key={product.id}
              columns={tableColumns}
              minWidth={1080}
            >
              <div className="grid min-w-0 grid-cols-[56px_1fr] items-center gap-3">
                <ProductThumbnail product={product} />
                <div className="min-w-0">
                  <p className="truncate font-black text-[color:var(--color-maintext)]">
                    {product.name}
                  </p>
                  <p className="mt-1 truncate text-[12px] text-[#7C8794]">
                    {product.brand?.name || "No brand"}
                    {product.variations?.length
                      ? ` - ${product.variations.length} variants`
                      : ""}
                  </p>
                </div>
              </div>
              <span className="truncate font-semibold text-[#6B7280]">
                {product.sku}
              </span>
              <span className="truncate text-[#6B7280]">
                {product.category || "-"}
              </span>
              <span className="font-bold text-[#1F2937]">
                {formatPrice(product)}
              </span>
              <StockBadge stock={product.stock} />
              <span className="font-semibold text-[#6B7280]">
                {product.images?.length || (product.imageUrl ? 1 : 0)}
              </span>
              <span
                className={cn(
                  "w-fit rounded-full px-3 py-1 text-[12px] font-bold",
                  product.isActive
                    ? "bg-[#DCFCE7] text-[#166534]"
                    : "bg-[#F3F4F6] text-[#6B7280]",
                )}
              >
                {product.isActive ? "Active" : "Inactive"}
              </span>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => handleDelete(product)}
                  disabled={deletingId === product.id}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#FECACA] text-[#E11D48] transition-colors hover:bg-[#FFF1F2] disabled:opacity-50"
                  aria-label={`Delete ${product.name}`}
                  title="Delete"
                >
                  <SvgIcon src="/icons/trash.svg" size={18} />
                </button>
              </div>
            </DashboardTableRow>
          ))}
        </DashboardTable>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <p className="text-[13px] text-[#7C8794]">
              Page {page} of {totalPages}
            </p>
            <Link
              href="/dashboard/products/add"
              className="text-[13px] font-bold text-[color:var(--color-primary)] transition-colors hover:text-[#0F766E]"
            >
              Add product
            </Link>
          </div>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            disabled={isLoading}
            onPageChange={setPage}
          />
        </div>
      </section>
    </div>
  );
}

function SelectFilter({
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
        className="h-[44px] rounded border border-[#E5E7EB] bg-white px-4 text-sm text-[#1F2937] outline-none transition-colors focus:border-[#0088FF] disabled:bg-[#F8FAFC]"
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

function ProductThumbnail({ product }: { product: Product }) {
  const primaryImage =
    product.images?.find((image) => image.isPrimary)?.imageUrl ??
    product.imageUrl;

  if (!primaryImage) {
    return (
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#F8FAFC] text-[#94A3B8]">
        <SvgIcon src="/icons/product-list.svg" size={22} />
      </div>
    );
  }

  return (
    <Image
      src={primaryImage}
      alt={product.name}
      width={96}
      height={96}
      className="h-14 w-14 rounded-xl object-cover"
      unoptimized
    />
  );
}

function StockBadge({ stock }: { stock: number }) {
  const isLowStock = stock > 0 && stock <= 10;
  const isOut = stock <= 0;

  return (
    <span
      className={cn(
        "w-fit rounded-full px-3 py-1 text-[12px] font-bold",
        isOut
          ? "bg-[#FEF2F2] text-[#B91C1C]"
          : isLowStock
            ? "bg-[#FEF3C7] text-[#92400E]"
            : "bg-[#EEF2FF] text-[#3730A3]",
      )}
    >
      {stock}
    </span>
  );
}

function formatPrice(product: Product) {
  const variationPrices =
    product.variations?.map((variation) => variation.price) ?? [];

  if (variationPrices.length > 0) {
    const min = Math.min(...variationPrices);
    const max = Math.max(...variationPrices);

    if (min !== max) {
      return `${formatMoney(min)} - ${formatMoney(max)}`;
    }

    return formatMoney(min);
  }

  return formatMoney(product.price);
}

function formatMoney(value: number) {
  return `$${value.toLocaleString("en-US", {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}
