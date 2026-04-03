import { z } from 'zod';

export const paymentSchema = z.object({
  id: z.string(),
  billId: z.string(),
  amount: z.number(),
  method: z.enum(['cash', 'card', 'upi']),
  status: z.enum(['pending', 'completed', 'failed']),
  createdAt: z.date(),
});

export type Payment = z.infer<typeof paymentSchema>;
