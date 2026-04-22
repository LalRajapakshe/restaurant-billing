import { mockRooms } from "@/data/mock-rooms";
import { RoomPayload, RoomRecord } from "@/types/room";

type RoomsResponse = {
  success?: boolean;
  data: RoomRecord[];
};

type RoomResponse = {
  success?: boolean;
  data: RoomRecord;
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

export const roomService = {
  async getRooms() {
    try {
      const response = await request<RoomsResponse>("/api/rooms");
      return response.data;
    } catch {
      return mockRooms;
    }
  },

  async getRoomById(id: string) {
    try {
      const response = await request<RoomResponse>(`/api/rooms/${id}`);
      return response.data;
    } catch {
      return mockRooms.find((item) => item.id === id) ?? null;
    }
  },

  async saveRoom(payload: RoomPayload) {
    if (payload.id) {
      return request<RoomResponse>(`/api/rooms/${payload.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    }

    return request<RoomResponse>("/api/rooms", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
