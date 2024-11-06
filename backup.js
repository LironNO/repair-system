
import express from 'express';
import { auth, adminOnly } from '../middleware/auth.js';
import BackupService from '../services/BackupService.js';

const router = express.Router();

// כל הנתיבים דורשים הרשאת מנהל
router.use(auth, adminOnly);

// יצירת גיבוי חדש
router.post('/create', async (req, res) => {
    try {
        const backupPath = await BackupService.createBackup();
        res.json({ message: 'גיבוי נוצר בהצלחה', path: backupPath });
    } catch (error) {
        res.status(500).json({ error: 'שגיאה ביצירת גיבוי' });
    }
});

// שחזור מגיבוי
router.post('/restore/:filename', async (req, res) => {
    try {
        await BackupService.restoreBackup(req.params.filename);
        res.json({ message: 'מסד הנתונים שוחזר בהצלחה' });
    } catch (error) {
        res.status(500).json({ error: 'שגיאה בשחזור הגיבוי' });
    }
});

// קבלת רשימת גיבויים
router.get('/list', async (req, res) => {
    try {
        const backups = await BackupService.getBackupsList();
        res.json(backups);
    } catch (error) {
        res.status(500).json({ error: 'שגיאה בקבלת רשימת הגיבויים' });
    }
});

export default router;
