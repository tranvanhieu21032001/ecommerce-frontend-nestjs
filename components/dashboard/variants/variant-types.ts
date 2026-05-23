export type VariantOptionForm = {
  id: string;
  value: string;
  colorCode: string;
  isActive: boolean;
};

export type VariantGroupForm = {
  name: string;
  options: VariantOptionForm[];
};
