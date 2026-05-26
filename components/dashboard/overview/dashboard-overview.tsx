"use client";

import { AlertTriangle, Loader2, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

import {
  getDashboardAnalytics,
  type DashboardAnalytics,
  type DashboardPeriod,
} from "@/lib/api/dashboard";
import { cn } from "@/lib/cn";

const periods: DashboardPeriod[] = [7, 30, 90];

export function DashboardOverview() {
  const [days, setDays] = useState<DashboardPeriod>(30);
  const [data, setData] = useState<DashboardAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadAnalytics() {
      try {
        const response = await getDashboardAnalytics(days);
        if (active) {
          setData(response);
          setError("");
        }
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error ? loadError.message : "Could not load analytics.",
          );
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadAnalytics();

    return () => {
      active = false;
    };
  }, [days]);

  function selectPeriod(nextDays: DashboardPeriod) {
    if (nextDays === days) {
      return;
    }
    setIsLoading(true);
    setDays(nextDays);
  }

  return (
    <div className="grid min-w-0 gap-6">
      <section className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[color:var(--color-maintext)]">
            Sales overview
          </h2>
          <p className="mt-1 text-sm text-[#7C8794]">
            Revenue is counted after payment confirmation.
            {isLoading && data ? (
              <Loader2 className="ml-2 inline h-3.5 w-3.5 animate-spin" />
            ) : null}
          </p>
        </div>
        <div className="flex rounded-xl border border-[#E5E7EB] bg-white p-1">
          {periods.map((period) => (
            <button
              key={period}
              type="button"
              onClick={() => selectPeriod(period)}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
                days === period
                  ? "bg-[color:var(--color-primary)] text-white"
                  : "text-[#64748B] hover:bg-[#F3F4F6]",
              )}
            >
              {period} days
            </button>
          ))}
        </div>
      </section>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {isLoading && !data ? (
        <div className="flex min-h-[420px] items-center justify-center gap-2 rounded-[20px] border border-[#E5E7EB] bg-white text-sm text-[#7C8794]">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading sales analytics...
        </div>
      ) : data ? (
        <>
          <section className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Paid revenue"
              value={formatMoney(data.summary.revenue)}
              helper={formatGrowth(data.summary.revenueGrowth)}
            />
            <MetricCard label="Paid orders" value={String(data.summary.paidOrders)} />
            <MetricCard label="Items sold" value={String(data.summary.itemsSold)} />
            <MetricCard
              label="Average order"
              value={formatMoney(data.summary.averageOrderValue)}
            />
          </section>

          <section className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">
            <ChartCard title="Paid revenue" subtitle={`Last ${days} days`}>
              <RevenueChart series={data.series} />
            </ChartCard>
            <ChartCard title="Sales volume" subtitle="Orders and items sold">
              <SalesVolumeChart series={data.series} />
            </ChartCard>
          </section>

          <section className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,0.9fr)]">
            <InfoCard title="Top products">
              {data.topProducts.length ? (
                data.topProducts.map((product, index) => (
                  <InfoRow
                    key={product.id}
                    label={`${index + 1}. ${product.name}`}
                    value={`${product.quantity} sold`}
                  />
                ))
              ) : (
                <EmptyText>No paid product sales in this period.</EmptyText>
              )}
            </InfoCard>
            <InfoCard title="Order status">
              {data.orderStatus.map((status) => (
                <InfoRow
                  key={status.status}
                  label={formatStatus(status.status)}
                  value={String(status.count)}
                />
              ))}
            </InfoCard>
            <InfoCard title="Low stock alert">
              {data.lowStockProducts.length ? (
                data.lowStockProducts.map((product) => (
                  <InfoRow
                    key={product.id}
                    label={product.name}
                    value={`${product.stock} left`}
                    warning
                  />
                ))
              ) : (
                <EmptyText>No product is running low.</EmptyText>
              )}
            </InfoCard>
          </section>
        </>
      ) : null}
    </div>
  );
}

function MetricCard({
  helper,
  label,
  value,
}: {
  helper?: string;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-[20px] border border-[#E5E7EB] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#7C8794]">
        {label}
      </p>
      <p className="mt-3 truncate text-[28px] font-black text-[color:var(--color-maintext)]">
        {value}
      </p>
      {helper ? (
        <p className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary">
          <TrendingUp size={13} />
          {helper}
        </p>
      ) : null}
    </div>
  );
}

function ChartCard({
  children,
  subtitle,
  title,
}: {
  children: React.ReactNode;
  subtitle: string;
  title: string;
}) {
  return (
    <div className="min-w-0 overflow-hidden rounded-[20px] border border-[#E5E7EB] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)] lg:p-6">
      <div className="mb-5">
        <h3 className="text-base font-bold text-[color:var(--color-maintext)]">{title}</h3>
        <p className="mt-1 text-xs text-[#7C8794]">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

function RevenueChart({ series }: { series: DashboardAnalytics["series"] }) {
  const width = 720;
  const height = 270;
  const padding = { top: 18, right: 16, bottom: 38, left: 72 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const max = Math.max(...series.map((point) => point.revenue), 1);
  const points = series.map((point, index) => ({
    ...point,
    x: padding.left + (series.length === 1 ? 0 : (index / (series.length - 1)) * innerWidth),
    y: padding.top + innerHeight - (point.revenue / max) * innerHeight,
  }));
  const path = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
  const area = `${path} L ${padding.left + innerWidth} ${padding.top + innerHeight} L ${padding.left} ${padding.top + innerHeight} Z`;
  const labelStep = Math.max(1, Math.ceil(series.length / 6));

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="block h-auto max-w-full"
      role="img"
      aria-label="Paid revenue chart"
    >
      {[0, 0.5, 1].map((step) => {
        const y = padding.top + innerHeight - step * innerHeight;
        return (
          <g key={step}>
            <line x1={padding.left} x2={width - padding.right} y1={y} y2={y} stroke="#E5E7EB" />
            <text x={padding.left - 9} y={y + 4} textAnchor="end" fontSize="11" fill="#7C8794">
              {compactMoney(max * step)}
            </text>
          </g>
        );
      })}
      <path d={area} fill="#158947" opacity="0.1" />
      <path d={path} fill="none" stroke="#158947" strokeWidth="3" strokeLinejoin="round" />
      {points.map((point, index) =>
        index % labelStep === 0 || index === points.length - 1 ? (
          <text
            key={point.date}
            x={point.x}
            y={height - 11}
            textAnchor="middle"
            fontSize="11"
            fill="#7C8794"
          >
            {shortDate(point.date)}
          </text>
        ) : null,
      )}
    </svg>
  );
}

function SalesVolumeChart({ series }: { series: DashboardAnalytics["series"] }) {
  const max = Math.max(...series.map((point) => point.itemsSold), 1);
  const showLabelEvery = Math.max(1, Math.ceil(series.length / 5));

  return (
    <div className="min-w-0 overflow-hidden">
      <div className="mb-4 flex gap-4 text-xs text-[#64748B]">
        <Legend color="#158947" label="Items sold" />
        <Legend color="#93D991" label="Paid orders" />
      </div>
      <div className="flex h-[194px] min-w-0 items-end gap-1 border-b border-[#E5E7EB] pb-2">
        {series.map((point, index) => (
          <div key={point.date} className="flex h-full min-w-0 flex-1 flex-col justify-end">
            <div className="flex min-w-0 items-end justify-center gap-px">
              <div
                title={`${point.itemsSold} items sold`}
                className="min-w-0 flex-1 rounded-t bg-[#158947]"
                style={{ height: `${Math.max(point.itemsSold ? 4 : 0, (point.itemsSold / max) * 150)}px` }}
              />
              <div
                title={`${point.paidOrders} paid orders`}
                className="min-w-0 flex-1 rounded-t bg-[#93D991]"
                style={{ height: `${Math.max(point.paidOrders ? 4 : 0, (point.paidOrders / max) * 150)}px` }}
              />
            </div>
            <p className="mt-3 h-4 truncate text-center text-[10px] text-[#7C8794]">
              {index % showLabelEvery === 0 || index === series.length - 1
                ? shortDate(point.date)
                : ""}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}

function InfoCard({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div className="min-w-0 overflow-hidden rounded-[20px] border border-[#E5E7EB] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
      <h3 className="mb-3 text-base font-bold text-[color:var(--color-maintext)]">{title}</h3>
      <div className="divide-y divide-[#EEF2F7]">{children}</div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  warning = false,
}: {
  label: string;
  value: string;
  warning?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-3 text-sm">
      <span className="line-clamp-1 text-[#475569]">{label}</span>
      <span
        className={cn(
          "shrink-0 font-semibold",
          warning ? "inline-flex items-center gap-1 text-amber-600" : "text-[#111827]",
        )}
      >
        {warning ? <AlertTriangle size={13} /> : null}
        {value}
      </span>
    </div>
  );
}

function EmptyText({ children }: { children: React.ReactNode }) {
  return <p className="py-7 text-center text-sm text-[#7C8794]">{children}</p>;
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

function compactMoney(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function shortDate(date: string) {
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit" }).format(
    new Date(date),
  );
}

function formatStatus(status: DashboardAnalytics["orderStatus"][number]["status"]) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

function formatGrowth(growth: number | null) {
  if (growth === null) {
    return "First revenue in this period";
  }
  if (growth === 0) {
    return "No change vs previous period";
  }
  return `${growth > 0 ? "+" : ""}${growth}% vs previous period`;
}
