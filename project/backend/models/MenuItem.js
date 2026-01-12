import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true
    },
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    image: { type: String },
    category: { type: String, required: true }, // e.g., "Appetizer", "Main Course"
    isAvailable: { type: Boolean, default: true },
    isPopular: { type: Boolean, default: false },
    isVegetarian: { type: Boolean, default: false },
    calories: { type: Number },
}, { timestamps: true });

const MenuItem = mongoose.model('MenuItem', menuItemSchema);
export default MenuItem;
