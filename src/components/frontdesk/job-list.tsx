"use client";

import React from "react";
import { Search } from "lucide-react";

import JobCard, { FrontdeskJobCardData } from "@/components/frontdesk/job-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type JobListProps = {
  filters: readonly string[];
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  filteredJobs: FrontdeskJobCardData[];
  activeJobId: string | null;
  onSelectJob: (jobId: string) => void;
  search: string;
  onSearchChange: (value: string) => void;
};

export default function JobList({
  filters,
  activeFilter,
  onFilterChange,
  filteredJobs,
  activeJobId,
  onSelectJob,
  search,
  onSearchChange,
}: JobListProps) {
  return (
    <Card className="rounded-[28px] border-white/60 bg-white/90 shadow-sm backdrop-blur">
      <CardHeader className="pb-3 space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl">Open Tables / Jobs</CardTitle>
            <p className="mt-1 text-sm text-slate-500">
              Dynamic card view for active restaurant jobs
            </p>
          </div>
          <Badge className="rounded-full bg-slate-900 px-3 py-1.5 hover:bg-slate-900">
            {filteredJobs.length} Visible
          </Badge>
        </div>

        <div className="w-full max-w-[520px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by job no, table, mobile, customer"
              className="h-11 rounded-2xl border-slate-200 bg-white pl-10"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
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
      </CardHeader>

      <CardContent className="max-h-[860px] space-y-4 overflow-auto pb-5">
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
      </CardContent>
    </Card>
  );
}
