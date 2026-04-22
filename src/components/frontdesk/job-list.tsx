"use client";

import React from "react";

import JobCard, { FrontdeskJobCardData } from "@/components/frontdesk/job-card";
import PanelShell from "@/components/shared/panel-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type JobListProps = {
  filters: readonly string[];
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  filteredJobs: FrontdeskJobCardData[];
  activeJobId: string | null;
  onSelectJob: (jobId: string) => void;
};

export default function JobList({
  filters,
  activeFilter,
  onFilterChange,
  filteredJobs,
  activeJobId,
  onSelectJob,
}: JobListProps) {
  return (
    <PanelShell
      title="Open Tables / Jobs"
      description="Dynamic card view for active restaurant jobs"
      headerRight={
        <Badge className="rounded-full bg-slate-900 px-3 py-1.5 hover:bg-slate-900">
          {filteredJobs.length} Visible
        </Badge>
      }
      minimizedContent={
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-medium text-slate-900">
                {filteredJobs.length} jobs visible
              </p>
              <p className="mt-1 text-slate-500">
                Active filter: <span className="font-medium text-slate-700">{activeFilter}</span>
              </p>
            </div>
            {activeJobId ? (
              <div className="text-right">
                <p className="text-xs text-slate-500">Selected</p>
                <p className="font-semibold text-slate-900">{activeJobId}</p>
              </div>
            ) : null}
          </div>
        </div>
      }
    >
      <div className="mt-0 flex flex-wrap gap-2">
        {filters.map((filter) => (
          <Button
            key={filter}
            variant={activeFilter === filter ? "default" : "outline"}
            onClick={() => onFilterChange(filter)}
            className={`rounded-2xl ${activeFilter === filter ? "bg-slate-900 text-white" : "bg-white"}`}
          >
            {filter}
          </Button>
        ))}
      </div>

      <div className="mt-4 max-h-[780px] space-y-4 overflow-auto pb-2">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              active={activeJobId === job.id}
              onSelect={() => onSelectJob(job.id)}
            />
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
            No jobs match the current search/filter.
          </div>
        )}
      </div>
    </PanelShell>
  );
}
