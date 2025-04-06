import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import axios from "axios";
import { GoogleOAuthProvider } from "@react-oauth/google";

// Create AuthContext
const AuthContext = createContext(null);

// Create the provider component
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

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

      alert("Login successful!");
      
      // Return the user data so the component can handle navigation
      return userData;
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
    alert("Logout successful!");
    // We'll let the component handle navigation after logout
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

      alert("Signup successful!");
      return userData;
    } catch (error) {
      console.error("Signup Error:", error);
      alert(error.response?.data?.message || "Signup failed.");
      throw error;
    }
  }, []);

  // Signup with Google
  const signupWithGoogle = useCallback(() => {
    window.location.href = "http://localhost:3000/auth/google";
  }, []);

  // Create a stable value object with useCallback
  const contextValue = {
    user,
    isInitialized,
    login,
    logout,
    signup,
    signupWithGoogle
  };

  return (
    <GoogleOAuthProvider clientId="520016725734-7mq3cl77tq37cm20tqss1j99q8kfrtoa.apps.googleusercontent.com">
      <AuthContext.Provider value={contextValue}>
        {children}
      </AuthContext.Provider>
    </GoogleOAuthProvider>
  );
};

// Custom hook - declared separately with const
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Export both separately
export { AuthProvider, useAuth };