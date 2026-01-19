import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { validatePalmEmbedding, isPalmMatch, normalizePalmEmbedding } from '../services/palm-embedding.service';

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

        // Check for palm embedding in header
        const palmEmbeddingHeader = req.headers['x-palm-code'] as string;

        if (palmEmbeddingHeader) {
            try {
                // Parse the palm embedding from header (could be base64 string or JSON)
                let palmEmbedding;
                try {
                    palmEmbedding = JSON.parse(palmEmbeddingHeader);
                } catch {
                    // If JSON parse fails, treat as base64 string
                    palmEmbedding = palmEmbeddingHeader;
                }

                if (!validatePalmEmbedding(palmEmbedding)) {
                    return res.status(401).json({ error: 'Invalid palm embedding format' });
                }

                // Normalize the palm embedding to standard format
                const normalizedPalm = normalizePalmEmbedding(palmEmbedding);

                // Find all users with verified palm codes for comparison
                const usersWithPalm = await prisma.user.findMany({
                    where: {
                        plam_code: { not: null },
                        vertify_plam: true
                    },
                    select: {
                        id: true,
                        plam_code: true
                    }
                });

                // Compare with each stored palm embedding
                for (const user of usersWithPalm) {
                    if (user.plam_code && Array.isArray(user.plam_code)) {
                        const storedEmbedding = user.plam_code as number[];

                        if (isPalmMatch(normalizedPalm, storedEmbedding)) {
                            req.userId = user.id;
                            return next();
                        }
                    }
                }

                return res.status(401).json({ error: 'Palm not recognized' });
            } catch (error) {
                console.error('Palm authentication error:', error);
                return res.status(401).json({ error: 'Invalid palm embedding data' });
            }
        }

        // No authentication method provided
        return res.status(401).json({
            error: 'Authentication required',
            message: 'Provide either Bearer token or x-palm-code header with palm embedding'
        });
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(401).json({ error: 'Authentication failed' });
    }
};
