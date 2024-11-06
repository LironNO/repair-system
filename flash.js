
import express from 'express';
import { auth } from '../middleware/auth.js';
import FlashTask from '../models/FlashTask.js';
import NotificationService from '../services/NotificationService.js';

const router = express.Router();
const notificationService = NotificationService.getInstance();

// Get all flash tasks
router.get('/', auth, async (req, res) => {
    try {
        const tasks = await FlashTask.find()
            .populate('assignedTo', 'name')
            .populate('createdBy', 'name')
            .sort('-createdAt');
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching flash tasks' });
    }
});

// Create new flash task
router.post('/', auth, async (req, res) => {
    try {
        const task = new FlashTask({
            ...req.body,
            createdBy: req.user._id
        });

        await task.save();

        // Send notification
        notificationService.sendNotification(
            'flash',
            `משימת פלאש חדשה: ${task.title}`,
            task.assignedTo ? [task.assignedTo] : null
        );

        res.status(201).json(task);
    } catch (error) {
        res.status(400).json({ error: 'Error creating flash task' });
    }
});

// Update flash task
router.patch('/:id', auth, async (req, res) => {
    try {
        const task = await FlashTask.findByIdAndUpdate(
            req.params.id,
            { ...req.body },
            { new: true }
        ).populate('assignedTo', 'name');

        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        if (req.body.status === 'completed') {
            notificationService.sendNotification(
                'success',
                `משימת פלאש הושלמה: ${task.title}`,
                [task.createdBy]
            );
        }

        res.json(task);
    } catch (error) {
        res.status(400).json({ error: 'Error updating flash task' });
    }
});

// Delete flash task
router.delete('/:id', auth, async (req, res) => {
    try {
        const task = await FlashTask.findByIdAndDelete(req.params.id);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting flash task' });
    }
});

export default router;
