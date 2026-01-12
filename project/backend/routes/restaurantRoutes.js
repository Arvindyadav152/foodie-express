import express from 'express';
import Restaurant from '../models/Restaurant.js';
// import { protect } from './authRoutes.js'; // Removed to fix crash


const router = express.Router();

import { reverseGeocodeFree, calculateDistance } from '../utils/locationHelper.js';

// Get All Restaurants (with filters and nearby search)
router.get('/', async (req, res) => {
    try {
        const { search, category, rating, lat, lng, radius = 5000 } = req.query; // radius in meters
        let query = { isActive: true };

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }
        if (category && category !== 'All') {
            query.categories = category;
        }
        if (rating) {
            query.rating = { $gte: Number(rating) };
        }

        // Geospatial Nearby Search
        if (lat && lng) {
            query.location = {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    $maxDistance: parseInt(radius)
                }
            };
        }

        const restaurants = await Restaurant.find(query);

        // Add distance to the response if lat/lng are provided
        const results = restaurants.map(rest => {
            const r = rest.toObject();
            if (lat && lng && r.location?.coordinates) {
                const dist = calculateDistance(
                    parseFloat(lat),
                    parseFloat(lng),
                    r.location.coordinates[1],
                    r.location.coordinates[0]
                );
                r.distance = parseFloat(dist.toFixed(2));
            }
            return r;
        });

        res.json(results);
    } catch (error) {
        console.error("Nearby Search Error:", error);
        res.status(500).json({ message: 'Server Error', error });
    }
});

// @desc    Reverse Geocode coordinates (FREE via Nominatim)
// @route   GET /api/restaurants/reverse-geocode
router.get('/reverse-geocode', async (req, res) => {
    const { lat, lng } = req.query;
    if (!lat || !lng) return res.status(400).json({ message: 'Lat and Lng required' });

    const address = await reverseGeocodeFree(lat, lng);
    if (address) {
        res.json(address);
    } else {
        res.status(500).json({ message: 'Failed to reverse geocode' });
    }
});

// Get Single Restaurant
router.get('/:id', async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id);
        if (restaurant) {
            res.json(restaurant);
        } else {
            res.status(404).json({ message: 'Restaurant not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Create Restaurant (Vendor Only) - Simplified protect middleware usage
// You might need to move 'protect' to a middleware util file if circular deps occur
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protectRoute = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
            req.user = await User.findById(decoded.id).select('-password');
            next();
        } catch (error) {
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const vendorOnly = (req, res, next) => {
    if (req.user && (req.user.role === 'vendor' || req.user.role === 'admin')) {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as vendor' });
    }
};

router.post('/', protectRoute, vendorOnly, async (req, res) => {
    try {
        const { name, image, description, deliveryTime, priceRange, categories, address } = req.body;

        const restaurant = new Restaurant({
            name,
            image,
            description,
            deliveryTime,
            priceRange,
            categories,
            address,
            location: req.body.location || { type: 'Point', coordinates: [77.2090, 28.6139] },
            vendorId: req.user._id
        });

        const createdRestaurant = await restaurant.save();
        res.status(201).json(createdRestaurant);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
});

export default router;
