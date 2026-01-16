import { Router } from 'express';
import { getProfile, verifyPalm, topUp } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authenticateWithPalm } from '../middleware/palm-auth.middleware';

const router = Router();

router.get('/profile', authenticate, getProfile);
router.post('/verify-palm', authenticate, verifyPalm);
router.post('/topup', authenticateWithPalm, topUp);

export default router;
