import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

export default function ResetPassword() {
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      setMessage(null);
      
      if (!email) {
        setMessage("Email is required to reset password. Please go back to the forgot password page.");
        setIsLoading(false);
        return;
      }
      
      console.log('Resetting password for email:', email);
      
      // Simple direct approach - use the reset-password endpoint
      const resetResponse = await fetch(`http://localhost:4001/user/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          email: email,
          password: data.password 
        })
      });
      
      if (!resetResponse.ok) {
        const errorData = await resetResponse.json();
        throw new Error(errorData.message || "Failed to reset password");
      }
      
      const resetResult = await resetResponse.json();
      console.log('Password reset successful:', resetResult);
      
      setMessage("Password has been reset successfully!");
      
      // Navigate to login page after a brief delay
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (error) {
      console.error('Error resetting password:', error);
      setMessage(error.message || "Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // If email is missing, show instructions
  if (!email) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 border rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Reset Password</h1>
        <div className="bg-yellow-100 text-yellow-700 p-4 rounded mb-4">
          <p className="text-sm">
            No email provided. Please use the forgot password page to initiate a password reset.
          </p>
        </div>
        <Link to="/forgot-password">
          <Button className="w-full mt-4">Go to Forgot Password</Button>
        </Link>
      </div>
    );
  }
  
  return (
    <div className="max-w-md mx-auto mt-8 p-6 border rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Reset Password</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input 
            type="email" 
            id="email" 
            value={email} 
            disabled 
            className="bg-gray-100"
          />
        </div>
        
        <div>
          <Label htmlFor="password">New Password</Label>
          <Input 
            type="password" 
            id="password" 
            placeholder="Enter new password" 
            {...register("password", { 
              required: "Password is required",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters"
              },
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                message: "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character"
              }
            })} 
            className={errors.password ? "border-red-500" : ""}
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input 
            type="password" 
            id="confirmPassword" 
            placeholder="Confirm new password" 
            {...register("confirmPassword", { 
              required: "Please confirm your password",
              validate: value => value === watch('password') || "Passwords do not match"
            })} 
            className={errors.confirmPassword ? "border-red-500" : ""}
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>
        
        {message && (
          <div className={`p-3 rounded ${
            message.includes("successfully") 
              ? "bg-green-100 text-green-700" 
              : "bg-red-100 text-red-700"
          }`}>
            <p className="text-sm">{message}</p>
          </div>
        )}
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading}
        >
          {isLoading ? "Updating Password..." : "Update Password"}
        </Button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Remember your password? {" "}
          <Link to="/login" className="text-blue-500 hover:underline font-medium">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}