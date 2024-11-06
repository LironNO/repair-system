
import express from 'express';
import { auth } from '../middleware/auth.js';
import Repair from '../models/Repair.js';

const router = express.Router();

// Get all repairs
router.get('/', auth, async (req, res) => {
    try {
        const repairs = await Repair.find()
            .populate('technician', 'name')
            .sort('-createdAt');
        res.json(repairs);
    } catch (error) {
        res.status(500).json({ error: 'שגיאה בקבלת רשימת התיקונים' });
    }
});

// Add new repair
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

        await repair.save();
        res.status(201).json(repair);
    } catch (error) {
        res.status(400).json({ error: 'שגיאה ביצירת תיקון חדש' });
    }
});

// Update repair status
router.patch('/:id/status', auth, async (req, res) => {
    try {
        const repair = await Repair.findById(req.params.id);
        if (!repair) {
            return res.status(404).json({ error: 'תיקון לא נמצא' });
        }

        repair.status = req.body.status;
        repair.history.push({
            action: 'status_update',
            user: req.user._id,
            details: `סטטוס עודכן ל-${req.body.status}`
        });

        await repair.save();
        res.json(repair);
    } catch (error) {
        res.status(400).json({ error: 'שגיאה בעדכון סטטוס' });
    }
});

export default router;
