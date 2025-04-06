import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login } = useAuth();
  const [loginError, setLoginError] = useState(null);
  const navigate = useNavigate();
  
  // Handle form submission
  const onSubmit = async (data) => {
    try {
      console.log('Attempting login...');
      const userData = await login(data.email, data.password);
      console.log('Login function completed');
      console.log('User data from server:', userData); // Debug output
      
      // Handle navigation here after successful login
      if (userData.role === "admin") {
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
    }
  };
  
  return (
    <div className="max-w-md mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            id="email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /\S+@\S+\.\S+/,
                message: "Invalid email address"
              }
            })}
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            type="password"
            id="password"
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters"
              }
            })}
          />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
        </div>
        {loginError && (
          <div className="text-red-500 text-sm mt-1">
            {loginError}
            <div className="text-right">
              <Link to="/Forgotpassword" className="text-red-500 hover:underline">Forgot Password?</Link>
            </div>
          </div>
        )}
        <Button type="submit" className="w-full">Login</Button>
      </form>
      <div className="border-t p-4 text-center">
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