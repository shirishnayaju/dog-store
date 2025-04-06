import express from 'express';
import {
  getAllOrders,
  createOrder,
  getOrderById,
  updateOrder,
  deleteOrder,
  getOrdersByUser,
} from '../controller/order.controller.js';

const router = express.Router();

// Get all orders
router.get('/orders', getAllOrders);

// Create a new order
router.post('/orders', createOrder);

// Get order details by ID
router.get('/orders/:id', getOrderById);

// Update an order by ID
router.put('/orders/:id', updateOrder);

// Delete an order by ID
router.delete('/orders/:id', deleteOrder);

// Get all orders for a specific user by email
router.get('/users/:userEmail/orders', getOrdersByUser);

export default router;