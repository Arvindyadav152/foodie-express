import express from 'express';
import Restaurant from '../models/Restaurant.js';
import Order from '../models/Order.js';
import MenuItem from '../models/MenuItem.js';
import { io } from '../server.js';
import { emitOrderAssigned } from '../socket.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Get Vendor's Restaurant
router.get('/restaurant/:vendorId', protect, authorize('vendor', 'admin'), async (req, res) => {
    try {
        const restaurant = await Restaurant.findOne({ vendorId: req.params.vendorId });
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found for this vendor' });
        }
        res.json(restaurant);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get Restaurant Orders
router.get('/orders/:restaurantId', protect, authorize('vendor', 'admin'), async (req, res) => {
    try {
        const orders = await Order.find({ restaurantId: req.params.restaurantId })
            .populate('items.menuItemId')
            .populate('userId', 'fullName phone')
            .populate('deliveryAddress')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Update Order Status (with socket notifications)
router.put('/orders/:orderId/status', protect, authorize('vendor', 'admin'), async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.orderId)
            .populate('restaurantId')
            .populate('userId', 'fullName phone');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const oldStatus = order.status;
        order.status = status;
        await order.save();

        // Socket: Notify customer about status change
        if (io) {
            io.to(`order:${order._id}`).emit('order:status_changed', {
                orderId: order._id,
                status,
                message: getStatusMessage(status)
            });
            io.to('admin').emit('order:status_changed', { orderId: order._id, status });
            console.log(`📊 Socket: Order ${order._id} status changed to ${status}`);
        }

        // If order is ready for pickup (preparing -> ready), notify available drivers
        if (status === 'preparing' && !order.driverId && io) {
            // Broadcast to all drivers that an order is available
            io.emit('driver:order_available', {
                orderId: order._id,
                restaurantName: order.restaurantId?.name,
                restaurantAddress: order.restaurantId?.address,
                totalAmount: order.totalAmount,
                earnings: (order.totalAmount * 0.15).toFixed(2)
            });
            console.log('🚚 Socket: Notified all drivers about available order');
        }

        res.json(order);
    } catch (error) {
        console.error('Status update error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Helper function for status messages
const getStatusMessage = (status) => {
    const messages = {
        confirmed: 'Order confirmed! Restaurant is preparing your food.',
        preparing: 'Your food is being prepared!',
        out_for_delivery: 'Your order is on the way!',
        delivered: 'Order delivered! Enjoy your meal!',
        cancelled: 'Order has been cancelled.'
    };
    return messages[status] || 'Order status updated.';
};

// Create/Update Restaurant Profile
router.post('/restaurant', protect, authorize('vendor', 'admin'), async (req, res) => {
    try {
        const { vendorId, name, address, categories, image, deliveryTime } = req.body;

        let restaurant = await Restaurant.findOne({ vendorId });

        if (restaurant) {
            // Update
            restaurant.name = name || restaurant.name;
            restaurant.address = address || restaurant.address;
            restaurant.categories = categories || restaurant.categories;
            restaurant.image = image || restaurant.image;
            restaurant.deliveryTime = deliveryTime || restaurant.deliveryTime;
            await restaurant.save();
        } else {
            // Create
            restaurant = new Restaurant(req.body);
            await restaurant.save();
        }

        res.json(restaurant);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Dashboard Stats (Simple)
router.get('/stats/:restaurantId', protect, authorize('vendor', 'admin'), async (req, res) => {
    try {
        const { restaurantId } = req.params;

        // Today's Orders
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const todaysOrders = await Order.countDocuments({
            restaurantId,
            createdAt: { $gte: startOfDay }
        });

        // Total Revenue
        const orders = await Order.find({ restaurantId, status: 'delivered' });
        const totalRevenue = orders.reduce((acc, order) => acc + order.totalAmount, 0);

        // Active Orders
        const activeOrders = await Order.countDocuments({
            restaurantId,
            status: { $in: ['confirmed', 'preparing', 'out_for_delivery'] }
        });

        res.json({
            todaysOrders,
            totalRevenue,
            activeOrders
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router;
