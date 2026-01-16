import { z } from 'zod';

export const registerSchema = z.object({
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    phone: z.string().min(1, 'Phone number is required'),
    password: z.string().min(1, 'Password is required'),
    plam_code: z.string().optional()
});

export const loginSchema = z.object({
    phone: z.string().min(1, 'Phone number is required'),
    password: z.string().min(1, 'Password is required')
});

export const verifyPalmSchema = z.object({
    plam_code: z.string().min(1, 'Palm code is required')
});

export const topUpSchema = z.object({
    amount: z.number().positive('Amount must be positive')
});
