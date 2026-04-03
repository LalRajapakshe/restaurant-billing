import { apiClient } from "@/lib/api-client";
import { mockJobs } from "@/data/mock-jobs";

type JobsResponse = {
    success?: boolean;
    data: typeof mockJobs;
};

type JobResponse = {
    success?: boolean;
    data: (typeof mockJobs)[number];
};

export const jobService = {
    async getJobs() {
        try {
            const response = await apiClient.get<JobsResponse>("/jobs");
            return response.data;
        } catch {
            return mockJobs;
        }
    },

    async getJobById(jobId: string) {
        try {
            const response = await apiClient.get<JobResponse>(`/jobs/${jobId}`);
            return response.data;
        } catch {
            return mockJobs.find((job) => job.id === jobId) ?? null;
        }
    },
};