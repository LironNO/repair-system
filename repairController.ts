
import { Request, Response } from 'express';
import { Repair } from '../models/Repair';
import { NotificationService } from '../services/NotificationService';

export const createRepair = async (req: Request, res: Response) => {
    try {
        const repair = new Repair({
            ...req.body,
            technician: req.user._id,
            history: [{
                action: 'created',
                user: req.user._id,
                details: 'תיקון חדש נפתח'
            }]
        });

        await repair.save();

        if (repair.hasWarranty) {
            await NotificationService.getInstance().sendNotification({
                type: 'warranty',
                message: `מחשב חדש באחריות: ${repair.serialNumber}`,
                targetUsers: ['logistics']
            });
        }

        res.status(201).json(repair);
    } catch (error) {
        console.error('Create repair error:', error);
        res.status(400).json({ error: 'שגיאה ביצירת תיקון חדש' });
    }
};

export const getRepairs = async (req: Request, res: Response) => {
    try {
        const repairs = await Repair.find()
            .populate('technician', 'name')
            .populate('history.user', 'name')
            .sort('-createdAt');
        res.json(repairs);
    } catch (error) {
        res.status(500).json({ error: 'שגיאה בקבלת רשימת התיקונים' });
    }
};

export const updateRepairStatus = async (req: Request, res: Response) => {
    try {
        const { status } = req.body;
        const repair = await Repair.findById(req.params.id);

        if (!repair) {
            return res.status(404).json({ error: 'תיקון לא נמצא' });
        }

        repair.status = status;
        repair.history.push({
            action: 'status_update',
            user: req.user._id,
            details: `סטטוס עודכן ל-${status}`,
            date: new Date()
        });

        if (status === 'completed') {
            await NotificationService.getInstance().sendNotification({
                type: 'success',
                message: `תיקון ${repair.serialNumber} הושלם`,
                targetUsers: [repair.technician]
            });
        }

        await repair.save();
        res.json(repair);
    } catch (error) {
        res.status(400).json({ error: 'שגיאה בעדכון סטטוס' });
    }
};

export const returnComputer = async (req: Request, res: Response) => {
    try {
        const { collectorName, signature } = req.body;
        const repair = await Repair.findById(req.params.id);

        if (!repair) {
            return res.status(404).json({ error: 'תיקון לא נמצא' });
        }

        repair.status = 'returned';
        repair.returnDetails = {
            collectorName,
            signature,
            returnDate: new Date()
        };

        repair.history.push({
            action: 'returned',
            user: req.user._id,
            details: `מחשב הוחזר ל-${collectorName}`,
            date: new Date()
        });

        await repair.save();
        res.json(repair);
    } catch (error) {
        res.status(400).json({ error: 'שגיאה בהחזרת המחשב' });
    }
};

export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const activeRepairs = await Repair.countDocuments({ status: { $ne: 'returned' } });
        const completedThisMonth = await Repair.countDocuments({
            status: 'completed',
            'returnDetails.returnDate': {
                $gte: new Date(new Date().setDate(1))
            }
        });
        const warrantyRepairs = await Repair.countDocuments({ hasWarranty: true, status: 'pending' });

        res.json({
            activeRepairs,
            completedThisMonth,
            warrantyRepairs
        });
    } catch (error) {
        res.status(500).json({ error: 'שגיאה בקבלת נתוני לוח הבקרה' });
    }
};
