import { z } from 'zod';

export const reportSchema = z.object({
  dailySales: z.array(z.object({
    date: z.string(),
    amount: z.number(),
  })),
  topItems: z.array(z.object({
    name: z.string(),
    count: z.number(),
    revenue: z.number(),
  })),
});

export type Report = z.infer<typeof reportSchema>;
