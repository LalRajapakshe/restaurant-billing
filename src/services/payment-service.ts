import { apiClient } from "@/lib/api-client";
import { mockPayments } from "@/data/mock-payments";

type PaymentsResponse = {
    success?: boolean;
    data: typeof mockPayments;
};

export const paymentService = {
    async getPayments() {
        try {
            const response = await apiClient.get<PaymentsResponse>("/payments");
            return response.data;
        } catch {
            return mockPayments;
        }
    },
};