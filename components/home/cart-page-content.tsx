"use client";

import { Heart, Loader2, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { ShopContainer } from "@/components/home/shop-container";
import {
  clearCart,
  getCart,
  removeCartItem,
  updateCartItem,
  type Cart,
  type CartItem,
} from "@/lib/api/cart";
import { addWishlistItem } from "@/lib/api/wishlist";
import type { Product } from "@/lib/api/products";
import { notifyCartUpdated, notifyWishlistUpdated } from "@/lib/store-events";

export function CartPageContent() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [busyProductId, setBusyProductId] = useState<string | null>(null);
  const [isClearing, setIsClearing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadCart() {
      try {
        const response = await getCart();
        if (active) {
          setCart(response);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Could not load cart.");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadCart();

    return () => {
      active = false;
    };
  }, []);

  async function updateQuantity(item: CartItem, change: number) {
    const quantity = Math.max(
      1,
      Math.min(item.quantity + change, item.variation?.stock ?? item.product.stock),
    );

    if (quantity === item.quantity) {
      return;
    }

    setBusyProductId(item.product.id);
    try {
      const response = await updateCartItem(item.product.id, quantity, item.variationId);
      setCart(response);
      notifyCartUpdated();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update cart.");
    } finally {
      setBusyProductId(null);
    }
  }

  async function removeProduct(item: CartItem) {
    const { product } = item;
    setBusyProductId(product.id);
    try {
      const response = await removeCartItem(product.id, item.variationId);
      setCart(response);
      notifyCartUpdated();
      toast.success(`${product.name} removed from cart.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not remove product.");
    } finally {
      setBusyProductId(null);
    }
  }

  async function saveToWishlist(product: Product) {
    try {
      await addWishlistItem(product.id);
      notifyWishlistUpdated();
      toast.success(`${product.name} saved to wishlist.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save product.");
    }
  }

  async function handleClearCart() {
    setIsClearing(true);
    try {
      const response = await clearCart();
      setCart(response);
      notifyCartUpdated();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not clear cart.");
    } finally {
      setIsClearing(false);
    }
  }

  if (isLoading) {
    return <LoadingState label="Loading your cart..." />;
  }

  if (error) {
    return <EmptyState details={error} />;
  }

  if (!cart || cart.items.length === 0) {
    return <EmptyState details="Choose something you like and it will appear here." />;
  }

  return (
    <div className="bg-[#FAFAFA] pb-12">
      <ShopContainer>
        <div className="flex items-center gap-2 py-7">
          <ShoppingBag className="text-[#063C28]" />
          <h1 className="text-2xl font-bold text-[#151515]">Shopping Cart</h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <section className="overflow-hidden rounded-md border bg-white lg:col-span-2">
            {cart.items.map((item) => {
              const { product, quantity } = item;
              const busy = busyProductId === product.id;

              return (
                <article
                  key={item.id}
                  className="flex items-start justify-between gap-3 border-b p-3 last:border-b-0 md:gap-5"
                >
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <Link
                      href={`/shop/product/${product.id}`}
                      className="flex shrink-0 overflow-hidden rounded-md border bg-[#F6F6F6]"
                    >
                      <Image
                        src={getProductImage(product)}
                        alt={product.name}
                        width={160}
                        height={160}
                        unoptimized
                        className="h-28 w-24 object-contain transition-transform duration-300 hover:scale-105 md:h-40 md:w-40"
                      />
                    </Link>
                    <div className="flex min-h-28 min-w-0 flex-col justify-between py-1 md:min-h-40">
                      <div className="space-y-1">
                        <Link
                          href={`/shop/product/${product.id}`}
                          className="line-clamp-2 text-sm font-semibold transition-colors hover:text-[#3B9C3C] md:text-base"
                        >
                          {product.name}
                        </Link>
                        <p className="text-sm capitalize text-[#52525B]">
                          Category:{" "}
                          <span className="font-semibold text-[#151515]">
                            {product.category ?? "Uncategorized"}
                          </span>
                        </p>
                        {item.variation ? (
                          <p className="text-sm text-[#3B9C3C]">
                            Option:{" "}
                            <span className="font-semibold">
                              {formatVariationLabel(item.variation)}
                            </span>
                          </p>
                        ) : null}
                        <p className="hidden text-sm capitalize text-[#52525B] sm:block">
                          Status:{" "}
                          <span className="font-semibold text-[#151515]">
                            {product.isActive ? "Available" : "Unavailable"}
                          </span>
                        </p>
                      </div>
                      <div className="flex items-center gap-3 text-[#52525B]">
                        <button
                          type="button"
                          onClick={() => void saveToWishlist(product)}
                          aria-label={`Save ${product.name} to wishlist`}
                          className="transition-colors hover:text-[#3B9C3C]"
                        >
                          <Heart size={19} />
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => void removeProduct(item)}
                          aria-label={`Remove ${product.name} from cart`}
                          className="transition-colors hover:text-red-600 disabled:opacity-50"
                        >
                          <Trash2 size={19} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex min-h-28 shrink-0 flex-col items-end justify-between py-1 md:min-h-40">
                    <p className="font-bold text-[#151515] md:text-lg">
                      ${(item.unitPrice * quantity).toFixed(2)}
                    </p>
                    <div className="flex items-center rounded-full border border-[#151515]/15 p-1">
                      <button
                        type="button"
                        disabled={busy || quantity <= 1}
                        onClick={() => void updateQuantity(item, -1)}
                        aria-label={`Decrease ${product.name} quantity`}
                        className="flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-[#F6F6F6] disabled:opacity-40"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold">
                        {busy ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : quantity}
                      </span>
                      <button
                        type="button"
                        disabled={busy || quantity >= (item.variation?.stock ?? product.stock)}
                        onClick={() => void updateQuantity(item, 1)}
                        aria-label={`Increase ${product.name} quantity`}
                        className="flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-[#F6F6F6] disabled:opacity-40"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
            <button
              type="button"
              disabled={isClearing}
              onClick={() => void handleClearCart()}
              className="m-5 rounded-full border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:border-red-600 hover:bg-red-50 disabled:opacity-60"
            >
              {isClearing ? "Clearing..." : "Clear Cart"}
            </button>
          </section>

          <aside className="h-fit rounded-md border bg-white p-6">
            <h2 className="mb-5 text-xl font-semibold">Order Summary</h2>
            <div className="space-y-4 text-sm">
              <SummaryRow label="SubTotal" value={cart.subtotal} />
              <div className="border-t pt-4">
                <SummaryRow label="Total" value={cart.subtotal} strong />
              </div>
              <Link
                href={cart.id ? `/checkout?cartId=${encodeURIComponent(cart.id)}` : "/checkout"}
                className="block w-full rounded-full bg-[#063C28] py-3 text-center font-semibold tracking-wide text-white transition-colors hover:bg-[#3B9C3C]"
              >
                Proceed to Checkout
              </Link>
            </div>
          </aside>
        </div>
      </ShopContainer>
    </div>
  );
}

function LoadingState({ label }: { label: string }) {
  return (
    <ShopContainer className="py-16">
      <div className="flex min-h-[420px] items-center justify-center gap-2 text-sm text-[#52525B]">
        <Loader2 className="h-5 w-5 animate-spin" />
        {label}
      </div>
    </ShopContainer>
  );
}

function EmptyState({ details }: { details: string }) {
  return (
    <ShopContainer className="py-16">
      <div className="flex min-h-[420px] flex-col items-center justify-center rounded-md bg-[#F6F6F6] px-4 text-center">
        <ShoppingBag className="h-14 w-14 text-[#063C28]" strokeWidth={1.5} />
        <h1 className="mt-6 text-3xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-sm text-[#52525B]">{details}</p>
        <Link
          href="/shop"
          className="mt-7 rounded-full bg-[#063C28] px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#3B9C3C]"
        >
          Continue Shopping
        </Link>
      </div>
    </ShopContainer>
  );
}

function SummaryRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: number;
  strong?: boolean;
}) {
  return (
    <div
      className={
        strong
          ? "flex items-center justify-between text-lg font-semibold"
          : "flex items-center justify-between"
      }
    >
      <span>{label}</span>
      <span className={strong ? "font-bold text-[#151515]" : undefined}>
        ${value.toFixed(2)}
      </span>
    </div>
  );
}

function getProductImage(product: Product) {
  return (
    product.images?.find((image) => image.isPrimary)?.imageUrl ??
    product.imageUrl ??
    "/icons/product-list.svg"
  );
}

function formatVariationLabel(
  variation: NonNullable<Product["variations"]>[number],
) {
  return variation.options.map((option) => option.name).join(" / ");
}
