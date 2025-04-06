import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import axios from "axios";

export default function VerifyOtp() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const { email } = location.state || {};  // Get email passed through navigation

  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data) => {
    setIsLoading(true);
    setMessage(null);

    try {
      // Use the email from location.state
      console.log("Verifying OTP for:", email);
      console.log("Entered OTP:", data.otp);

      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4001/api";
      const response = await axios.post(`${API_URL}/otp/verify-otp`, {
        email: email, // Use the email from location.state
        otp: data.otp
      });

      console.log("OTP verified successfully:", response.data);
      setMessage("✅ OTP is verified. You can now reset your password.");

      // Navigate to reset password page
      setTimeout(() => {
        navigate("/ResetPassword", { state: { email: email } });
      }, 2000);
    } catch (error) {
      console.error("Error verifying OTP:", error);
      setMessage(
        error.response?.data?.message || "❌ Invalid or expired OTP. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 border rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Verify OTP</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input
            type="email"
            id="email"
            value={email || ""}
            disabled
            className="bg-gray-100"
          />
          {/* Adding a hidden input to register the email */}
          <input type="hidden" {...register("email")} value={email || ""} />
        </div>

        <div>
          <Label htmlFor="otp">OTP</Label>
          <Input
            type="text"
            id="otp"
            placeholder="Enter the OTP sent to your email"
            {...register("otp", {
              required: "OTP is required",
              minLength: {
                value: 6,
                message: "OTP must be 6 digits"
              }
            })}
            className={errors.otp ? "border-red-500" : ""}
          />
          {errors.otp && (
            <p className="text-red-500 text-sm mt-1">{errors.otp.message}</p>
          )}
        </div>

        {message && (
          <div
            className={`p-3 rounded ${message.includes("verified") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
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
              Verifying...
            </span>
          ) : (
            "Verify OTP"
          )}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Didn't receive the OTP?{" "}
          <Link to="/forgotpassword" className="text-blue-500 hover:underline font-medium">
            Resend OTP
          </Link>
        </p>
      </div>
    </div>
  );
}