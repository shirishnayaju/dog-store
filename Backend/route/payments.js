import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

const router = express.Router();

router.post('/verify-khalti', async (req, res) => {
  try {
    const { token, amount, orderId } = req.body;
    
    // Get secret key from environment variables
    const secretKey = process.env.KHALTI_SECRET_KEY;
    
    if (!secretKey) {
      throw new Error('KHALTI_SECRET_KEY is not defined in environment variables');
    }

    // Log request data for debugging (consider removing in production)
    console.log("Verifying payment:", { token, amount, orderId });
    
    // Verify with Khalti server
    const response = await axios.post(
      'https://khalti.com/api/v2/payment/verify/',
      {
        token: token,
        amount: amount
      },
      {
        headers: {
          'Authorization': `Key ${secretKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log("Khalti API response:", response.data);

    // If verification was successful
    if (response.data && response.data.idx) {
      // Update order status in your database
      try {
        // Example: Update order payment status 
        // Uncomment and modify according to your database model
        // await Order.findByIdAndUpdate(orderId, { 
        //   paymentStatus: 'paid', 
        //   transactionId: response.data.idx,
        //   paymentMethod: 'khalti'
        // });
        
        return res.status(200).json({
          success: true,
          message: 'Payment verified successfully',
          data: response.data
        });
      } catch (dbError) {
        console.error('Database update error:', dbError);
        // Payment verified but database update failed
        return res.status(500).json({
          success: false,
          message: 'Payment verified but order update failed',
          error: dbError.message
        });
      }
    } else {
      throw new Error('Invalid response from Khalti');
    }
  } catch (error) {
    console.error('Khalti verification error:', error.response?.data || error.message);
    
    return res.status(400).json({
      success: false,
      message: 'Payment verification failed',
      error: error.response?.data || error.message
    });
  }
});

export default router;