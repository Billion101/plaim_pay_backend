import { z } from 'zod';

export const createOrderSchema = z.object({
    amount: z.number().positive('Amount must be positive'),
    description: z.string().optional(),
    items: z.any().optional()
});
