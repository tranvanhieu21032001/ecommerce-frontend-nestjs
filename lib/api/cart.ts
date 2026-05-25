import { apiRequest } from "@/lib/api/client";
import type { Product } from "@/lib/api/products";

export type CartItem = {
  id: string;
  quantity: number;
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

export async function addCartItem(productId: string, quantity = 1): Promise<Cart> {
  return apiRequest<Cart>("/api/v1/cart/items", {
    method: "POST",
    body: { productId, quantity },
  });
}

export async function updateCartItem(
  productId: string,
  quantity: number,
): Promise<Cart> {
  return apiRequest<Cart>(`/api/v1/cart/items/${productId}`, {
    method: "PATCH",
    body: { quantity },
  });
}

export async function removeCartItem(productId: string): Promise<Cart> {
  return apiRequest<Cart>(`/api/v1/cart/items/${productId}`, {
    method: "DELETE",
  });
}

export async function clearCart(): Promise<Cart> {
  return apiRequest<Cart>("/api/v1/cart/items", { method: "DELETE" });
}
