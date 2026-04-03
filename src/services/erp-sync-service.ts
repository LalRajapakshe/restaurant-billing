import { apiClient } from "@/lib/api-client";

type ErpSyncResponse = {
    success: boolean;
    message: string;
    syncedAt: string;
    data?: unknown;
};

export const erpSyncService = {
    async syncWithERP(data?: unknown) {
        try {
            const response = await apiClient.post<ErpSyncResponse>("/erp/sync", data);
            return response;
        } catch {
            return {
                success: false,
                message: "ERP sync is not connected in demo mode.",
                syncedAt: new Date().toISOString(),
                data: data ?? null,
            };
        }
    },
};