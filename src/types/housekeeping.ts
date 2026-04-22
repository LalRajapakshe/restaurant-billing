export type HousekeepingTaskStatus =
  | "Dirty"
  | "Cleaning In Progress"
  | "Ready";

export type HousekeepingTaskRecord = {
  id: string;
  roomId: string;
  roomNo: string;
  roomType: string;
  floor: string;
  status: HousekeepingTaskStatus;
  assignedTo: string;
  cleanedBy: string;
  note: string;
  createdAt: string;
  completedAt: string;
};

export type HousekeepingTaskPayload = Omit<HousekeepingTaskRecord, "id"> & {
  id?: string;
};

export const housekeepingTaskStatuses: HousekeepingTaskStatus[] = [
  "Dirty",
  "Cleaning In Progress",
  "Ready",
];
