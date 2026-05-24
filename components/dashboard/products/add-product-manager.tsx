"use client";

import Image from "next/image";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { DashboardStat } from "@/components/dashboard/shared/dashboard-stat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SvgIcon } from "@/components/ui/svg-icon";
import { getBrands, type Brand } from "@/lib/api/brands";
import { getCategories, type Category } from "@/lib/api/categories";
import { createProduct, type ProductPayload } from "@/lib/api/products";
import { getTags, type Tag } from "@/lib/api/tags";
import { uploadImage } from "@/lib/api/uploads";
import { getVariants, type Variant } from "@/lib/api/variants";
import { cn } from "@/lib/cn";

import {
  getVariantAttribute,
  getVariantColorCode,
  groupVariants,
  isColorVariantName,
} from "@/components/dashboard/variants/variant-utils";

type FormState = {
  name: string;
  description: string;
  price: string;
  stock: string;
  sku: string;
  images: ProductImageForm[];
  categoryId: string;
  brandId: string;
  tagIds: string[];
  variantIds: string[];
  isActive: boolean;
};

type ProductImageForm = {
  id: string;
  imageUrl: string;
  isPrimary: boolean;
};

type ProductVariationRow = {
  id: string;
  key: string;
  label: string;
  variantIds: string[];
  price: string;
  stock: string;
  sku: string;
  isActive: boolean;
};

const emptyForm: FormState = {
  name: "",
  description: "",
  price: "",
  stock: "0",
  sku: "",
  images: [],
  categoryId: "",
  brandId: "",
  tagIds: [],
  variantIds: [],
  isActive: true,
};

export function AddProductManager() {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [variationRows, setVariationRows] = useState<ProductVariationRow[]>([]);

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === form.categoryId),
    [categories, form.categoryId],
  );
  const selectedBrand = useMemo(
    () => brands.find((brand) => brand.id === form.brandId),
    [brands, form.brandId],
  );
  const hasVariationRows = variationRows.length > 0;

  useEffect(() => {
    loadOptions();
  }, []);

  useEffect(() => {
    setVariationRows((currentRows) =>
      buildVariationRows({
        selectedIds: form.variantIds,
        variants,
        currentRows,
        basePrice: form.price,
        baseStock: form.stock,
        baseSku: form.sku,
      }),
    );
  }, [form.variantIds, form.price, form.stock, form.sku, variants]);

  async function loadOptions() {
    setIsLoadingOptions(true);

    try {
      const [categoryResponse, brandResponse, tagResponse, variantResponse] =
        await Promise.all([
          getCategories({ isActive: true, page: 1, limit: 100 }),
          getBrands({ isActive: true, page: 1, limit: 100 }),
          getTags({ isActive: true, page: 1, limit: 100 }),
          getVariants({ isActive: true, page: 1, limit: 200 }),
        ]);

      setCategories(categoryResponse.data);
      setBrands(brandResponse.data);
      setTags(tagResponse.data);
      setVariants(variantResponse.data);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not load product options.",
      );
    } finally {
      setIsLoadingOptions(false);
    }
  }

  function updateForm(patch: Partial<FormState>) {
    setForm((current) => ({
      ...current,
      ...patch,
    }));
  }

  function toggleTag(tagId: string) {
    setForm((current) => {
      const hasTag = current.tagIds.includes(tagId);

      return {
        ...current,
        tagIds: hasTag
          ? current.tagIds.filter((id) => id !== tagId)
          : [...current.tagIds, tagId],
      };
    });
  }

  function toggleVariant(variantId: string) {
    setForm((current) => {
      const hasVariant = current.variantIds.includes(variantId);

      return {
        ...current,
        variantIds: hasVariant
          ? current.variantIds.filter((id) => id !== variantId)
          : [...current.variantIds, variantId],
      };
    });
  }

  function updateVariationRow(id: string, patch: Partial<ProductVariationRow>) {
    setVariationRows((current) =>
      current.map((row) =>
        row.id === id
          ? {
              ...row,
              ...patch,
            }
          : row,
      ),
    );
  }

  async function handleImageUpload(files: FileList | null) {
    const selectedFiles = Array.from(files ?? []);

    if (selectedFiles.length === 0) {
      return;
    }

    const invalidFile = selectedFiles.find(
      (file) => !file.type.startsWith("image/"),
    );
    if (invalidFile) {
      toast.error("Please choose image files only.");
      return;
    }

    setIsUploadingImage(true);
    try {
      const uploadedImages = await Promise.all(
        selectedFiles.map(async (file) => {
          const result = await uploadImage(file, "products");

          return {
            id: `${Date.now()}-${file.name}-${result.url}`,
            imageUrl: result.url,
            isPrimary: false,
          };
        }),
      );

      setForm((current) => {
        const hasPrimary = current.images.some((image) => image.isPrimary);
        const nextImages = [...current.images, ...uploadedImages];

        return {
          ...current,
          images: nextImages.map((image, index) => ({
            ...image,
            isPrimary: hasPrimary ? image.isPrimary : index === 0,
          })),
        };
      });
      toast.success(
        selectedFiles.length > 1
          ? "Product images uploaded successfully."
          : "Product image uploaded successfully.",
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not upload product images.",
      );
    } finally {
      setIsUploadingImage(false);
    }
  }

  function setPrimaryImage(imageId: string) {
    setForm((current) => ({
      ...current,
      images: current.images.map((image) => ({
        ...image,
        isPrimary: image.id === imageId,
      })),
    }));
  }

  function removeImage(imageId: string) {
    setForm((current) => {
      const removedImage = current.images.find((image) => image.id === imageId);
      const nextImages = current.images.filter((image) => image.id !== imageId);

      if (removedImage?.isPrimary && nextImages.length > 0) {
        nextImages[0] = {
          ...nextImages[0],
          isPrimary: true,
        };
      }

      return {
        ...current,
        images: nextImages,
      };
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
      await createProduct(payload);
      toast.success("Product created successfully.");
      setForm(emptyForm);
      setVariationRows([]);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not create product.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  function buildPayload(): ProductPayload | null {
    if (!form.name.trim()) {
      toast.error("Product name is required.");
      return null;
    }

    if (!form.sku.trim()) {
      toast.error("SKU is required.");
      return null;
    }

    if (!form.categoryId) {
      toast.error("Category is required.");
      return null;
    }

    const price = Number(form.price || "0");
    const stock = Number(form.stock || "0");

    if (!hasVariationRows && (!Number.isFinite(price) || price < 0)) {
      toast.error("Price must be a valid number.");
      return null;
    }

    if (!hasVariationRows && (!Number.isInteger(stock) || stock < 0)) {
      toast.error("Stock must be a valid whole number.");
      return null;
    }

    const invalidVariation = variationRows.some((row) => {
      const rowPrice = Number(row.price);
      const rowStock = Number(row.stock);

      return (
        !Number.isFinite(rowPrice) ||
        rowPrice < 0 ||
        !Number.isInteger(rowStock) ||
        rowStock < 0
      );
    });

    if (invalidVariation) {
      toast.error("Variation price and stock must be valid numbers.");
      return null;
    }

    const resolvedPrice =
      variationRows.length > 0
        ? Math.min(...variationRows.map((row) => Number(row.price)))
        : price;
    const resolvedStock =
      variationRows.length > 0
        ? variationRows.reduce((total, row) => total + Number(row.stock), 0)
        : stock;
    const primaryImage =
      form.images.find((image) => image.isPrimary) ?? form.images[0];

    return {
      name: form.name,
      description: form.description,
      price: resolvedPrice,
      stock: resolvedStock,
      sku: form.sku,
      imageUrl: primaryImage?.imageUrl,
      images: form.images.map((image, index) => ({
        imageUrl: image.imageUrl,
        sortOrder: index,
        isPrimary: image.id === primaryImage?.id,
      })),
      categoryId: form.categoryId,
      brandId: form.brandId,
      tagIds: form.tagIds,
      variations: variationRows.map((row) => ({
        variantIds: row.variantIds,
        price: Number(row.price),
        stock: Number(row.stock),
        sku: row.sku,
        isActive: row.isActive,
      })),
      isActive: form.isActive,
    };
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <section className="min-w-0 rounded-[20px] border border-[#E5E7EB] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)] lg:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-subtext)]">
              Product
            </p>
            <h2 className="mt-1 text-[24px] font-black text-[color:var(--color-maintext)]">
              Add product
            </h2>
            <p className="mt-2 max-w-[620px] text-[14px] leading-6 text-[#6B7280]">
              Create catalog items with inventory, category, brand, tags, and
              media.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <DashboardStat label="Categories" value={categories.length} />
            <DashboardStat label="Brands" value={brands.length} />
            <DashboardStat label="Variants" value={variants.length} />
          </div>
        </div>

        <form className="mt-6 grid gap-5" onSubmit={handleSubmit}>
          <div className="grid gap-4 lg:grid-cols-[1fr_0.55fr]">
            <Input
              label="Product name"
              isRequired
              value={form.name}
              onChange={(event) => updateForm({ name: event.target.value })}
              placeholder="Enter product name"
              maxLength={200}
            />
            <Input
              label="SKU"
              isRequired
              value={form.sku}
              onChange={(event) => updateForm({ sku: event.target.value })}
              placeholder="SKU-001"
              maxLength={50}
            />
          </div>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
            Description
            <textarea
              value={form.description}
              onChange={(event) =>
                updateForm({ description: event.target.value })
              }
              placeholder="Enter product description"
              rows={4}
              className="w-full resize-none rounded border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#1F2937] outline-none transition-colors placeholder:text-[color:var(--color-subtext)] focus:border-[#0088FF]"
            />
          </label>

          <div className="grid gap-4 lg:grid-cols-2">
            <Input
              label={hasVariationRows ? "Default variation price" : "Price"}
              isRequired={!hasVariationRows}
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(event) => updateForm({ price: event.target.value })}
              placeholder="0.00"
            />
            <Input
              label={hasVariationRows ? "Default variation stock" : "Stock"}
              isRequired={!hasVariationRows}
              type="number"
              min="0"
              step="1"
              value={form.stock}
              onChange={(event) => updateForm({ stock: event.target.value })}
              placeholder="0"
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <SelectField
              label="Category"
              isRequired
              value={form.categoryId}
              onChange={(categoryId) => updateForm({ categoryId })}
              disabled={isLoadingOptions}
              options={categories.map((category) => ({
                value: category.id,
                label: category.name,
              }))}
              placeholder="Select category"
            />
            <SelectField
              label="Brand"
              value={form.brandId}
              onChange={(brandId) => updateForm({ brandId })}
              disabled={isLoadingOptions}
              options={brands.map((brand) => ({
                value: brand.id,
                label: brand.name,
              }))}
              placeholder="No brand"
            />
          </div>

          <TagPicker
            tags={tags}
            selectedIds={form.tagIds}
            onToggle={toggleTag}
          />

          <VariantPicker
            variants={variants}
            selectedIds={form.variantIds}
            onToggle={toggleVariant}
          />

          <VariationMatrix rows={variationRows} onChange={updateVariationRow} />

          <label className="flex items-center justify-between rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3">
            <span>
              <span className="block text-[14px] font-bold text-[#1F2937]">
                Active
              </span>
              <span className="block text-[12px] text-[#7C8794]">
                Product is visible in catalog workflows
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

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="default"
              className="sm:w-auto"
              onClick={() => {
                setForm(emptyForm);
                setVariationRows([]);
              }}
            >
              Reset
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="sm:w-auto"
              disabled={isSaving || isUploadingImage}
            >
              {isSaving ? "Creating..." : "Create product"}
            </Button>
          </div>
        </form>
      </section>

      <aside className="grid gap-6">
        <ProductImageCard
          images={form.images}
          isUploadingImage={isUploadingImage}
          onImageUpload={handleImageUpload}
          onSetPrimary={setPrimaryImage}
          onRemoveImage={removeImage}
        />
        <ProductSummaryCard
          form={form}
          categoryName={selectedCategory?.name}
          brandName={selectedBrand?.name}
          variantCount={variationRows.length}
          imageCount={form.images.length}
        />
      </aside>
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  placeholder,
  disabled,
  isRequired,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  placeholder: string;
  disabled?: boolean;
  isRequired?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
      {label}
      {isRequired ? <span className="sr-only"> required</span> : null}
      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="h-[44px] rounded border border-[#E5E7EB] bg-white px-4 text-sm text-[#1F2937] outline-none transition-colors focus:border-[#0088FF] disabled:bg-[#F8FAFC]"
        required={isRequired}
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

function TagPicker({
  tags,
  selectedIds,
  onToggle,
}: {
  tags: Tag[];
  selectedIds: string[];
  onToggle: (tagId: string) => void;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-slate-700">Tags</p>
      <div className="mt-2 flex min-h-[44px] flex-wrap gap-2 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-2">
        {tags.length > 0 ? (
          tags.map((tag) => {
            const isSelected = selectedIds.includes(tag.id);

            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => onToggle(tag.id)}
                className={cn(
                  "rounded-lg border px-3 py-2 text-[12px] font-bold transition-colors",
                  isSelected
                    ? "border-[color:var(--color-primary)] bg-[#EAF7EF] text-[color:var(--color-primary)]"
                    : "border-[#E5E7EB] bg-white text-[#64748B] hover:border-[#BBF7D0]",
                )}
              >
                {tag.name}
              </button>
            );
          })
        ) : (
          <span className="px-2 py-2 text-[13px] text-[#94A3B8]">
            No active tags
          </span>
        )}
      </div>
    </div>
  );
}

function VariantPicker({
  variants,
  selectedIds,
  onToggle,
}: {
  variants: Variant[];
  selectedIds: string[];
  onToggle: (variantId: string) => void;
}) {
  const groups = groupVariants(variants);

  return (
    <div>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-700">Variants</p>
          <p className="mt-1 text-[12px] text-[#7C8794]">
            Select options from each group to generate sellable combinations.
          </p>
        </div>
        {selectedIds.length > 0 ? (
          <span className="shrink-0 text-[12px] font-bold text-[color:var(--color-primary)]">
            {selectedIds.length} selected
          </span>
        ) : null}
      </div>
      <div className="mt-2 grid max-h-[280px] gap-3 overflow-y-auto rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-3">
        {groups.length > 0 ? (
          groups.map((group) => (
            <div key={group.name} className="rounded-xl bg-white p-3">
              <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#7C8794]">
                {group.name}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {group.items.map((variant) => {
                  const [, optionValue] = getVariantAttribute(variant);
                  const colorCode = getVariantColorCode(variant);
                  const showColor = isColorVariantName(group.name) && colorCode;
                  const isSelected = selectedIds.includes(variant.id);

                  return (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => onToggle(variant.id)}
                      className={cn(
                        "flex items-center gap-2 rounded-lg border px-3 py-2 text-[12px] font-bold transition-colors",
                        isSelected
                          ? "border-[color:var(--color-primary)] bg-[#EAF7EF] text-[color:var(--color-primary)]"
                          : "border-[#E5E7EB] bg-white text-[#64748B] hover:border-[#BBF7D0]",
                      )}
                    >
                      {showColor ? (
                        <span
                          className="h-4 w-4 rounded-full border border-[#CBD5E1]"
                          style={{ backgroundColor: colorCode }}
                          aria-hidden="true"
                        />
                      ) : null}
                      {optionValue || variant.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          <span className="px-2 py-2 text-[13px] text-[#94A3B8]">
            No active variants
          </span>
        )}
      </div>
    </div>
  );
}

function VariationMatrix({
  rows,
  onChange,
}: {
  rows: ProductVariationRow[];
  onChange: (id: string, patch: Partial<ProductVariationRow>) => void;
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-4 py-6 text-center">
        <p className="text-[13px] font-bold text-[#1F2937]">
          No variation combinations
        </p>
        <p className="mt-1 text-[12px] text-[#7C8794]">
          Select variant options above to create rows for price and stock.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-700">
            Variation pricing
          </p>
          <p className="mt-1 text-[12px] text-[#7C8794]">
            Each row is one purchasable SKU combination.
          </p>
        </div>
        <span className="text-[12px] font-bold text-[#7C8794]">
          {rows.length} combination{rows.length > 1 ? "s" : ""}
        </span>
      </div>
      <div className="mt-2 overflow-x-auto rounded-xl border border-[#E5E7EB] bg-white">
        <div className="grid min-w-[780px] grid-cols-[1.25fr_0.7fr_0.55fr_0.75fr_0.35fr] border-b border-[#E5E7EB] bg-[#F8FAFC] px-3 py-2 text-[12px] font-bold uppercase tracking-[0.12em] text-[#7C8794]">
          <span>Combination</span>
          <span>Price</span>
          <span>Stock</span>
          <span>SKU</span>
          <span>Status</span>
        </div>
        <div className="max-h-[360px] min-w-[780px] overflow-y-auto">
          {rows.map((row) => (
            <div
              key={row.key}
              className="grid grid-cols-[1.25fr_0.7fr_0.55fr_0.75fr_0.35fr] items-center gap-3 border-b border-[#F1F5F9] px-3 py-2 last:border-b-0"
            >
              <span className="truncate text-[13px] font-bold text-[#1F2937]">
                {row.label}
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={row.price}
                onChange={(event) =>
                  onChange(row.id, { price: event.target.value })
                }
                className="h-9 rounded border border-[#E5E7EB] px-3 text-[13px] font-medium outline-none focus:border-[#0088FF]"
              />
              <input
                type="number"
                min="0"
                step="1"
                value={row.stock}
                onChange={(event) =>
                  onChange(row.id, { stock: event.target.value })
                }
                className="h-9 rounded border border-[#E5E7EB] px-3 text-[13px] font-medium outline-none focus:border-[#0088FF]"
              />
              <input
                value={row.sku}
                onChange={(event) =>
                  onChange(row.id, { sku: event.target.value })
                }
                placeholder="Auto"
                className="h-9 rounded border border-[#E5E7EB] px-3 text-[13px] font-medium outline-none placeholder:text-[#94A3B8] focus:border-[#0088FF]"
              />
              <input
                type="checkbox"
                checked={row.isActive}
                onChange={(event) =>
                  onChange(row.id, { isActive: event.target.checked })
                }
                className="h-5 w-5 accent-[color:var(--color-primary)]"
                aria-label={`Toggle ${row.label}`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProductImageCard({
  images,
  isUploadingImage,
  onImageUpload,
  onSetPrimary,
  onRemoveImage,
}: {
  images: ProductImageForm[];
  isUploadingImage: boolean;
  onImageUpload: (files: FileList | null) => void;
  onSetPrimary: (imageId: string) => void;
  onRemoveImage: (imageId: string) => void;
}) {
  return (
    <div className="rounded-[20px] border border-[#E5E7EB] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-subtext)]">
            Media
          </p>
          <h3 className="mt-1 text-[18px] font-black text-[color:var(--color-maintext)]">
            Product images
          </h3>
        </div>
        {images.length > 0 ? (
          <span className="rounded-full bg-[#F8FAFC] px-3 py-1 text-[12px] font-bold text-[#64748B]">
            {images.length}
          </span>
        ) : null}
      </div>

      <label className="mt-4 flex min-h-[132px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-4 py-5 text-center transition-colors hover:border-[color:var(--color-primary)] hover:bg-[#F0FDF4]">
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="sr-only"
          disabled={isUploadingImage}
          onChange={(event) => {
            onImageUpload(event.target.files);
            event.currentTarget.value = "";
          }}
        />
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[color:var(--color-primary)] shadow-sm">
          <SvgIcon src="/icons/product-list.svg" size={24} />
        </span>
        <span className="mt-3 text-[13px] font-bold text-[#1F2937]">
          {isUploadingImage ? "Uploading..." : "Add product images"}
        </span>
        <span className="mt-1 text-[12px] text-[#7C8794]">
          Select one or many JPG, PNG, WEBP or GIF files
        </span>
      </label>

      {images.length > 0 ? (
        <div className="mt-4 grid max-h-[360px] gap-3 overflow-y-auto pr-1">
          {images.map((image, index) => (
            <div
              key={image.id}
              className="grid grid-cols-[82px_1fr_auto] items-center gap-3 rounded-xl border border-[#E5E7EB] bg-white p-2"
            >
              <Image
                src={image.imageUrl}
                alt={`Product image ${index + 1}`}
                width={120}
                height={120}
                className="h-[72px] w-[72px] rounded-lg object-cover"
                unoptimized
              />
              <div className="min-w-0">
                <p className="truncate text-[13px] font-bold text-[#1F2937]">
                  Image {index + 1}
                </p>
                <button
                  type="button"
                  onClick={() => onSetPrimary(image.id)}
                  className={cn(
                    "mt-2 rounded-lg border px-3 py-1.5 text-[12px] font-bold transition-colors",
                    image.isPrimary
                      ? "border-[color:var(--color-primary)] bg-[#EAF7EF] text-[color:var(--color-primary)]"
                      : "border-[#E5E7EB] bg-[#F8FAFC] text-[#64748B] hover:border-[#BBF7D0]",
                  )}
                >
                  {image.isPrimary ? "Primary" : "Set primary"}
                </button>
              </div>
              <button
                type="button"
                onClick={() => onRemoveImage(image.id)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#FECACA] bg-white text-[#E11D48] transition-colors hover:bg-[#FEF2F2]"
                aria-label={`Remove image ${index + 1}`}
                title="Remove image"
              >
                <SvgIcon src="/icons/trash.svg" size={16} />
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ProductSummaryCard({
  form,
  categoryName,
  brandName,
  variantCount,
  imageCount,
}: {
  form: FormState;
  categoryName?: string;
  brandName?: string;
  variantCount: number;
  imageCount: number;
}) {
  const hasVariations = variantCount > 0;

  return (
    <div className="rounded-[20px] border border-[#E5E7EB] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
      <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-subtext)]">
        Preview
      </p>
      <h3 className="mt-1 truncate text-[18px] font-black text-[color:var(--color-maintext)]">
        {form.name || "Product name"}
      </h3>
      <div className="mt-4 grid gap-3">
        <SummaryLine label="SKU" value={form.sku || "Not set"} />
        <SummaryLine
          label="Price"
          value={
            hasVariations
              ? "From variations"
              : form.price
                ? `$${form.price}`
                : "$0"
          }
        />
        <SummaryLine
          label="Stock"
          value={hasVariations ? "From variations" : form.stock || "0"}
        />
        <SummaryLine label="Category" value={categoryName || "Not selected"} />
        <SummaryLine label="Brand" value={brandName || "No brand"} />
        <SummaryLine label="Tags" value={String(form.tagIds.length)} />
        <SummaryLine label="Images" value={String(imageCount)} />
        <SummaryLine label="Variants" value={String(variantCount)} />
      </div>
    </div>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-[#F8FAFC] px-3 py-2">
      <span className="text-[12px] font-semibold text-[#7C8794]">{label}</span>
      <span className="truncate text-[13px] font-bold text-[#1F2937]">
        {value}
      </span>
    </div>
  );
}

function buildVariationRows({
  selectedIds,
  variants,
  currentRows,
  basePrice,
  baseStock,
  baseSku,
}: {
  selectedIds: string[];
  variants: Variant[];
  currentRows: ProductVariationRow[];
  basePrice: string;
  baseStock: string;
  baseSku: string;
}) {
  const selectedVariants = variants.filter((variant) =>
    selectedIds.includes(variant.id),
  );
  const groups = groupVariants(selectedVariants).filter(
    (group) => group.items.length > 0,
  );

  if (groups.length === 0) {
    return [];
  }

  const existingRows = new Map(currentRows.map((row) => [row.key, row]));
  const combinations = groups.reduce<Variant[][]>(
    (rows, group) =>
      rows.flatMap((row) => group.items.map((variant) => [...row, variant])),
    [[]],
  );

  return combinations.map((combination) => {
    const variantIds = combination.map((variant) => variant.id);
    const key = [...variantIds].sort().join("|");
    const existingRow = existingRows.get(key);
    const label = combination
      .map((variant) => {
        const [, value] = getVariantAttribute(variant);
        return value || variant.name;
      })
      .join(" / ");

    if (existingRow) {
      return {
        ...existingRow,
        label,
        variantIds,
      };
    }

    return {
      id: crypto.randomUUID(),
      key,
      label,
      variantIds,
      price: basePrice || "0",
      stock: baseStock || "0",
      sku: buildVariationSku(baseSku, label),
      isActive: true,
    };
  });
}

function buildVariationSku(baseSku: string, label: string) {
  if (!baseSku.trim()) {
    return "";
  }

  const suffix = label
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toUpperCase();

  return suffix ? `${baseSku.trim()}-${suffix}` : baseSku.trim();
}
