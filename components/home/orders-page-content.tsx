"use client";

import { Loader2, PackageOpen } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { ShopContainer } from "@/components/home/shop-container";
import {
  getOrders,
  type ManagedOrder,
  type OrderStatus,
  type PaymentStatus,
} from "@/lib/api/orders";
import { cn } from "@/lib/cn";

const pageSize = 6;

export function OrdersPageContent() {
  const [orders, setOrders] = useState<ManagedOrder[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadOrders() {
      setIsLoading(true);
      setError("");

      try {
        const response = await getOrders({ page, limit: pageSize });

        if (active) {
          setOrders(response.data);
          setTotalOrders(response.meta.total);
          setTotalPages(Math.max(response.meta.totalPages, 1));
        }
      } catch (loadError) {
        if (active) {
          setOrders([]);
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load your orders.",
          );
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadOrders();

    return () => {
      active = false;
    };
  }, [page]);

  if (isLoading) {
    return (
      <ShopContainer className="py-16">
        <div className="flex min-h-[420px] items-center justify-center gap-2 text-sm text-[#52525B]">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading your orders...
        </div>
      </ShopContainer>
    );
  }

  if (error || orders.length === 0) {
    return <EmptyOrders details={error || "Orders you place will appear here."} />;
  }

  return (
    <div className="bg-[#FAFAFA] pb-12">
      <ShopContainer className="py-10">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#3B9C3C]">
              Purchase history
            </p>
            <h1 className="mt-2 text-3xl font-bold text-[#151515]">My orders</h1>
          </div>
          <p className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-[#52525B] shadow-sm">
            {totalOrders} {totalOrders === 1 ? "order" : "orders"}
          </p>
        </div>

        <div className="space-y-5">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>

        {totalPages > 1 ? (
          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((current) => current - 1)}
              className="rounded-full border border-[#063C28]/15 bg-white px-5 py-2 text-sm font-semibold text-[#063C28] transition-colors hover:bg-[#F0FDF4] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-sm font-medium text-[#52525B]">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((current) => current + 1)}
              className="rounded-full border border-[#063C28]/15 bg-white px-5 py-2 text-sm font-semibold text-[#063C28] transition-colors hover:bg-[#F0FDF4] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        ) : null}
      </ShopContainer>
    </div>
  );
}

function OrderCard({ order }: { order: ManagedOrder }) {
  const currency = order.payment?.currency ?? "USD";
  const itemCount = order.orderItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <article className="overflow-hidden rounded-xl border border-[#151515]/10 bg-white">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#151515]/10 bg-[#F6F6F6] px-5 py-4">
        <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[#71717A]">
              Order
            </p>
            <p className="mt-1 font-semibold text-[#151515]">#{order.orderNumber}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[#71717A]">
              Placed
            </p>
            <p className="mt-1 font-medium text-[#151515]">
              {formatDate(order.createdAt)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[#71717A]">
              Items
            </p>
            <p className="mt-1 font-medium text-[#151515]">{itemCount}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge status={order.status} />
          {order.payment ? <PaymentBadge status={order.payment.status} /> : null}
        </div>
      </header>

      <div className="divide-y divide-[#151515]/10">
        {order.orderItems.map((item) => (
          <div key={item.id} className="flex items-start gap-4 px-5 py-4">
            <Link
              href={`/shop/product/${item.product.id}`}
              className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-[#F6F6F6]"
            >
              <Image
                src={item.product.imageUrl ?? "/icons/product-list.svg"}
                alt={item.product.name}
                width={80}
                height={80}
                unoptimized
                className="h-full w-full object-contain"
              />
            </Link>
            <div className="min-w-0 flex-1">
              <Link
                href={`/shop/product/${item.product.id}`}
                className="line-clamp-2 font-semibold text-[#151515] transition-colors hover:text-[#3B9C3C]"
              >
                {item.product.name}
              </Link>
              {item.variation?.options.length ? (
                <p className="mt-1 text-sm text-[#52525B]">
                  Option:{" "}
                  <span className="font-medium text-[#3B9C3C]">
                    {item.variation.options.map((option) => option.name).join(" / ")}
                  </span>
                </p>
              ) : null}
              <p className="mt-1 text-sm text-[#52525B]">
                Quantity: <span className="font-medium">{item.quantity}</span>
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="font-semibold text-[#151515]">
                {formatMoney(item.price * item.quantity, currency)}
              </p>
              {item.quantity > 1 ? (
                <p className="mt-1 text-xs text-[#71717A]">
                  {formatMoney(item.price, currency)} each
                </p>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      <footer className="grid gap-4 border-t border-[#151515]/10 px-5 py-4 text-sm sm:grid-cols-[minmax(0,1fr)_auto]">
        <div className="text-[#52525B]">
          <p className="font-semibold text-[#151515]">Ship to {order.shippingName ?? "Customer"}</p>
          <p className="mt-1">
            {[order.shippingAddressLine1, order.shippingDistrict, order.shippingCity]
              .filter(Boolean)
              .join(", ")}
          </p>
        </div>
        <div className="min-w-52 space-y-1 text-right">
          {order.discountAmount > 0 ? (
            <p className="text-[#52525B]">
              Discount: -{formatMoney(order.discountAmount, currency)}
            </p>
          ) : null}
          <p className="text-base font-bold text-[#063C28]">
            Total: {formatMoney(order.totalAmount, currency)}
          </p>
        </div>
      </footer>
    </article>
  );
}

function EmptyOrders({ details }: { details: string }) {
  return (
    <ShopContainer className="py-16">
      <div className="flex min-h-[420px] flex-col items-center justify-center rounded-md bg-[#F6F6F6] px-4 text-center">
        <PackageOpen className="h-14 w-14 text-[#063C28]" strokeWidth={1.5} />
        <h1 className="mt-6 text-3xl font-bold">No orders yet</h1>
        <p className="mt-2 text-sm text-[#52525B]">{details}</p>
        <Link
          href="/shop"
          className="mt-7 rounded-full bg-[#063C28] px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#3B9C3C]"
        >
          Start Shopping
        </Link>
      </div>
    </ShopContainer>
  );
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const labels: Record<OrderStatus, string> = {
    PENDING: "Pending",
    PROCESSING: "Processing",
    SHIPPED: "Shipped",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
  };

  return (
    <span
      className={cn(
        "rounded-full px-3 py-1 text-xs font-semibold",
        status === "DELIVERED" && "bg-green-100 text-green-700",
        status === "CANCELLED" && "bg-red-100 text-red-700",
        status === "SHIPPED" && "bg-blue-100 text-blue-700",
        status === "PROCESSING" && "bg-amber-100 text-amber-700",
        status === "PENDING" && "bg-[#EAF7EC] text-[#063C28]",
      )}
    >
      {labels[status]}
    </span>
  );
}

function PaymentBadge({ status }: { status: PaymentStatus }) {
  const labels: Record<PaymentStatus, string> = {
    PENDING: "Payment pending",
    COMPLETED: "Paid",
    FAILED: "Payment failed",
    REFUNDED: "Refunded",
  };

  return (
    <span
      className={cn(
        "rounded-full px-3 py-1 text-xs font-semibold",
        status === "COMPLETED" && "bg-green-100 text-green-700",
        status === "FAILED" && "bg-red-100 text-red-700",
        status === "REFUNDED" && "bg-slate-100 text-slate-600",
        status === "PENDING" && "bg-orange-100 text-orange-700",
      )}
    >
      {labels[status]}
    </span>
  );
}

function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "VND" ? 0 : 2,
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
