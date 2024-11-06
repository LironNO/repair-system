
import { Request, Response } from 'express';
import { User } from '../models/User';
import { NotificationService } from '../services/NotificationService';

export const getUsers = async (req: Request, res: Response) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'שגיאה בקבלת רשימת המשתמשים' });
    }
};

export const createUser = async (req: Request, res: Response) => {
    try {
        const userExists = await User.findOne({ username: req.body.username });
        if (userExists) {
            return res.status(400).json({ error: 'שם משתמש כבר קיים במערכת' });
        }

        const user = new User(req.body);
        await user.save();

        await NotificationService.getInstance().sendNotification({
            type: 'info',
            message: `משתמש חדש נוצר: ${user.name}`,
            targetUsers: ['admin']
        });

        res.status(201).json({
            id: user._id,
            username: user.username,
            name: user.name,
            role: user.role
        });
    } catch (error) {
        res.status(400).json({ error: 'שגיאה ביצירת משתמש חדש' });
    }
};

export const updateUser = async (req: Request, res: Response) => {
    try {
        const updates = req.body;
        if (updates.password === '') {
            delete updates.password;
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ error: 'משתמש לא נמצא' });
        }

        res.json(user);
    } catch (error) {
        res.status(400).json({ error: 'שגיאה בעדכון משתמש' });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ error: 'משתמש לא נמצא' });
        }

        if (user.role === 'admin' && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'אין הרשאה למחוק מנהל' });
        }

        await user.remove();
        res.json({ message: 'משתמש נמחק בהצלחה' });
    } catch (error) {
        res.status(500).json({ error: 'שגיאה במחיקת משתמש' });
    }
};
