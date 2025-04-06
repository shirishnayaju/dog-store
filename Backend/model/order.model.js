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
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
  }],
  total: { type: Number, required: true },
  // Replace userId with email
  userEmail: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending'
  }
}, { timestamps: true });

export const Order = mongoose.model('Order', orderSchema);