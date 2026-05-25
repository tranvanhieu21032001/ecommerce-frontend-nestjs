import { apiRequest } from "@/lib/api/client";
import type { Product } from "@/lib/api/products";

export type WishlistItem = {
  id: string;
  product: Product;
};

export type Wishlist = {
  items: WishlistItem[];
  itemCount: number;
};

export async function getWishlist(): Promise<Wishlist> {
  return apiRequest<Wishlist>("/api/v1/wishlist");
}

export async function addWishlistItem(productId: string): Promise<Wishlist> {
  return apiRequest<Wishlist>("/api/v1/wishlist/items", {
    method: "POST",
    body: { productId },
  });
}

export async function removeWishlistItem(productId: string): Promise<Wishlist> {
  return apiRequest<Wishlist>(`/api/v1/wishlist/items/${productId}`, {
    method: "DELETE",
  });
}

export async function clearWishlist(): Promise<Wishlist> {
  return apiRequest<Wishlist>("/api/v1/wishlist/items", {
    method: "DELETE",
  });
}
