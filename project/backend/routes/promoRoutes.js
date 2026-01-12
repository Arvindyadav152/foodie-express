import express from 'express';
import Promo from '../models/Promo.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Get All Promos (Admin)
router.get('/', async (req, res) => {
    try {
        const promos = await Promo.find().sort({ createdAt: -1 });
        res.json(promos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Create a Promo (Admin)
router.post('/', async (req, res) => {
    try {
        const promo = new Promo(req.body);
        await promo.save();
        res.status(201).json(promo);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @desc    Validate a Promo Code
router.get('/validate/:code', protect, async (req, res) => {
    try {
        const promo = await Promo.findOne({
            code: req.params.code.toUpperCase(),
            isActive: true,
            expiryDate: { $gt: new Date() }
        });

        if (!promo) {
            return res.status(404).json({ message: 'Invalid or expired promo code' });
        }

        // Check usage limit
        if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
            return res.status(400).json({ message: 'Promo code usage limit reached' });
        }

        res.json(promo);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router;
