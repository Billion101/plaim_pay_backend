import { Router } from 'express';
import { createOrder, getOrders } from '../controllers/order.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authenticateWithPalm } from '../middleware/palm-auth.middleware';

const router = Router();

router.post('/', authenticateWithPalm, createOrder);
router.get('/', authenticate, getOrders);

export default router;
