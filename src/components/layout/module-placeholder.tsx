import * as React from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ModulePlaceholderProps = {
  heading: string;
  intro: string;
  scope: string[];
  nextDeliverables: string[];
};

export default function ModulePlaceholder({
  heading,
  intro,
  scope,
  nextDeliverables,
}: ModulePlaceholderProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <Card className="rounded-[28px] border-white/60 bg-white/90 shadow-sm backdrop-blur">
        <CardHeader>
          <CardTitle className="text-xl">{heading}</CardTitle>
          <p className="mt-2 text-sm leading-6 text-slate-500">{intro}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {scope.map((item) => (
            <div
              key={item}
              className="flex items-start gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4"
            >
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
              <p className="text-sm text-slate-700">{item}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-[28px] border-white/60 bg-white/90 shadow-sm backdrop-blur">
        <CardHeader>
          <CardTitle className="text-xl">Next Deliverables</CardTitle>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Planned progression after Sprint 1 shell and routing are stabilized.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {nextDeliverables.map((item) => (
            <div
              key={item}
              className="flex items-start gap-3 rounded-3xl bg-slate-50 p-4"
            >
              <ArrowRight className="mt-0.5 h-4 w-4 text-slate-700" />
              <p className="text-sm text-slate-700">{item}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
