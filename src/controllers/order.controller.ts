import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';
import { createOrderSchema } from '../validators/order.validator';

export const createOrder = async (req: AuthRequest, res: Response) => {
    try {
        const validatedData = createOrderSchema.parse(req.body);

        const user = await prisma.user.findUnique({
            where: { id: req.userId }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if user has sufficient balance
        if (Number(user.amount) < validatedData.amount) {
            return res.status(400).json({
                error: 'Insufficient balance',
                currentBalance: Number(user.amount),
                requiredAmount: validatedData.amount
            });
        }

        // Create order with completed status (no payment link needed)
        const transactionId = `order_${Date.now()}_${req.userId}`;
        const order = await prisma.order.create({
            data: {
                user_id: req.userId!,
                amount: validatedData.amount,
                payment_method: 'balance',
                payment_status: 'completed',
                transaction_id: transactionId,
                items: validatedData.items || null
            }
        });

        // Deduct amount from user balance immediately
        const updatedUser = await prisma.user.update({
            where: { id: req.userId },
            data: {
                amount: {
                    decrement: validatedData.amount
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

        res.status(201).json({
            message: 'Order created successfully - balance deducted',
            order: order,
            user: updatedUser
        });
    } catch (error: any) {
        console.error('Create order error:', error);
        res.status(400).json({ error: error.message });
    }
};

export const getOrders = async (req: AuthRequest, res: Response) => {
    try {
        const orders = await prisma.order.findMany({
            where: { user_id: req.userId },
            orderBy: { created_at: 'desc' }
        });

        res.json(orders);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
