import { apiRequest } from "@/lib/api/client";
import type { Product } from "@/lib/api/products";

export type CartItem = {
  id: string;
  quantity: number;
  variationId: string | null;
  unitPrice: number;
  variation: NonNullable<Product["variations"]>[number] | null;
  product: Product;
};

export type Cart = {
  id: string | null;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
};

export async function getCart(): Promise<Cart> {
  return apiRequest<Cart>("/api/v1/cart");
}

export async function addCartItem(
  productId: string,
  quantity = 1,
  variationId?: string,
): Promise<Cart> {
  return apiRequest<Cart>("/api/v1/cart/items", {
    method: "POST",
    body: { productId, quantity, variationId },
  });
}

export async function updateCartItem(
  productId: string,
  quantity: number,
  variationId?: string | null,
): Promise<Cart> {
  const query = variationId ? `?variationId=${encodeURIComponent(variationId)}` : "";
  return apiRequest<Cart>(`/api/v1/cart/items/${productId}${query}`, {
    method: "PATCH",
    body: { quantity },
  });
}

export async function removeCartItem(
  productId: string,
  variationId?: string | null,
): Promise<Cart> {
  const query = variationId ? `?variationId=${encodeURIComponent(variationId)}` : "";
  return apiRequest<Cart>(`/api/v1/cart/items/${productId}${query}`, {
    method: "DELETE",
  });
}

export async function clearCart(): Promise<Cart> {
  return apiRequest<Cart>("/api/v1/cart/items", { method: "DELETE" });
}
