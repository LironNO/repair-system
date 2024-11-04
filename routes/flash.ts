import express from 'express';
import { auth } from '../middleware/auth';
import { FlashTask } from '../models/FlashTask';

const router = express.Router();

// קבלת כל משימות הפלאש
router.get('/', auth, async (req, res) => {
    try {
        const tasks = await FlashTask.find()
            .populate('responsible', 'name')
            .sort('-date');
        res.send(tasks);
    } catch (error) {
        res.status(500).send({ error: 'שגיאה בקבלת משימות' });
    }
});

// הוספת משימת פלאש חדשה
router.post('/', auth, async (req, res) => {
    try {
        const task = new FlashTask({
            ...req.body,
            createdBy: req.user._id,
            status: 'pending'
        });
        await task.save();
        res.status(201).send(task);
    } catch (error) {
        res.status(400).send({ error: 'שגיאה ביצירת משימה' });
    }
});

// עדכון סטטוס משימה
router.patch('/:id', auth, async (req, res) => {
    try {
        const task = await FlashTask.findByIdAndUpdate(
            req.params.id,
            { ...req.body },
            { new: true }
        );
        if (!task) {
            return res.status(404).send({ error: 'משימה לא נמצאה' });
        }
        res.send(task);
    } catch (error) {
        res.status(400).send({ error: 'שגיאה בעדכון משימה' });
    }
});

export default router;