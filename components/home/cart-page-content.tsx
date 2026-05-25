"use client";

import { Heart, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { ShopContainer } from "@/components/home/shop-container";
import type { HomeProduct } from "@/lib/mock/home";
import { products } from "@/lib/mock/home";

type CartLine = {
  product: HomeProduct;
  quantity: number;
};

const initialCart: CartLine[] = products.slice(0, 3).map((product, index) => ({
  product,
  quantity: index + 1,
}));

export function CartPageContent() {
  const [cartLines, setCartLines] = useState(initialCart);

  const subtotal = useMemo(
    () =>
      cartLines.reduce(
        (total, line) => total + line.product.price * line.quantity,
        0,
      ),
    [cartLines],
  );
  const total = useMemo(
    () =>
      cartLines.reduce(
        (sum, line) => sum + getSalePrice(line.product) * line.quantity,
        0,
      ),
    [cartLines],
  );
  const discount = subtotal - total;

  function updateQuantity(productId: string, change: number) {
    setCartLines((lines) =>
      lines.map((line) =>
        line.product.id === productId
          ? {
              ...line,
              quantity: Math.max(
                1,
                Math.min(line.quantity + change, line.product.stock),
              ),
            }
          : line,
      ),
    );
  }

  function removeProduct(productId: string) {
    setCartLines((lines) =>
      lines.filter((line) => line.product.id !== productId),
    );
  }

  if (cartLines.length === 0) {
    return (
      <ShopContainer className="py-16">
        <div className="flex min-h-[420px] flex-col items-center justify-center rounded-md bg-[#F6F6F6] px-4 text-center">
          <ShoppingBag className="h-14 w-14 text-[#063C28]" strokeWidth={1.5} />
          <h1 className="mt-6 text-3xl font-bold">Your cart is empty</h1>
          <p className="mt-2 text-sm text-[#52525B]">
            Choose something you like and it will appear here.
          </p>
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

  return (
    <div className="bg-[#FAFAFA] pb-12">
      <ShopContainer>
        <div className="flex items-center gap-2 py-7">
          <ShoppingBag className="text-[#063C28]" />
          <h1 className="text-2xl font-bold text-[#151515]">Shopping Cart</h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <section className="overflow-hidden rounded-md border bg-white lg:col-span-2">
            {cartLines.map(({ product, quantity }) => (
              <article
                key={product.id}
                className="flex items-start justify-between gap-3 border-b p-3 last:border-b-0 md:gap-5"
              >
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <Link
                    href={`/shop/product/${product.id}`}
                    className="flex shrink-0 overflow-hidden rounded-md border bg-[#F6F6F6]"
                  >
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={160}
                      height={160}
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
                          {product.category}
                        </span>
                      </p>
                      <p className="hidden text-sm capitalize text-[#52525B] sm:block">
                        Status:{" "}
                        <span className="font-semibold text-[#151515]">
                          {product.status ?? "Regular"}
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-[#52525B]">
                      <button
                        type="button"
                        aria-label={`Save ${product.name} to wishlist`}
                        className="transition-colors hover:text-[#3B9C3C]"
                      >
                        <Heart size={19} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeProduct(product.id)}
                        aria-label={`Remove ${product.name} from cart`}
                        className="transition-colors hover:text-red-600"
                      >
                        <Trash2 size={19} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex min-h-28 shrink-0 flex-col items-end justify-between py-1 md:min-h-40">
                  <p className="font-bold text-[#151515] md:text-lg">
                    ${(getSalePrice(product) * quantity).toFixed(2)}
                  </p>
                  <div className="flex items-center rounded-full border border-[#151515]/15 p-1">
                    <button
                      type="button"
                      onClick={() => updateQuantity(product.id, -1)}
                      aria-label={`Decrease ${product.name} quantity`}
                      className="flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-[#F6F6F6]"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(product.id, 1)}
                      aria-label={`Increase ${product.name} quantity`}
                      className="flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-[#F6F6F6]"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
            <button
              type="button"
              onClick={() => setCartLines([])}
              className="m-5 rounded-full border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:border-red-600 hover:bg-red-50"
            >
              Reset Cart
            </button>
          </section>

          <aside className="h-fit rounded-md border bg-white p-6">
            <h2 className="mb-5 text-xl font-semibold">Order Summary</h2>
            <div className="space-y-4 text-sm">
              <SummaryRow label="SubTotal" value={subtotal} />
              <SummaryRow label="Discount" value={discount} />
              <div className="border-t pt-4">
                <SummaryRow label="Total" value={total} strong />
              </div>
              <Link
                href="/checkout"
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

function getSalePrice(product: HomeProduct) {
  return product.discount
    ? product.price - (product.price * product.discount) / 100
    : product.price;
}
