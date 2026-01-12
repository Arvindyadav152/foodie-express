import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
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
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    items: [
        {
            menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
            name: String,
            quantity: { type: Number, required: true, min: 1 },
            price: Number,
        }
    ],
    totalAmount: { type: Number, required: true },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'],
        default: 'pending'
    },
    deliveryAddress: {
        street: String,
        city: String,
        zip: String,
    },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    paymentMethod: { type: String, enum: ['cod', 'online', 'upi', 'card'], default: 'cod' },
    stripePaymentIntentId: { type: String },
    verificationCode: { type: String },
    promoCode: { type: String },
    discountAmount: { type: Number, default: 0 },
    instructions: { type: String },
    // Advanced Financial & Fraud Data
    transactionId: { type: String },
    riskScore: { type: Number, default: 0 }, // 0-100 score
    riskStatus: { type: String, enum: ['safe', 'flagged', 'high_risk'], default: 'safe' },
    paymentMetadata: {
        cardBrand: String,
        last4: String,
        gatewayResponse: String
    }
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);
export default Order;
