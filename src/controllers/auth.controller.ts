import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { registerSchema, loginSchema } from '../validators/user.validator';

export const register = async (req: Request, res: Response) => {
    try {
        const validatedData = registerSchema.parse(req.body);

        const existingUser = await prisma.user.findUnique({
            where: { phone: validatedData.phone }
        });

        if (existingUser) {
            return res.status(400).json({ error: 'Phone number already registered' });
        }

        const hashedPassword = await bcrypt.hash(validatedData.password, 10);

        const user = await prisma.user.create({
            data: {
                ...validatedData,
                password: hashedPassword,
                vertify_plam: !!validatedData.plam_code
            },
            select: {
                id: true,
                first_name: true,
                last_name: true,
                phone: true,
                plam_code: true,
                amount: true,
                vertify_plam: true,
                created_at: true
            }
        });

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '7d' });

        res.status(201).json({ user, token });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const validatedData = loginSchema.parse(req.body);

        const user = await prisma.user.findUnique({
            where: { phone: validatedData.phone }
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isPasswordValid = await bcrypt.compare(validatedData.password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '7d' });

        const { password, ...userWithoutPassword } = user;

        res.json({ user: userWithoutPassword, token });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};
