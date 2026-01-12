import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import admin from '../config/firebaseAdmin.js';

const router = express.Router();

// Generate Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
        expiresIn: '30d',
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
    const { fullName, email, password, role } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            fullName,
            email,
            password,
            role: role || 'customer'
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                walletBalance: user.walletBalance || 0,
                loyaltyPoints: user.loyaltyPoints || 0,
                avatar: user.avatar || '',
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                walletBalance: user.walletBalance || 0,
                loyaltyPoints: user.loyaltyPoints || 0,
                avatar: user.avatar || '',
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Auth with Firebase Phone
// @route   POST /api/auth/phone-login
// @access  Public
router.post('/phone-login', async (req, res) => {
    const { idToken, role } = req.body;

    if (!admin) {
        return res.status(500).json({ message: 'Firebase Admin not initialized. Check server environment.' });
    }

    try {
        // 1. Verify the ID token from Firebase
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const { phone_number, uid } = decodedToken;

        if (!phone_number) {
            return res.status(400).json({ message: 'Phone number not found in token' });
        }

        // 2. Find or Create User by phone number
        let user = await User.findOne({ phoneNumber: phone_number });

        if (!user) {
            // Create a new user if it doesn't exist
            user = await User.create({
                fullName: `User ${phone_number.slice(-4)}`,
                email: `${uid}@phoneauth.foodies`,
                password: Math.random().toString(36).slice(-10),
                phoneNumber: phone_number,
                role: role || 'customer',
                firebaseUid: uid
            });
        }

        // 3. Return user info and our local JWT token
        res.json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            walletBalance: user.walletBalance || 0,
            loyaltyPoints: user.loyaltyPoints || 0,
            avatar: user.avatar || '',
            token: generateToken(user._id),
        });

    } catch (error) {
        console.error('Firebase Phone Login Error:', error);
        res.status(401).json({ message: 'Invalid Firebase token' });
    }
});

export default router;
