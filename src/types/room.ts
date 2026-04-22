export type RoomStatus =
  | "Vacant Ready"
  | "Reserved"
  | "Occupied"
  | "Dirty"
  | "Cleaning In Progress"
  | "Out of Order";

export type BoardBasis = "Room Only" | "Half Board" | "Full Board";

export type RoomRecord = {
  id: string;
  roomNo: string;
  roomType: string;
  floor: string;
  rate: number;
  status: RoomStatus;
  reservationId: string;
  guestName: string;
  mobile: string;
  arrivalDate: string;
  departureDate: string;
  nights: number;
  adults: number;
  children: number;
  boardBasis: BoardBasis;
  notes: string;
  housekeepingNote: string;
  lastCleanedBy: string;
};

export type RoomPayload = Omit<RoomRecord, "id" | "nights"> & {
  id?: string;
  nights?: number;
};

export const roomStatusOptions: RoomStatus[] = [
  "Vacant Ready",
  "Reserved",
  "Occupied",
  "Dirty",
  "Cleaning In Progress",
  "Out of Order",
];

export const assignableRoomStatuses: RoomStatus[] = [
  "Vacant Ready",
  "Reserved",
  "Occupied",
];

export const boardBasisOptions: BoardBasis[] = [
  "Room Only",
  "Half Board",
  "Full Board",
];
