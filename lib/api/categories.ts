import { apiRequest } from "@/lib/api/client";

export type Category = {
  id: string;
  name: string;
  description: string | null;
  slug: string | null;
  imageUrl: string | null;
  isActive: boolean;
  productCount: number;
  createdAt: string;
  updatedAt: string;
};

export type CategoryPayload = {
  name: string;
  description?: string;
  slug?: string;
  imageUrl?: string;
  isActive?: boolean;
};

export type CategoryQuery = {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
};

export type CategoryListResponse = {
  data: Category[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

function toQueryString(query: CategoryQuery) {
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

function cleanPayload(payload: CategoryPayload): CategoryPayload {
  return {
    name: payload.name.trim(),
    description: payload.description?.trim() || undefined,
    slug: payload.slug?.trim() || undefined,
    imageUrl: payload.imageUrl?.trim() || undefined,
    isActive: payload.isActive,
  };
}

export async function getCategories(
  query: CategoryQuery = {},
): Promise<CategoryListResponse> {
  return apiRequest<CategoryListResponse>(
    `/api/v1/categories${toQueryString(query)}`,
  );
}

export async function createCategory(
  payload: CategoryPayload,
): Promise<Category> {
  return apiRequest<Category>("/api/v1/categories", {
    method: "POST",
    body: cleanPayload(payload),
  });
}

export async function updateCategory(
  id: string,
  payload: CategoryPayload,
): Promise<Category> {
  return apiRequest<Category>(`/api/v1/categories/${id}`, {
    method: "PATCH",
    body: cleanPayload(payload),
  });
}

export async function deleteCategory(
  id: string,
): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/api/v1/categories/${id}`, {
    method: "DELETE",
  });
}
