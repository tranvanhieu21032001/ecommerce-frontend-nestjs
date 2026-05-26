import { apiRequest } from "@/lib/api/client";

export type DashboardPeriod = 7 | 30 | 90;

export type DashboardAnalytics = {
  period: {
    days: DashboardPeriod;
    from: string;
    to: string;
  };
  summary: {
    revenue: number;
    paidOrders: number;
    itemsSold: number;
    averageOrderValue: number;
    revenueGrowth: number | null;
  };
  series: Array<{
    date: string;
    revenue: number;
    paidOrders: number;
    itemsSold: number;
  }>;
  orderStatus: Array<{
    status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
    count: number;
  }>;
  topProducts: Array<{
    id: string;
    name: string;
    quantity: number;
  }>;
  lowStockProducts: Array<{
    id: string;
    name: string;
    stock: number;
  }>;
  generatedAt: string;
  revenueBasis: "COMPLETED_PAYMENT";
};

export async function getDashboardAnalytics(
  days: DashboardPeriod,
): Promise<DashboardAnalytics> {
  return apiRequest<DashboardAnalytics>(`/api/v1/dashboard/analytics?days=${days}`);
}
