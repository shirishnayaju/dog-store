import {Product} from "../model/product.model.js";
import {Order} from "../model/order.model.js";
import User from "../model/user.model.js";
import {VaccinationBooking} from "../model/VaccinationBooking.model.js"; // Adjust import path as needed

/**
 * Get dashboard statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    // Get product count
    const productCount = await Product.countDocuments();
    
    // Get order count
    const orderCount = await Order.countDocuments();
    
    // Get customer count (assuming regular users are customers)
    const customerCount = await User.countDocuments({ role: "user" });
    
    // Get vaccination booking count
    const vaccinationCount = await VaccinationBooking.countDocuments();
    
    // Return all statistics
    return res.status(200).json({
      productCount,
      orderCount,
      customerCount,
      vaccinationCount
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    next(error);
  }
};