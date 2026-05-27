export type StorefrontProductVariation = {
  id: string;
  sku: string | null;
  price: number;
  stock: number;
  isActive: boolean;
  options: Array<{
    id: string;
    name: string;
    attributes: Record<string, unknown>;
  }>;
};

export type HomeProduct = {
  id: string;
  name: string;
  category: string;
  image: string;
  price: number;
  discount?: number;
  stock: number;
  status?: "sale" | "hot";
  variations?: StorefrontProductVariation[];
};

export type HomeCategory = {
  id: string;
  title: string;
  image: string;
  productCount: number;
};

export type HomeBrand = {
  id: string;
  title: string;
  image: string;
};

export type HomeBlog = {
  id: string;
  title: string;
  category: string;
  image: string;
  date: string;
};
