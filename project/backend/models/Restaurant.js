import mongoose from 'mongoose';

const restaurantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    image: { type: String, required: true },
    description: { type: String },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    deliveryTime: { type: String, required: true }, // e.g., "30-45 min"
    priceRange: { type: String, enum: ['$', '$$', '$$$', '$$$$'], default: '$$' },
    deliveryFee: { type: Number, default: 0 },
    isFreeDelivery: { type: Boolean, default: false },
    categories: [{ type: String }], // e.g., ["Italian", "Pizza"]
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    address: {
        street: String,
        city: String,
        zip: String
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true,
            default: [77.2090, 28.6139] // Default to New Delhi if not provided
        }
    },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

restaurantSchema.index({ location: '2dsphere' });

const Restaurant = mongoose.model('Restaurant', restaurantSchema);
export default Restaurant;
