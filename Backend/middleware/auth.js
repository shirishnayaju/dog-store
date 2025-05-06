import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get JWT secret from environment variables or use a default (for development only)
const JWT_SECRET = process.env.JWT_SECRET || "gharpaluwa_secret_key_should_be_in_env";

// Middleware to verify JWT token
export const verifyToken = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "Access denied. No token provided" });
    }
    
    // Extract token (remove 'Bearer ' prefix)
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided" });
    }
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Add user data from token to request object
    req.user = decoded;
    
    // Continue to the next middleware or route handler
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    res.status(401).json({ message: "Invalid token" });
  }
};

// Generate JWT token
export const generateToken = (user) => {
  // Create payload with user data (do not include sensitive data like password)
  const payload = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
  };
  
  // Sign token with secret and set expiration (24 hours)
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
};