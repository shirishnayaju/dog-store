
import express from "express";
import { 
  getDashboardStats, 
  getDashboardChartData,
  getRecentActivities
} from "../controller/dashboard.controller.js";

const router = express.Router();

// Get dashboard statistics
router.get("/stats", getDashboardStats);

// Get dashboard chart data
router.get("/charts", getDashboardChartData);

// Get recent activities
router.get("/activities", getRecentActivities);

export default router;