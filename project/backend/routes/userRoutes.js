import express from 'express';
import User from '../models/User.js';
import Restaurant from '../models/Restaurant.js';

const router = express.Router();

// Get User Profile
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Update User Profile
router.put('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            user.fullName = req.body.fullName || user.fullName;
            user.email = req.body.email || user.email;
            user.phone = req.body.phone || user.phone;
            user.avatar = req.body.avatar || user.avatar;

            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();
            res.json({
                _id: updatedUser._id,
                fullName: updatedUser.fullName,
                email: updatedUser.email,
                role: updatedUser.role,
                token: null // Should regenerate token if critical info changes
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get User Favorites (Restaurants)
router.get('/:id/favorites', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate('favorites');
        res.json(user.favorites);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Toggle Favorite
router.put('/:id/favorites/:restaurantId', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        const restaurantId = req.params.restaurantId;

        if (user.favorites.includes(restaurantId)) {
            user.favorites = user.favorites.filter(id => id.toString() !== restaurantId);
        } else {
            user.favorites.push(restaurantId);
        }

        await user.save();
        res.json(user.favorites);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get User Addresses
router.get('/:id/addresses', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        res.json(user.addresses);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Add Address
router.post('/:id/addresses', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        const newAddress = req.body;
        user.addresses.push(newAddress);
        await user.save();
        res.json(user.addresses);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get User Stats & Achievements
router.get('/:id/stats', async (req, res) => {
    try {
        const Order = (await import('../models/Order.js')).default;
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get order stats
        const orders = await Order.find({ userId: req.params.id, status: 'delivered' });
        const totalOrders = orders.length;
        const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);

        // Calculate most ordered category (simplified)
        const categoryCount = {};
        orders.forEach(order => {
            order.items.forEach(item => {
                const cat = item.menuItemId?.category || 'Other';
                categoryCount[cat] = (categoryCount[cat] || 0) + item.quantity;
            });
        });
        const favoriteCategory = Object.keys(categoryCount).sort((a, b) => categoryCount[b] - categoryCount[a])[0] || 'None';

        res.json({
            totalOrders,
            totalSpent: totalSpent.toFixed(2),
            loyaltyPoints: user.loyaltyPoints || 0,
            walletBalance: user.walletBalance || 0,
            achievements: user.achievements || [],
            favoriteCategory,
            memberSince: user.createdAt
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Unlock Achievement (internal helper, can be called from order creation)
router.post('/:id/achievements', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { title, icon } = req.body;

        // Check if already unlocked
        const exists = user.achievements.some(a => a.title === title);
        if (exists) {
            return res.status(200).json({ message: 'Achievement already unlocked', achievements: user.achievements });
        }

        user.achievements.push({ title, icon, unlockedAt: new Date() });
        await user.save();

        res.json({ message: 'Achievement unlocked!', achievements: user.achievements });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router;
