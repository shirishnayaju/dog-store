// routes/payments.js
import express from 'express';
import axios from 'axios';
import {Order} from '../model/order.model.js';
import KhaltiCheckout from 'khalti-checkout-web';

const router = express.Router();

// Initialize Khalti with server-side keys
const getKhaltiConfig = () => ({
  publicKey: process.env.KHALTI_PUBLIC_KEY,
  productUrl: process.env.BASE_URL,
  paymentPreference: ["KHALTI"],
});

// Payment initialization endpoint
router.post('/init-khalti', async (req, res) => {
  try {
    const { orderId, amount } = req.body;
    
    if (!orderId || !amount) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing order details' 
      });
    }

    const amountInPaisa = Math.max(100, Math.round(amount * 100));
    const config = getKhaltiConfig();

    return res.json({
      success: true,
      config,
      amountInPaisa
    });
  } catch (error) {
    console.error('Init error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Payment initialization failed' 
    });
  }
});

// Unified verification endpoint
router.post('/verify-khalti', async (req, res) => {
  try {
    const { payload, orderId } = req.body;
    const secretKey = process.env.KHALTI_SECRET_KEY;

    // Verify with Khalti API
    const khaltiResponse = await axios.post(
      'https://khalti.com/api/v2/payment/verify/',
      { token: payload.token, amount: payload.amount },
      { headers: { Authorization: `Key ${secretKey}` } }
    );

    // Update order
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { 
        paymentStatus: 'paid',
        transactionId: khaltiResponse.data.idx,
        paymentMethod: 'khalti',
        paymentDetails: khaltiResponse.data
      },
      { new: true }
    );

    res.json({
      success: true,
      data: khaltiResponse.data,
      orderDetails: updatedOrder
    });
  } catch (error) {
    console.error('Verification error:', error.response?.data || error.message);
    res.status(400).json({
      success: false,
      message: error.response?.data?.detail || 'Payment verification failed'
    });
  }
});
/**
 * Handle returning from Khalti redirect flow
 * @route POST /payments/verify-khalti-return
 */
router.post('/verify-khalti-return', async (req, res) => {
  try {
    const { pidx, txnId, status, order_id } = req.body;
    
    if (!pidx || !status) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters'
      });
    }
    
    const secretKey = process.env.KHALTI_SECRET_KEY;
    
    if (!secretKey) {
      return res.status(500).json({
        success: false,
        message: 'Payment configuration error'
      });
    }
    
    // For verification, we need to check the payment status using the pidx
    const response = await axios.post(
      'https://khalti.com/api/v2/payment/status/',
      { pidx },
      {
        headers: {
          'Authorization': `Key ${secretKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log("Khalti status response:", response.data);
    
    if (response.data && response.data.status === 'Completed') {
      // Determine order ID - either from the request or from Khalti's response
      const orderId = order_id || response.data.purchase_order_id || response.data.product_identity;
      
      if (!orderId) {
        return res.status(400).json({
          success: false,
          message: 'Could not determine order ID'
        });
      }
      
      // Update the order in your database
      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        {
          paymentStatus: 'paid',
          transactionId: txnId || response.data.transaction_id,
          paymentMethod: 'khalti',
          paymentDetails: response.data
        },
        { new: true }
      );
      
      if (!updatedOrder) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }
      
      // Get order items if needed
      const orderItems = updatedOrder.products || [];
      
      return res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        data: response.data,
        orderDetails: updatedOrder,
        orderItems: orderItems
      });
    } else {
      // Payment failed or is pending
      return res.status(400).json({
        success: false,
        message: `Payment ${response.data?.status || status}`,
        data: response.data
      });
    }
  } catch (error) {
    console.error('Khalti return verification error:', error.response?.data || error.message);
    
    return res.status(400).json({
      success: false,
      message: 'Payment verification failed',
      error: error.response?.data || error.message
    });
  }
});

/**
 * Endpoint to handle webhook notifications from Khalti
 * @route POST /payments/khalti-webhook
 */
router.post('/khalti-webhook', async (req, res) => {
  try {
    // For security, verify the signature if Khalti provides one
    // const signature = req.headers['khalti-signature'];
    
    const eventData = req.body;
    console.log('Received webhook from Khalti:', eventData);
    
    // Verify event type
    if (eventData.event === 'payment_completed') {
      // Extract order ID from the product_identity field
      const orderId = eventData.product_identity;
      
      if (!orderId) {
        console.error('No order ID in webhook data');
        return res.status(400).send('No order ID found');
      }
      
      // Update the order
      await Order.findByIdAndUpdate(
        orderId,
        {
          paymentStatus: 'paid',
          transactionId: eventData.transaction_id,
          paymentMethod: 'khalti',
          paymentDetails: eventData
        }
      );
      
      // Always respond with 200 to webhook calls
      return res.status(200).send('Webhook processed');
    }
    
    // For other event types
    return res.status(200).send('Event acknowledged');
  } catch (error) {
    console.error('Webhook processing error:', error);
    // Always respond with 200 even if processing fails
    // But log the error for internal tracking
    return res.status(200).send('Webhook received');
  }
});

export default router;