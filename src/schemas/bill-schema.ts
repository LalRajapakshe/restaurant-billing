import { z } from 'zod';

export const billSchema = z.object({
  id: z.string(),
  tableNumber: z.number(),
  items: z.number(),
  total: z.number(),
  status: z.enum(['paid', 'pending']),
  createdAt: z.date(),
});

export type Bill = z.infer<typeof billSchema>;
