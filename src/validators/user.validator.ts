import { z } from 'zod';

// Palm embedding validation schema - supports multiple formats
const palmEmbeddingSchema = z.union([
    // Base64 encrypted format: "base64string..."
    z.string().min(1, 'Base64 palm embedding cannot be empty'),
    // Direct array format: [0, 1, 2, ...]
    z.array(z.number()).length(512, 'Palm embedding must contain exactly 512 values'),
    // Object format: {"embedding": [0, 1, 2, ...]}
    z.object({
        embedding: z.array(z.number()).length(512, 'Palm embedding must contain exactly 512 values')
    })
]);

export const registerSchema = z.object({
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    phone: z.string().min(1, 'Phone number is required'),
    password: z.string().min(1, 'Password is required'),
    plam_code: palmEmbeddingSchema.optional()
});

export const loginSchema = z.object({
    phone: z.string().min(1, 'Phone number is required'),
    password: z.string().min(1, 'Password is required')
});

export const verifyPalmSchema = z.object({
    plam_code: palmEmbeddingSchema
});

export const topUpSchema = z.object({
    amount: z.number().positive('Amount must be positive')
});
