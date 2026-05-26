"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { DashboardStat } from "@/components/dashboard/shared/dashboard-stat";
import {
  DashboardTable,
  DashboardTableRow,
} from "@/components/dashboard/shared/dashboard-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { SvgIcon } from "@/components/ui/svg-icon";
import {
  getOrders,
  updateOrderStatus,
  type ManagedOrder,
  type OrderPaymentMethod,
  type OrderStatus,
  type PaymentStatus,
} from "@/lib/api/orders";
import { cn } from "@/lib/cn";

type StatusFilter = "ALL" | OrderStatus;

const pageSize = 10;
const tableColumns = "1.2fr 0.92fr 0.7fr 0.72fr 0.68fr 0.8fr 160px";
const statusFilters: Array<{ value: StatusFilter; label: string }> = [
  { value: "ALL", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "PROCESSING", label: "Processing" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
];

const nextStatus: Partial<Record<OrderStatus, OrderStatus[]>> = {
  PENDING: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
};

export function OrdersManager() {
  const [orders, setOrders] = useState<ManagedOrder[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [createdFrom, setCreatedFrom] = useState("");
  const [createdTo, setCreatedTo] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const selectedOrder =
    orders.find((order) => order.id === selectedOrderId) ?? orders[0] ?? null;
  const pendingCount = orders.filter((order) => order.status === "PENDING").length;
  const fulfilledCount = orders.filter((order) => order.status === "DELIVERED").length;
  const pageRevenue = useMemo(
    () =>
      orders
        .filter((order) => order.status !== "CANCELLED")
        .reduce((total, order) => total + order.totalAmount, 0),
    [orders],
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [search]);

  useEffect(() => {
    let active = true;

    async function loadOrders() {
      setIsLoading(true);

      try {
        const response = await getOrders({
          search: debouncedSearch,
          status: statusFilter === "ALL" ? undefined : statusFilter,
          createdFrom: toRangeTimestamp(createdFrom, false),
          createdTo: toRangeTimestamp(createdTo, true),
          page,
          limit: pageSize,
        });

        if (!active) {
          return;
        }

        setOrders(response.data);
        setTotalOrders(response.meta.total);
        setTotalPages(Math.max(response.meta.totalPages, 1));
        setSelectedOrderId((current) =>
          response.data.some((order) => order.id === current)
            ? current
            : (response.data[0]?.id ?? null),
        );
      } catch (error) {
        if (active) {
          setOrders([]);
          toast.error(
            error instanceof Error ? error.message : "Could not load orders.",
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
  }, [createdFrom, createdTo, debouncedSearch, page, statusFilter]);

  async function handleStatusChange(order: ManagedOrder, status: OrderStatus) {
    if (
      status === "CANCELLED" &&
      !window.confirm(`Cancel order "${order.orderNumber}" and restore stock?`)
    ) {
      return;
    }

    setUpdatingId(order.id);

    try {
      const updatedOrder = await updateOrderStatus(order.id, status);
      setOrders((current) =>
        statusFilter !== "ALL" && statusFilter !== updatedOrder.status
          ? current.filter((candidate) => candidate.id !== updatedOrder.id)
          : current.map((candidate) =>
              candidate.id === updatedOrder.id ? updatedOrder : candidate,
            ),
      );
      if (statusFilter !== "ALL" && statusFilter !== updatedOrder.status) {
        setTotalOrders((current) => Math.max(0, current - 1));
      }
      toast.success(`Order moved to ${formatStatus(status)}.`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not update order status.",
      );
    } finally {
      setUpdatingId(null);
    }
  }

  function applyStatusFilter(value: StatusFilter) {
    setStatusFilter(value);
    setPage(1);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="min-w-0 rounded-[20px] border border-[#E5E7EB] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)] lg:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-subtext)]">
              Fulfillment
            </p>
            <h2 className="mt-1 text-[24px] font-black text-[color:var(--color-maintext)]">
              Order management
            </h2>
            <p className="mt-2 max-w-[560px] text-[14px] leading-6 text-[#6B7280]">
              Track customer orders, payments and delivery progress.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <DashboardStat label="Total" value={totalOrders} />
            <DashboardStat label="Pending page" value={pendingCount} />
            <DashboardStat label="Delivered page" value={fulfilledCount} />
            <div className="min-w-[92px] rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3">
              <p className="text-[11px] font-semibold text-[#7C8794]">Page value</p>
              <p className="mt-1 text-[16px] font-black text-[color:var(--color-maintext)]">
                {formatMoney(pageRevenue)}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-3 lg:grid-cols-[1fr_165px_165px]">
          <Input
            label="Search orders"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search order number"
          />
          <Input
            label="Created from"
            type="date"
            value={createdFrom}
            onChange={(event) => {
              setCreatedFrom(event.target.value);
              setPage(1);
            }}
          />
          <Input
            label="Created to"
            type="date"
            value={createdTo}
            onChange={(event) => {
              setCreatedTo(event.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="mt-2 flex flex-wrap gap-2">
          {statusFilters.map((status) => (
            <button
              key={status.value}
              type="button"
              aria-pressed={statusFilter === status.value}
              onClick={() => applyStatusFilter(status.value)}
              className={cn(
                "rounded-lg px-4 py-2 text-[13px] font-semibold transition-colors",
                statusFilter === status.value
                  ? "bg-[#F0FDF4] text-[color:var(--color-primary)]"
                  : "text-[#6B7280] hover:bg-[#F8FAFC] hover:text-[#1F2937]",
              )}
            >
              {status.label}
            </button>
          ))}
        </div>

        <DashboardTable
          columns={tableColumns}
          headers={[
            "Order",
            "Customer",
            "Date",
            "Payment",
            "Total",
            "Status",
            <span key="actions" className="text-right">
              Actions
            </span>,
          ]}
          hasData={orders.length > 0}
          isLoading={isLoading}
          minWidth={1050}
          emptyState={
            <div className="flex min-h-[270px] flex-col items-center justify-center px-4 py-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EAF7EF] text-[color:var(--color-primary)]">
                <SvgIcon src="/icons/order.svg" size={22} />
              </div>
              <p className="mt-3 text-[15px] font-bold text-[color:var(--color-maintext)]">
                No orders found
              </p>
              <p className="mt-1 text-[13px] text-[#7C8794]">
                Try another status, date range or order number.
              </p>
            </div>
          }
        >
          {orders.map((order) => (
            <DashboardTableRow
              key={order.id}
              columns={tableColumns}
              minWidth={1050}
            >
              <button
                type="button"
                onClick={() => setSelectedOrderId(order.id)}
                className="min-w-0 text-left"
              >
                <span className="block truncate font-black text-[color:var(--color-maintext)] hover:text-[color:var(--color-primary)]">
                  {order.orderNumber}
                </span>
                <span className="mt-1 block text-[12px] text-[#7C8794]">
                  {order.orderItems.length} item(s)
                </span>
              </button>
              <div className="min-w-0">
                <p className="truncate font-semibold text-[#1F2937]">
                  {order.shippingName || "Customer"}
                </p>
                <p className="mt-1 truncate text-[12px] text-[#7C8794]">
                  {order.shippingPhone || order.userId}
                </p>
              </div>
              <span className="text-[12px] font-semibold text-[#6B7280]">
                {formatDateTime(order.createdAt)}
              </span>
              <PaymentBadge order={order} />
              <span className="font-bold text-[#1F2937]">
                {formatMoney(order.totalAmount)}
              </span>
              <OrderStatusBadge status={order.status} />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrderId(order.id)}
                  className="rounded-lg border border-[#D1FAE5] px-3 py-2 text-[12px] font-bold text-[color:var(--color-primary)] transition-colors hover:bg-[#ECFDF5]"
                >
                  Details
                </button>
              </div>
            </DashboardTableRow>
          ))}
        </DashboardTable>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[13px] text-[#7C8794]">
            Page {page} of {totalPages}
          </p>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            disabled={isLoading}
            onPageChange={setPage}
          />
        </div>
      </section>

      <OrderDetailsPanel
        order={selectedOrder}
        updating={selectedOrder?.id === updatingId}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}

function OrderDetailsPanel({
  onStatusChange,
  order,
  updating,
}: {
  onStatusChange: (order: ManagedOrder, status: OrderStatus) => Promise<void>;
  order: ManagedOrder | null;
  updating: boolean;
}) {
  if (!order) {
    return (
      <aside className="flex min-h-[340px] items-center justify-center rounded-[20px] border border-[#E5E7EB] bg-white p-6 text-center text-sm text-[#7C8794]">
        Select an order to view fulfillment details.
      </aside>
    );
  }

  const transitions = nextStatus[order.status] ?? [];

  return (
    <aside className="h-fit rounded-[20px] border border-[#E5E7EB] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)] lg:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-subtext)]">
            Order detail
          </p>
          <h3 className="mt-1 break-all text-[18px] font-black text-[color:var(--color-maintext)]">
            {order.orderNumber}
          </h3>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="mt-5 space-y-3 border-y border-[#E5E7EB] py-4 text-[13px]">
        <DetailRow label="Placed" value={formatDateTime(order.createdAt)} />
        <DetailRow
          label="Payment"
          value={`${formatPaymentMethod(order.payment?.method)} - ${formatPaymentStatus(order.payment?.status)}`}
        />
        <DetailRow label="Subtotal" value={formatMoney(order.subtotal)} />
        <DetailRow label="Discount" value={`-${formatMoney(order.discountAmount)}`} />
        <DetailRow label="Total" value={formatMoney(order.totalAmount)} strong />
      </div>

      <div className="mt-5">
        <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#7C8794]">
          Delivery
        </p>
        <p className="mt-2 text-sm font-bold text-[#1F2937]">
          {order.shippingName || "Unnamed customer"}
        </p>
        <p className="mt-1 text-[13px] leading-5 text-[#6B7280]">
          {order.shippingPhone || "No phone"}<br />
          {formatAddress(order)}
        </p>
        {order.notes ? (
          <p className="mt-3 rounded-lg bg-[#F8FAFC] px-3 py-2 text-[12px] text-[#6B7280]">
            Note: {order.notes}
          </p>
        ) : null}
      </div>

      <div className="mt-5">
        <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#7C8794]">
          Items
        </p>
        <div className="mt-2 space-y-2">
          {order.orderItems.map((item) => (
            <div key={item.id} className="rounded-lg border border-[#E5E7EB] p-3 text-[12px]">
              <p className="truncate font-semibold text-[#1F2937]">
                Product {item.productId}
              </p>
              <p className="mt-1 text-[#6B7280]">
                {formatMoney(item.price)} x {item.quantity}
                {item.flashSaleItemId ? " - Flash sale" : ""}
              </p>
            </div>
          ))}
        </div>
      </div>

      {transitions.length > 0 ? (
        <div className="mt-6 grid gap-2">
          {transitions.map((status) => (
            <Button
              key={status}
              type="button"
              variant={status === "CANCELLED" ? "danger" : "primary"}
              disabled={updating}
              onClick={() => void onStatusChange(order, status)}
            >
              {updating ? "Updating..." : actionLabel(status)}
            </Button>
          ))}
        </div>
      ) : (
        <p className="mt-6 rounded-lg bg-[#F8FAFC] px-3 py-3 text-center text-[13px] text-[#6B7280]">
          This order has reached its final status.
        </p>
      )}
    </aside>
  );
}

function PaymentBadge({ order }: { order: ManagedOrder }) {
  return (
    <span className="text-[12px] font-semibold text-[#6B7280]">
      {formatPaymentMethod(order.payment?.method)}
      <span className="block text-[11px] text-[#94A3B8]">
        {formatPaymentStatus(order.payment?.status)}
      </span>
    </span>
  );
}

function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const styles: Record<OrderStatus, string> = {
    PENDING: "bg-[#FEF3C7] text-[#92400E]",
    PROCESSING: "bg-[#DBEAFE] text-[#1D4ED8]",
    SHIPPED: "bg-[#E0E7FF] text-[#4338CA]",
    DELIVERED: "bg-[#DCFCE7] text-[#166534]",
    CANCELLED: "bg-[#FEE2E2] text-[#B91C1C]",
  };

  return (
    <span className={cn("w-fit rounded-full px-3 py-1 text-[12px] font-bold", styles[status])}>
      {formatStatus(status)}
    </span>
  );
}

function DetailRow({
  label,
  strong = false,
  value,
}: {
  label: string;
  strong?: boolean;
  value: string;
}) {
  return (
    <div className={cn("flex justify-between gap-3", strong && "text-sm font-bold")}>
      <span className="text-[#7C8794]">{label}</span>
      <span className="text-right text-[#1F2937]">{value}</span>
    </div>
  );
}

function formatStatus(status: OrderStatus) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

function actionLabel(status: OrderStatus) {
  return status === "CANCELLED" ? "Cancel order" : `Mark as ${formatStatus(status)}`;
}

function formatPaymentMethod(method?: OrderPaymentMethod | null) {
  if (method === "COD") {
    return "COD";
  }

  if (method === "PAYOS") {
    return "PayOS";
  }

  if (method === "BANK_TRANSFER") {
    return "Bank transfer";
  }

  if (method) {
    return method.charAt(0) + method.slice(1).toLowerCase();
  }

  return "Unselected";
}

function formatPaymentStatus(status?: PaymentStatus) {
  if (!status) {
    return "No payment";
  }

  return status.charAt(0) + status.slice(1).toLowerCase();
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function toRangeTimestamp(value: string, throughEndOfDay: boolean) {
  if (!value) {
    return undefined;
  }

  const date = new Date(`${value}T${throughEndOfDay ? "23:59:59.999" : "00:00:00.000"}`);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function formatAddress(order: ManagedOrder) {
  return [
    order.shippingAddressLine1,
    order.shippingAddressLine2,
    order.shippingWard,
    order.shippingDistrict,
    order.shippingCity,
    order.shippingCountry,
  ]
    .filter(Boolean)
    .join(", ");
}
