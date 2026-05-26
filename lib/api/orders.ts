import { apiRequest } from "@/lib/api/client";
import type { PaymentMethod } from "@/lib/api/checkout";

export type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
export type OrderPaymentMethod =
  | PaymentMethod
  | "STRIPE"
  | "PAYPAL"
  | "BANK_TRANSFER";

export type OrderItem = {
  id: string;
  productId: string;
  variationId: string | null;
  flashSaleItemId: string | null;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    imageUrl: string | null;
  };
  variation: {
    id: string;
    options: Array<{
      id: string;
      name: string;
    }>;
  } | null;
  createdAt: string;
  updatedAt: string;
};

export type ManagedOrder = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  userId: string;
  cartId: string | null;
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  shippingName: string | null;
  shippingPhone: string | null;
  shippingAddressLine1: string;
  shippingAddressLine2: string | null;
  shippingWard: string | null;
  shippingDistrict: string | null;
  shippingCity: string;
  shippingPostalCode: string | null;
  shippingCountry: string;
  notes: string | null;
  orderItems: OrderItem[];
  payment: {
    id: string;
    amount: number;
    status: PaymentStatus;
    method: OrderPaymentMethod | null;
    currency: string;
    paidAt: string | null;
  } | null;
  createdAt: string;
  updatedAt: string;
  cancelledAt: string | null;
};

export type OrderQuery = {
  search?: string;
  status?: OrderStatus;
  createdFrom?: string;
  createdTo?: string;
  page?: number;
  limit?: number;
};

export type OrderListResponse = {
  data: ManagedOrder[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

function toQueryString(query: OrderQuery) {
  const params = new URLSearchParams();

  if (query.search?.trim()) {
    params.set("search", query.search.trim());
  }

  if (query.status) {
    params.set("status", query.status);
  }

  if (query.createdFrom) {
    params.set("createdFrom", query.createdFrom);
  }

  if (query.createdTo) {
    params.set("createdTo", query.createdTo);
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

export async function getOrders(
  query: OrderQuery = {},
): Promise<OrderListResponse> {
  return apiRequest<OrderListResponse>(`/api/v1/orders${toQueryString(query)}`);
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<ManagedOrder> {
  return apiRequest<ManagedOrder>(`/api/v1/orders/${id}/status`, {
    method: "PATCH",
    body: { status },
  });
}
