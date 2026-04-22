export type ReservationStatus =
  | "Tentative"
  | "Confirmed"
  | "Checked In"
  | "Checked Out"
  | "Cancelled"
  | "No Show";

export type BoardBasis = "Room Only" | "Half Board" | "Full Board";

export type ReservationRecord = {
  id: string;
  guestName: string;
  mobile: string;
  email: string;
  arrivalDate: string;
  departureDate: string;
  nights: number;
  roomType: string;
  roomNo: string;
  adults: number;
  children: number;
  boardBasis: BoardBasis;
  advancePayment: number;
  totalEstimate: number;
  status: ReservationStatus;
  notes: string;
  createdAt: string;
};

export type ReservationPayload = Omit<ReservationRecord, "id" | "createdAt" | "nights"> & {
  id?: string;
  createdAt?: string;
  nights?: number;
};

export const reservationStatuses: ReservationStatus[] = [
  "Tentative",
  "Confirmed",
  "Checked In",
  "Checked Out",
  "Cancelled",
  "No Show",
];

export const boardBasisOptions: BoardBasis[] = [
  "Room Only",
  "Half Board",
  "Full Board",
];
