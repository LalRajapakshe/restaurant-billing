import { apiClient } from "@/lib/api-client";
import { mockDashboard } from "@/data/mock-dashboard";

type DashboardResponse = {
    success?: boolean;
    data: typeof mockDashboard;
};

export const dashboardService = {
    async getDashboardData() {
        try {
            const response = await apiClient.get<DashboardResponse>("/dashboard");
            return response.data;
        } catch {
            return mockDashboard;
        }
    },
};