export type VariantOptionForm = {
  id: string;
  variantId?: string;
  value: string;
  colorCode: string;
  isActive: boolean;
};

export type VariantGroupForm = {
  name: string;
  options: VariantOptionForm[];
};
