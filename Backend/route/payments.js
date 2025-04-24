// routes/payments.js
import express from 'express';
import axios from 'axios';
import {Order} from '../model/order.model.js';

const router = express.Router();

// Environment variables
const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY;
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'; // Frontend URL
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:4001'; // Backend API URL

// API base URLs for Khalti
const KHALTI_API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://khalti.com/api/v2'
  : 'https://dev.khalti.com/api/v2';

/**
 * Initiate a payment with Khalti
 * @route POST /payments/initiate-payment
 */
router.post('/initiate-payment', async (req, res) => {
  try {
    const { 
      purchase_order_id, 
      purchase_order_name,
      amount, 
      customer_info,
      return_url // Allow frontend to provide its own return_url
    } = req.body;
    
    if (!purchase_order_id || !amount) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }
    
    if (!KHALTI_SECRET_KEY) {
      return res.status(500).json({
        success: false,
        message: 'Payment system configuration error'
      });
    }

    // Use the provided return_url or fallback to the BASE_URL
    const finalReturnUrl = return_url || `${BASE_URL}/payment`;
    
    // Prepare payload for Khalti API
    const payload = {
      return_url: finalReturnUrl,
      website_url: BASE_URL,
      amount,
      purchase_order_id,
      purchase_order_name,
      customer_info
    };
    
    console.log('Initiating Khalti payment:', payload);
    
    // Make request to Khalti API
    const response = await axios.post(
      `${KHALTI_API_BASE}/epayment/initiate/`,
      payload,
      {
        headers: {
          'Authorization': `Key ${KHALTI_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Khalti initiate response:', response.data);
    
    // Save the payment initiation details to the order
    if (purchase_order_id) {
      await Order.findByIdAndUpdate(
        purchase_order_id,
        {
          paymentMethod: 'khalti',
          paymentStatus: 'initiated',
          khaltiPidx: response.data.pidx
        }
      );
    }
    
    // Return Khalti payment URL to frontend
    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Payment initiation error:', error.response?.data || error.message);
    
    return res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.detail || 'Failed to initiate payment',
      error: error.response?.data || error.message
    });
  }
});

/**
 * Verify payment using Khalti lookup API
 * @route POST /payments/verify-khalti-lookup
 */
router.post('/verify-khalti-lookup', async (req, res) => {
  try {
    const { pidx } = req.body;
    
    if (!pidx) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment identifier (pidx)'
      });
    }
    
    if (!KHALTI_SECRET_KEY) {
      return res.status(500).json({
        success: false,
        message: 'Payment system configuration error'
      });
    }
    
    // Verify the payment status with Khalti
    const response = await axios.post(
      `${KHALTI_API_BASE}/epayment/lookup/`,
      { pidx },
      {
        headers: {
          'Authorization': `Key ${KHALTI_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Khalti lookup response:', response.data);
    
    // Find the order by Khalti pidx
    const order = await Order.findOne({ khaltiPidx: pidx });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Check if the payment is completed
    if (response.data.status === 'Completed') {
      // Update the order
      const updatedOrder = await Order.findByIdAndUpdate(
        order._id,
        {
          paymentStatus: 'paid',
          transactionId: response.data.transaction_id,
          paymentDetails: response.data
        },
        { new: true }
      );
      
      // Get order items
      let orderItems = [];
      try {
        // Assuming you have a way to get order items - modify as needed
        orderItems = await getOrderItems(order._id);
      } catch (err) {
        console.error('Error fetching order items:', err);
      }
      
      return res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        data: response.data,
        orderDetails: updatedOrder,
        orderItems: orderItems
      });
    } else if (response.data.status === 'Pending') {
      return res.status(202).json({
        success: false,
        message: 'Payment is pending',
        data: response.data
      });
    } else {
      // Payment expired, canceled, etc.
      await Order.findByIdAndUpdate(
        order._id,
        {
          paymentStatus: 'failed',
          paymentDetails: response.data
        }
      );
      
      return res.status(400).json({
        success: false,
        message: `Payment ${response.data.status}`,
        data: response.data
      });
    }
  } catch (error) {
    console.error('Payment lookup error:', error.response?.data || error.message);
    
    return res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.detail || 'Payment verification failed',
      error: error.response?.data || error.message
    });
  }
});

/**
 * Helper function to get order items
 * @param {String} orderId 
 * @returns {Array} Order items
 */
async function getOrderItems(orderId) {
  try {
    // Replace with your actual implementation
    // This is just a placeholder
    const order = await Order.findById(orderId).populate('products');
    return order.products || [];
  } catch (err) {
    console.error('Error getting order items:', err);
    return [];
  }
}

/**
 * Handle GET requests for payment returns from Khalti
 * This route handles when users are redirected back from Khalti
 * @route GET /payment
 */
router.get('/', async (req, res) => {
  // Log the incoming request for debugging
  console.log('Payment return request received:', req.query);
  
  const { pidx, status } = req.query;
  
  if (pidx) {
    // For API-based apps, redirect to the frontend with all query parameters preserved
    const queryString = new URLSearchParams(req.query).toString();
    return res.redirect(`${BASE_URL}/payment?${queryString}`);
  }
  
  // If this is not a return from Khalti, just redirect to the frontend
  return res.redirect(BASE_URL);
});

/**
 * Endpoint to handle webhook notifications from Khalti
 * @route POST /payments/khalti-webhook
 */
router.post('/khalti-webhook', async (req, res) => {
  try {
    const eventData = req.body;
    console.log('Received webhook from Khalti:', eventData);
    
    // Extract relevant information
    const pidx = eventData.pidx;
    const status = eventData.status;
    const transaction_id = eventData.transaction_id;
    
    if (!pidx) {
      console.error('No pidx in webhook data');
      return res.status(200).send('Missing payment identifier');
    }
    
    // Find the order by Khalti pidx
    const order = await Order.findOne({ khaltiPidx: pidx });
    
    if (!order) {
      console.error('No order found for pidx:', pidx);
      return res.status(200).send('Order not found');
    }
    
    if (status === 'Completed') {
      // Update order as paid
      await Order.findByIdAndUpdate(
        order._id,
        {
          paymentStatus: 'paid',
          transactionId: transaction_id,
          paymentDetails: eventData
        }
      );
    } else if (status === 'Refunded' || status === 'Partially refunded') {
      // Update order as refunded
      await Order.findByIdAndUpdate(
        order._id,
        {
          paymentStatus: 'refunded',
          paymentDetails: eventData
        }
      );
    }
    
    // Always respond with 200 to webhook calls
    return res.status(200).send('Webhook processed');
  } catch (error) {
    console.error('Webhook processing error:', error);
    // Always respond with 200 even if processing fails
    return res.status(200).send('Webhook received');
  }
});

export default router;