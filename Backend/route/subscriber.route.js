import express from 'express';
import { subscribe, unsubscribe, getAllSubscribers, deleteSubscriber, updatePreferences } from '../controller/subscriber.controller.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/subscribe', subscribe);
router.get('/unsubscribe/:email/:token', unsubscribe);

// Protected routes (admin only)
router.get(
  '/admin/subscribers',
  verifyToken,  // Changed to use available middleware
  getAllSubscribers
);

router.delete(
  '/admin/subscribers/:id',
  verifyToken,  // Changed to use available middleware
  deleteSubscriber
);

// Update subscriber preferences (can be accessed with right token or by admin)
router.patch('/preferences/:email', updatePreferences);

// Change export format to match what index.js is expecting
export { router as subscriberRoutes };