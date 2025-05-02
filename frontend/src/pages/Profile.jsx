"use client";

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "../components/ui/button";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext"; // Import toast hook
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
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
  Activity,
  ChevronRight,
  ShoppingBag,
  AlertCircle,
  Check,
  Trash2
} from 'lucide-react';

const formatDate = (dateString) => {
  if (!dateString) return "Not specified";
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatTime = (timeString) => {
  if (!timeString) return "Not specified";
  return timeString;
};

const StatusBadge = ({ status }) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return <Check className="w-3 h-3 mr-1" />;
      case "cancelled":
        return <AlertCircle className="w-3 h-3 mr-1" />;
      default:
        return null;
    }
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(status)}`}>
      {getStatusIcon(status)}
      {status}
    </span>
  );
};

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { addToast } = useToast(); // Use the toast hook
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [vaccinations, setVaccinations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("orders");
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

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

        const ordersResponse = await axios.get(`http://localhost:4001/api/users/${encodeURIComponent(user.email)}/orders`, {
          headers: {
            "Content-Type": "application/json",
            ...(user.token && { Authorization: `Bearer ${user.token}` })
          }
        });

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

  const confirmLogout = () => {
    setShowLogoutDialog(true);
  };

  const handleLogout = () => {
    const result = logout();
    
    // Show toast notification
    if (result?.showToast) {
      addToast(result.showToast);
    }
    
    navigate("/home");
    setShowLogoutDialog(false);
  };

  const cancelLogout = () => {
    setShowLogoutDialog(false);
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;

    try {
      await axios.delete(`http://localhost:4001/api/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });

      setOrders(orders.filter(order => order._id !== orderId));
    } catch (err) {
      console.error("Error deleting order:", err);
      setError(err.response?.data?.message || "Failed to delete order.");
    }
  };

  const totalSpent = orders.reduce((sum, order) => sum + Number(order.total), 0).toFixed(2);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gray-50 min-h-screen pb-12">
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white py-8 mb-6 rounded-xl">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              <UserCircle className="mr-2" /> My Profile
            </h1>
            <p className="text-blue-100">Manage your account, orders and vaccination bookings</p>
          </div>
        </div>

        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="col-span-1 space-y-6">
              <div className="bg-white rounded-xl shadow-sm p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                
                <div className="flex flex-col items-center py-4">
                  <div className="h-24 w-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <UserCircle className="h-16 w-16 text-blue-600" />
                  </div>
                  
                  {user && (
                    <>
                      <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
                      <p className="text-gray-500 mb-4">{user.email}</p>
                    </>
                  )}

                  <div className="grid grid-cols-2 gap-4 w-full">
                    <Button 
                      variant="outline"
                      className=" bg-blue-600 border border-blue-200 text-blue-600 hover:bg-blue-800  flex items-center justify-center"
                      onClick={() => navigate("/edit-profile")}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                    <Button 
                      variant="destructive"
                      className="bg-red-500 hover:bg-red-600 flex items-center justify-center"
                      onClick={confirmLogout}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Account Summary</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <ShoppingBag className="h-5 w-5 text-blue-600 mr-2" />
                      <p className="text-sm font-medium text-gray-600">Total Orders</p>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">{orders.length}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <p className="text-sm font-medium text-gray-600">Total Spent</p>
                    </div>
                    <p className="text-2xl font-bold text-green-600">Rs {totalSpent}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Quick Actions</h2>
                <div className="space-y-2">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                    onClick={() => navigate("/shop")}
                  >
                    <Package className="mr-2 h-5 w-5" />
                    Shop Products
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                    onClick={() => navigate("/book-vaccination")}
                  >
                    <Syringe className="mr-2 h-5 w-5" />
                    Book Vaccination
                  </Button>
                </div>
              </div>
            </div>

            <div className="col-span-1 md:col-span-2">
              <div className="flex border-b mb-6">
                <button 
                  className={`py-3 px-6 font-medium text-sm ${activeTab === "orders" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                  onClick={() => setActiveTab("orders")}
                >
                  <div className="flex items-center">
                    <Package className="mr-2 h-5 w-5" />
                    Order History
                  </div>
                </button>
                <button 
                  className={`py-3 px-6 font-medium text-sm ${activeTab === "vaccinations" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                  onClick={() => setActiveTab("vaccinations")}
                >
                  <div className="flex items-center">
                    <Syringe className="mr-2 h-5 w-5" />
                    Vaccination Bookings
                  </div>
                </button>
              </div>

              {activeTab === "orders" && (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                      <Package className="mr-2" /> Order History
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">View and track all your past orders</p>
                  </div>

                  {error ? (
                    <div className="p-6 text-center">
                      <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                      <p className="text-red-500">{error}</p>
                    </div>
                  ) : orders.length > 0 ? (
                    <div className="divide-y">
                      {orders.map((order) => (
                        <div key={order._id} className="p-6 hover:bg-gray-50 transition">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-medium text-gray-800 mb-1">Order #{order._id.substring(order._id.length - 8)}</h3>
                              <p className="text-sm text-gray-500">Placed on {formatDate(order.createdAt || new Date())}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <StatusBadge status={order.status} />
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:bg-blue-200 hover:text-red-700"
                                onClick={() => handleDeleteOrder(order._id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="mt-4 bg-gray-50 rounded-lg p-4">
                            <h4 className="font-medium text-gray-700 mb-2">Products</h4>
                            <ul className="space-y-2">
                              {order.products.map((product, index) => (
                                <li key={index} className="flex justify-between text-sm">
                                  <div className="flex items-center">
                                    <div className="h-8 w-8 bg-gray-200 rounded mr-3"></div>
                                    <span className="text-gray-800">{product.name}</span>
                                  </div>
                                  <div className="flex items-center space-x-4">
                                    <span className="text-gray-500">Qty: {product.quantity}</span>
                                    <span className="font-medium">Rs {(product.price * product.quantity).toFixed(2)}</span>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="mt-4 flex justify-between items-center">
                            <div>
                              <p className="text-sm text-gray-500">
                                Total Items: {order.products.reduce((acc, product) => acc + product.quantity, 0)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-gray-500">Total</p>
                              <p className="text-xl font-bold text-gray-800">Rs {Number(order.total).toFixed(2)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-12 text-center">
                      <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No orders found.</p>
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => navigate("/products")}
                      >
                        Start Shopping
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "vaccinations" && (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                      <Syringe className="mr-2" /> Vaccination Bookings
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">View and manage your pet's vaccination appointments</p>
                  </div>

                  {error ? (
                    <div className="p-6 text-center">
                      <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                      <p className="text-red-500">{error}</p>
                    </div>
                  ) : vaccinations.length > 0 ? (
                    <div className="divide-y">
                      {vaccinations.map((booking) => (
                        <div key={booking._id} className="p-6 hover:bg-gray-50 transition">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-medium text-gray-800 mb-1">Booking #{booking._id.substring(booking._id.length - 8)}</h3>
                              <p className="text-sm text-gray-500">Scheduled for {formatDate(booking.date)} at {formatTime(booking.time)}</p>
                            </div>
                            <StatusBadge status={booking.status} />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div className="bg-blue-50 rounded-lg p-4">
                              <h4 className="font-medium text-blue-800 mb-3 flex items-center">
                                <Dog className="w-4 h-4 mr-2" /> Pet Information
                              </h4>
                              <div className="space-y-2">
                                <div className="flex">
                                  <span className="text-gray-500 w-20">Name:</span>
                                  <span className="font-medium text-gray-800">{booking.dog?.name || "Not specified"}</span>
                                </div>
                                <div className="flex">
                                  <span className="text-gray-500 w-20">Breed:</span>
                                  <span className="font-medium text-gray-800">{booking.dog?.breed || "Not specified"}</span>
                                </div>
                                <div className="flex">
                                  <span className="text-gray-500 w-20">Behavior:</span>
                                  <span className="font-medium text-gray-800">{booking.dog?.behaviour || "Not specified"}</span>
                                </div>
                              </div>
                            </div>

                            <div className="bg-green-50 rounded-lg p-4">
                              <h4 className="font-medium text-green-800 mb-3 flex items-center">
                                <Syringe className="w-4 h-4 mr-2" /> Vaccine Details
                              </h4>
                              <div className="space-y-2">
                                <div className="flex">
                                  <span className="text-gray-500 w-20">Type:</span>
                                  <span className="font-medium text-gray-800">{booking.vaccines?.[0]?.name || "Not specified"}</span>
                                </div>
                                <div className="flex">
                                  <span className="text-gray-500 w-20">Price:</span>
                                  <span className="font-medium text-gray-800">Rs {booking.vaccines?.[0]?.price || "0.00"}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 flex justify-end">
                            <Button
                              variant="outline"
                              className=" hover:bg-blue-800 border-blue-200 flex items-center"
                              onClick={() => navigate("/MyBookings", { state: { bookingId: booking._id } })}
                            >
                              View details
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-12 text-center">
                      <Syringe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No vaccination bookings found.</p>
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => navigate("/vaccination")}
                      >
                        Book a Vaccination
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LogOut className="h-5 w-5 text-red-500" />
              Confirm Logout
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to log out of your account?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row justify-end gap-2 mt-4">
            <Button 
              variant="outline" 
              onClick={cancelLogout}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleLogout}
              className="flex items-center"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}