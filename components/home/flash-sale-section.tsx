"use client";

import { Flame, Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  getActiveFlashSales,
  reserveFlashSaleItem,
  type FlashSale,
  type FlashSaleItem,
} from "@/lib/api/flash-sales";

export function FlashSaleSection() {
  const router = useRouter();
  const [sales, setSales] = useState<FlashSale[]>([]);
  const [loadingItemId, setLoadingItemId] = useState("");
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let active = true;

    async function refreshSales() {
      try {
        const response = await getActiveFlashSales();
        if (active) {
          setSales(response);
        }
      } catch {
        // Keep a currently rendered campaign visible during transient refresh errors.
      }
    }

    void refreshSales();
    const intervalId = window.setInterval(() => {
      void refreshSales();
    }, 15000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const sale = sales.find(
    (candidate) =>
      candidate.items.length > 0 && new Date(candidate.endsAt).getTime() > now,
  );
  if (!sale) {
    return null;
  }

  async function buyNow(item: FlashSaleItem) {
    setLoadingItemId(item.id);
    try {
      const reservation = await reserveFlashSaleItem(item.id);
      router.push(
        `/checkout?flashSaleReservationId=${encodeURIComponent(reservation.id)}`,
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Khong the giu suat flash sale luc nay.",
      );
    } finally {
      setLoadingItemId("");
    }
  }

  return (
    <section className="my-10 overflow-hidden rounded-2xl bg-[#063C28] px-5 py-6 text-white sm:px-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-[#93D991]">
            <Flame size={16} fill="currentColor" />
            Flash sale
          </p>
          <h2 className="mt-2 text-2xl font-bold">{sale.name}</h2>
        </div>
        <p className="rounded-full bg-white/10 px-4 py-2 text-sm">
          Con lai: {formatRemainingTime(sale.endsAt, now)}
        </p>
      </header>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {sale.items.slice(0, 4).map((item) => {
          const remaining = getRemaining(item);

          return (
            <article key={item.id} className="rounded-xl bg-white p-3 text-[#151515]">
              <Image
                src={item.product.imageUrl ?? "/icons/product-list.svg"}
                alt={item.product.name}
                width={240}
                height={180}
                unoptimized
                className="h-36 w-full object-contain"
              />
              <p className="mt-3 line-clamp-1 font-semibold">{item.product.name}</p>
              {item.variation ? (
                <p className="mt-1 line-clamp-1 text-xs text-[#52525B]">
                  {item.variation.options.map((option) => option.name).join(" / ")}
                </p>
              ) : null}
              <div className="mt-2 flex items-baseline gap-2">
                <p className="font-semibold text-red-600">{formatMoney(item.salePrice)}</p>
                <p className="text-xs text-[#71717A] line-through">
                  {formatMoney(item.variation?.price ?? item.product.price)}
                </p>
              </div>
              <p className="mt-2 text-xs text-[#52525B]">Con {remaining} suat</p>
              <button
                type="button"
                disabled={loadingItemId === item.id || remaining === 0}
                onClick={() => void buyNow(item)}
                className="mt-3 flex h-9 w-full items-center justify-center rounded-full bg-[#3B9C3C] text-sm font-semibold text-white transition-colors hover:bg-[#063C28] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loadingItemId === item.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : remaining === 0 ? (
                  "Sold out"
                ) : (
                  "Buy now"
                )}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 2,
  }).format(value);
}

function getRemaining(item: FlashSaleItem) {
  return item.remaining ?? Math.max(0, item.stockLimit - item.soldCount);
}

function formatRemainingTime(endsAt: string, now: number) {
  const seconds = Math.max(0, Math.floor((new Date(endsAt).getTime() - now) / 1000));
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  const time = [hours, minutes, remainingSeconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");

  return days > 0 ? `${days} ngay ${time}` : time;
}
