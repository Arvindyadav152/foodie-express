import express from 'express';
import User from '../models/User.js';
import SpinPrize from '../models/SpinPrize.js';
import UserPrize from '../models/UserPrize.js';
import Order from '../models/Order.js';

const router = express.Router();

// @desc    Spin the wheel
// @route   POST /api/gamification/spin
router.post('/spin', async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.spinCredits <= 0) {
            return res.status(400).json({ message: 'No spin credits available. Order more to earn spins!' });
        }

        // Get all active prizes
        const prizes = await SpinPrize.find({ isActive: true });
        if (prizes.length === 0) {
            return res.status(400).json({ message: 'No prizes available' });
        }

        // Weighted random selection
        const totalWeight = prizes.reduce((sum, p) => sum + p.probability, 0);
        let random = Math.random() * totalWeight;
        let selectedPrize = prizes[0];

        for (const prize of prizes) {
            random -= prize.probability;
            if (random <= 0) {
                selectedPrize = prize;
                break;
            }
        }

        // Deduct spin credit
        user.spinCredits -= 1;
        await user.save();

        // Create user prize (valid for X days)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + selectedPrize.validityDays);

        const userPrize = new UserPrize({
            userId,
            prizeId: selectedPrize._id,
            prizeName: selectedPrize.name,
            prizeType: selectedPrize.type,
            prizeValue: selectedPrize.value,
            expiresAt
        });
        await userPrize.save();

        res.json({
            prize: selectedPrize,
            userPrize,
            remainingSpins: user.spinCredits
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get user's streak info
// @route   GET /api/gamification/streak/:userId
router.get('/streak/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const streak = user.streak || { currentDays: 0, maxStreak: 0, lastOrderDate: null };

        // Check if streak is still valid (ordered yesterday or today)
        if (streak.lastOrderDate) {
            const lastOrder = new Date(streak.lastOrderDate);
            const today = new Date();
            const diffDays = Math.floor((today - lastOrder) / (1000 * 60 * 60 * 24));

            if (diffDays > 1) {
                // Streak broken
                streak.currentDays = 0;
            }
        }

        // Streak rewards logic
        let reward = null;
        if (streak.currentDays >= 7) {
            reward = { type: 'free_delivery', message: '7-Day Streak! Free delivery on next order!' };
        } else if (streak.currentDays >= 5) {
            reward = { type: 'discount', message: '5-Day Streak! 10% off on next order!' };
        } else if (streak.currentDays >= 3) {
            reward = { type: 'points', message: '3-Day Streak! +50 bonus points!' };
        }

        res.json({
            currentDays: streak.currentDays,
            maxStreak: streak.maxStreak,
            lastOrderDate: streak.lastOrderDate,
            reward,
            spinCredits: user.spinCredits || 0
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get leaderboard (top orderers)
// @route   GET /api/gamification/leaderboard
router.get('/leaderboard', async (req, res) => {
    try {
        const { city = '', limit = 10 } = req.query;

        // Aggregate orders by user
        const leaderboard = await Order.aggregate([
            { $match: { status: 'delivered' } },
            {
                $group: {
                    _id: '$userId',
                    orderCount: { $sum: 1 },
                    totalSpent: { $sum: '$totalAmount' }
                }
            },
            { $sort: { orderCount: -1 } },
            { $limit: parseInt(limit) },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },
            {
                $project: {
                    _id: 1,
                    orderCount: 1,
                    totalSpent: 1,
                    fullName: '$user.fullName',
                    avatar: '$user.avatar',
                    loyaltyPoints: '$user.loyaltyPoints'
                }
            }
        ]);

        res.json(leaderboard);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get user's prizes
// @route   GET /api/gamification/prizes/:userId
router.get('/prizes/:userId', async (req, res) => {
    try {
        const prizes = await UserPrize.find({
            userId: req.params.userId,
            isUsed: false,
            expiresAt: { $gt: new Date() }
        }).sort({ createdAt: -1 });

        res.json(prizes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get spin prizes configuration (Admin)
// @route   GET /api/gamification/spin-prizes
router.get('/spin-prizes', async (req, res) => {
    try {
        const prizes = await SpinPrize.find().sort({ probability: -1 });
        res.json(prizes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Create spin prize (Admin)
// @route   POST /api/gamification/spin-prizes
router.post('/spin-prizes', async (req, res) => {
    try {
        const prize = new SpinPrize(req.body);
        await prize.save();
        res.status(201).json(prize);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

export default router;
