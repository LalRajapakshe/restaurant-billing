import * as React from "react";

import { Card, CardContent } from "@/components/ui/card";

type SummaryMetricCardProps = {
  label: string;
  value: string;
  helper: string;
  icon: React.ComponentType<{ className?: string }>;
};

export default function SummaryMetricCard({
  label,
  value,
  helper,
  icon: Icon,
}: SummaryMetricCardProps) {
  return (
    <Card className="rounded-[28px] border-white/60 bg-white/90 shadow-sm backdrop-blur">
      <CardContent className="flex items-start justify-between p-5">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
          <p className="mt-1 text-xs text-slate-500">{helper}</p>
        </div>
        <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}
