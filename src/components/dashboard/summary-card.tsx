'use client';

interface SummaryCardProps {
  title: string;
  value: string | number;
  description?: string;
}

export function SummaryCard({ title, value, description }: SummaryCardProps) {
  return (
    <div className="rounded-lg border p-6 bg-white">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="text-2xl font-bold mt-2">{value}</p>
      {description && <p className="text-xs text-muted-foreground mt-2">{description}</p>}
    </div>
  );
}
