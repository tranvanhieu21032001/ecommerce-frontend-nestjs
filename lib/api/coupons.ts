import { apiRequest } from "@/lib/api/client";

export type DiscountType = "PERCENTAGE" | "FIXED_AMOUNT";

export type Coupon = {
  id: string;
  code: string;
  description: string | null;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount: number | null;
  usageLimit: number | null;
  usedCount: number;
  startsAt: string | null;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CouponPayload = {
  code: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  startsAt?: string;
  expiresAt?: string;
  isActive?: boolean;
};

export type CouponQuery = {
  search?: string;
  isActive?: boolean;
  discountType?: DiscountType;
  page?: number;
  limit?: number;
};

export type CouponListResponse = {
  data: Coupon[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

function toQueryString(query: CouponQuery) {
  const params = new URLSearchParams();

  if (query.search?.trim()) {
    params.set("search", query.search.trim());
  }

  if (typeof query.isActive === "boolean") {
    params.set("isActive", String(query.isActive));
  }

  if (query.discountType) {
    params.set("discountType", query.discountType);
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

function optionalNumber(value: number | undefined) {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

function cleanPayload(payload: CouponPayload): CouponPayload {
  return {
    code: payload.code.trim().toUpperCase(),
    description: payload.description?.trim() || undefined,
    discountType: payload.discountType,
    discountValue: payload.discountValue,
    minOrderAmount: optionalNumber(payload.minOrderAmount),
    maxDiscountAmount: optionalNumber(payload.maxDiscountAmount),
    usageLimit: optionalNumber(payload.usageLimit),
    startsAt: payload.startsAt || undefined,
    expiresAt: payload.expiresAt || undefined,
    isActive: payload.isActive,
  };
}

export async function getCoupons(
  query: CouponQuery = {},
): Promise<CouponListResponse> {
  return apiRequest<CouponListResponse>(
    `/api/v1/coupons${toQueryString(query)}`,
  );
}

export async function createCoupon(payload: CouponPayload): Promise<Coupon> {
  return apiRequest<Coupon>("/api/v1/coupons", {
    method: "POST",
    body: cleanPayload(payload),
  });
}

export async function updateCoupon(
  id: string,
  payload: CouponPayload,
): Promise<Coupon> {
  return apiRequest<Coupon>(`/api/v1/coupons/${id}`, {
    method: "PATCH",
    body: cleanPayload(payload),
  });
}

export async function deleteCoupon(id: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/api/v1/coupons/${id}`, {
    method: "DELETE",
  });
}
