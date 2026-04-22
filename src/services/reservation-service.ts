import { mockReservations } from "@/data/mock-reservations";
import { ReservationPayload, ReservationRecord } from "@/types/reservation";

type ReservationsResponse = {
  success?: boolean;
  data: ReservationRecord[];
};

type ReservationResponse = {
  success?: boolean;
  data: ReservationRecord;
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

export const reservationService = {
  async getReservations() {
    try {
      const response = await request<ReservationsResponse>("/api/reservations");
      return response.data;
    } catch {
      return mockReservations;
    }
  },

  async getReservationById(id: string) {
    try {
      const response = await request<ReservationResponse>(`/api/reservations/${id}`);
      return response.data;
    } catch {
      return mockReservations.find((item) => item.id === id) ?? null;
    }
  },

  async saveReservation(payload: ReservationPayload) {
    if (payload.id) {
      return request<ReservationResponse>(`/api/reservations/${payload.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    }

    return request<ReservationResponse>("/api/reservations", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
