import { apiRequest } from "@/lib/api/client";

export type Variant = {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  imageUrl: string | null;
  attributes?: Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type VariantPayload = {
  name: string;
  sku?: string;
  price?: number;
  stock?: number;
  imageUrl?: string;
  attributes?: Record<string, string>;
  isActive?: boolean;
};

export type VariantQuery = {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
};

export type VariantListResponse = {
  data: Variant[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

function toQueryString(query: VariantQuery) {
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

function cleanPayload(payload: VariantPayload): VariantPayload {
  return {
    name: payload.name.trim(),
    sku: payload.sku?.trim() || undefined,
    price: payload.price,
    stock: payload.stock,
    imageUrl: payload.imageUrl?.trim() || undefined,
    attributes: cleanAttributes(payload.attributes),
    isActive: payload.isActive,
  };
}

function cleanAttributes(attributes?: Record<string, string>) {
  const cleaned = Object.fromEntries(
    Object.entries(attributes ?? {})
      .map(([key, value]) => [key.trim(), value.trim()])
      .filter(([key, value]) => key.length > 0 && value.length > 0),
  );

  return Object.keys(cleaned).length > 0 ? cleaned : undefined;
}

export async function getVariants(
  query: VariantQuery = {},
): Promise<VariantListResponse> {
  return apiRequest<VariantListResponse>(
    `/api/v1/variants${toQueryString(query)}`,
  );
}

export async function createVariant(payload: VariantPayload): Promise<Variant> {
  return apiRequest<Variant>("/api/v1/variants", {
    method: "POST",
    body: cleanPayload(payload),
  });
}

export async function updateVariant(
  id: string,
  payload: VariantPayload,
): Promise<Variant> {
  return apiRequest<Variant>(`/api/v1/variants/${id}`, {
    method: "PATCH",
    body: cleanPayload(payload),
  });
}

export async function deleteVariant(id: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/api/v1/variants/${id}`, {
    method: "DELETE",
  });
}
