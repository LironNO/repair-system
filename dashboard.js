
import express from 'express';
import { auth } from '../middleware/auth.js';
import StatsService from '../services/StatsService.js';

const router = express.Router();

// קבלת כל הסטטיסטיקות
router.get('/stats', auth, async (req, res) => {
    try {
        const stats = await StatsService.getDashboardStats();
        res.json(stats);
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Error fetching dashboard stats' });
    }
});

// סטטיסטיקות טכנאי ספציפי
router.get('/technician/:id', auth, async (req, res) => {
    try {
        const techStats = await StatsService.getTechnicianDetailedStats(req.params.id);
        res.json(techStats);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching technician stats' });
    }
});

// סטטיסטיקות חודשיות
router.get('/monthly', auth, async (req, res) => {
    try {
        const monthlyStats = await StatsService.getMonthlyStats();
        res.json(monthlyStats);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching monthly stats' });
    }
});

// יצוא דוח סטטיסטי
router.get('/export', auth, async (req, res) => {
    try {
        const stats = await StatsService.generateStatisticalReport();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: 'Error generating statistical report' });
    }
});

export default router;
