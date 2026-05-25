import { apiRequest } from "@/lib/api/client";

export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  sku: string;
  imageUrl: string | null;
  images?: Array<{
    id: string;
    imageUrl: string;
    sortOrder: number;
    isPrimary: boolean;
  }>;
  category: string | null;
  brand: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
  } | null;
  tags?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  variations?: Array<{
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
  }>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ProductPayload = {
  name: string;
  description?: string;
  price: number;
  stock: number;
  sku: string;
  imageUrl?: string;
  images?: Array<{
    imageUrl: string;
    sortOrder?: number;
    isPrimary?: boolean;
  }>;
  categoryId: string;
  brandId?: string;
  tagIds?: string[];
  variations?: Array<{
    variantIds: string[];
    price: number;
    stock: number;
    sku?: string;
    isActive?: boolean;
  }>;
  isActive?: boolean;
};

export type ProductQuery = {
  search?: string;
  categoryId?: string;
  brandId?: string;
  tagId?: string;
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

  if (query.categoryId) {
    params.set("categoryId", query.categoryId);
  }

  if (query.brandId) {
    params.set("brandId", query.brandId);
  }

  if (query.tagId) {
    params.set("tagId", query.tagId);
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

export async function getProduct(id: string): Promise<Product> {
  return apiRequest<Product>(`/api/v1/products/${id}`);
}

function cleanPayload(payload: ProductPayload): ProductPayload {
  return {
    name: payload.name.trim(),
    description: payload.description?.trim() || undefined,
    price: payload.price,
    stock: payload.stock,
    sku: payload.sku.trim(),
    imageUrl: payload.imageUrl?.trim() || undefined,
    images: payload.images
      ?.map((image, index) => ({
        imageUrl: image.imageUrl.trim(),
        sortOrder: image.sortOrder ?? index,
        isPrimary: image.isPrimary,
      }))
      .filter((image) => image.imageUrl),
    categoryId: payload.categoryId,
    brandId: payload.brandId || undefined,
    tagIds: payload.tagIds?.filter(Boolean),
    variations: payload.variations,
    isActive: payload.isActive,
  };
}

export async function createProduct(payload: ProductPayload): Promise<Product> {
  return apiRequest<Product>("/api/v1/products", {
    method: "POST",
    body: cleanPayload(payload),
  });
}

export async function deleteProduct(id: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/api/v1/products/${id}`, {
    method: "DELETE",
  });
}
