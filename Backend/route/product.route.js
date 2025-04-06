import express from 'express';
import {
  getAllProducts, // Add this import
  getProductById,
  getProductRating,
  addComment,
  getComments,
} from '../controller/product.controller.js';

const router = express.Router();

// Add this route to fetch all products
router.get('/', getAllProducts);

// Existing product routes
router.get('/:id', getProductById);
router.get('/:id/rating', getProductRating);

// Comment routes
router.post('/:id/comments', addComment);
router.get('/:id/comments', getComments);

export default router;