import User from "../model/user.model.js";
import bcryptjs from "bcryptjs";
import { otpStore } from "../utils/otpStore.js";

// Signup
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    const hashPassword = await bcryptjs.hash(password, 10);
    const newUser = new User({ name, email, password: hashPassword });
    await newUser.save();

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Login - UPDATED to include role
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Include role in the response
    res.status(200).json({ 
      message: "Login successful", 
      user: { 
        name: user.name, 
        email: user.email, 
        role: user.role 
      } 
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Forgot Password (Send OTP)
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP with expiration (30 minutes)
    const expiresAt = Date.now() + 30 * 60 * 1000;
    otpStore.set(email, { otp, expiresAt });

    // In a real application, you would send the OTP via email here
    // For development, we'll just log it
    console.log(`OTP for ${email}: ${otp}`);

    res.status(200).json({ message: "OTP sent to your email" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Reset Password (without OTP requirement)
export const resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate request fields
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Hash the new password and update
    user.password = await bcryptjs.hash(password, 10);
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Find user by email - Utility endpoint for the frontend
export const findUserByEmail = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    
    // Include role in the response
    res.status(200).json({ 
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    console.error("Find user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all users - For admin purposes
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.status(200).json(users);
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Check if email exists
export const checkEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    res.status(200).json({ exists: !!user });
  } catch (error) {
    console.error("Check email error:", error);
    res.status(500).json({ message: "Server error" });
  }
};