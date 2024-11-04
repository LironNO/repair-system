import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

interface AuthRequest extends Request {
    user?: any;
}

export const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            throw new Error();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        const user = await User.findOne({ _id: decoded.id });

        if (!user) {
            throw new Error();
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).send({ error: 'אנא התחבר למערכת' });
    }
};

export const adminOnly = async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user.role !== 'admin') {
        return res.status(403).send({ error: 'גישה למנהלים בלבד' });
    }
    next();
};