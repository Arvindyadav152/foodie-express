import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema({
    title: { type: String, required: true },
    subtitle: { type: String },
    offerText: { type: String, required: true }, // e.g. "50% OFF"
    image: { type: String }, // Optional background image URL
    bgColor: { type: String, default: '#111811' },
    textColor: { type: String, default: '#0df20d' },
    actionType: {
        type: String,
        enum: ['promo', 'category', 'restaurant', 'search'],
        default: 'search'
    },
    actionValue: { type: String }, // code, category name, or restaurant id
    isActive: { type: Boolean, default: true },
    priority: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

const Banner = mongoose.model('Banner', bannerSchema);
export default Banner;
