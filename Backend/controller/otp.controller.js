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

// Function to send OTP via email with improved design
const sendOTPEmail = async (email, otp) => {
  // Company logo HTML
  const logoHtml = `
    <div style="text-align: center; margin-bottom: 20px;">
      <img src="https://scontent.fktm21-2.fna.fbcdn.net/v/t39.30808-6/299602768_486726786790155_4876935833175453117_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=ytDg_olhTFcQ7kNvwGKXe6y&_nc_oc=Adm6CM1oL1K2Vo39kD-YK0u7zmVnP0qTRio7C8uxESXwveen6xCIiA36-935tTxJd0yw7EAXty_fIgZn4wWzSlFQ&_nc_zt=23&_nc_ht=scontent.fktm21-2.fna&_nc_gid=4xm9OkBeERVxS1S5cgPtMw&oh=00_AfE_noDDL3f8lQHBErPeibuKHRpfp7qWBbFU0IWjT2IjLw&oe=67F9E2DA" alt="GharPaluwa Logo" style="max-width: 150px; height: auto;" />
      <h2 style="color: #3b82f6; text-align: center; margin-top: 10px;">GharPaluwa</h2>
    </div>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: email,
    subject: "OTP CODE",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
        ${logoHtml}
        <h2 style="color: #3b82f6; text-align: center;">Your OTP Code</h2>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0; text-align: center;">
          <p style="margin-bottom: 10px;">Your OTP Code is:</p>
          <h1 style="color: #333; letter-spacing: 5px; margin: 10px 0; font-size: 32px;">${otp}</h1>
          <p style="margin-top: 10px; color: #666; font-size: 14px;">This code will expire in 10 minutes</p>
        </div>
        <p>If you didn't request this password reset, please ignore this email or contact our support team if you have concerns.</p>
        <p style="margin-top: 30px;">Best regards,<br>The GharPaluwa Team</p>
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
  const { email } = req.body;

  const otp = generateOTP();
  otpStore.set(email, { otp, expiresAt: Date.now() + 10 * 60 * 1000 }); // OTP expires in 10 minutes

  console.log(`Generated OTP for ${email}: ${otp}`);

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