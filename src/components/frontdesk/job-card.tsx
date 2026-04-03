'use client';

interface JobCardProps {
  jobId: string;
  description: string;
  status: 'pending' | 'completed';
}

export function JobCard({ jobId, description, status }: JobCardProps) {
  return (
    <div className="rounded-lg border p-4 bg-white">
      <p className="text-sm text-muted-foreground">Job ID: {jobId}</p>
      <p className="font-medium mt-2">{description}</p>
      <div className="mt-4">
        <span className={`text-xs px-2 py-1 rounded-full ${
          status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {status}
        </span>
      </div>
    </div>
  );
}
