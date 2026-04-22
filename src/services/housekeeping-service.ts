import { mockHousekeepingTasks } from "@/data/mock-housekeeping-tasks";
import { HousekeepingTaskPayload, HousekeepingTaskRecord } from "@/types/housekeeping";

type TasksResponse = {
  success?: boolean;
  data: HousekeepingTaskRecord[];
};

type TaskResponse = {
  success?: boolean;
  data: HousekeepingTaskRecord;
};

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    cache: "no-store",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const housekeepingService = {
  async getTasks() {
    try {
      const response = await request<TasksResponse>("/api/housekeeping");
      return response.data;
    } catch {
      return mockHousekeepingTasks;
    }
  },

  async getTaskById(id: string) {
    try {
      const response = await request<TaskResponse>(`/api/housekeeping/${id}`);
      return response.data;
    } catch {
      return mockHousekeepingTasks.find((item) => item.id === id) ?? null;
    }
  },

  async saveTask(payload: HousekeepingTaskPayload) {
    if (payload.id) {
      return request<TaskResponse>(`/api/housekeeping/${payload.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    }

    return request<TaskResponse>("/api/housekeeping", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
