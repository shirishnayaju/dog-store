import User from "../model/user.model.js";
import bcryptjs from "bcryptjs";
import { otpStore } from "../utils/otpStore.js";
import { generateToken } from "../middleware/auth.js";

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

    // Generate JWT token for the new user
    const token = generateToken(newUser);

    res.status(201).json({ 
      message: "User created successfully",
      token,
      user: {
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        _id: newUser._id
      }
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Login - UPDATED to include token
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

    // Generate JWT token
    const token = generateToken(user);

    // Include token and user data in response
    res.status(200).json({ 
      message: "Login successful", 
      token,
      user: { 
        name: user.name, 
        email: user.email, 
        role: user.role,
        _id: user._id
      } 
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Login with Google
export const loginWithGoogle = async (req, res) => {
  try {
    const { email, googleData } = req.body;
    
    if (!email || !googleData) {
      return res.status(400).json({ message: "Email and Google account data are required" });
    }
    
    // Find the user by email
    const user = await User.findOne({ email });
    
    // If user doesn't exist, return error suggesting to sign up
    if (!user) {
      return res.status(404).json({ message: "No account found with this Google email. Please sign up first." });
    }
    
    // Generate JWT token
    const token = generateToken(user);
    
    // Return token and user data
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        _id: user._id
      }
    });
    
  } catch (error) {
    console.error("Google login error:", error);
    res.status(500).json({ message: "Server error during Google login" });
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

// Update a user by ID - For editing customer names
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    // Validate request
    if (!name || name.trim() === '') {
      return res.status(400).json({ message: "Name is required" });
    }

    // Find and update the user
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ message: "Failed to update user", error: error.message });
  }
};

// Delete a user by ID
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedUser = await User.findByIdAndDelete(id);
    
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(200).json({ message: "User deleted successfully", _id: id });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Failed to delete user", error: error.message });
  }
};

// Google Sign-up - Creates a user account with Google data
export const completeGoogleSignup = async (req, res) => {
  try {
    const { googleData } = req.body;
    
    if (!googleData || !googleData.email || !googleData.name) {
      return res.status(400).json({ message: "Google account data is incomplete" });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: googleData.email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }
    
    // Generate a random password since Google OAuth doesn't provide one
    const randomPassword = Math.random().toString(36).slice(-10);
    const hashPassword = await bcryptjs.hash(randomPassword, 10);
    
    // Create new user with Google data
    const newUser = new User({
      name: googleData.name,
      email: googleData.email,
      password: hashPassword,
      // You can add additional fields like googleId if needed
    });
    
    await newUser.save();
    
    // Generate JWT token
    const token = generateToken(newUser);
    
    res.status(201).json({ 
      message: "User created successfully with Google account",
      token,
      user: {
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        _id: newUser._id
      }
    });
    
  } catch (error) {
    console.error("Google signup error:", error);
    res.status(500).json({ message: "Server error during Google signup" });
  }
};