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
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
  type Category,
  type CategoryPayload,
} from "@/lib/api/categories";
import { uploadImage } from "@/lib/api/uploads";
import { cn } from "@/lib/cn";

type FormState = {
  name: string;
  description: string;
  slug: string;
  imageUrl: string;
  isActive: boolean;
};

const emptyForm: FormState = {
  name: "",
  description: "",
  slug: "",
  imageUrl: "",
  isActive: true,
};

const pageSize = 10;
const tableColumns = "0.45fr 1.15fr 0.8fr 0.6fr 0.5fr 88px";

export function CategoriesManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCategories, setTotalCategories] = useState(0);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedCategories, setHasLoadedCategories] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const activeCount = useMemo(
    () => categories.filter((category) => category.isActive).length,
    [categories],
  );

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, statusFilter, page]);

  useEffect(() => {
    return () => {
      if (imagePreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  async function loadCategories() {
    setIsLoading(true);

    try {
      const response = await getCategories({
        search: debouncedSearch,
        isActive:
          statusFilter === "all" ? undefined : statusFilter === "active",
        page,
        limit: pageSize,
      });

      setCategories(response.data);
      setTotalPages(Math.max(response.meta.totalPages, 1));
      setTotalCategories(response.meta.total);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not load categories.",
      );
    } finally {
      setHasLoadedCategories(true);
      setIsLoading(false);
    }
  }

  function handleEdit(category: Category) {
    setEditingCategory(category);
    setForm({
      name: category.name,
      description: category.description ?? "",
      slug: category.slug ?? "",
      imageUrl: category.imageUrl ?? "",
      isActive: category.isActive,
    });
    setImagePreviewUrl(category.imageUrl ?? "");
  }

  function resetForm() {
    setEditingCategory(null);
    setForm(emptyForm);
    setImagePreviewUrl("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.name.trim()) {
      toast.error("Category name is required.");
      return;
    }

    const payload: CategoryPayload = {
      name: form.name,
      description: form.description,
      slug: form.slug,
      imageUrl: form.imageUrl,
      isActive: form.isActive,
    };

    setIsSaving(true);

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, payload);
        toast.success("Category updated successfully.");
      } else {
        await createCategory(payload);
        toast.success("Category created successfully.");
      }

      resetForm();
      await loadCategories();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not save category.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(category: Category) {
    const confirmed = window.confirm(`Delete category "${category.name}"?`);

    if (!confirmed) {
      return;
    }

    setDeletingId(category.id);

    try {
      await deleteCategory(category.id);
      toast.success("Category deleted successfully.");
      if (categories.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        await loadCategories();
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not delete category.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  async function handleImageUpload(file: File | undefined) {
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }

    const localPreviewUrl = URL.createObjectURL(file);
    setImagePreviewUrl((previousUrl) => {
      if (previousUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previousUrl);
      }

      return localPreviewUrl;
    });

    setIsUploadingImage(true);
    try {
      const result = await uploadImage(file, "categories");
      setForm((current) => ({ ...current, imageUrl: result.url }));
      setImagePreviewUrl((previousUrl) => {
        if (previousUrl.startsWith("blob:")) {
          URL.revokeObjectURL(previousUrl);
        }

        return result.url;
      });
      toast.success("Category image uploaded successfully.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not upload image.",
      );
    } finally {
      setIsUploadingImage(false);
    }
  }

  function clearImage() {
    setForm((current) => ({ ...current, imageUrl: "" }));
    setImagePreviewUrl((previousUrl) => {
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
              Categories
            </h2>
            <p className="mt-2 max-w-[620px] text-[14px] leading-6 text-[#6B7280]">
              Manage product categories, category images, and catalog
              availability.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <DashboardStat label="Total" value={totalCategories} />
            <DashboardStat label="Active" value={activeCount} />
            <DashboardStat label="Page" value={page} />
          </div>
        </div>

        <div className="mt-6 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-start">
          <Input
            label="Search categories"
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
            "Image",
            "Name",
            "Slug",
            "Status",
            "Products",
            <span key="actions" className="text-right">
              Actions
            </span>,
          ]}
          hasData={categories.length > 0}
          isLoading={isLoading}
          showSkeleton={isLoading && !hasLoadedCategories}
          emptyState={
            <div className="flex min-h-[240px] flex-col items-center justify-center px-4 py-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EAF7EF] text-[color:var(--color-primary)]">
                <SvgIcon src="/icons/categories.svg" size={22} />
              </div>
              <p className="mt-3 text-[15px] font-bold text-[color:var(--color-maintext)]">
                No categories found
              </p>
              <p className="mt-1 text-[13px] text-[#7C8794]">
                Create a category or adjust filters to see results.
              </p>
            </div>
          }
        >
          {categories.map((category) => (
            <DashboardTableRow key={category.id} columns={tableColumns}>
              <CategoryImage category={category} />
              <div className="min-w-0">
                <button
                  type="button"
                  onClick={() => handleEdit(category)}
                  className="block max-w-full truncate text-left font-bold text-[color:var(--color-maintext)] transition-colors hover:text-[color:var(--color-primary)] focus:outline-none focus-visible:text-[color:var(--color-primary)]"
                >
                  {category.name}
                </button>
                <p className="mt-1 truncate text-[12px] text-[#7C8794]">
                  {category.description || "No description"}
                </p>
              </div>
              <span className="truncate text-[#6B7280]">
                {category.slug || "-"}
              </span>
              <span
                className={cn(
                  "w-fit rounded-full px-3 py-1 text-[12px] font-bold",
                  category.isActive
                    ? "bg-[#DCFCE7] text-[#166534]"
                    : "bg-[#F3F4F6] text-[#6B7280]",
                )}
              >
                {category.isActive ? "Active" : "Inactive"}
              </span>
              <span className="font-semibold text-[#1F2937]">
                {category.productCount}
              </span>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => handleDelete(category)}
                  disabled={deletingId === category.id}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#FECACA] text-[#E11D48] transition-colors hover:bg-[#FFF1F2] disabled:opacity-50"
                  aria-label={`Delete ${category.name}`}
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
            disabled={isLoading && !hasLoadedCategories}
            onPageChange={setPage}
          />
        </div>
      </section>

      <aside className="rounded-[20px] border border-[#E5E7EB] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)] lg:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-subtext)]">
              {editingCategory ? "Edit category" : "New category"}
            </p>
            <h3 className="mt-1 text-[20px] font-black text-[color:var(--color-maintext)]">
              {editingCategory ? editingCategory.name : "Create category"}
            </h3>
          </div>
          {editingCategory ? (
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
            placeholder="Enter category name"
            maxLength={100}
          />
          <Input
            label="Slug"
            value={form.slug}
            onChange={(event) =>
              setForm((current) => ({ ...current, slug: event.target.value }))
            }
            placeholder="category-slug"
            maxLength={100}
          />
          <div className="grid gap-2">
            <p className="text-sm font-medium text-slate-700">Image</p>
            {imagePreviewUrl ? (
              <div className="relative rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-3">
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#64748B] shadow-sm transition-colors hover:text-[#E11D48]"
                  aria-label="Remove image"
                  title="Remove image"
                >
                  <SvgIcon src="/icons/close.svg" size={16} />
                </button>
                <div className="flex items-center gap-3 pr-9">
                  <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">
                    <Image
                      src={imagePreviewUrl}
                      alt="Category image preview"
                      width={64}
                      height={64}
                      className="h-full w-full object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-bold text-[#1F2937]">
                      {isUploadingImage ? "Uploading..." : "Image ready"}
                    </p>
                    <p className="mt-1 truncate text-[12px] text-[#7C8794]">
                      {isUploadingImage
                        ? "Please wait before saving"
                        : "Image will be saved with this category"}
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
                  disabled={isUploadingImage}
                  onChange={(event) => {
                    handleImageUpload(event.target.files?.[0]);
                    event.currentTarget.value = "";
                  }}
                />
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[color:var(--color-primary)] shadow-sm">
                  <SvgIcon src="/icons/categories.svg" size={22} />
                </span>
                <span className="mt-3 text-[13px] font-bold text-[#1F2937]">
                  {isUploadingImage ? "Uploading..." : "Choose category image"}
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
              placeholder="Enter category description"
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
                Show this category for product workflows
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
              : editingCategory
                ? "Update category"
                : "Create category"}
          </Button>
        </form>
      </aside>
    </div>
  );
}

function CategoryImage({ category }: { category: Category }) {
  return (
    <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] text-[color:var(--color-primary)]">
      {category.imageUrl ? (
        <Image
          src={category.imageUrl}
          alt={`${category.name} category`}
          width={44}
          height={44}
          className="h-full w-full object-cover"
          unoptimized
        />
      ) : (
        <SvgIcon src="/icons/categories.svg" size={22} />
      )}
    </div>
  );
}
