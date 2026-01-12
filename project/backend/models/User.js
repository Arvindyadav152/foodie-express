import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phoneNumber: { type: String, unique: true, sparse: true },
    firebaseUid: { type: String, unique: true, sparse: true },
    role: {
        type: String,
        enum: ['user', 'vendor', 'admin', 'driver'],
        default: 'user'
    },
    addresses: [{
        label: { type: String, default: 'Home' }, // e.g., Home, Work
        street: String,
        city: String,
        zip: String,
        coordinates: { lat: Number, lng: Number }
    }],
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' }],
    avatar: { type: String, default: '' },
    isVerified: { type: Boolean, default: false }, // For Vendor/Driver approval
    isAvailable: { type: Boolean, default: true }, // For Driver status

    // Elite Features: Wallet & Gamification
    walletBalance: { type: Number, default: 0 },
    loyaltyPoints: { type: Number, default: 0 },
    spinCredits: { type: Number, default: 0 },
    streak: {
        currentDays: { type: Number, default: 0 },
        maxStreak: { type: Number, default: 0 },
        lastOrderDate: { type: Date, default: null }
    },
    payLaterEnabled: { type: Boolean, default: false },
    payLaterDues: { type: Number, default: 0 },
    driverStats: {
        totalEarnings: { type: Number, default: 0 },
        completedTrips: { type: Number, default: 0 },
        rating: { type: Number, default: 5.0 }
    },
    allergies: [{ type: String }], // e.g., ['Peanuts', 'Dairy']
    achievements: [{
        title: { type: String },
        icon: { type: String },
        unlockedAt: { type: Date, default: Date.now }
    }],

    // Vendor specific fields (can be moved to a separate Vendor model if complexity grows, but kept here for simplicity initially)
    vendorDetails: {
        restaurantName: { type: String },
        description: { type: String },
        address: { type: String },
        rating: { type: Number, default: 0 },
    },

    createdAt: { type: Date, default: Date.now }
});

// Password Hash Middleware
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match Password Method
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
