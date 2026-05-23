import { apiRequest } from "@/lib/api/client";

export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  sku: string;
  imageUrl: string | null;
  category: string | null;
  brand: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
  } | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ProductQuery = {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
};

export type ProductListResponse = {
  data: Product[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

function toQueryString(query: ProductQuery) {
  const params = new URLSearchParams();

  if (query.search?.trim()) {
    params.set("search", query.search.trim());
  }

  if (typeof query.isActive === "boolean") {
    params.set("isActive", String(query.isActive));
  }

  if (query.page) {
    params.set("page", String(query.page));
  }

  if (query.limit) {
    params.set("limit", String(query.limit));
  }

  const value = params.toString();
  return value ? `?${value}` : "";
}

export async function getProducts(
  query: ProductQuery = {},
): Promise<ProductListResponse> {
  return apiRequest<ProductListResponse>(
    `/api/v1/products${toQueryString(query)}`,
  );
}
