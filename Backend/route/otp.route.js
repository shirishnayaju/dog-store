import express from "express";
import { sendOtp, verifyOtp } from "../controller/otp.controller.js";

const router = express.Router();

router.post("/send-otp", sendOtp);  // Route to send OTP
router.post("/verify-otp", verifyOtp);  // Route to verify OTP

export default router;
