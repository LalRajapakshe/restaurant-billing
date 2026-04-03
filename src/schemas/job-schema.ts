import { z } from 'zod';

export const jobSchema = z.object({
  id: z.string(),
  description: z.string(),
  status: z.enum(['pending', 'in_progress', 'completed']),
  createdAt: z.date(),
});

export type Job = z.infer<typeof jobSchema>;
