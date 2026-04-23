import { mockFolioEntries } from "@/data/mock-folio-entries";
import { FolioEntry } from "@/types/folio";

export const FOLIO_STORAGE_KEY = "hotel-demo-folio-entries-v1";
export const FOLIO_STORAGE_EVENT = "hotel-demo-folio-updated";

function cloneFallback() {
  return mockFolioEntries.map((entry) => ({ ...entry }));
}

function isBrowser() {
  return typeof window !== "undefined";
}

function emitUpdate() {
  if (!isBrowser()) return;
  window.dispatchEvent(new Event(FOLIO_STORAGE_EVENT));
}

function normalizeEntries(entries: FolioEntry[]) {
  return [...entries].sort((a, b) => {
    return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
  });
}

export function getStoredFolioEntries() {
  if (!isBrowser()) {
    return cloneFallback();
  }

  const raw = window.localStorage.getItem(FOLIO_STORAGE_KEY);

  if (!raw) {
    const seeded = cloneFallback();
    window.localStorage.setItem(FOLIO_STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }

  try {
    const parsed = JSON.parse(raw) as FolioEntry[];
    if (!Array.isArray(parsed)) throw new Error("Invalid folio storage");
    return normalizeEntries(parsed);
  } catch {
    const seeded = cloneFallback();
    window.localStorage.setItem(FOLIO_STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }
}

export function saveStoredFolioEntries(entries: FolioEntry[]) {
  if (!isBrowser()) return;

  const normalized = normalizeEntries(entries);
  window.localStorage.setItem(FOLIO_STORAGE_KEY, JSON.stringify(normalized));
  emitUpdate();
}

export function appendStoredFolioEntries(entries: FolioEntry[]) {
  if (!isBrowser()) return;

  const current = getStoredFolioEntries();
  const existingIds = new Set(current.map((entry) => entry.id));
  const next = [...current];

  entries.forEach((entry) => {
    if (!existingIds.has(entry.id)) {
      next.unshift(entry);
      existingIds.add(entry.id);
    }
  });

  saveStoredFolioEntries(next);
}

export function upsertRoomChargeEntry(entry: FolioEntry) {
  if (!isBrowser()) return;

  const current = getStoredFolioEntries();
  const filtered = current.filter(
    (item) => !(item.sourceModule === "room" && item.roomId === entry.roomId)
  );

  saveStoredFolioEntries([entry, ...filtered]);
}

export function removeRoomFolioEntries(roomNo: string) {
  if (!isBrowser()) return;

  const current = getStoredFolioEntries();
  const filtered = current.filter((entry) => entry.roomNo !== roomNo);
  saveStoredFolioEntries(filtered);
}
