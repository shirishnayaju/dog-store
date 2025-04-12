import express from "express";
import { sendOtp, verifyOtp } from "../controller/otp.controller.js";

const router = express.Router();

router.post("/send-otp", sendOtp);     // POST /api/otp/send-otp
router.post("/verify-otp", verifyOtp); // POST /api/otp/verify-otp

export default router;
