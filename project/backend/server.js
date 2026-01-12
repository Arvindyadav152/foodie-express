import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from 'redis';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import http from 'http';
import { Server } from 'socket.io';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 8000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate Limiting
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again after 15 minutes'
});

// Database Connection (MongoDB)
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Database Connection (Redis)
const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
    socket: {
        reconnectStrategy: (retries) => {
            if (retries > 5) return false; // Stop retrying after 5 attempts
            return 500;
        }
    }
});

redisClient.on('error', (err) => {
    if (process.env.NODE_ENV === 'production') {
        console.log('⚠️ Redis not available, skipping cache...');
    } else {
        console.error('❌ Redis Client Error', err);
    }
});
redisClient.on('connect', () => console.log('✅ Redis Client Connected'));

// Only attempt connection if REDIS_URL is provided or in development
if (process.env.REDIS_URL || process.env.NODE_ENV !== 'production') {
    await redisClient.connect().catch(err => console.log('⚠️ Redis Connection Failed'));
}

import authRoutes from './routes/authRoutes.js';
import restaurantRoutes from './routes/restaurantRoutes.js';
import menuRoutes from './routes/menuRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import userRoutes from './routes/userRoutes.js';
import vendorRoutes from './routes/vendorRoutes.js';
import driverRoutes from './routes/driverRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import promoRoutes from './routes/promoRoutes.js';
import bannerRoutes from './routes/bannerRoutes.js';
import flashDealRoutes from './routes/flashDealRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import gamificationRoutes from './routes/gamificationRoutes.js';
import walletRoutes from './routes/walletRoutes.js';

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/promos', promoRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/flash-deals', flashDealRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/driver', driverRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// Basic Route
app.get('/', (req, res) => {
    res.send('Foodies Backend API is Running');
});

// Initialize Socket.io Logic
import { initSocket } from './socket.js';
initSocket(io);

// Start Server
server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export { redisClient, io };
