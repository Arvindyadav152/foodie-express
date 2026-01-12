import express from 'express';
import User from '../models/User.js';
import WalletTransaction from '../models/WalletTransaction.js';
import Order from '../models/Order.js';

const router = express.Router();

// @desc    Get wallet balance and recent transactions
// @route   GET /api/wallet/:userId
router.get('/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select('walletBalance payLaterEnabled payLaterDues');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const transactions = await WalletTransaction.find({ userId: req.params.userId })
            .sort({ createdAt: -1 })
            .limit(20);

        res.json({
            balance: user.walletBalance || 0,
            payLaterEnabled: user.payLaterEnabled || false,
            payLaterDues: user.payLaterDues || 0,
            transactions
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Add funds to wallet (Simulated UPI)
// @route   POST /api/wallet/:userId/add
router.post('/:userId/add', async (req, res) => {
    try {
        const { amount, source = 'upi_add' } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Invalid amount' });
        }

        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update balance
        user.walletBalance = (user.walletBalance || 0) + amount;
        await user.save();

        // Create transaction record
        const transaction = new WalletTransaction({
            userId: req.params.userId,
            type: 'credit',
            amount,
            source,
            description: `Added ₹${amount} via ${source === 'upi_add' ? 'UPI' : 'Card'}`,
            balanceAfter: user.walletBalance
        });
        await transaction.save();

        res.json({
            message: 'Funds added successfully',
            balance: user.walletBalance,
            transaction
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Deduct from wallet (for order payment)
// @route   POST /api/wallet/:userId/deduct
router.post('/:userId/deduct', async (req, res) => {
    try {
        const { amount, orderId, description } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Invalid amount' });
        }

        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if ((user.walletBalance || 0) < amount) {
            return res.status(400).json({ message: 'Insufficient wallet balance' });
        }

        // Update balance
        user.walletBalance -= amount;
        await user.save();

        // Create transaction record
        const transaction = new WalletTransaction({
            userId: req.params.userId,
            type: 'debit',
            amount,
            source: 'order_payment',
            orderId,
            description: description || `Payment for order`,
            balanceAfter: user.walletBalance
        });
        await transaction.save();

        res.json({
            message: 'Payment successful',
            balance: user.walletBalance,
            transaction
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Add cashback to wallet
// @route   POST /api/wallet/:userId/cashback
router.post('/:userId/cashback', async (req, res) => {
    try {
        const { amount, orderId } = req.body;

        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.walletBalance = (user.walletBalance || 0) + amount;
        await user.save();

        const transaction = new WalletTransaction({
            userId: req.params.userId,
            type: 'credit',
            amount,
            source: 'cashback',
            orderId,
            description: `Cashback earned on order`,
            balanceAfter: user.walletBalance
        });
        await transaction.save();

        res.json({
            message: `₹${amount} cashback credited!`,
            balance: user.walletBalance
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Check Pay Later eligibility
// @route   GET /api/wallet/:userId/pay-later-eligibility
router.get('/:userId/pay-later-eligibility', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check eligibility: 5+ delivered orders, no pending dues
        const deliveredOrders = await Order.countDocuments({
            userId: req.params.userId,
            status: 'delivered'
        });

        const isEligible = deliveredOrders >= 5 && (user.payLaterDues || 0) === 0;
        const maxLimit = isEligible ? Math.min(500, deliveredOrders * 50) : 0;

        res.json({
            eligible: isEligible,
            orderCount: deliveredOrders,
            pendingDues: user.payLaterDues || 0,
            maxLimit,
            reason: !isEligible
                ? (deliveredOrders < 5 ? 'Need 5+ orders' : 'Clear pending dues first')
                : null
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Pay Later dues payment
// @route   POST /api/wallet/:userId/pay-dues
router.post('/:userId/pay-dues', async (req, res) => {
    try {
        const { amount, source = 'upi_add' } = req.body;

        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (amount > (user.payLaterDues || 0)) {
            return res.status(400).json({ message: 'Amount exceeds pending dues' });
        }

        user.payLaterDues = (user.payLaterDues || 0) - amount;
        await user.save();

        const transaction = new WalletTransaction({
            userId: req.params.userId,
            type: 'credit',
            amount,
            source: 'pay_later_payment',
            description: `Pay Later dues cleared: ₹${amount}`,
            balanceAfter: user.walletBalance
        });
        await transaction.save();

        res.json({
            message: 'Dues paid successfully',
            remainingDues: user.payLaterDues
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
