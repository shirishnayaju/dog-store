import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  customer: {
    name: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    city: { type: String, required: true },
    colony: { type: String, required: true },
    orderNotes: { type: String }
  },
  products: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, // Add reference to product
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
  }],
  totalAmount: { type: Number, required: true }, // Renamed for consistency
  total: { type: Number, required: true }, // Keep for backward compatibility
  // Add reference to user model
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  userEmail: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled', 'processing', 'refunded'],
    default: 'pending'
  }
}, { timestamps: true });

// Pre-save hook to ensure total and totalAmount are in sync
orderSchema.pre('save', function(next) {
  if (this.total && !this.totalAmount) {
    this.totalAmount = this.total;
  } else if (this.totalAmount && !this.total) {
    this.total = this.totalAmount;
  }
  next();
});

export const Order = mongoose.model('Order', orderSchema);