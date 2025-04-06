"use client";

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "../components/ui/button";
import { useAuth } from "../context/AuthContext";
import { 
  UserCircle, 
  Package, 
  LogOut, 
  Edit, 
  Syringe,
  User,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Navigation,
  Dog,
  PawPrint,
  Activity
} from 'lucide-react';

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return "Not specified";
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Helper function to format time
const formatTime = (timeString) => {
  if (!timeString) return "Not specified";
  return timeString;
};

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [vaccinations, setVaccinations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        if (!user) {
          throw new Error("User information not available.");
        }

        if (!user.email) {
          throw new Error("User email not available.");
        }

        // Fetch orders
        const ordersResponse = await axios.get(`http://localhost:4001/api/users/${encodeURIComponent(user.email)}/orders`, {
          headers: {
            "Content-Type": "application/json",
            ...(user.token && { Authorization: `Bearer ${user.token}` })
          }
        });

        // Fetch vaccination bookings
        const vaccinationsResponse = await axios.get(`http://localhost:4001/api/users/${encodeURIComponent(user.email)}/vaccinations`, {
          headers: {
            "Content-Type": "application/json",
            ...(user.token && { Authorization: `Bearer ${user.token}` })
          }
        });

        setOrders(ordersResponse.data);
        setVaccinations(vaccinationsResponse.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.response?.data?.message || "Failed to load data.");
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchData();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/home");
  };

  const totalSpent = orders.reduce((sum, order) => sum + Number(order.total), 0).toFixed(2);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 flex items-center">
        <UserCircle className="mr-2" /> My Profile
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Card (unchanged) */}
        <div className="col-span-1">
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl shadow-lg p-6 text-white">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <UserCircle className="mr-2" /> Profile Information
            </h2>
            <div className="flex flex-col items-center">
              {user && (
                <>
                  <p className="text-xl font-bold mb-1">{user.name}</p>
                  <p className="text-blue-100 mb-4">{user.email}</p>
                </>
              )}

              <div className="grid grid-cols-2 gap-4 w-full mt-2">
                <Button variant="outline" className="text-blue-600 hover:bg-blue-50 hover:text-blue-600 border-none shadow-md" onClick={() => navigate("/edit-profile")}>
                  Edit Profile
                </Button>
                <Button variant="destructive" onClick={handleLogout} className="bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-md">
                  <LogOut className="w-4 h-4 mr-1" /> Logout
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Card (unchanged) */}
          <div className="bg-white rounded-xl shadow-md p-6 mt-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">Account Summary</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Total Orders</p>
                <p className="text-2xl font-bold text-blue-600">{orders.length}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Total Spent</p>
                <p className="text-2xl font-bold text-green-600">${totalSpent}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Order and Vaccination Bookings Section */}
        <div className="col-span-1 md:col-span-2">
          {/* Order History Section (unchanged) */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center">
              <Package className="mr-2" /> Order History
            </h2>

            {isLoading ? (
              <p className="text-center text-gray-500">Loading orders...</p>
            ) : error ? (
              <p className="text-center text-red-500">{error}</p>
            ) : orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order._id} className="border rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-gray-600">Order ID: {order._id}</h3>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {order.status}
                      </span>
                    </div>

                    <div className="mt-4">
                      <h4 className="font-semibold text-gray-600">Products Ordered:</h4>
                      <ul className="list-inside list-disc pl-4 mt-2">
                        {order.products.map((product, index) => (
                          <li key={index} className="flex justify-between">
                            <span className="text-gray-700">{product.name}</span>
                            <span className="text-gray-600">Qty: {product.quantity}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-4">
                      <p className="text-gray-600">
                        <strong>Total Products:</strong> {order.products.length}
                      </p>
                      <p className="text-gray-600">
                        <strong>Total Quantity Ordered:</strong> {order.products.reduce((acc, product) => acc + product.quantity, 0)}
                      </p>
                    </div>

                    <p className="text-gray-600 mt-4">Total: ${Number(order.total).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">No orders found.</p>
            )}
          </div>

          {/* Vaccination Bookings Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center">
              <Syringe className="mr-2" />Total Vaccination Bookings
            </h2>

            {isLoading ? (
              <p className="text-center text-gray-500">Loading vaccination bookings...</p>
            ) : error ? (
              <p className="text-center text-red-500">{error}</p>
            ) : vaccinations.length > 0 ? (
              <div className="space-y-6">
                {vaccinations.map((booking) => (
                  <div key={booking._id} className="border rounded-lg p-6 hover:shadow-md transition">
                    {/* Booking Status */}
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-gray-600">Booking ID: {booking._id}</h3>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {booking.status}
                      </span>
                    </div>

                    {/* Vaccination Information */}
                    <div className="relative">
  <h3 className="text-lg font-semibold text-gray-800 mb-3">Vaccination Information</h3>
  <div className="space-y-4">
    {/* Vaccine Information */}
    <div className="flex items-start">
      <div className="bg-purple-100 p-2 rounded-lg mr-3">
        <Navigation className="h-5 w-5 text-purple-600" />
      </div>
      <div>
        <p className="text-sm text-gray-500">Vaccine Name</p>
        <p className="font-medium text-gray-800">{booking.vaccines?.[0]?.name || "Not specified"}</p>
      </div>
    </div>

    {/* Dog Name */}
    <div className="flex items-start">
      <div className="bg-purple-100 p-2 rounded-lg mr-3">
        <Dog className="h-5 w-5 text-purple-600" />
      </div>
      <div>
        <p className="text-sm text-gray-500">Dog Name</p>
        <p className="font-medium text-gray-800">{booking.dog?.name || "Not specified"}</p>
      </div>
    </div>

    {/* Dog Breed */}
    <div className="flex items-start">
      <div className="bg-purple-100 p-2 rounded-lg mr-3">
        <PawPrint className="h-5 w-5 text-purple-600" />
      </div>
      <div>
        <p className="text-sm text-gray-500">Dog Breed</p>
        <p className="font-medium text-gray-800">{booking.dog?.breed || "Not specified"}</p>
      </div>
    </div>

    {/* Dog Behaviour */}
    <div className="flex items-start">
      <div className="bg-purple-100 p-2 rounded-lg mr-3">
        <Activity className="h-5 w-5 text-purple-600" />
      </div>
      <div>
        <p className="text-sm text-gray-500">Dog Behaviour</p>
        <p className="font-medium text-gray-800">{booking.dog?.behaviour || "Not specified"}</p>
      </div>
    </div>
  </div>

  {/* View Details Button */}
<Button
  variant="outline"
  className="absolute bottom-0 right-0 text-blue-600 hover:bg-blue-800 border-none shadow-md"
  onClick={() => navigate("/MyBookings", { 
    state: { 
      bookingId: booking._id 
    } 
  })}
>
  View details
</Button>
</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">No vaccination bookings found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}