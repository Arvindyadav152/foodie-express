import mongoose from 'mongoose';

const flashDealSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    discountPercent: { type: Number, required: true },
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        default: null // null means applies to all restaurants
    },
    category: { type: String, default: null }, // e.g., 'Pizza', 'Biryani'
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    bgColor: { type: String, default: '#111811' },
    textColor: { type: String, default: '#0df20d' },
    createdAt: { type: Date, default: Date.now }
});

// Virtual to check if deal is currently live
flashDealSchema.virtual('isLive').get(function () {
    const now = new Date();
    return this.isActive && now >= this.startTime && now <= this.endTime;
});

// Ensure virtuals are included in JSON
flashDealSchema.set('toJSON', { virtuals: true });
flashDealSchema.set('toObject', { virtuals: true });

const FlashDeal = mongoose.model('FlashDeal', flashDealSchema);
export default FlashDeal;
