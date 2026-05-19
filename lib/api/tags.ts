import { apiRequest } from "@/lib/api/client";

export type Tag = {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  isActive: boolean;
  productCount: number;
  createdAt: string;
  updatedAt: string;
};

export type TagPayload = {
  name: string;
  slug?: string;
  description?: string;
  isActive?: boolean;
};

export type TagQuery = {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
};

export type TagListResponse = {
  data: Tag[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

function toQueryString(query: TagQuery) {
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

function cleanPayload(payload: TagPayload): TagPayload {
  return {
    name: payload.name.trim(),
    slug: payload.slug?.trim() || undefined,
    description: payload.description?.trim() || undefined,
    isActive: payload.isActive,
  };
}

export async function getTags(query: TagQuery = {}): Promise<TagListResponse> {
  return apiRequest<TagListResponse>(`/api/v1/tags${toQueryString(query)}`);
}

export async function createTag(payload: TagPayload): Promise<Tag> {
  return apiRequest<Tag>("/api/v1/tags", {
    method: "POST",
    body: cleanPayload(payload),
  });
}

export async function updateTag(id: string, payload: TagPayload): Promise<Tag> {
  return apiRequest<Tag>(`/api/v1/tags/${id}`, {
    method: "PATCH",
    body: cleanPayload(payload),
  });
}

export async function deleteTag(id: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/api/v1/tags/${id}`, {
    method: "DELETE",
  });
}
