import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    title: { type: String },
    comment: { type: String, required: true },
    images: [{ type: String }], // Array of image URLs
    helpfulCount: { type: Number, default: 0 },
    helpfulVotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isFeatured: { type: Boolean, default: false },
    isVerifiedPurchase: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

// Index for efficient queries
reviewSchema.index({ restaurantId: 1, createdAt: -1 });
reviewSchema.index({ helpfulCount: -1 });

const Review = mongoose.model('Review', reviewSchema);
export default Review;
