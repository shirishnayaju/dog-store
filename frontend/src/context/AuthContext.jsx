import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import axios from "axios";
import { GoogleOAuthProvider } from "@react-oauth/google";
import {jwtDecode} from "jwt-decode";
import { useToast } from "./ToastContext"; // Import the toast context

// Create AuthContext
const AuthContext = createContext(null);

// Custom hook - Declare inside the same file for consistency
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Create the provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  // We can't use useToast here directly since this is outside of a component's render
  // We'll use a different approach for the provider
  
  // Initialize user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse stored user data", e);
        localStorage.removeItem("user");
      }
    }
    setIsInitialized(true);
  }, []);

  // Update user function - needed for profile updates
  const updateUser = useCallback((userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    return {
      showToast: {
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
        type: "success",
        duration: 3000
      }
    };
  }, []);

  // Login function - using useCallback to maintain reference stability
  const login = useCallback(async (email, password) => {
    try {
      const response = await axios.post("http://localhost:4001/user/login", {
        email,
        password,
      });

      console.log("Full Response from Backend:", response.data);

      // Ensure user data is correctly extracted
      const userData = response.data?.user;
      if (!userData) {
        throw new Error("User data is missing in response");
      }

      console.log("Extracted User Data:", userData);

      // Save user data to state and local storage
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));

      // Instead of alert, we'll return an object with a showToast property
      return { userData, showToast: {
        title: "Login Successful", 
        description: `Welcome back, ${userData.name}!`, 
        type: "success",
        duration: 3000
      }};
    } catch (error) {
      console.error("Login Error:", error);

      if (error.response?.data?.message === "Incorrect password") {
        throw new Error("Incorrect password. Please try again.");
      } else if (error.response?.data?.message === "User not found") {
        throw new Error("User not found. Please check your email.");
      } else {
        throw new Error("Login failed. Please try again later.");
      }
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("user");
    
    // Return toast data instead of showing alert
    return {
      showToast: {
        title: "Logout Successful",
        description: "You have been logged out successfully.",
        type: "info",
        duration: 3000
      }
    };
  }, []);

  // Signup function
  const signup = useCallback(async (name, email, password) => {
    try {
      const response = await axios.post("http://localhost:4001/user/signup", {
        name,
        email,
        password,
      });

      // After signup, we need to log the user in to get their full profile including role
      const loginResponse = await axios.post("http://localhost:4001/user/login", {
        email,
        password,
      });

      const userData = loginResponse.data?.user;
      if (!userData) {
        throw new Error("Signup failed. User data missing.");
      }

      console.log("Signup Success:", userData);

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));

      // Return user data and toast info
      return { userData, showToast: {
        title: "Signup Successful",
        description: `Welcome to Gharpaluwa, ${userData.name}!`,
        type: "success",
        duration: 3000
      }};
    } catch (error) {
      console.error("Signup Error:", error);
      throw error;
    }
  }, []);

  // Signup with Google
  const signupWithGoogle = useCallback(() => {
    window.location.href = "http://localhost:3000/auth/google";
  }, []);

  // Login with Google
  const loginWithGoogle = useCallback(async (googleCredential) => {
    try {
      // Decode the JWT token to get user info
      const decoded = jwtDecode(googleCredential);
      console.log("Google login data:", decoded);
      
      // Check if user exists and log them in
      const response = await axios.post("http://localhost:4001/user/login-with-google", {
        email: decoded.email,
        googleData: decoded
      });
      
      const userData = response.data?.user;
      if (!userData) {
        throw new Error("Login failed. User data missing.");
      }
      
      console.log("Google Login Success:", userData);
      
      // Save user data to state and local storage
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      
      // Return user data and toast info
      return { userData, showToast: {
        title: "Google Login Successful",
        description: `Welcome back, ${userData.name}!`,
        type: "success",
        duration: 3000
      }};
    } catch (error) {
      console.error("Google Login Error:", error);
      
      // If user doesn't exist, we may want to redirect to signup
      if (error.response?.status === 404) {
        throw new Error("No account found for this Google user. Please sign up first.");
      } else {
        throw new Error("Login with Google failed. Please try again later.");
      }
    }
  }, []);

  // Create a stable value object with useCallback
  const contextValue = {
    user,
    isInitialized,
    login,
    logout,
    signup,
    signupWithGoogle,
    loginWithGoogle,
    updateUser // Add this to the context value
  };

  return (
    <GoogleOAuthProvider 
      clientId="520016725734-7mq3cl77tq37cm20tqss1j99q8kfrtoa.apps.googleusercontent.com"
      onScriptLoadError={(error) => console.error("Google script load error:", error)}
      onError={(error) => {
        console.error("Google OAuth error:", error);
        // Log detailed error information for debugging
        if (error.type === "idpiframe_initialization_failed") {
          console.log("Google initialization failed. Details:", error.details);
          console.log("Current origin:", window.location.origin);
          console.log("If you're seeing origin_mismatch errors, make sure this origin is registered in Google Cloud Console");
        }
      }}
    >
      <AuthContext.Provider value={contextValue}>
        {children}
      </AuthContext.Provider>
    </GoogleOAuthProvider>
  );
}