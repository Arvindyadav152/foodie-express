import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Promo from '../models/Promo.js';
import Restaurant from '../models/Restaurant.js';

const router = express.Router();

// @desc    Get Financial Stats & Risk Management
// @route   GET /api/admin/finance/stats
router.get('/finance/stats', protect, authorize('admin'), async (req, res) => {
    try {
        const totalRevenue = await Order.aggregate([
            { $match: { status: 'delivered', paymentStatus: 'paid' } },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } }
        ]);

        const flaggedOrders = await Order.countDocuments({ riskStatus: { $in: ['flagged', 'high_risk'] } });

        const recentTransactions = await Order.find()
            .select('userId totalAmount paymentStatus riskStatus transactionId createdAt')
            .populate('userId', 'fullName')
            .sort({ createdAt: -1 })
            .limit(10);

        res.json({
            revenue: totalRevenue[0]?.total || 0,
            flaggedCount: flaggedOrders,
            transactions: recentTransactions,
            payoutsPending: (totalRevenue[0]?.total || 0) * 0.7 // Roughly 70% to vendors
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// @route   GET /api/admin/stats
// @access  Private/Admin
router.get('/stats', protect, authorize('admin'), async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'user' });
        const totalVendors = await User.countDocuments({ role: 'vendor' });
        const totalDrivers = await User.countDocuments({ role: 'driver' });
        const totalOrders = await Order.countDocuments();

        const earnings = await Order.aggregate([
            { $match: { status: 'delivered' } },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } }
        ]);

        // Get active orders (orders currently being prepared or delivered)
        const activeOrdersCount = await Order.countDocuments({
            status: { $in: ['confirmed', 'preparing', 'out_for_delivery'] }
        });

        res.json({
            users: totalUsers,
            vendors: totalVendors,
            drivers: totalDrivers,
            orders: totalOrders,
            revenue: earnings[0]?.total || 0,
            activeSessions: activeOrdersCount // Real active orders instead of mock
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get All Users (for admin panel)
// @route   GET /api/admin/users
router.get('/users', protect, authorize('admin'), async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Approve/Verify User (Vendor/Driver)
// @route   PUT /api/admin/users/:id/verify
router.put('/users/:id/verify', protect, authorize('admin'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.isVerified = !user.isVerified;
        await user.save();
        res.json({ message: `User ${user.isVerified ? 'verified' : 'unverified'} successfully`, isVerified: user.isVerified });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get All Orders (for admin panel)
// @route   GET /api/admin/orders
router.get('/orders', protect, authorize('admin'), async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('userId', 'fullName email')
            .populate('restaurantId', 'name')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get All Restaurants (for admin panel)
// @route   GET /api/admin/restaurants
router.get('/restaurants', protect, authorize('admin'), async (req, res) => {
    try {
        const restaurants = await Restaurant.find().sort({ createdAt: -1 });
        res.json(restaurants);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Create a new Promo Code
// @route   POST /api/admin/promos
// @access  Private/Admin
router.post('/promos', protect, authorize('admin'), async (req, res) => {
    try {
        const promo = await Promo.create({
            ...req.body,
            createdBy: req.user._id
        });
        res.status(201).json(promo);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @desc    Get all Promo Codes
// @route   GET /api/admin/promos
// @access  Private/Admin
router.get('/promos', protect, authorize('admin'), async (req, res) => {
    try {
        const promos = await Promo.find().sort({ createdAt: -1 });
        res.json(promos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Delete a Promo Code
// @route   DELETE /api/admin/promos/:id
// @access  Private/Admin
router.delete('/promos/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const promo = await Promo.findByIdAndDelete(req.params.id);
        if (!promo) return res.status(404).json({ message: 'Promo not found' });
        res.json({ message: 'Promo deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get All Drivers with Stats
// @route   GET /api/admin/drivers
router.get('/drivers', async (req, res) => {
    try {
        const drivers = await User.find({ role: 'driver' })
            .select('fullName email phone profileImage driverStats createdAt')
            .sort({ createdAt: -1 });

        // Get active deliveries count
        const activeDeliveries = await Order.countDocuments({
            driverId: { $exists: true },
            status: { $in: ['out_for_delivery', 'preparing'] }
        });

        // Calculate average rating
        const ratingsSum = drivers.reduce((sum, d) => sum + (d.driverStats?.rating || 5), 0);
        const avgRating = drivers.length > 0 ? (ratingsSum / drivers.length).toFixed(1) : 5.0;

        // Get driver online status from their recent activity
        // A driver is considered "online" if they have an active delivery or accepted an order recently
        const activeDriverIds = await Order.distinct('driverId', {
            status: { $in: ['preparing', 'out_for_delivery'] },
            driverId: { $exists: true }
        });

        const driversWithStatus = drivers.map(d => ({
            ...d.toObject(),
            isOnline: activeDriverIds.some(id => id?.toString() === d._id.toString()),
            isVerified: d.isVerified || true,
            vehicleType: d.vehicleType || 'Bike'
        }));

        const onlineCount = driversWithStatus.filter(d => d.isOnline).length;

        res.json({
            drivers: driversWithStatus,
            total: drivers.length,
            online: onlineCount,
            activeDeliveries,
            avgRating: parseFloat(avgRating)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Suspend/Activate Driver
// @route   PUT /api/admin/drivers/:id/:action
router.put('/drivers/:id/:action', protect, authorize('admin'), async (req, res) => {
    try {
        const { id, action } = req.params;
        const driver = await User.findById(id);

        if (!driver) return res.status(404).json({ message: 'Driver not found' });

        if (action === 'suspend') {
            driver.isSuspended = true;
        } else if (action === 'activate') {
            driver.isSuspended = false;
        }

        await driver.save();
        res.json({ message: `Driver ${action}d successfully`, driver });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
