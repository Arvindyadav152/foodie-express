import mongoose from 'mongoose';

const spinPrizeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: {
        type: String,
        enum: ['discount_percent', 'discount_fixed', 'free_delivery', 'points', 'cashback', 'better_luck'],
        required: true
    },
    value: { type: Number, required: true }, // percentage, amount, or points
    color: { type: String, default: '#0df20d' },
    probability: { type: Number, required: true, min: 0, max: 100 }, // Weight for selection
    isActive: { type: Boolean, default: true },
    validityDays: { type: Number, default: 7 }, // How long the prize is valid
    createdAt: { type: Date, default: Date.now }
});

const SpinPrize = mongoose.model('SpinPrize', spinPrizeSchema);
export default SpinPrize;
