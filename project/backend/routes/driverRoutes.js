import express from 'express';
import Order from '../models/Order.js';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { io } from '../server.js';
import { emitOrderAssigned } from '../socket.js';

const router = express.Router();

// Get Available Orders (Ready for pickup, no driver yet)
router.get('/available', protect, authorize('driver'), async (req, res) => {
    try {
        const orders = await Order.find({
            status: { $in: ['confirmed', 'preparing'] },
            driverId: { $exists: false } // No driver assigned yet
        })
            .populate('restaurantId')
            .populate('userId', 'fullName phone')
            .populate('deliveryAddress')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Driver Accepts Order (Atomic operation to prevent race conditions)
router.put('/accept/:orderId', protect, authorize('driver'), async (req, res) => {
    try {
        const { driverId } = req.body;

        if (!driverId) {
            return res.status(400).json({ message: 'Driver ID is required' });
        }

        // Atomic update - only succeeds if no driver is assigned yet
        const order = await Order.findOneAndUpdate(
            {
                _id: req.params.orderId,
                driverId: { $exists: false } // Only if not already assigned
            },
            {
                $set: {
                    driverId: driverId,
                    status: 'preparing',
                    acceptedAt: new Date()
                }
            },
            { new: true }
        )
            .populate('restaurantId')
            .populate('userId', 'fullName phone');

        if (!order) {
            // Check if order exists but was already assigned
            const existingOrder = await Order.findById(req.params.orderId);
            if (!existingOrder) {
                return res.status(404).json({ message: 'Order not found' });
            }
            if (existingOrder.driverId) {
                return res.status(409).json({ message: 'Order already assigned to another driver' });
            }
            return res.status(400).json({ message: 'Unable to accept order' });
        }

        // Get driver info for notification
        const driver = await User.findById(driverId);

        // Socket: Notify customer that driver has been assigned
        if (io) {
            io.to(`order:${order._id}`).emit('driver:assigned', {
                orderId: order._id,
                driverId,
                driverName: driver?.fullName || 'Delivery Partner',
                driverPhone: driver?.phone,
                message: 'Delivery partner assigned to your order!'
            });
            io.to('admin').emit('driver:assigned', { orderId: order._id, driverId });
            console.log(`✅ Socket: Notified customer about driver assignment for order ${order._id}`);
        }

        res.json(order);
    } catch (error) {
        console.error('Accept order error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Driver Rejects Order
router.put('/reject/:orderId', protect, authorize('driver'), async (req, res) => {
    try {
        const { driverId, reason } = req.body;
        const order = await Order.findById(req.params.orderId);

        if (!order) return res.status(404).json({ message: 'Order not found' });

        // If this driver was assigned, remove them
        if (order.driverId?.toString() === driverId) {
            order.driverId = undefined;
            order.status = 'confirmed'; // Reset to confirmed for reassignment
        }

        // Track rejected drivers to avoid reassigning
        if (!order.rejectedDrivers) order.rejectedDrivers = [];
        order.rejectedDrivers.push({ driverId, reason, rejectedAt: new Date() });

        await order.save();

        // TODO: Emit socket event to find new driver
        res.json({ message: 'Order rejected and available for reassignment', order });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Driver confirms pickup (changes status from preparing to out_for_delivery)
router.put('/pickup/:orderId', protect, authorize('driver'), async (req, res) => {
    try {
        const { driverId } = req.body;
        const order = await Order.findById(req.params.orderId);

        if (!order) return res.status(404).json({ message: 'Order not found' });
        if (order.driverId?.toString() !== driverId) {
            return res.status(403).json({ message: 'Not authorized for this order' });
        }

        order.status = 'out_for_delivery';
        order.pickedUpAt = new Date();
        await order.save();

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Driver's Active/History Orders
router.get('/my-orders/:driverId', protect, authorize('driver'), async (req, res) => {
    try {
        const orders = await Order.find({ driverId: req.params.driverId })
            .populate('restaurantId')
            .populate('deliveryAddress')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Update Delivery Status (Delivered)
router.put('/status/:orderId', protect, authorize('driver'), async (req, res) => {
    try {
        const { status, verificationCode } = req.body; // e.g., 'delivered'

        const order = await Order.findById(req.params.orderId);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        // Security check for PIN
        if (status === 'delivered') {
            if (!verificationCode || order.verificationCode !== verificationCode) {
                return res.status(400).json({ message: 'Invalid delivery verification code' });
            }
        }

        order.status = status;
        await order.save();

        // Update Driver Stats if delivered
        if (status === 'delivered') {
            const driverEarnings = order.totalAmount * 0.15;
            await User.findByIdAndUpdate(order.driverId || req.user._id, {
                $inc: {
                    "driverStats.completedTrips": 1,
                    "driverStats.totalEarnings": driverEarnings
                }
            });
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get Driver Stats
router.get('/stats/:driverId', protect, authorize('driver'), async (req, res) => {
    try {
        const { driverId } = req.params;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        weekAgo.setHours(0, 0, 0, 0);

        // Get today's orders
        const todayOrders = await Order.find({
            driverId,
            status: 'delivered',
            updatedAt: { $gte: today }
        });

        // Get this week's orders
        const weekOrders = await Order.find({
            driverId,
            status: 'delivered',
            updatedAt: { $gte: weekAgo }
        });

        const todayEarnings = todayOrders.reduce((sum, o) => sum + (o.totalAmount * 0.15), 0);
        const weekEarnings = weekOrders.reduce((sum, o) => sum + (o.totalAmount * 0.15), 0);

        // Calculate real rating from driver's delivered orders (if reviews exist)
        const driver = await User.findById(driverId);
        const driverRating = driver?.driverStats?.rating || 5.0;

        res.json({
            todayEarnings,
            todayTrips: todayOrders.length,
            weekEarnings,
            weekTrips: weekOrders.length,
            rating: driverRating,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get Driver Earnings with Transactions
router.get('/earnings/:driverId', protect, authorize('driver'), async (req, res) => {
    try {
        const { driverId } = req.params;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);

        const allOrders = await Order.find({
            driverId,
            status: 'delivered'
        }).sort({ updatedAt: -1 }).limit(100);

        const todayOrders = allOrders.filter(o => new Date(o.updatedAt) >= today);
        const weekOrders = allOrders.filter(o => new Date(o.updatedAt) >= weekAgo);
        const monthOrders = allOrders.filter(o => new Date(o.updatedAt) >= monthAgo);

        const todayEarnings = todayOrders.reduce((sum, o) => sum + (o.totalAmount * 0.15), 0);
        const weekEarnings = weekOrders.reduce((sum, o) => sum + (o.totalAmount * 0.15), 0);
        const monthEarnings = monthOrders.reduce((sum, o) => sum + (o.totalAmount * 0.15), 0);

        // Create transaction history from recent orders
        const transactions = allOrders.slice(0, 10).map(order => ({
            id: order._id,
            type: 'earning',
            amount: Math.round(order.totalAmount * 0.15),
            date: order.updatedAt,
            orderId: `#${order._id.toString().slice(-6).toUpperCase()}`
        }));

        res.json({
            todayEarnings,
            weekEarnings,
            monthEarnings,
            availableBalance: weekEarnings, // Simplified
            pendingBalance: todayEarnings,
            trips: {
                today: todayOrders.length,
                week: weekOrders.length,
                month: monthOrders.length
            },
            transactions
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router;
