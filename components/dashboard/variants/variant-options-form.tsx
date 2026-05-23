import type { FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SvgIcon } from "@/components/ui/svg-icon";
import type { Variant } from "@/lib/api/variants";

import type { VariantGroupForm, VariantOptionForm } from "./variant-types";
import { isColorVariantName } from "./variant-utils";

type VariantOptionsFormProps = {
  form: VariantGroupForm;
  editingVariant: Variant | null;
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
  editingVariant,
  isSaving,
  onChange,
  onOptionChange,
  onAddOption,
  onRemoveOption,
  onReset,
  onSubmit,
}: VariantOptionsFormProps) {
  const isColorVariant = isColorVariantName(form.name);

  return (
    <aside className="rounded-[20px] border border-[#E5E7EB] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)] lg:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-subtext)]">
            {editingVariant ? "Edit option" : "New variant"}
          </p>
          <h3 className="mt-1 text-[20px] font-black text-[color:var(--color-maintext)]">
            {editingVariant ? editingVariant.name : "Add options"}
          </h3>
        </div>
        {editingVariant ? (
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
          placeholder="Size, Color, Material"
          maxLength={80}
        />

        <div className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#7C8794]">
                Options
              </p>
            </div>
            {!editingVariant ? (
              <button
                type="button"
                onClick={onAddOption}
                className="h-9 rounded-lg border border-[#D1FAE5] bg-white px-3 text-[12px] font-bold text-[color:var(--color-primary)] transition-colors hover:bg-[#ECFDF5]"
              >
                Add option
              </button>
            ) : null}
          </div>

          <div className="mt-3 grid gap-3">
            {form.options.map((option, index) => (
              <OptionRow
                key={option.id}
                option={option}
                index={index}
                isColorVariant={isColorVariant}
                canRemove={!editingVariant && form.options.length > 1}
                onChange={(patch) => onOptionChange(option.id, patch)}
                onRemove={() => onRemoveOption(option.id)}
              />
            ))}
          </div>
        </div>

        <Button type="submit" variant="primary" disabled={isSaving}>
          {isSaving
            ? "Saving..."
            : editingVariant
              ? "Update option"
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
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-[12px] font-bold text-[#7C8794]">
          Option {index + 1}
        </span>
        {canRemove ? (
          <button
            type="button"
            onClick={onRemove}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#FECACA] text-[#E11D48] transition-colors hover:bg-[#FFF1F2]"
            aria-label="Remove option"
            title="Remove"
          >
            <SvgIcon src="/icons/trash.svg" size={16} />
          </button>
        ) : null}
      </div>

      <Input
        label={isColorVariant ? "Color name" : "Option value"}
        isRequired
        value={option.value}
        onChange={(event) => onChange({ value: event.target.value })}
        placeholder={isColorVariant ? "Black, Red, Blue" : "S, M, L"}
        maxLength={80}
      />
      {isColorVariant ? (
        <div className="mt-3 grid grid-cols-[52px_1fr] gap-3">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
            Color
            <input
              type="color"
              value={option.colorCode}
              onChange={(event) => onChange({ colorCode: event.target.value })}
              className="h-[44px] w-full cursor-pointer rounded border border-[#E5E7EB] bg-white p-1"
              aria-label="Color code"
            />
            <span className="min-h-4 text-[11px] text-transparent">.</span>
          </label>
          <Input
            label="Hex code"
            value={option.colorCode}
            onChange={(event) => onChange({ colorCode: event.target.value })}
            placeholder="#000000"
            maxLength={7}
          />
        </div>
      ) : null}
      <label className="mt-3 flex items-center justify-between rounded-lg border border-[#E5E7EB] bg-[#F8FAFC] px-3 py-2">
        <span className="text-[13px] font-bold text-[#1F2937]">Active</span>
        <input
          type="checkbox"
          checked={option.isActive}
          onChange={(event) => onChange({ isActive: event.target.checked })}
          className="h-5 w-5 accent-[color:var(--color-primary)]"
        />
      </label>
    </div>
  );
}
