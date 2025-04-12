import express from "express";
import { sendOrderStatusEmail } from "../controller/mailController.js";

const router = express.Router();

router.post("/send-order-email", sendOrderStatusEmail);

export default router;