'use client';

export function EmptyState({ message = 'No data available' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}
