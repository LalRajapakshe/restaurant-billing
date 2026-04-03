export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-IN');
}

export function formatTime(date: Date | string): string {
  return new Date(date).toLocaleTimeString('en-IN');
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString('en-IN');
}
