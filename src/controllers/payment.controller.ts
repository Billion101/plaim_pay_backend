import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';
import { checkPaymentStatus } from '../services/phajay.service';

export const checkOrderPaymentStatus = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const order = await prisma.order.findFirst({
            where: {
                id,
                user_id: req.userId
            }
        });

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        if (!order.transaction_id) {
            return res.status(400).json({ error: 'No transaction ID found' });
        }

        const paymentStatus = await checkPaymentStatus(order.transaction_id);

        let status = 'pending';
        if (paymentStatus.status === 'SUCCESS' || paymentStatus.status === 'COMPLETED') {
            status = 'completed';

            await prisma.order.update({
                where: { id: order.id },
                data: { payment_status: 'completed' }
            });

            await prisma.user.update({
                where: { id: req.userId },
                data: {
                    amount: {
                        decrement: Number(order.amount)
                    }
                }
            });
        } else if (paymentStatus.status === 'FAILED' || paymentStatus.status === 'CANCELLED') {
            status = 'failed';

            await prisma.order.update({
                where: { id: order.id },
                data: { payment_status: 'failed' }
            });
        }

        res.json({
            orderId: order.id,
            paymentStatus: status,
            transactionId: order.transaction_id,
            amount: order.amount
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
