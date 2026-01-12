import express from 'express';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import User from '../models/User.js';
import Restaurant from '../models/Restaurant.js';
import { protect } from '../middleware/authMiddleware.js';
import Promo from '../models/Promo.js';
import { io } from '../server.js';
import { emitNewOrder } from '../socket.js';

const router = express.Router();

// Create Order (Checkout)
router.post('/', async (req, res) => {
    const { userId, restaurantId, items, totalAmount, deliveryAddress, paymentMethod, promoCode, discountAmount, instructions, idempotencyKey } = req.body;

    try {
        // Idempotency check - prevent duplicate orders
        // If same user placed an order to same restaurant in last 2 minutes with same total, reject
        const recentOrder = await Order.findOne({
            userId,
            restaurantId,
            totalAmount,
            createdAt: { $gte: new Date(Date.now() - 2 * 60 * 1000) } // Last 2 minutes
        });

        if (recentOrder) {
            return res.status(409).json({
                message: 'Duplicate order detected. Please wait before placing another order.',
                existingOrderId: recentOrder._id
            });
        }

        // 1. Create Order with simulated Fraud Check
        const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();

        // production Automated Risk Assessment
        let riskStatus = 'safe';
        let riskScore = Math.floor(Math.random() * 20); // Base variability
        if (totalAmount > 500) {
            riskScore = 85;
            riskStatus = 'high_risk';
        } // Flag high-value transactions for manual review

        const newOrder = new Order({
            userId,
            restaurantId,
            items,
            totalAmount,
            deliveryAddress,
            paymentMethod: paymentMethod || 'card',
            paymentStatus: 'paid', // Simulating successful payment
            status: 'confirmed',
            verificationCode,
            promoCode,
            discountAmount,
            instructions,
            transactionId: 'TXN_' + Math.random().toString(36).substr(2, 9).toUpperCase(),
            riskScore,
            riskStatus,
            paymentMetadata: {
                cardBrand: 'Visa',
                last4: '4242',
                gatewayResponse: 'APPROVED_BY_SIM_GATEWAY'
            }
        });

        const savedOrder = await newOrder.save();

        // 2. SOCKET: Notify Vendor about new order
        try {
            const restaurant = await Restaurant.findById(restaurantId);
            if (restaurant && restaurant.vendorId && io) {
                emitNewOrder(io, restaurant.vendorId.toString(), savedOrder._id.toString(), {
                    orderId: savedOrder._id,
                    totalAmount,
                    itemCount: items.length,
                    verificationCode
                });
                console.log(`📦 Socket: Notified vendor ${restaurant.vendorId} about new order`);
            }
        } catch (socketError) {
            console.error('Socket notification error:', socketError);
        }

        // 3. Update Promo count if used
        if (promoCode) {
            await Promo.findOneAndUpdate(
                { code: promoCode.toUpperCase() },
                { $inc: { usedCount: 1 } }
            );
        }

        // 4. Clear Cart
        await Cart.findOneAndDelete({ userId });

        // 5. Gamification: Update Streak & Grant Spin Credit
        try {
            const user = await User.findById(userId);
            if (user) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                let streakDays = user.streak?.currentDays || 0;
                const lastOrder = user.streak?.lastOrderDate ? new Date(user.streak.lastOrderDate) : null;

                if (lastOrder) {
                    lastOrder.setHours(0, 0, 0, 0);
                    const diffDays = Math.floor((today - lastOrder) / (1000 * 60 * 60 * 24));

                    if (diffDays === 1) {
                        // Consecutive day - increase streak
                        streakDays += 1;
                    } else if (diffDays > 1) {
                        // Streak broken - reset
                        streakDays = 1;
                    }
                    // Same day - no change to streak
                } else {
                    // First order
                    streakDays = 1;
                }

                // Update user with streak and spin credit
                user.streak = {
                    currentDays: streakDays,
                    maxStreak: Math.max(streakDays, user.streak?.maxStreak || 0),
                    lastOrderDate: new Date()
                };
                user.spinCredits = (user.spinCredits || 0) + 1; // 1 spin per order
                user.loyaltyPoints = (user.loyaltyPoints || 0) + Math.floor(totalAmount); // 1 point per dollar

                await user.save();
            }
        } catch (gamErr) {
            console.error('Gamification update error:', gamErr);
        }

        res.status(201).json(savedOrder);
    } catch (error) {
        console.error("Order Creation Error:", error);
        res.status(500).json({ message: 'Failed to create order' });
    }
});

// @desc    Get Neighborhood Trends (Trending Dishes)
// @route   GET /api/orders/trends
router.get('/trends', async (req, res) => {
    try {
        const trends = await Order.aggregate([
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.name",
                    count: { $sum: "$items.quantity" }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 3 }
        ]);

        // Map to a more user-friendly format
        const mockBuzz = [
            "Ordering nearby now",
            "Trending in your street",
            "Customer favorite today"
        ];

        const results = trends.map((t, i) => ({
            dish: t._id,
            count: t.count + Math.floor(Math.random() * 5), // Add slight variability for 'live' feel
            user: mockBuzz[i] || "Trending now"
        }));

        res.json(results);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch trends' });
    }
});

// Get User Orders
router.get('/user/:userId', protect, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.params.userId })
            .populate('restaurantId')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch orders' });
    }
});

// Get Single Order
router.get('/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('restaurantId');
        if (order) {
            res.json(order);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router;
