"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { DashboardStat } from "@/components/dashboard/shared/dashboard-stat";
import {
  StatusFilterTabs,
  type StatusFilter,
} from "@/components/dashboard/shared/status-filter-tabs";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import {
  createVariant,
  deleteVariant,
  getVariants,
  updateVariant,
  type Variant,
} from "@/lib/api/variants";

import { VariantOptionsForm } from "./variant-options-form";
import type { VariantGroupForm, VariantOptionForm } from "./variant-types";
import {
  buildFormFromVariantGroup,
  buildPayloads,
  createEmptyForm,
  createOption,
  getVariantAttribute,
  pageSize,
} from "./variant-utils";
import { VariantsTable } from "./variants-table";

export function VariantsManager() {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalVariants, setTotalVariants] = useState(0);
  const [form, setForm] = useState<VariantGroupForm>(createEmptyForm());
  const [editingVariants, setEditingVariants] = useState<Variant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const activeCount = useMemo(
    () => variants.filter((variant) => variant.isActive).length,
    [variants],
  );

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    loadVariants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, statusFilter, page]);

  async function loadVariants() {
    setIsLoading(true);

    try {
      const response = await getVariants({
        search: debouncedSearch,
        isActive:
          statusFilter === "all" ? undefined : statusFilter === "active",
        page,
        limit: pageSize,
      });

      setVariants(response.data);
      setTotalPages(Math.max(response.meta.totalPages, 1));
      setTotalVariants(response.meta.total);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not load variants.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function updateForm(patch: Partial<VariantGroupForm>) {
    setForm((current) => ({
      ...current,
      ...patch,
    }));
  }

  function updateOption(id: string, patch: Partial<VariantOptionForm>) {
    setForm((current) => ({
      ...current,
      options: current.options.map((option) =>
        option.id === id
          ? {
              ...option,
              ...patch,
            }
          : option,
      ),
    }));
  }

  function addOption() {
    setForm((current) => ({
      ...current,
      options: [...current.options, createOption()],
    }));
  }

  function removeOption(id: string) {
    setForm((current) => {
      const options = current.options.filter((option) => option.id !== id);
      return {
        ...current,
        options: options.length > 0 ? options : [createOption()],
      };
    });
  }

  function handleEditGroup(name: string, variants: Variant[]) {
    setEditingVariants(variants);
    setForm(buildFormFromVariantGroup(name, variants));
  }

  function resetForm() {
    setEditingVariants([]);
    setForm(createEmptyForm());
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    const payloads = buildPayloads(form);
    setIsSaving(true);

    try {
      if (editingVariants.length > 0) {
        const existingIds = new Set(
          editingVariants.map((variant) => variant.id),
        );
        const retainedIds = new Set(
          form.options
            .map((option) => option.variantId)
            .filter((id): id is string => Boolean(id)),
        );

        await Promise.all(
          form.options
            .filter((option) => option.value.trim())
            .map((option, index) => {
              const payload = payloads[index];

              if (option.variantId) {
                return updateVariant(option.variantId, payload);
              }

              return createVariant(payload);
            }),
        );

        await Promise.all(
          Array.from(existingIds)
            .filter((id) => !retainedIds.has(id))
            .map((id) => deleteVariant(id)),
        );

        toast.success("Variant updated successfully.");
      } else {
        await Promise.all(payloads.map((payload) => createVariant(payload)));
        toast.success("Variant options created successfully.");
      }

      resetForm();
      await loadVariants();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not save variant options.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(variant: Variant) {
    const confirmed = window.confirm(
      `Delete variant option "${variant.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(variant.id);

    try {
      await deleteVariant(variant.id);
      toast.success("Variant option deleted successfully.");
      if (variants.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        await loadVariants();
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not delete variant option.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  function validateForm() {
    if (!form.name.trim()) {
      toast.error("Variant name is required.");
      return false;
    }

    const validOptions = form.options.filter((option) => option.value.trim());

    if (validOptions.length === 0) {
      toast.error("Add at least one option.");
      return false;
    }

    const optionKeys = validOptions.map((option) =>
      option.value.trim().toLowerCase(),
    );
    const hasDuplicateOption = new Set(optionKeys).size !== optionKeys.length;

    if (hasDuplicateOption) {
      toast.error("Option values must be unique.");
      return false;
    }

    const variantName = form.name.trim().toLowerCase();
    const hasExistingOption = validOptions.some((option) => {
      const optionValue = option.value.trim().toLowerCase();

      return variants.some((variant) => {
        if (
          editingVariants.some(
            (editingVariant) => editingVariant.id === variant.id,
          )
        ) {
          return false;
        }

        const [name, value] = getVariantAttribute(variant);
        return (
          name.trim().toLowerCase() === variantName &&
          value.trim().toLowerCase() === optionValue
        );
      });
    });

    if (hasExistingOption) {
      toast.error("This variant option already exists.");
      return false;
    }

    return true;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
      <section className="min-w-0 rounded-[20px] border border-[#E5E7EB] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)] lg:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-subtext)]">
              Catalog
            </p>
            <h2 className="mt-1 text-[24px] font-black text-[color:var(--color-maintext)]">
              Variants
            </h2>
            <p className="mt-2 max-w-[620px] text-[14px] leading-6 text-[#6B7280]">
              Add a variant name first, then add each option under it.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <DashboardStat label="Total" value={totalVariants} />
            <DashboardStat label="Active" value={activeCount} />
            <DashboardStat label="Page" value={page} />
          </div>
        </div>

        <div className="mt-6 grid gap-3 xl:grid-cols-[1fr_auto] xl:items-start">
          <Input
            label="Search variants"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by variant or option"
          />
          <StatusFilterTabs
            value={statusFilter}
            onChange={(value) => {
              setStatusFilter(value);
              setPage(1);
            }}
          />
        </div>

        <VariantsTable
          variants={variants}
          isLoading={isLoading}
          deletingId={deletingId}
          onEditGroup={handleEditGroup}
          onDelete={handleDelete}
        />

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

      <VariantOptionsForm
        form={form}
        editingVariants={editingVariants}
        isSaving={isSaving}
        onChange={updateForm}
        onOptionChange={updateOption}
        onAddOption={addOption}
        onRemoveOption={removeOption}
        onReset={resetForm}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
