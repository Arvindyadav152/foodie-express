import express from 'express';
import Review from '../models/Review.js';
import Order from '../models/Order.js';

const router = express.Router();

// @desc    Get reviews for a restaurant
// @route   GET /api/reviews/restaurant/:restaurantId
router.get('/restaurant/:restaurantId', async (req, res) => {
    try {
        const { sort = 'recent' } = req.query;
        let sortQuery = { createdAt: -1 };

        if (sort === 'helpful') {
            sortQuery = { helpfulCount: -1, createdAt: -1 };
        } else if (sort === 'rating-high') {
            sortQuery = { rating: -1, createdAt: -1 };
        } else if (sort === 'rating-low') {
            sortQuery = { rating: 1, createdAt: -1 };
        }

        const reviews = await Review.find({ restaurantId: req.params.restaurantId })
            .populate('userId', 'fullName avatar')
            .sort(sortQuery)
            .limit(50);

        // Get stats
        const stats = await Review.aggregate([
            { $match: { restaurantId: new (await import('mongoose')).default.Types.ObjectId(req.params.restaurantId) } },
            {
                $group: {
                    _id: null,
                    avgRating: { $avg: '$rating' },
                    count: { $sum: 1 },
                    fiveStars: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
                    fourStars: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
                    threeStars: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
                    twoStars: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
                    oneStars: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } }
                }
            }
        ]);

        res.json({
            reviews,
            stats: stats[0] || { avgRating: 0, count: 0, fiveStars: 0, fourStars: 0, threeStars: 0, twoStars: 0, oneStars: 0 }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

// @desc    Submit a review
// @route   POST /api/reviews
router.post('/', async (req, res) => {
    try {
        const { userId, restaurantId, orderId, rating, title, comment, images } = req.body;

        // Check if user has ordered from this restaurant (verified purchase)
        let isVerifiedPurchase = false;
        if (orderId) {
            const order = await Order.findOne({ _id: orderId, userId, 'restaurantId': restaurantId, status: 'delivered' });
            isVerifiedPurchase = !!order;
        }

        const review = new Review({
            userId,
            restaurantId,
            orderId,
            rating,
            title,
            comment,
            images: images || [],
            isVerifiedPurchase
        });

        await review.save();

        const populatedReview = await Review.findById(review._id).populate('userId', 'fullName avatar');
        res.status(201).json(populatedReview);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @desc    Mark review as helpful
// @route   POST /api/reviews/:id/helpful
router.post('/:id/helpful', async (req, res) => {
    try {
        const { userId } = req.body;
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Check if already voted
        if (review.helpfulVotes.includes(userId)) {
            // Remove vote
            review.helpfulVotes = review.helpfulVotes.filter(id => id.toString() !== userId);
            review.helpfulCount = Math.max(0, review.helpfulCount - 1);
        } else {
            // Add vote
            review.helpfulVotes.push(userId);
            review.helpfulCount += 1;
        }

        await review.save();
        res.json({ helpfulCount: review.helpfulCount, voted: review.helpfulVotes.includes(userId) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get user's reviews
// @route   GET /api/reviews/user/:userId
router.get('/user/:userId', async (req, res) => {
    try {
        const reviews = await Review.find({ userId: req.params.userId })
            .populate('restaurantId', 'name image')
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
