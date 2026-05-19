"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  DashboardTable,
  DashboardTableRow,
} from "@/components/dashboard/shared/dashboard-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { SvgIcon } from "@/components/ui/svg-icon";
import {
  createTag,
  deleteTag,
  getTags,
  updateTag,
  type Tag,
  type TagPayload,
} from "@/lib/api/tags";
import { cn } from "@/lib/cn";

type StatusFilter = "all" | "active" | "inactive";

type FormState = {
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
};

const emptyForm: FormState = {
  name: "",
  slug: "",
  description: "",
  isActive: true,
};

const pageSize = 10;
const tableColumns = "1.1fr 0.8fr 0.6fr 0.5fr 88px";

export function TagsManager() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTags, setTotalTags] = useState(0);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const activeCount = useMemo(
    () => tags.filter((tag) => tag.isActive).length,
    [tags],
  );

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    loadTags();
  }, [debouncedSearch, statusFilter, page]);

  async function loadTags() {
    setIsLoading(true);

    try {
      const response = await getTags({
        search: debouncedSearch,
        isActive:
          statusFilter === "all" ? undefined : statusFilter === "active",
        page,
        limit: pageSize,
      });

      setTags(response.data);
      setTotalPages(Math.max(response.meta.totalPages, 1));
      setTotalTags(response.meta.total);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load tags.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleEdit(tag: Tag) {
    setEditingTag(tag);
    setForm({
      name: tag.name,
      slug: tag.slug ?? "",
      description: tag.description ?? "",
      isActive: tag.isActive,
    });
  }

  function resetForm() {
    setEditingTag(null);
    setForm(emptyForm);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.name.trim()) {
      toast.error("Tag name is required.");
      return;
    }

    const payload: TagPayload = {
      name: form.name,
      slug: form.slug,
      description: form.description,
      isActive: form.isActive,
    };

    setIsSaving(true);

    try {
      if (editingTag) {
        await updateTag(editingTag.id, payload);
        toast.success("Tag updated successfully.");
      } else {
        await createTag(payload);
        toast.success("Tag created successfully.");
      }

      resetForm();
      await loadTags();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save tag.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(tag: Tag) {
    const confirmed = window.confirm(`Delete tag "${tag.name}"?`);

    if (!confirmed) {
      return;
    }

    setDeletingId(tag.id);

    try {
      await deleteTag(tag.id);
      toast.success("Tag deleted successfully.");
      if (tags.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        await loadTags();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete tag.");
    } finally {
      setDeletingId(null);
    }
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
              Tags
            </h2>
            <p className="mt-2 max-w-[620px] text-[14px] leading-6 text-[#6B7280]">
              Manage product tags used for filtering, campaigns, and product
              discovery.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Stat label="Total" value={totalTags} />
            <Stat label="Active" value={activeCount} />
            <Stat label="Page" value={page} />
          </div>
        </div>

        <div className="mt-6 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-start">
          <Input
            label="Search tags"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name or description"
          />

          <div className="flex items-center gap-1 pt-[29px]">
            {(["all", "active", "inactive"] as StatusFilter[]).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => {
                  setStatusFilter(status);
                  setPage(1);
                }}
                className={cn(
                  "h-[44px] rounded-lg px-4 text-[13px] font-semibold capitalize transition-colors",
                  statusFilter === status
                    ? "bg-[#F0FDF4] text-[color:var(--color-primary)]"
                    : "text-[#6B7280] hover:bg-[#F8FAFC] hover:text-[#1F2937]",
                )}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <DashboardTable
          columns={tableColumns}
          headers={[
            "Name",
            "Slug",
            "Status",
            "Products",
            <span key="actions" className="text-right">
              Actions
            </span>,
          ]}
          hasData={tags.length > 0}
          isLoading={isLoading}
          emptyState={
            <div className="flex min-h-[240px] flex-col items-center justify-center px-4 py-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EAF7EF] text-[color:var(--color-primary)]">
                <SvgIcon src="/icons/tag.svg" size={22} />
              </div>
              <p className="mt-3 text-[15px] font-bold text-[color:var(--color-maintext)]">
                No tags found
              </p>
              <p className="mt-1 text-[13px] text-[#7C8794]">
                Create a tag or adjust filters to see results.
              </p>
            </div>
          }
        >
          {tags.map((tag) => (
            <DashboardTableRow key={tag.id} columns={tableColumns}>
              <div className="min-w-0">
                <button
                  type="button"
                  onClick={() => handleEdit(tag)}
                  className="block max-w-full truncate text-left font-bold text-[color:var(--color-maintext)] transition-colors hover:text-[color:var(--color-primary)] focus:outline-none focus-visible:text-[color:var(--color-primary)]"
                >
                  {tag.name}
                </button>
                <p className="mt-1 truncate text-[12px] text-[#7C8794]">
                  {tag.description || "No description"}
                </p>
              </div>
              <span className="truncate text-[#6B7280]">{tag.slug || "-"}</span>
              <span
                className={cn(
                  "w-fit rounded-full px-3 py-1 text-[12px] font-bold",
                  tag.isActive
                    ? "bg-[#DCFCE7] text-[#166534]"
                    : "bg-[#F3F4F6] text-[#6B7280]",
                )}
              >
                {tag.isActive ? "Active" : "Inactive"}
              </span>
              <span className="font-semibold text-[#1F2937]">
                {tag.productCount}
              </span>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => handleDelete(tag)}
                  disabled={deletingId === tag.id}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#FECACA] text-[#E11D48] transition-colors hover:bg-[#FFF1F2] disabled:opacity-50"
                  aria-label={`Delete ${tag.name}`}
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
              {editingTag ? "Edit tag" : "New tag"}
            </p>
            <h3 className="mt-1 text-[20px] font-black text-[color:var(--color-maintext)]">
              {editingTag ? editingTag.name : "Create tag"}
            </h3>
          </div>
          {editingTag ? (
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
            placeholder="Summer Sale"
            maxLength={100}
          />
          <Input
            label="Slug"
            value={form.slug}
            onChange={(event) =>
              setForm((current) => ({ ...current, slug: event.target.value }))
            }
            placeholder="summer-sale"
            maxLength={100}
          />
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
              placeholder="Short note for this tag"
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
                Show this tag for product workflows
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
            {isSaving ? "Saving..." : editingTag ? "Update tag" : "Create tag"}
          </Button>
        </form>
      </aside>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-[92px] rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3">
      <p className="text-[11px] font-semibold text-[#7C8794]">{label}</p>
      <p className="mt-1 text-[22px] font-black text-[color:var(--color-maintext)]">
        {value}
      </p>
    </div>
  );
}
