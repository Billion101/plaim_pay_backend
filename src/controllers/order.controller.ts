import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';
import { createOrderSchema } from '../validators/order.validator';
import { createPhajayPayment } from '../services/phajay.service';

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

        // Create PhajayPay payment link
        const tempOrderId = `order_${Date.now()}_${req.userId}`;
        const paymentResponse = await createPhajayPayment({
            orderId: tempOrderId,
            amount: validatedData.amount,
            customerPhone: user.phone,
            customerName: `${user.first_name} ${user.last_name}`,
            description: validatedData.description || 'Order payment'
        });

        // Create order with completed status
        const order = await prisma.order.create({
            data: {
                user_id: req.userId!,
                amount: validatedData.amount,
                payment_method: 'phajay',
                payment_status: 'completed',
                transaction_id: paymentResponse.transactionId || tempOrderId,
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
            user: updatedUser,
            payment: {
                paymentUrl: paymentResponse.paymentUrl,
                qrCode: paymentResponse.qrCode
            }
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
