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

// Function to send OTP via email with professional design
const sendOTPEmail = async (email, otp, purpose = 'reset') => {
  // Use project logo instead of random image
  const logoHtml = `
    <div style="text-align: center; margin-bottom: 20px;">
      <img src="https://i.ibb.co/6Yfh9FJ/logo.jpg" alt="GharPaluwa Logo" style="max-width: 100px; height: auto; border-radius: 10px;" />
    </div>
  `;

  // Determine email purpose text
  const purposeText = purpose === 'verification' 
    ? 'account verification' 
    : 'password reset';
  
  const subject = purpose === 'verification'
    ? 'GharPaluwa - Account Verification Code'
    : 'GharPaluwa - Password Reset Code';

  const mailOptions = {
    from: `"GharPaluwa Pet Services" <${process.env.EMAIL_USERNAME}>`,
    to: email,
    subject: subject,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e1e4e8; border-radius: 10px; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        ${logoHtml}
        <h2 style="color: #4338ca; text-align: center; margin-top: 0; font-size: 24px;">GharPaluwa Pet Services</h2>
        <p style="color: #4b5563; text-align: center; margin-bottom: 25px; font-size: 16px;">Your trusted partner for pet care</p>
        
        <div style="background-color: #f9fafb; padding: 25px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4338ca;">
          <h3 style="color: #111827; margin-top: 0; text-align: center;">Your Verification Code</h3>
          <p style="color: #4b5563; text-align: center; margin-bottom: 15px;">Please use the following code to complete your ${purposeText}:</p>
          <div style="background-color: #ffffff; border: 1px dashed #d1d5db; padding: 15px; border-radius: 8px; text-align: center; margin: 0 auto; max-width: 240px;">
            <h1 style="color: #4338ca; letter-spacing: 8px; margin: 0; font-size: 32px; font-family: monospace;">${otp}</h1>
          </div>
          <p style="color: #6b7280; font-size: 14px; text-align: center; margin-top: 15px;">This code will expire in <strong>10 minutes</strong></p>
        </div>
        
        <p style="color: #4b5563; margin-top: 25px; font-size: 14px;">If you didn't request this ${purposeText}, please ignore this email or contact our support team.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
          <p style="margin-bottom: 5px;">© ${new Date().getFullYear()} GharPaluwa Pet Services. All rights reserved.</p>
          <p style="margin-bottom: 5px;">Bhaktapur, Nepal</p>
          <p>
            <a href="https://gharpaluwa.netlify.app/" style="color: #4338ca; text-decoration: none;">Our Website</a> | 
            <a href="mailto:support@gharpaluwa.com" style="color: #4338ca; text-decoration: none;">Contact Support</a>
          </p>
        </div>
      </div>
    `,
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
  const { email, purpose = 'reset' } = req.body;

  // Check if an OTP already exists and is not expired
  const existingOtp = otpStore.get(email);
  const currentTime = Date.now();
  
  // If OTP was generated less than 30 seconds ago, don't generate a new one to prevent duplicate emails
  if (existingOtp && existingOtp.createdAt && (currentTime - existingOtp.createdAt) < 30000) {
    return res.status(200).json({ 
      message: "OTP was recently sent to your email. Please check your inbox or wait 30 seconds to request a new one."
    });
  }

  const otp = generateOTP();
  
  // Store OTP with expiry time and creation time
  otpStore.set(email, { 
    otp, 
    expiresAt: currentTime + 10 * 60 * 1000, // OTP expires in 10 minutes
    createdAt: currentTime 
  });

  console.log(`Generated OTP for ${email}: ${otp} (Purpose: ${purpose})`);
  
  // Send email with purpose parameter
  const emailSent = await sendOTPEmail(email, otp, purpose);
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