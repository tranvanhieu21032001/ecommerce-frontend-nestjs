import type { Variant, VariantPayload } from "@/lib/api/variants";

import type { VariantGroupForm, VariantOptionForm } from "./variant-types";

export const pageSize = 10;

export function createOption(): VariantOptionForm {
  return {
    id: crypto.randomUUID(),
    value: "",
    colorCode: "#000000",
    isActive: true,
  };
}

export function createEmptyForm() {
  return {
    name: "",
    options: [createOption()],
  };
}

export function buildPayloads(form: VariantGroupForm): VariantPayload[] {
  return form.options
    .filter((option) => option.value.trim())
    .map((option) => {
      const variantName = form.name.trim();
      const attributes: Record<string, string> = {
        [variantName]: option.value.trim(),
      };

      if (isColorVariantName(variantName)) {
        attributes.colorCode = normalizeColorCode(option.colorCode);
      }

      return {
        name: `${variantName} - ${option.value.trim()}`,
        imageUrl: undefined,
        attributes,
        isActive: option.isActive,
      };
    });
}

export function buildFormFromVariant(variant: Variant): VariantGroupForm {
  const [name, value] = getVariantAttribute(variant);

  return {
    name: name || variant.name,
    options: [buildOptionFromVariant(variant, value || variant.name)],
  };
}

export function buildFormFromVariantGroup(
  name: string,
  variants: Variant[],
): VariantGroupForm {
  return {
    name,
    options: variants.map((variant) => {
      const [, value] = getVariantAttribute(variant);
      return buildOptionFromVariant(variant, value || variant.name);
    }),
  };
}

export function getVariantAttribute(variant: Variant) {
  const entry = Object.entries(variant.attributes ?? {}).find(
    ([key, value]) => {
      return (
        key !== "colorCode" &&
        value !== null &&
        value !== undefined &&
        String(value).trim() !== ""
      );
    },
  );

  return entry ? [entry[0], String(entry[1])] : ["", ""];
}

export function getVariantColorCode(variant: Variant) {
  const value = variant.attributes?.colorCode;
  return typeof value === "string" && isHexColor(value) ? value : "";
}

export function isColorVariantName(value: string) {
  const normalized = value.trim().toLowerCase();
  return ["color", "colour", "màu", "mau", "màu sắc", "mau sac"].includes(
    normalized,
  );
}

export function normalizeColorCode(value: string) {
  return isHexColor(value) ? value : "#000000";
}

export function groupVariants(variants: Variant[]) {
  const grouped = new Map<string, Variant[]>();

  variants.forEach((variant) => {
    const [name] = getVariantAttribute(variant);
    const groupName = name || "Variant";

    grouped.set(groupName, [...(grouped.get(groupName) ?? []), variant]);
  });

  return Array.from(grouped.entries()).map(([name, items]) => ({
    name,
    items,
  }));
}

function isHexColor(value: string) {
  return /^#[0-9A-Fa-f]{6}$/.test(value);
}

function buildOptionFromVariant(
  variant: Variant,
  value: string,
): VariantOptionForm {
  return {
    id: crypto.randomUUID(),
    variantId: variant.id,
    value,
    colorCode: getVariantColorCode(variant) || "#000000",
    isActive: variant.isActive,
  };
}
