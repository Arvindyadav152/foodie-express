import express from 'express';
import FlashDeal from '../models/FlashDeal.js';

const router = express.Router();

// @desc    Get active/live flash deals
// @route   GET /api/flash-deals/active
router.get('/active', async (req, res) => {
    try {
        const now = new Date();
        const deals = await FlashDeal.find({
            isActive: true,
            startTime: { $lte: now },
            endTime: { $gte: now }
        }).populate('restaurantId', 'name image').sort({ endTime: 1 });

        res.json(deals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get all flash deals (Admin)
// @route   GET /api/flash-deals
router.get('/', async (req, res) => {
    try {
        const deals = await FlashDeal.find()
            .populate('restaurantId', 'name')
            .sort({ createdAt: -1 });
        res.json(deals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Create flash deal (Admin)
// @route   POST /api/flash-deals
router.post('/', async (req, res) => {
    try {
        const deal = new FlashDeal(req.body);
        await deal.save();
        res.status(201).json(deal);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @desc    Update flash deal (Admin)
// @route   PUT /api/flash-deals/:id
router.put('/:id', async (req, res) => {
    try {
        const deal = await FlashDeal.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!deal) {
            return res.status(404).json({ message: 'Flash deal not found' });
        }
        res.json(deal);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @desc    Delete flash deal (Admin)
// @route   DELETE /api/flash-deals/:id
router.delete('/:id', async (req, res) => {
    try {
        const deal = await FlashDeal.findByIdAndDelete(req.params.id);
        if (!deal) {
            return res.status(404).json({ message: 'Flash deal not found' });
        }
        res.json({ message: 'Flash deal deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
