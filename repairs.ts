import express from 'express';
import { auth, adminOnly } from '../middleware/auth';
import { Repair } from '../models/Repair';
import { sendNotification } from '../utils/notifications';

const router = express.Router();

// קבלת כל התיקונים
router.get('/', auth, async (req, res) => {
    try {
        const repairs = await Repair.find()
            .populate('technician', 'name')
            .sort('-createdAt');
        res.send(repairs);
    } catch (error) {
        res.status(500).send({ error: 'שגיאה בקבלת התיקונים' });
    }
});

// הוספת תיקון חדש
router.post('/', auth, async (req, res) => {
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

        // שליחת התראה אם יש אחריות
        if (repair.hasWarranty) {
            sendNotification({
                type: 'warranty',
                message: `מחשב חדש באחריות: ${repair.serialNumber}`,
                recipients: ['logistics']
            });
        }

        await repair.save();
        res.status(201).send(repair);
    } catch (error) {
        res.status(400).send({ error: 'שגיאה ביצירת תיקון' });
    }
});

// עדכון סטטוס תיקון
router.patch('/:id/status', auth, async (req, res) => {
    try {
        const repair = await Repair.findById(req.params.id);
        if (!repair) {
            return res.status(404).send({ error: 'תיקון לא נמצא' });
        }

        repair.status = req.body.status;
        repair.history.push({
            action: 'status_update',
            user: req.user._id,
            details: `סטטוס עודכן ל-${req.body.status}`
        });

        if (req.body.status === 'completed') {
            sendNotification({
                type: 'repair_completed',
                message: `התיקון ${repair.serialNumber} הושלם`,
                recipients: [repair.customerPhone]
            });
        }

        await repair.save();
        res.send(repair);
    } catch (error) {
        res.status(400).send({ error: 'שגיאה בעדכון סטטוס' });
    }
});

// מחיקת תיקון (אדמין בלבד)
router.delete('/:id', [auth, adminOnly], async (req, res) => {
    try {
        const repair = await Repair.findByIdAndDelete(req.params.id);
        if (!repair) {
            return res.status(404).send({ error: 'תיקון לא נמצא' });
        }
        res.send(repair);
    } catch (error) {
        res.status(500).send({ error: 'שגיאה במחיקת תיקון' });
    }
});

// החזרת מחשב
router.post('/:id/return', auth, async (req, res) => {
    try {
        const repair = await Repair.findById(req.params.id);
        if (!repair) {
            return res.status(404).send({ error: 'תיקון לא נמצא' });
        }

        repair.status = 'returned';
        repair.returnDetails = {
            collectorName: req.body.collectorName,
            signature: req.body.signature,
            returnDate: new Date()
        };
        repair.history.push({
            action: 'returned',
            user: req.user._id,
            details: `המחשב הוחזר ל${req.body.collectorName}`
        });

        await repair.save();
        res.send(repair);
    } catch (error) {
        res.status(400).send({ error: 'שגיאה בהחזרת המחשב' });
    }
});

export default router;