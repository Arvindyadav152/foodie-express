import mongoose from 'mongoose';

const userPrizeSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    prizeId: { type: mongoose.Schema.Types.ObjectId, ref: 'SpinPrize' },
    prizeName: { type: String, required: true },
    prizeType: { type: String, required: true },
    prizeValue: { type: Number, required: true },
    isUsed: { type: Boolean, default: false },
    usedAt: { type: Date },
    expiresAt: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now }
});

// Index for efficient queries
userPrizeSchema.index({ userId: 1, isUsed: 1 });
userPrizeSchema.index({ expiresAt: 1 });

const UserPrize = mongoose.model('UserPrize', userPrizeSchema);
export default UserPrize;
