import { Router } from 'express';
import { getTopUpHistory, getOrderHistory } from '../controllers/transaction.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/topup-history', authenticate, getTopUpHistory);
router.get('/order-history', authenticate, getOrderHistory);

export default router;
