
import express from 'express';
import { auth } from '../middleware/auth.js';
import WarrantyService from '../services/WarrantyService.js';

const router = express.Router();

// Check warranty status
router.get('/check/:serialNumber', auth, async (req, res) => {
    try {
        const status = await WarrantyService.checkWarrantyStatus(req.params.serialNumber);
        res.json(status);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create warranty claim
router.post('/claim/:repairId', auth, async (req, res) => {
    try {
        const claim = await WarrantyService.processWarrantyClaim(req.params.repairId);
        res.json(claim);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Check claim status
router.get('/claim/:claimId', auth, async (req, res) => {
    try {
        const status = await WarrantyService.checkWarrantyClaimStatus(req.params.claimId);
        res.json(status);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get warranty statistics
router.get('/stats', auth, async (req, res) => {
    try {
        const stats = await WarrantyService.getWarrantyStats();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
