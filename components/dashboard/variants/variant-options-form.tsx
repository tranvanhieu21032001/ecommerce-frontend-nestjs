import type { FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SvgIcon } from "@/components/ui/svg-icon";
import type { Variant } from "@/lib/api/variants";

import type { VariantGroupForm, VariantOptionForm } from "./variant-types";
import { isColorVariantName } from "./variant-utils";

type VariantOptionsFormProps = {
  form: VariantGroupForm;
  editingVariants: Variant[];
  isSaving: boolean;
  onChange: (patch: Partial<VariantGroupForm>) => void;
  onOptionChange: (id: string, patch: Partial<VariantOptionForm>) => void;
  onAddOption: () => void;
  onRemoveOption: (id: string) => void;
  onReset: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function VariantOptionsForm({
  form,
  editingVariants,
  isSaving,
  onChange,
  onOptionChange,
  onAddOption,
  onRemoveOption,
  onReset,
  onSubmit,
}: VariantOptionsFormProps) {
  const isColorVariant = isColorVariantName(form.name);
  const isEditing = editingVariants.length > 0;

  return (
    <aside className="rounded-[20px] border border-[#E5E7EB] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)] lg:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-subtext)]">
            {isEditing ? "Edit variant" : "New variant"}
          </p>
          <h3 className="mt-1 text-[20px] font-black text-[color:var(--color-maintext)]">
            {isEditing ? form.name : "Add options"}
          </h3>
        </div>
        {isEditing ? (
          <button
            type="button"
            onClick={onReset}
            className="rounded-lg border border-[#E5E7EB] px-3 py-2 text-[12px] font-bold text-[#6B7280] transition-colors hover:bg-[#F8FAFC]"
          >
            Clear
          </button>
        ) : null}
      </div>

      <form className="mt-5 grid gap-3" onSubmit={onSubmit}>
        <Input
          label="Variant name"
          isRequired
          value={form.name}
          onChange={(event) => onChange({ name: event.target.value })}
          placeholder="Enter variant name"
          maxLength={80}
        />

        <div className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#7C8794]">
                Options
              </p>
              <p className="mt-1 text-[12px] font-medium text-[#94A3B8]">
                {form.options.length} item{form.options.length > 1 ? "s" : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={onAddOption}
              className="h-9 rounded-lg border border-[#D1FAE5] bg-white px-3 text-[12px] font-bold text-[color:var(--color-primary)] transition-colors hover:bg-[#ECFDF5]"
            >
              Add option
            </button>
          </div>

          <div className="mt-3 grid max-h-[430px] gap-2 overflow-y-auto pr-1">
            {form.options.map((option, index) => (
              <OptionRow
                key={option.id}
                option={option}
                index={index}
                isColorVariant={isColorVariant}
                canRemove={form.options.length > 1}
                onChange={(patch) => onOptionChange(option.id, patch)}
                onRemove={() => onRemoveOption(option.id)}
              />
            ))}
          </div>
        </div>

        <Button type="submit" variant="primary" disabled={isSaving}>
          {isSaving
            ? "Saving..."
            : isEditing
              ? "Update variant"
              : "Create options"}
        </Button>
      </form>
    </aside>
  );
}

function OptionRow({
  option,
  index,
  isColorVariant,
  canRemove,
  onChange,
  onRemove,
}: {
  option: VariantOptionForm;
  index: number;
  isColorVariant: boolean;
  canRemove: boolean;
  onChange: (patch: Partial<VariantOptionForm>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="shrink-0 text-[12px] font-bold text-[#7C8794]">
          #{index + 1}
        </span>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-[12px] font-bold text-[#475569]">
            <input
              type="checkbox"
              checked={option.isActive}
              onChange={(event) => onChange({ isActive: event.target.checked })}
              className="h-4 w-4 accent-[color:var(--color-primary)]"
            />
            Active
          </label>
          {canRemove ? (
            <button
              type="button"
              onClick={onRemove}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#FECACA] text-[#E11D48] transition-colors hover:bg-[#FFF1F2]"
              aria-label="Remove option"
              title="Remove"
            >
              <SvgIcon src="/icons/trash.svg" size={15} />
            </button>
          ) : null}
        </div>
      </div>

      <CompactField
        label={isColorVariant ? "Color name" : "Option value"}
        value={option.value}
        onChange={(value) => onChange({ value })}
        placeholder={isColorVariant ? "Enter color name" : "Enter option value"}
      />
      {isColorVariant ? (
        <div className="mt-2 grid grid-cols-[44px_1fr] gap-2">
          <label className="flex flex-col gap-1 text-[12px] font-bold text-slate-600">
            Hex
            <input
              type="color"
              value={option.colorCode}
              onChange={(event) => onChange({ colorCode: event.target.value })}
              className="h-9 w-full cursor-pointer rounded border border-[#E5E7EB] bg-white p-1"
              aria-label="Color code"
            />
          </label>
          <CompactField
            label="Color code"
            value={option.colorCode}
            onChange={(colorCode) => onChange({ colorCode })}
            placeholder="#000000"
          />
        </div>
      ) : null}
    </div>
  );
}

function CompactField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="flex min-w-0 flex-col gap-1 text-[12px] font-bold text-slate-600">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        maxLength={80}
        className="h-9 w-full rounded border border-[#E5E7EB] bg-white px-3 text-[13px] font-medium text-[#1F2937] outline-none transition-colors placeholder:text-[#94A3B8] focus:border-[#0088FF]"
      />
    </label>
  );
}
