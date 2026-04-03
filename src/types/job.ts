export interface Job {
  id: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: Date;
  updatedAt?: Date;
  completedAt?: Date;
}

export interface JobDetails extends Job {
  notes?: string;
  priority?: 'low' | 'medium' | 'high';
}
