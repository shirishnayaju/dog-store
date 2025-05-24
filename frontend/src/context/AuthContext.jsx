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
  const [token, setToken] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Set up axios interceptor for authentication
  useEffect(() => {
    // Configure axios to use the token in all requests
    const interceptor = axios.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
    
    // Clean up interceptor when component unmounts
    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, [token]);
  
  // Initialize user and token from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    
    if (storedUser && storedToken) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setToken(storedToken);
        
        // Set default authorization header for all requests
        axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
      } catch (e) {
        console.error("Failed to parse stored user data", e);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
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
      // Validate inputs before sending request
      if (!email) {
        throw new Error("Email is required");
      }
      
      if (!password) {
        throw new Error("Password is required");
      }

      console.log("Sending login request to backend with email:", email);
      
      const response = await axios.post("http://localhost:4001/user/login", {
        email,
        password,
      });

      console.log("Full Response from Backend:", response.data);

      // Extract user data and token
      const userData = response.data?.user;
      const authToken = response.data?.token;
      
      if (!userData || !authToken) {
        throw new Error("Authentication data is missing in response");
      }

      console.log("Extracted User Data:", userData);

      // Save user data and token to state and local storage
      setUser(userData);
      setToken(authToken);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", authToken);
      
      // Set default authorization header
      axios.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;

      // Return user data and toast info
      return { userData, showToast: {
        title: "Login Successful", 
        description: `Welcome back, ${userData.name}!`, 
        type: "success",
        duration: 3000
      }};    } catch (error) {
      console.error("Login Error:", error);
      
      // Log detailed error information
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);
        
        if (error.response.status === 400) {
          if (error.response.data.message === "Email and password are required") {
            throw new Error("Email and password are required. Please fill in all fields.");
          } else if (error.response.data.message === "Invalid credentials") {
            throw new Error("Invalid email or password. Please try again.");
          } else {
            throw new Error(error.response.data.message || "Invalid request. Please check your inputs.");
          }
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error("No response received:", error.request);
        throw new Error("No response from server. Please try again later.");
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Request setup error:", error.message);
      }
      
      // Default error message
      throw new Error(error.message || "Login failed. Please try again later.");
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    
    // Return toast data
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

      // Extract user data and token from the response
      const userData = response.data?.user;
      const authToken = response.data?.token;
      
      if (!userData || !authToken) {
        throw new Error("Authentication data is missing in response");
      }

      console.log("Signup Success:", userData);

      // Save user data and token
      setUser(userData);
      setToken(authToken);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", authToken);
      
      // Set default authorization header
      axios.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;

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
      
      // Extract user data and token
      const userData = response.data?.user;
      const authToken = response.data?.token;
      
      if (!userData || !authToken) {
        throw new Error("Authentication data is missing in response");
      }
      
      console.log("Google Login Success:", userData);
      
      // Save user data and token
      setUser(userData);
      setToken(authToken);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", authToken);
      
      // Set default authorization header
      axios.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;
      
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

  // Check if the token is valid and renew if needed
  const checkToken = useCallback(async () => {
    if (!token) return false;
    
    try {
      // You can implement a token verification endpoint in your backend
      // For now, we'll just decode and check expiration
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      
      if (decoded.exp < currentTime) {
        // Token is expired, log the user out
        logout();
        return false;
      }
      return true;
    } catch (error) {
      console.error("Token validation error:", error);
      logout();
      return false;
    }
  }, [token, logout]);

  // Create a stable value object with useCallback
  const contextValue = {
    user,
    token,
    isInitialized,
    login,
    logout,
    signup,
    signupWithGoogle,
    loginWithGoogle,
    updateUser,
    checkToken
  };

  return (
    <GoogleOAuthProvider 
      clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || "520016725734-7mq3cl77tq37cm20tqss1j99q8kfrtoa.apps.googleusercontent.com"}
      onScriptLoadSuccess={() => console.log("Google OAuth script loaded successfully")}
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