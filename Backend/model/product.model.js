import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true }, 
  price: { type: Number, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  ingredients: { type: [String], required: true },
  recommendedFor: { type: [String], required: true },
  details: {
    type: [String],
    required: true,
  }
});

const ratingSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
});

const commentSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  userName: { type: String, required: true },
  text: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  date: { type: Date, default: Date.now },
});

export const Product = mongoose.model('Product', productSchema);
export const Rating = mongoose.model('Rating', ratingSchema);
export const Comment = mongoose.model('Comment', commentSchema);