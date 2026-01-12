import mongoose from 'mongoose';

const walletTransactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['credit', 'debit'],
        required: true
    },
    amount: { type: Number, required: true },
    source: {
        type: String,
        enum: ['upi_add', 'card_add', 'order_payment', 'cashback', 'refund', 'promo_reward', 'spin_reward', 'pay_later_payment'],
        required: true
    },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    description: { type: String },
    balanceAfter: { type: Number },
    createdAt: { type: Date, default: Date.now }
});

// Index for efficient queries
walletTransactionSchema.index({ userId: 1, createdAt: -1 });

const WalletTransaction = mongoose.model('WalletTransaction', walletTransactionSchema);
export default WalletTransaction;
