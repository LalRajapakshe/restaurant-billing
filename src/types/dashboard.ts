export interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  activeJobs: number;
  pendingPayments: number;
  averageOrderValue?: number;
}

export interface SalesData {
  date: string;
  amount: number;
}

export interface TopItem {
  name: string;
  count: number;
  revenue: number;
}
