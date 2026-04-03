'use client';

interface StatChipProps {
  label: string;
  value: string | number;
}

export function StatChip({ label, value }: StatChipProps) {
  return (
    <div className="px-3 py-2 bg-muted rounded-full text-sm">
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-semibold ml-2">{value}</span>
    </div>
  );
}
