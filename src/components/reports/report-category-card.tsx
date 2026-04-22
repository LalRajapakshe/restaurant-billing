import * as React from "react";
import { ArrowRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

type ReportCategoryCardProps = {
  title: string;
  description: string;
  items: string[];
  kpiLabel: string;
  kpiValue: string;
};

export default function ReportCategoryCard({
  title,
  description,
  items,
  kpiLabel,
  kpiValue,
}: ReportCategoryCardProps) {
  return (
    <Card className="rounded-[28px] border-white/60 bg-white/90 shadow-sm backdrop-blur">
      <CardContent className="p-6">
        <p className="text-lg font-semibold text-slate-900">{title}</p>
        <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>

        <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs text-slate-500">{kpiLabel}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{kpiValue}</p>
        </div>

        <div className="mt-4 space-y-3">
          {items.map((item) => (
            <div key={item} className="flex items-start gap-3 rounded-3xl bg-slate-50 p-4">
              <ArrowRight className="mt-0.5 h-4 w-4 text-slate-700" />
              <p className="text-sm text-slate-700">{item}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
