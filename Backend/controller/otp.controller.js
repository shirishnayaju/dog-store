import { otpStore } from "../utils/otpStore.js"; // Import the OTP store
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Create a transporter for sending OTPs via email
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Function to generate OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Function to send OTP via email
const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: email,
    subject: "Password Reset OTP",
    html: `<p>Your OTP for password reset is: <strong>${otp}</strong></p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

// Send OTP Endpoint
export const sendOtp = async (req, res) => {
  const { email } = req.body;

  const otp = generateOTP();
  otpStore.set(email, { otp, expiresAt: Date.now() + 10 * 60 * 1000 }); // OTP expires in 10 minutes

  console.log(`Generated OTP for ${email}: ${otp}`);  // Log the OTP
  
  // Verify if the OTP is being saved properly
  console.log("Current OTP store:", otpStore);  

  const emailSent = await sendOTPEmail(email, otp);
  if (emailSent) {
    return res.status(200).json({ message: "OTP sent to your email" });
  }

  res.status(500).json({ message: "Failed to send OTP" });
};

// OTP Verification Endpoint
export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  const otpData = otpStore.get(email); // Retrieve OTP data

  console.log("OTP Data Retrieved:", otpData);
  console.log("Entered OTP:", otp);
  console.log("Current Time:", Date.now());
  console.log("OTP Expiry Time:", otpData?.expiresAt);

  if (!otpData || otpData.otp !== otp || Date.now() > otpData.expiresAt) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  res.status(200).json({ message: "OTP verified successfully" });
};
