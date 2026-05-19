import { apiRequest } from "@/lib/api/client";

export type Brand = {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  logoUrl: string | null;
  isActive: boolean;
  productCount: number;
  createdAt: string;
  updatedAt: string;
};

export type BrandPayload = {
  name: string;
  description?: string;
  slug?: string;
  logoUrl?: string;
  isActive?: boolean;
};

export type BrandQuery = {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
};

export type BrandListResponse = {
  data: Brand[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

function toQueryString(query: BrandQuery) {
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

function cleanPayload(payload: BrandPayload): BrandPayload {
  return {
    name: payload.name.trim(),
    description: payload.description?.trim() || undefined,
    slug: payload.slug?.trim() || undefined,
    logoUrl: payload.logoUrl?.trim() || undefined,
    isActive: payload.isActive,
  };
}

export async function getBrands(
  query: BrandQuery = {},
): Promise<BrandListResponse> {
  return apiRequest<BrandListResponse>(`/api/v1/brands${toQueryString(query)}`);
}

export async function createBrand(payload: BrandPayload): Promise<Brand> {
  return apiRequest<Brand>("/api/v1/brands", {
    method: "POST",
    body: cleanPayload(payload),
  });
}

export async function updateBrand(
  id: string,
  payload: BrandPayload,
): Promise<Brand> {
  return apiRequest<Brand>(`/api/v1/brands/${id}`, {
    method: "PATCH",
    body: cleanPayload(payload),
  });
}

export async function deleteBrand(id: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/api/v1/brands/${id}`, {
    method: "DELETE",
  });
}
