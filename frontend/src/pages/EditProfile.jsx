"use client";

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "../components/ui/button";
import { useAuth } from "../context/AuthContext";
import { UserCircle, Save, ArrowLeft, Key } from 'lucide-react';

export default function EditProfile() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  useEffect(() => {
    if (user) {
      setName(user.name || "");
    }
  }, [user]);
  
  const handleNameChange = (e) => {
    setName(e.target.value);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    if (!user || !user.email) {
      setError("User information not available");
      setIsLoading(false);
      return;
    }
    
    try {
      // Using the user/users endpoint with email
      const apiUrl = `http://localhost:4001/user/users/email/${encodeURIComponent(user.email)}`;
      console.log("Making API request to:", apiUrl);
      
      const response = await axios.put(
        apiUrl,
        { name: name },
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
      
      console.log("Response:", response.data);
      
      // Update local user data
      updateUser({
        ...user,
        name: name
      });
      
      setSuccess("Profile updated successfully");
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.response?.data?.message || err.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCancel = () => {
    navigate("/profile");
  };
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 flex items-center">
        <UserCircle className="mr-2" /> Edit Profile
      </h1>
      
      <div className="bg-white rounded-xl shadow-lg p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
            {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={handleNameChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-md font-semibold mb-2 text-gray-700 flex items-center">
              <Key className="mr-2 w-4 h-4" /> Password Management
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              Need to change your password? Use our password reset feature.
            </p>
            <Link 
              to="/ForgotPassword" 
              className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center"
            >
              Reset password <ArrowLeft className="ml-1 w-3 h-3 rotate-180" />
            </Link>
          </div>
          
          <div className="flex justify-between gap-4 mt-6">
          <Link 
              to="/profile" 
              className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center"
            >
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCancel}
              className="flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Profile
            </Button>
            </Link>
            
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 flex items-center"
              disabled={isLoading}
            >
              {isLoading ? "Updating..." : (
                <>
                  <Save className="w-4 h-4 mr-2" /> Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}