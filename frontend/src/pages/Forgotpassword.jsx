import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import axios from "axios";

export default function ForgotPassword() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const navigate = useNavigate();
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data) => {
    setIsLoading(true);
    setMessage(null);

    try {
      console.log("Sending OTP to:", data.email);

      // API Endpoint (uses environment variable)
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4001/api";
      const response = await axios.post(`${API_URL}/otp/send-otp`, { email: data.email });


      console.log("OTP sent successfully:", response.data);
      setMessage("✅ OTP has been sent to your email. Please check your inbox.");

      // Navigate to reset password page after delay
      setTimeout(() => {
        navigate("/VerifyOtp", {
          state: { email: data.email },
        });
      }, 2000);
    } catch (error) {
      console.error("Error sending OTP:", error);

      setMessage(
        error.response?.data?.message ||
        "❌ Failed to send OTP. Please try again later."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 border rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Forgot Password</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input
            type="email"
            id="email"
            placeholder="Enter your email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /\S+@\S+\.\S+/,
                message: "Invalid email address",
              },
            })}
            className={errors.email ? "border-red-500" : ""}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        {message && (
          <div
            className={`p-3 rounded ${
              message.includes("OTP has been sent") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            <p className="text-sm">{message}</p>
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isLoading || isSubmitting}>
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2 animate-spin" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              Sending...
            </span>
          ) : (
            "Send OTP"
          )}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Remember your password?{" "}
          <Link to="/login" className="text-blue-500 hover:underline font-medium">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
