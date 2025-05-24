
import express from "express";
import { 
  getDashboardStats, 
  getDashboardChartData,
  getRecentActivities,
  getProductAnalytics,
  getCustomerAnalytics,
  getVaccinationAnalytics
} from "../controller/dashboard.controller.js";

const router = express.Router();

// Get dashboard statistics
router.get("/stats", getDashboardStats);

// Get dashboard chart data
router.get("/charts", getDashboardChartData);

// Get recent activities
router.get("/activities", getRecentActivities);

// Get detailed product analytics
router.get("/product-analytics", getProductAnalytics);

// Get detailed customer analytics
router.get("/customer-analytics", getCustomerAnalytics);

// Get detailed vaccination analytics
router.get("/vaccination-analytics", getVaccinationAnalytics);

export default router;