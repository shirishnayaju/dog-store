import express from "express";
import { sendVaccinationStatusEmail } from '../controller/email.controller.js';

const router = express.Router();

// Route for sending vaccination status emails
router.post('/send-vaccination-email', sendVaccinationStatusEmail);

export default router;