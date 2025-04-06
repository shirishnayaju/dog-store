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
  
  const handleGoogleSignup = async (googleData) => {
    setIsSubmitting(true);
    setMessage(null);
    
    try {
      // For Google signup
      console.log("Processing Google signup");
      
      // First check if email already exists
      const checkResponse = await axios.post(`http://localhost:4001/user/check-email`, {
        email: data.email
      });
      
      if (checkResponse.data.exists) {
        setMessage("❌ This Google account is already registered. Please login instead.");
        return;
      }
      
      if (googleData.email_verified) {
        // If Google already verified the email, we still send to verification page
        // but can mark as "pre-verified"
        navigate('/verification-pending', { 
          state: { 
            googleData,
            email: googleData.email,
            method: 'google',
            preVerified: true
          }
        });
      } else {
        // If Google email isn't pre-verified, we'll need verification
        navigate('/verification-pending', { 
          state: { 
            googleData,
            email: googleData.email,
            method: 'google'
          }
        });
      }
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
    <div className="max-w-md mx-auto mt-8 p-6 border rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4 text-center">Sign Up</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input 
            type="text"
            id="name"
            placeholder="Enter your name"
            {...register("name", {
              required: "Name is required",
              minLength: {
                value: 2,
                message: "Name must be at least 2 characters"
              }
            })}
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input 
            type="email"
            id="email"
            placeholder="Enter your email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /\S+@\S+\.\S+/,
                message: "Invalid email address"
              }
            })}
            className={errors.email ? "border-red-500" : ""}
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input 
            type="password"
            id="password"
            placeholder="Create a password"
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters"
              }
            })}
            className={errors.password ? "border-red-500" : ""}
          />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
        </div>
        
        {message && (
          <div
            className={`p-3 rounded ${
              message.includes("✅") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            <p className="text-sm">{message}</p>
          </div>
        )}
        
        <Button 
          type="submit" 
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2 animate-spin" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            "Sign Up"
          )}
        </Button>
      </form>
      
      <div className="mt-4 flex items-center">
        <div className="flex-grow border-t border-gray-300"></div>
        <span className="px-3 text-gray-500 text-sm">OR</span>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>
      
      <div className="mt-4">
        <GoogleLogin
          onSuccess={handleGoogleSignup}
          onError={() => setMessage("❌ Google sign-in was unsuccessful. Please try again later.")}
          useOneTap
          className="w-full mt-4 flex items-center justify-center bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
          disabled={isSubmitting}
        />
      </div>
      
      <div className="border-t mt-6 pt-4 text-center">
        <p className="text-gray-600 text-sm">
          Already have an account? {" "}
          <Link to="/login" className="text-blue-600 font-medium hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}