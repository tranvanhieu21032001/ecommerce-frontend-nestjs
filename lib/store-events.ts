export const CART_UPDATED_EVENT = "shop-cart-updated";
export const WISHLIST_UPDATED_EVENT = "shop-wishlist-updated";
export const PROFILE_UPDATED_EVENT = "shop-profile-updated";

export function notifyCartUpdated() {
  window.dispatchEvent(new Event(CART_UPDATED_EVENT));
}

export function notifyWishlistUpdated() {
  window.dispatchEvent(new Event(WISHLIST_UPDATED_EVENT));
}

export function notifyProfileUpdated() {
  window.dispatchEvent(new Event(PROFILE_UPDATED_EVENT));
}
