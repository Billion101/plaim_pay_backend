import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';

export interface AuthRequest extends Request {
    userId?: string;
}

export const authenticateWithPalm = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        // Check for Bearer token first
        const token = req.headers.authorization?.split(' ')[1];

        if (token) {
            // Authenticate with JWT token
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
                req.userId = decoded.userId;
                return next();
            } catch (error) {
                // Token invalid, continue to check palm code
            }
        }

        // Check for palm code in header only
        const palmCode = req.headers['x-palm-code'] as string;

        if (palmCode) {
            // Authenticate with palm code
            const user = await prisma.user.findUnique({
                where: { plam_code: palmCode }
            });

            if (!user) {
                return res.status(401).json({ error: 'Invalid palm code' });
            }

            if (!user.vertify_plam) {
                return res.status(401).json({ error: 'Palm not verified' });
            }

            req.userId = user.id;
            return next();
        }

        // No authentication method provided
        return res.status(401).json({
            error: 'Authentication required',
            message: 'Provide either Bearer token or x-palm-code header'
        });
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(401).json({ error: 'Authentication failed' });
    }
};
