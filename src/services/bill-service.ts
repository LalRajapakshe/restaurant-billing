import { apiClient } from "@/lib/api-client";
import { mockBills } from "@/data/mock-bills";

type BillsResponse = {
    success?: boolean;
    data: typeof mockBills;
};

export const billService = {
    async getBills() {
        try {
            const response = await apiClient.get<BillsResponse>("/bills");
            return response.data;
        } catch {
            return mockBills;
        }
    },
};