import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';

export const getTopUpHistory = async (req: AuthRequest, res: Response) => {
    try {
        // Get all orders for the user
        const allOrders = await prisma.order.findMany({
            where: {
                user_id: req.userId
            },
            orderBy: { created_at: 'desc' },
            select: {
                id: true,
                amount: true,
                payment_method: true,
                payment_status: true,
                transaction_id: true,
                items: true,
                created_at: true,
                updated_at: true
            }
        });

        // Filter top-up orders in JavaScript
        const topUpOrders = allOrders.filter(order => {
            return order.items &&
                typeof order.items === 'object' &&
                (order.items as any).type === 'topup';
        });

        // Remove items field from response
        const transactions = topUpOrders.map(order => {
            const { items, ...rest } = order;
            return rest;
        });

        res.json({
            message: 'Top-up history retrieved successfully',
            total: transactions.length,
            transactions: transactions
        });
    } catch (error: any) {
        console.error('Get top-up history error:', error);
        res.status(500).json({ error: error.message });
    }
};

export const getOrderHistory = async (req: AuthRequest, res: Response) => {
    try {
        // Get all orders for the user
        const allOrders = await prisma.order.findMany({
            where: {
                user_id: req.userId
            },
            orderBy: { created_at: 'desc' },
            select: {
                id: true,
                amount: true,
                payment_method: true,
                payment_status: true,
                transaction_id: true,
                items: true,
                created_at: true,
                updated_at: true
            }
        });

        // Filter out top-up orders in JavaScript
        const orders = allOrders.filter(order => {
            if (!order.items) return true; // Include orders with no items
            if (typeof order.items === 'object' && (order.items as any).type === 'topup') {
                return false; // Exclude top-up orders
            }
            return true; // Include all other orders
        });

        res.json({
            message: 'Order history retrieved successfully',
            total: orders.length,
            transactions: orders
        });
    } catch (error: any) {
        console.error('Get order history error:', error);
        res.status(500).json({ error: error.message });
    }
};
