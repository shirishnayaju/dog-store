"use client";

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "../components/ui/button";
import { useAuth } from "../context/AuthContext";
import { UserCircle, Save, ArrowLeft, Key, Trash2 } from 'lucide-react';

export default function EditProfile() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  
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
      // Try to use the original endpoint that was working
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
      
      // Show success toast
      showToast("Profile updated successfully", "success");
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.response?.data?.message || err.message || "Failed to update profile");
      
      // Show error toast
      showToast("Failed to update profile", "error");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteAccount = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // First check if user has _id or if we should use email
      let deleteUrl;
      if (user && user._id) {
        deleteUrl = `http://localhost:4001/user/users/${user._id}`;
      } else if (user && user.email) {
        deleteUrl = `http://localhost:4001/user/users/email/${encodeURIComponent(user.email)}`;
      } else {
        throw new Error("No user identifier available");
      }
      
      console.log("Making delete request to:", deleteUrl);
      
      const response = await axios.delete(deleteUrl, {
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (response.status !== 200 && response.status !== 204) {
        throw new Error("Failed to delete account");
      }
      
      // Show success toast
      showToast("Account deleted successfully", "success");
      
      // Log out the user and redirect to home
      logout();
      navigate("/");
    } catch (err) {
      console.error("Error deleting account:", err);
      setError(err.response?.data?.message || err.message || "Failed to delete account");
      
      // Show error toast
      showToast("Failed to delete account", "error");
    } finally {
      setIsLoading(false);
      setShowDeleteConfirmation(false);
    }
  };
  
  const handleCancel = () => {
    navigate("/profile");
  };
  
  // Simple toast functionality
  const [toast, setToast] = useState({ message: "", type: "", visible: false });
  
  const showToast = (message, type = "info") => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast({ message: "", type: "", visible: false });
    }, 3000);
  };
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Toast notification */}
      {toast.visible && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transition-all transform ${
          toast.type === "success" ? "bg-green-500" : 
          toast.type === "error" ? "bg-red-500" : 
          "bg-blue-500"
        } text-white`}>
          <div className="flex items-center">
            {toast.type === "success" && (
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            )}
            {toast.type === "error" && (
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            )}
            {toast.message}
          </div>
        </div>
      )}
    
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
          
          <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-100">
            <h3 className="text-md font-semibold mb-2 text-red-700 flex items-center">
              <Trash2 className="mr-2 w-4 h-4" /> Delete Account
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              Warning: Deleting your account is permanent and cannot be undone.
            </p>
            <button 
              type="button"
              onClick={() => setShowDeleteConfirmation(true)}
              className="text-red-600 hover:text-red-800 text-sm font-medium inline-flex items-center bg-red-100 px-3 py-1 rounded-md"
            >
              <Trash2 className="mr-1 w-3 h-3" /> Delete my account
            </button>
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
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 m-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Account</h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Delete Account
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirmation(false)}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}