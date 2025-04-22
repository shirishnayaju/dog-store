
import express from "express";
import { getDashboardStats } from "../controller/dashboard.controller.js";

const router = express.Router();

// Get dashboard statistics
router.get("/stats", getDashboardStats);

export default router;