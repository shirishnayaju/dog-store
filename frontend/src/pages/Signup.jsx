import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { GoogleLogin } from '@react-oauth/google';
import axios from "axios";

export default function Signup() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  
  // API URL from environment variable
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4001/";
  
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setMessage(null);
    
    try {
      // Check if email is already registered
      const checkResponse = await axios.post(`http://localhost:4001/user/check-email`, {
        email: data.email
      });
      
      if (checkResponse.data.exists) {
        setMessage("❌ This email is already registered. Please login instead.");
        return;
      }
      
      // Store user data temporarily
      // We'll create the user only after verification
      console.log("Initiating signup for:", data.email);
      
      // Navigate to verification page with user data
      navigate('/verification-pending', { 
        state: { 
          name: data.name,
          email: data.email,
          password: data.password,
          method: 'email'
        }
      });
    } catch (error) {
      console.error("Error during signup:", error);
      
      setMessage(
        error.response?.data?.message ||
        "❌ Failed to initiate signup. Please try again later."
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleGoogleSignup = async (credentialResponse) => {
    setIsSubmitting(true);
    setMessage(null);
    
    try {
      // Decode the JWT token to get user info
      const decoded = jwt_decode(credentialResponse.credential);
      console.log("Processing Google signup with data:", decoded);
      
      // First check if email already exists
      const checkResponse = await axios.post(`${API_URL}/user/check-email`, {
        email: decoded.email
      });
      
      if (checkResponse.data.exists) {
        setMessage("❌ This Google account is already registered. Please login instead.");
        return;
      }
      
      // Navigate to verification page with Google data
      navigate('/verification-pending', { 
        state: { 
          googleData: decoded,
          email: decoded.email,
          name: decoded.name,
          method: 'google',
          preVerified: decoded.email_verified
        }
      });
    } catch (error) {
      console.error("Error during Google signup:", error);
      
      setMessage(
        error.response?.data?.message ||
        "❌ Failed to process Google signup. Please try again later."
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="max-w-md mx-auto mt-12 p-8 border rounded-xl shadow-lg bg-white">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800">Create Account</h1>
        <p className="text-gray-600 mt-2">Join us today and start your journey</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-gray-700 font-medium">Full Name</Label>
          <Input 
            type="text"
            id="name"
            placeholder="Enter your full name"
            {...register("name", {
              required: "Name is required",
              minLength: {
                value: 2,
                message: "Name must be at least 2 characters"
              }
            })}
            className={`h-11 px-4 ${errors.name ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200"}`}
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-700 font-medium">Email Address</Label>
          <Input 
            type="email"
            id="email"
            placeholder="you@example.com"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /\S+@\S+\.\S+/,
                message: "Invalid email address"
              }
            })}
            className={`h-11 px-4 ${errors.email ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200"}`}
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
            <span className="text-xs text-gray-500">Minimum 6 characters</span>
          </div>
          <Input 
            type="password"
            id="password"
            placeholder="••••••••"
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters"
              }
            })}
            className={`h-11 px-4 ${errors.password ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200"}`}
          />
          {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
        </div>
        
        {message && (
          <div
            className={`p-4 rounded-lg ${
              message.includes("✅") ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            <p className="text-sm font-medium">{message}</p>
          </div>
        )}
        
        <Button 
          type="submit" 
          className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2 animate-spin" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              Creating Account...
            </span>
          ) : (
            "Sign Up"
          )}
        </Button>
      </form>
      
      <div className="mt-6 flex items-center">
        <div className="flex-grow border-t border-gray-200"></div>
        <span className="px-4 text-gray-500 text-sm font-medium">OR CONTINUE WITH</span>
        <div className="flex-grow border-t border-gray-200"></div>
      </div>
      
      <div className="mt-6">
        <GoogleLogin
          onSuccess={handleGoogleSignup}
          onError={() => setMessage("❌ Google sign-in was unsuccessful. Please try again later.")}
          useOneTap
          className="w-full flex items-center justify-center"
          disabled={isSubmitting}
        />
      </div>
      
      <div className="mt-8 pt-4 text-center">
        <p className="text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 font-semibold hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}