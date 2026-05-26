import { apiRequest } from "@/lib/api/client";

export type CheckoutItem = {
  productId: string;
  variationId?: string;
  quantity: number;
};

export type CreatePayOSOrderPayload = {
  items?: CheckoutItem[];
  cartId?: string;
  shippingName?: string;
  shippingPhone?: string;
  shippingAddressLine1: string;
  shippingCity: string;
  shippingDistrict?: string;
  shippingWard?: string;
  notes?: string;
};

export type OrderPayment = {
  id: string;
  amount: number;
  status: string;
  method: string | null;
  currency: string;
};

export type Order = {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  payment: OrderPayment | null;
};

export type PayOSPaymentLink = {
  bin: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  description: string;
  orderCode: number;
  currency: string;
  paymentLinkId: string;
  status: string;
  expiredAt?: number;
  checkoutUrl: string;
  qrCode: string;
};

export async function createPayOSOrder(
  payload: CreatePayOSOrderPayload,
): Promise<Order> {
  return apiRequest<Order>("/api/v1/orders", {
    method: "POST",
    body: {
      ...payload,
      paymentMethod: "PAYOS",
      shippingCountry: "VN",
    },
  });
}

export async function createPayOSPaymentLink(
  orderId: string,
  returnUrl: string,
  cancelUrl: string,
): Promise<PayOSPaymentLink> {
  return apiRequest<PayOSPaymentLink>(
    `/api/v1/payments/payos/orders/${orderId}/payment-link`,
    {
      method: "POST",
      body: { returnUrl, cancelUrl },
    },
  );
}

export async function cancelOrder(orderId: string): Promise<Order> {
  return apiRequest<Order>(`/api/v1/orders/${orderId}/cancel`, {
    method: "PATCH",
  });
}
