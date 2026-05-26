import { apiRequest } from "@/lib/api/client";

export type FlashSaleItem = {
  id: string;
  salePrice: number;
  stockLimit: number;
  soldCount: number;
  orderCount: number;
  revenue: number;
  perUserLimit: number;
  remaining?: number;
  product: {
    id: string;
    name: string;
    imageUrl: string | null;
    price: number;
  };
  variation: {
    id: string;
    price: number;
    options: Array<{ id: string; name: string }>;
  } | null;
};

export type FlashSale = {
  id: string;
  name: string;
  startsAt: string;
  endsAt: string;
  items: FlashSaleItem[];
};

export type FlashSaleReservation = {
  id: string;
  quantity: number;
  status: "ACTIVE" | "CONSUMED" | "RELEASED" | "EXPIRED";
  expiresAt: string;
  remaining?: number;
  item: FlashSaleItem;
};

export type FlashSaleReport = {
  id: string;
  name: string;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  metrics: {
    stockLimit: number;
    soldCount: number;
    orderCount: number;
    revenue: number;
    revenueBasis: "COMPLETED_PAYMENT";
    sellThroughRate: number;
  };
  items: FlashSaleItem[];
  createdAt: string;
  updatedAt: string;
};

export type CreateFlashSalePayload = {
  name: string;
  startsAt: string;
  endsAt: string;
  isActive?: boolean;
  items: Array<{
    productId: string;
    variationId?: string;
    salePrice: number;
    stockLimit: number;
    perUserLimit?: number;
  }>;
};

export async function getActiveFlashSales(): Promise<FlashSale[]> {
  return apiRequest<FlashSale[]>("/api/v1/flash-sales/active");
}

export async function createFlashSale(
  payload: CreateFlashSalePayload,
): Promise<{ id: string }> {
  return apiRequest<{ id: string }>("/api/v1/flash-sales", {
    method: "POST",
    body: {
      ...payload,
      name: payload.name.trim(),
    },
  });
}

export async function getFlashSaleReports(): Promise<FlashSaleReport[]> {
  return apiRequest<FlashSaleReport[]>("/api/v1/flash-sales/reports");
}

export async function reserveFlashSaleItem(
  itemId: string,
  quantity = 1,
): Promise<FlashSaleReservation> {
  return apiRequest<FlashSaleReservation>(
    `/api/v1/flash-sales/items/${itemId}/reservations`,
    { method: "POST", body: { quantity } },
  );
}

export async function getFlashSaleReservation(
  id: string,
): Promise<FlashSaleReservation> {
  return apiRequest<FlashSaleReservation>(
    `/api/v1/flash-sales/reservations/${id}`,
  );
}
