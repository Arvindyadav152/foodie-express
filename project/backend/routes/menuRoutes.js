import express from 'express';
import MenuItem from '../models/MenuItem.js';

const router = express.Router();

// Get Menu for a Restaurant
router.get('/:restaurantId', async (req, res) => {
    try {
        const items = await MenuItem.find({ restaurantId: req.params.restaurantId, isAvailable: true });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Add Menu Item (Protected in real app, simplified here for seeding)
router.post('/', async (req, res) => {
    try {
        const item = new MenuItem(req.body);
        await item.save();
        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
});

// Update Menu Item
router.put('/:id', async (req, res) => {
    try {
        const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Delete Menu Item
router.delete('/:id', async (req, res) => {
    try {
        await MenuItem.findByIdAndDelete(req.params.id);
        res.json({ message: 'Item deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router;
