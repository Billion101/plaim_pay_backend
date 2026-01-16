import { Router } from 'express';
import { checkOrderPaymentStatus } from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/status/:id', authenticate, checkOrderPaymentStatus);

export default router;
