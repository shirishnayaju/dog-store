import express from 'express';
import {
  getAllProducts,
  addProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductRating,
  addComment,
  getComments,
} from '../controller/product.controller.js';

const router = express.Router();

// Product routes
router.get('/', getAllProducts);
router.post('/', addProduct);
router.get('/:id', getProductById);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);
router.get('/:id/rating', getProductRating);

// Comment routes
router.post('/:id/comments', addComment);
router.get('/:id/comments', getComments);

export default router;