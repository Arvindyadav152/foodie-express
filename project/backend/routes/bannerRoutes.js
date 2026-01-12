import express from 'express';
import Banner from '../models/Banner.js';

const router = express.Router();

// Public: Get active banners for home screen
router.get('/', async (req, res) => {
    try {
        const banners = await Banner.find({ isActive: true }).sort({ priority: -1 });
        res.json(banners);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Admin: Create a new banner
router.post('/', async (req, res) => {
    try {
        const banner = new Banner(req.body);
        await banner.save();
        res.status(201).json(banner);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Admin: Update a banner
router.put('/:id', async (req, res) => {
    try {
        const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(banner);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Admin: Delete a banner
router.delete('/:id', async (req, res) => {
    try {
        await Banner.findByIdAndDelete(req.params.id);
        res.json({ message: 'Banner deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
