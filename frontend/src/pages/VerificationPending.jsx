import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "../components/ui/dialog";
import axios from "axios";

export default function VerificationPending() {
  const location = useLocation();
  const navigate = useNavigate();
  const [verificationCode, setVerificationCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [message, setMessage] = useState(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  
  // Get user data from navigation state
  const userData = location.state || {};
  
  // API URL from environment variable
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4001/api";
  
  // Effect to handle initial OTP sending - runs only once on component mount
  useEffect(() => {
    // If we have email, send OTP immediately on component mount, but only once
    if (userData.email) {
      sendOTP(userData.email);
    }
  }, [userData.email]); // Only depends on userData.email
  
  // Separate effect to handle the timer
  useEffect(() => {
    let countdown;
    
    if (timer > 0) {
      countdown = setInterval(() => {
        setTimer(prevTimer => prevTimer - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    
    return () => {
      if (countdown) clearInterval(countdown);
    };
  }, [timer]);
  
  const sendOTP = async (email) => {
    setIsSubmitting(true);
    setMessage(null);
    
    try {
      console.log("Sending OTP to:", email);
      
      const response = await axios.post(`${API_URL}/otp/send-otp`, { 
        email: email,
        purpose: 'verification' // Specify this is for account verification
      });
      
      console.log("OTP sent successfully:", response.data);
      setMessage("✅ Verification code has been sent to your email. Please check your inbox.");
      setCanResend(false);
      setTimer(60);
    } catch (error) {
      console.error("Error sending OTP:", error);
      
      setMessage(
        error.response?.data?.message ||
        "❌ Failed to send verification code. Please try again later."
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleVerify = async () => {
    if (!verificationCode.trim()) {
      setMessage("Please enter the verification code");
      return;
    }
    
    setIsSubmitting(true);
    setMessage(null);
    
    // Trim the verification code to remove any accidental whitespace
    const trimmedCode = verificationCode.trim();
    
    try {
      console.log("Attempting to verify OTP:", {
        email: userData.email,
        otp: trimmedCode
      });
      
      // Verify the OTP
      const response = await axios.post(`${API_URL}/otp/verify-otp`, {
        email: userData.email,
        otp: trimmedCode
      });
      
      console.log("Verification response:", response.data);
      
      // Check if the response message indicates success
      // Updated this condition to check the message property instead of verified
      if (response.data.message && response.data.message.includes("successfully")) {
        // Once verified, complete the signup process
        try {
          if (userData.method === 'email') {
            console.log("Completing email signup for:", userData.email);
            await axios.post("http://localhost:4001/user/signup", {
              name: userData.name,
              email: userData.email,
              password: userData.password
            });
          } else if (userData.method === 'google') {
            console.log("Completing Google signup with data:", userData.googleData);
            await axios.post(`${API_URL}/auth/complete-google-signup`, {
              googleData: userData.googleData
            });
          }
          
          setMessage("✅ Email verified successfully! Your account has been created.");
          
          // Show the success dialog instead of just a message
          setShowSuccessDialog(true);
          
          // Navigate to login page after successful account creation and dialog display
          // Timer moved to the dialog close handler
        } catch (accountError) {
          console.error("Error creating account:", accountError);
          setMessage(
            accountError.response?.data?.message ||
            "❌ Verification successful, but account creation failed. Please contact support."
          );
        }
      } else {
        setMessage("❌ Invalid verification code. Please try again.");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      console.error("Error details:", error.response?.data);
      
      if (error.response?.status === 401) {
        setMessage("❌ Invalid verification code. Please check and try again.");
      } else if (error.response?.status === 410) {
        setMessage("❌ Verification code has expired. Please request a new code.");
        setCanResend(true);
        setTimer(0);
      } else {
        setMessage(
          error.response?.data?.message ||
          "❌ Verification failed. Please try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleSuccessDialogClose = () => {
    setShowSuccessDialog(false);
    // Navigate to login page after closing the dialog
    navigate('/login');
  };
  
  const handleResendCode = async () => {
    if (userData.email) {
      await sendOTP(userData.email);
    }
  };
  
  if (!userData.email) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 border rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold mb-4">Invalid Session</h1>
        <p className="mb-4">No email address found. Please return to the signup page.</p>
        <Button onClick={() => navigate('/signup')}>Back to Signup</Button>
      </div>
    );
  }
  
  return (
    <div className="max-w-md mx-auto mt-8 p-6 border rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4 text-center">Verify Your Email</h1>
      <p className="mb-6">
        We've sent a verification code to <strong>{userData.email}</strong>. 
        Please check your inbox and enter the code below to complete your registration.
      </p>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="verificationCode">Verification Code</Label>
          <Input
            id="verificationCode"
            type="text"
            placeholder="Enter verification code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            className="text-center tracking-wider text-lg font-mono"
          />
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
          onClick={handleVerify}
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2 animate-spin" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              Verifying...
            </span>
          ) : (
            "Verify and Create Account"
          )}
        </Button>
        
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600 mb-2">
            Didn't receive the code?
          </p>
          <Button
            variant="outline"
            onClick={handleResendCode}
            disabled={!canResend || isSubmitting}
            className="text-sm"
          >
            {!canResend ? `Resend in ${timer}s` : "Resend Code"}
          </Button>
        </div>
      </div>
      
      {/* Success Dialog Popup */}
      <Dialog
        open={showSuccessDialog}
        onOpenChange={setShowSuccessDialog}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Signup Successful!
            </DialogTitle>
            <DialogDescription>
              Your account has been created successfully. Now please login to use our features.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleSuccessDialogClose} className="w-full">
              Login
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}