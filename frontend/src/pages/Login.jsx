import React, { useState } from 'react'; 
import { useForm } from 'react-hook-form'; 
import { Link, useNavigate } from 'react-router-dom'; 
import { Button } from "../components/ui/button"; 
import { Input } from "../components/ui/input"; 
import { Label } from "../components/ui/label"; 
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { useToast } from '../context/ToastContext'; // Import the toast hook

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login, loginWithGoogle } = useAuth();
  const { addToast } = useToast(); // Use the toast hook
  const [loginError, setLoginError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  
  // Handle Google login
  const handleGoogleLogin = async (credentialResponse) => {
    setIsSubmitting(true);
    setLoginError(null);
    
    try {
      console.log('Attempting Google login with credential:', credentialResponse.credential.substring(0, 10) + '...');
      console.log('Current origin:', window.location.origin);
      const response = await loginWithGoogle(credentialResponse.credential);
      
      // Show toast notification
      if (response?.showToast) {
        addToast(response.showToast);
      }
      
      // Handle navigation after successful login
      if (response.userData.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error('Google login error:', error);
      setLoginError(error.message || "Login with Google failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
    // Handle form submission
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setLoginError(null);
    
    try {
      console.log('Attempting login with:', { email: data.email, password: data.password ? '********' : 'undefined' });
      const response = await login(data.email, data.password);
      console.log('Login function completed successfully', response);
      
      // Show toast notification
      if (response?.showToast) {
        addToast(response.showToast);
      }
      
      // Handle navigation here after successful login
      if (response.userData.role === "admin") {
        console.log("User is an admin. Redirecting to /admin");
        navigate("/admin");
      } else {
        console.log("User is not an admin. Redirecting to /");
        navigate("/");
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.message === "Incorrect password") {
        setLoginError("Incorrect password. Please try again.");
      } else {
        setLoginError("Login failed. Please check your credentials and try again.");
      }
      
      // Show error toast
      addToast({
        title: "Login Failed",
        description: error.message || "Please check your credentials and try again.",
        type: "error",
        duration: 4000
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="max-w-md mx-auto mt-8 p-6 border rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4 text-center">Login to Gharpaluwa</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
          <div className="flex justify-between items-center">
            <Label htmlFor="password">Password</Label>
            <Link to="/forgotpassword" className="text-blue-600 text-xs hover:underline">
              Forgot Password?
            </Link>
          </div>
          <Input 
            type="password"
            id="password"
            placeholder="Enter your password"
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
        
        {loginError && (
          <div className="p-3 rounded bg-red-100 text-red-700">
            <p className="text-sm">{loginError}</p>
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
              Logging in...
            </span>
          ) : (
            "Login"
          )}
        </Button>
      </form>
      
      <div className="mt-6">
        <GoogleLogin
          onSuccess={handleGoogleLogin}
          onError={(error) => {
            console.error("Google login error:", error);
            setLoginError("Google sign-in was unsuccessful. Please try again later.");
          }}
          useOneTap
          className="w-full flex items-center justify-center"
          disabled={isSubmitting}
          onGoogleScriptLoadError={(error) => console.error("Google script load error:", error)}
          cookiePolicy={'single_host_origin'}
        />
      </div>
      
      <div className="border-t mt-6 pt-4 text-center">
        <p className="text-gray-600 text-sm">
          New to Gharpaluwa?{" "}
          <Link to="/signup" className="text-blue-600 font-medium hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}