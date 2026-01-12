import express from 'express';
import Cart from '../models/Cart.js';
import MenuItem from '../models/MenuItem.js';

const router = express.Router();

// Middleware to get user ID (Simplified for now, in real app extract from JWT)
// For this verifiable build, we will pass userId in headers or body if not using full auth middleware yet
// But we established protect middleware earlier.. let's try to use it or mock it if complex.
// Let's assume the frontend sends a hardcoded UserID for now or we extract from token.
// To keep it simple and robust for this verification step:
// We will accept 'x-user-id' header or rely on body.
// Ideally usage: protected route.

// Get Cart
router.get('/:userId', async (req, res) => {
    try {
        let cart = await Cart.findOne({ userId: req.params.userId }).populate('restaurantId');
        if (!cart) {
            cart = await Cart.create({ userId: req.params.userId, items: [], totalAmount: 0 });
        }
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
});

// Add to Cart
router.post('/add', async (req, res) => {
    const { userId, menuItemId, quantity } = req.body;
    try {
        const menuItem = await MenuItem.findById(menuItemId);
        if (!menuItem) return res.status(404).json({ message: 'Item not found' });

        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = await Cart.create({ userId, items: [], totalAmount: 0 });
        }

        // Logic: specific restaurant constraint?
        // If cart has items from another restaurant, clear it?
        if (cart.restaurantId && cart.restaurantId.toString() !== menuItem.restaurantId.toString() && cart.items.length > 0) {
            return res.status(400).json({
                message: 'Different Restaurant',
                currentRestaurantId: cart.restaurantId,
                newRestaurantId: menuItem.restaurantId
            });
            // Frontend should ask: "Start new basket?"
        }

        cart.restaurantId = menuItem.restaurantId;

        const itemIndex = cart.items.findIndex(item => item.menuItemId.toString() === menuItemId);

        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += quantity;
        } else {
            cart.items.push({
                menuItemId: menuItem._id,
                name: menuItem.name,
                price: menuItem.price,
                quantity: quantity,
                image: menuItem.image
            });
        }

        // Recalculate Total
        cart.totalAmount = cart.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

        await cart.save();
        res.json(cart);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Clear Cart
router.delete('/:userId', async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.params.userId });
        if (cart) {
            cart.items = [];
            cart.totalAmount = 0;
            cart.restaurantId = null;
            await cart.save();
        }
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router;
