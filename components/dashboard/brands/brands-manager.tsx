"use client";

import Image from "next/image";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  DashboardTable,
  DashboardTableRow,
} from "@/components/dashboard/shared/dashboard-table";
import { DashboardStat } from "@/components/dashboard/shared/dashboard-stat";
import {
  StatusFilterTabs,
  type StatusFilter,
} from "@/components/dashboard/shared/status-filter-tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { SvgIcon } from "@/components/ui/svg-icon";
import {
  createBrand,
  deleteBrand,
  getBrands,
  updateBrand,
  type Brand,
  type BrandPayload,
} from "@/lib/api/brands";
import { uploadImage } from "@/lib/api/uploads";
import { cn } from "@/lib/cn";

type FormState = {
  name: string;
  description: string;
  slug: string;
  logoUrl: string;
  isActive: boolean;
};

const emptyForm: FormState = {
  name: "",
  description: "",
  slug: "",
  logoUrl: "",
  isActive: true,
};

const pageSize = 10;
const tableColumns = "0.45fr 1.15fr 0.8fr 0.6fr 0.5fr 88px";

export function BrandsManager() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBrands, setTotalBrands] = useState(0);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedBrands, setHasLoadedBrands] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const activeCount = useMemo(
    () => brands.filter((brand) => brand.isActive).length,
    [brands],
  );

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    loadBrands();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, statusFilter, page]);

  useEffect(() => {
    return () => {
      if (logoPreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(logoPreviewUrl);
      }
    };
  }, [logoPreviewUrl]);

  async function loadBrands() {
    setIsLoading(true);

    try {
      const response = await getBrands({
        search: debouncedSearch,
        isActive:
          statusFilter === "all" ? undefined : statusFilter === "active",
        page,
        limit: pageSize,
      });

      setBrands(response.data);
      setTotalPages(Math.max(response.meta.totalPages, 1));
      setTotalBrands(response.meta.total);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not load brands.",
      );
    } finally {
      setHasLoadedBrands(true);
      setIsLoading(false);
    }
  }

  function handleEdit(brand: Brand) {
    setEditingBrand(brand);
    setForm({
      name: brand.name,
      description: brand.description ?? "",
      slug: brand.slug,
      logoUrl: brand.logoUrl ?? "",
      isActive: brand.isActive,
    });
    setLogoPreviewUrl(brand.logoUrl ?? "");
  }

  function resetForm() {
    setEditingBrand(null);
    setForm(emptyForm);
    setLogoPreviewUrl("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.name.trim()) {
      toast.error("Brand name is required.");
      return;
    }

    const payload: BrandPayload = {
      name: form.name,
      description: form.description,
      slug: form.slug,
      logoUrl: form.logoUrl,
      isActive: form.isActive,
    };

    setIsSaving(true);

    try {
      if (editingBrand) {
        await updateBrand(editingBrand.id, payload);
        toast.success("Brand updated successfully.");
      } else {
        await createBrand(payload);
        toast.success("Brand created successfully.");
      }

      resetForm();
      await loadBrands();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save brand.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(brand: Brand) {
    const confirmed = window.confirm(`Delete brand "${brand.name}"?`);

    if (!confirmed) {
      return;
    }

    setDeletingId(brand.id);

    try {
      await deleteBrand(brand.id);
      toast.success("Brand deleted successfully.");
      if (brands.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        await loadBrands();
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not delete brand.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  async function handleLogoUpload(file: File | undefined) {
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }

    const localPreviewUrl = URL.createObjectURL(file);
    setLogoPreviewUrl((previousUrl) => {
      if (previousUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previousUrl);
      }

      return localPreviewUrl;
    });

    setIsUploadingLogo(true);
    try {
      const result = await uploadImage(file, "brands");
      setForm((current) => ({ ...current, logoUrl: result.url }));
      setLogoPreviewUrl((previousUrl) => {
        if (previousUrl.startsWith("blob:")) {
          URL.revokeObjectURL(previousUrl);
        }

        return result.url;
      });
      toast.success("Brand logo uploaded successfully.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not upload logo.",
      );
    } finally {
      setIsUploadingLogo(false);
    }
  }

  function clearLogo() {
    setForm((current) => ({ ...current, logoUrl: "" }));
    setLogoPreviewUrl((previousUrl) => {
      if (previousUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previousUrl);
      }

      return "";
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <section className="min-w-0 rounded-[20px] border border-[#E5E7EB] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)] lg:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-subtext)]">
              Catalog
            </p>
            <h2 className="mt-1 text-[24px] font-black text-[color:var(--color-maintext)]">
              Brands
            </h2>
            <p className="mt-2 max-w-[620px] text-[14px] leading-6 text-[#6B7280]">
              Manage product brands, logo references, and brand availability.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <DashboardStat label="Total" value={totalBrands} />
            <DashboardStat label="Active" value={activeCount} />
            <DashboardStat label="Page" value={page} />
          </div>
        </div>

        <div className="mt-6 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-start">
          <Input
            label="Search brands"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name or description"
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
            "Logo",
            "Name",
            "Slug",
            "Status",
            "Products",
            <span key="actions" className="text-right">
              Actions
            </span>,
          ]}
          hasData={brands.length > 0}
          isLoading={isLoading}
          showSkeleton={isLoading && !hasLoadedBrands}
          emptyState={
            <div className="flex min-h-[240px] flex-col items-center justify-center px-4 py-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EAF7EF] text-[color:var(--color-primary)]">
                <SvgIcon src="/icons/brand.svg" size={22} />
              </div>
              <p className="mt-3 text-[15px] font-bold text-[color:var(--color-maintext)]">
                No brands found
              </p>
              <p className="mt-1 text-[13px] text-[#7C8794]">
                Create a brand or adjust filters to see results.
              </p>
            </div>
          }
        >
          {brands.map((brand) => (
            <DashboardTableRow key={brand.id} columns={tableColumns}>
              <BrandLogo brand={brand} />
              <div className="min-w-0">
                <button
                  type="button"
                  onClick={() => handleEdit(brand)}
                  className="block max-w-full truncate text-left font-bold text-[color:var(--color-maintext)] transition-colors hover:text-[color:var(--color-primary)] focus:outline-none focus-visible:text-[color:var(--color-primary)]"
                >
                  {brand.name}
                </button>
                <p className="mt-1 truncate text-[12px] text-[#7C8794]">
                  {brand.description || "No description"}
                </p>
              </div>
              <span className="truncate text-[#6B7280]">
                {brand.slug || "-"}
              </span>
              <span
                className={cn(
                  "w-fit rounded-full px-3 py-1 text-[12px] font-bold",
                  brand.isActive
                    ? "bg-[#DCFCE7] text-[#166534]"
                    : "bg-[#F3F4F6] text-[#6B7280]",
                )}
              >
                {brand.isActive ? "Active" : "Inactive"}
              </span>
              <span className="font-semibold text-[#1F2937]">
                {brand.productCount}
              </span>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => handleDelete(brand)}
                  disabled={deletingId === brand.id}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#FECACA] text-[#E11D48] transition-colors hover:bg-[#FFF1F2] disabled:opacity-50"
                  aria-label={`Delete ${brand.name}`}
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
            disabled={isLoading && !hasLoadedBrands}
            onPageChange={setPage}
          />
        </div>
      </section>

      <aside className="rounded-[20px] border border-[#E5E7EB] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)] lg:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-subtext)]">
              {editingBrand ? "Edit brand" : "New brand"}
            </p>
            <h3 className="mt-1 text-[20px] font-black text-[color:var(--color-maintext)]">
              {editingBrand ? editingBrand.name : "Create brand"}
            </h3>
          </div>
          {editingBrand ? (
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
            label="Name"
            isRequired
            value={form.name}
            onChange={(event) =>
              setForm((current) => ({ ...current, name: event.target.value }))
            }
            placeholder="Apple"
            maxLength={100}
          />
          <Input
            label="Slug"
            value={form.slug}
            onChange={(event) =>
              setForm((current) => ({ ...current, slug: event.target.value }))
            }
            placeholder="apple"
            maxLength={100}
          />
          <div className="grid gap-2">
            <p className="text-sm font-medium text-slate-700">Logo</p>
            {logoPreviewUrl ? (
              <div className="relative rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-3">
                <button
                  type="button"
                  onClick={clearLogo}
                  className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#64748B] shadow-sm transition-colors hover:text-[#E11D48]"
                  aria-label="Remove logo"
                  title="Remove logo"
                >
                  <SvgIcon src="/icons/close.svg" size={16} />
                </button>
                <div className="flex items-center gap-3 pr-9">
                  <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">
                    <Image
                      src={logoPreviewUrl}
                      alt="Brand logo preview"
                      width={64}
                      height={64}
                      className="h-full w-full object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-bold text-[#1F2937]">
                      {isUploadingLogo ? "Uploading..." : "Logo ready"}
                    </p>
                    <p className="mt-1 truncate text-[12px] text-[#7C8794]">
                      {isUploadingLogo
                        ? "Please wait before saving"
                        : "Image will be saved with this brand"}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <label className="flex min-h-[112px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-4 py-5 text-center transition-colors hover:border-[color:var(--color-primary)] hover:bg-[#F0FDF4]">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="sr-only"
                  disabled={isUploadingLogo}
                  onChange={(event) => {
                    handleLogoUpload(event.target.files?.[0]);
                    event.currentTarget.value = "";
                  }}
                />
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[color:var(--color-primary)] shadow-sm">
                  <SvgIcon src="/icons/brand.svg" size={22} />
                </span>
                <span className="mt-3 text-[13px] font-bold text-[#1F2937]">
                  {isUploadingLogo ? "Uploading..." : "Choose brand logo"}
                </span>
                <span className="mt-1 text-[12px] text-[#7C8794]">
                  JPG, PNG, WEBP or GIF, max 5MB
                </span>
              </label>
            )}
          </div>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
            Description
            <textarea
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              placeholder="Short note for this brand"
              maxLength={255}
              className="min-h-[112px] resize-none rounded border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#1F2937] outline-none transition-colors placeholder:text-[color:var(--color-subtext)] focus:border-[#0088FF]"
            />
          </label>

          <label className="mt-1 flex items-center justify-between rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3">
            <span>
              <span className="block text-[14px] font-bold text-[#1F2937]">
                Active
              </span>
              <span className="block text-[12px] text-[#7C8794]">
                Show this brand for product workflows
              </span>
            </span>
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  isActive: event.target.checked,
                }))
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
              : editingBrand
                ? "Update brand"
                : "Create brand"}
          </Button>
        </form>
      </aside>
    </div>
  );
}

function BrandLogo({ brand }: { brand: Brand }) {
  return (
    <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] text-[color:var(--color-primary)]">
      {brand.logoUrl ? (
        <Image
          src={brand.logoUrl}
          alt={`${brand.name} logo`}
          width={44}
          height={44}
          className="h-full w-full object-cover"
          unoptimized
        />
      ) : (
        <SvgIcon src="/icons/brand.svg" size={22} />
      )}
    </div>
  );
}
