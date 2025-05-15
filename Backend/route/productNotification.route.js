import express from "express";
import { sendProductNotification } from '../controller/productNotification.controller.js';

const router = express.Router();

// Route for sending product notifications to all users and subscribers
router.post('/send-product-notification', sendProductNotification);

export default router;
