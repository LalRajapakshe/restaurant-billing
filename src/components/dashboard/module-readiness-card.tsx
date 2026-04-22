import Link from "next/link";
import * as React from "react";
import { ArrowRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { ModuleHealth } from "@/types/management-summary";

type ModuleReadinessCardProps = {
  module: ModuleHealth;
};

export default function ModuleReadinessCard({
  module,
}: ModuleReadinessCardProps) {
  return (
    <Card className="rounded-[28px] border-white/60 bg-white/90 shadow-sm backdrop-blur">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-lg font-semibold text-slate-900">{module.name}</p>
            <p
              className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-medium ${
                module.status === "Ready for Demo"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-amber-200 bg-amber-50 text-amber-700"
              }`}
            >
              {module.status}
            </p>
          </div>
        </div>

        <p className="mt-4 text-sm leading-6 text-slate-600">{module.summary}</p>

        <Link
          href={module.route}
          className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-slate-900"
        >
          Open module <ArrowRight className="h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
