import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';
import { verifyPalmSchema, topUpSchema } from '../validators/user.validator';
import { isPalmMatch, normalizePalmEmbedding } from '../services/palm-embedding.service';

export const getProfile = async (req: AuthRequest, res: Response) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            select: {
                id: true,
                first_name: true,
                last_name: true,
                phone: true,
                plam_code: true,
                amount: true,
                vertify_plam: true,
                created_at: true,
                updated_at: true
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const verifyPalm = async (req: AuthRequest, res: Response) => {
    try {
        const validatedData = verifyPalmSchema.parse(req.body);

        // Normalize the palm embedding (handles base64, array, or object format)
        const normalizedPalm = normalizePalmEmbedding(validatedData.plam_code);

        // Check if palm embedding already exists
        const usersWithPalm = await prisma.user.findMany({
            where: {
                plam_code: { not: null },
                vertify_plam: true,
                id: { not: req.userId } // Exclude current user
            },
            select: {
                id: true,
                plam_code: true
            }
        });

        // Check for duplicate palm embeddings
        for (const user of usersWithPalm) {
            if (user.plam_code && Array.isArray(user.plam_code)) {
                const storedEmbedding = user.plam_code as number[];

                if (isPalmMatch(normalizedPalm, storedEmbedding)) {
                    return res.status(400).json({ error: 'Palm already registered' });
                }
            }
        }

        const user = await prisma.user.update({
            where: { id: req.userId },
            data: {
                plam_code: normalizedPalm as any,
                vertify_plam: true
            },
            select: {
                id: true,
                first_name: true,
                last_name: true,
                phone: true,
                plam_code: true,
                amount: true,
                vertify_plam: true
            }
        });

        res.json({ message: 'Palm verified successfully', user });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const topUp = async (req: AuthRequest, res: Response) => {
    try {
        const validatedData = topUpSchema.parse(req.body);

        const user = await prisma.user.findUnique({
            where: { id: req.userId }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Create PhajayPay payment link first
        const { createPhajayPayment } = await import('../services/phajay.service');

        // Generate a temporary order ID for the payment
        const tempOrderId = `topup_${Date.now()}_${req.userId}`;

        const paymentResponse = await createPhajayPayment({
            orderId: tempOrderId,
            amount: Number(validatedData.amount),
            customerPhone: user.phone,
            customerName: `${user.first_name} ${user.last_name}`,
            description: `Top up balance - ${validatedData.amount} LAK`
        });

        // Create order record with payment info
        const topUpOrder = await prisma.order.create({
            data: {
                user_id: req.userId!,
                amount: validatedData.amount,
                payment_method: 'phajay',
                payment_status: 'completed',
                transaction_id: paymentResponse.transactionId || tempOrderId,
                items: { type: 'topup' }
            }
        });

        // Immediately add amount to user balance
        const updatedUser = await prisma.user.update({
            where: { id: req.userId },
            data: {
                amount: {
                    increment: validatedData.amount
                }
            },
            select: {
                id: true,
                first_name: true,
                last_name: true,
                phone: true,
                amount: true
            }
        });

        res.json({
            message: 'Top up successful - balance updated',
            user: updatedUser,
            order: topUpOrder,
            payment: {
                paymentUrl: paymentResponse.paymentUrl,
                qrCode: paymentResponse.qrCode
            }
        });
    } catch (error: any) {
        console.error('Top up error:', error);
        res.status(400).json({ error: error.message });
    }
};
