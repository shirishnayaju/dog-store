import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import khalti from "../Image/khalti.png";
import KhaltiCheckout from "khalti-checkout-web";
import axios from "axios";
import { 
  CreditCard, 
  Banknote, 
  Shield, 
  ChevronLeft, 
  ShoppingBag, 
  Truck, 
  Clock,
  CheckCircle
} from "lucide-react";

const Payment = () => {
  const [selectedMethod, setSelectedMethod] = useState("khalti");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Environment variables
  const khaltiPublicKey = import.meta.env.VITE_KHALTI_PUBLIC_KEY || "test_public_key_c86fd229687147c296108dadb68858fc";
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:4001";

  useEffect(() => {
    if (!khaltiPublicKey) {
      console.error("Khalti public key missing!");
      setError("Online payments temporarily unavailable. Please try cash on delivery.");
    }
  }, [khaltiPublicKey]);

  useEffect(() => {
    if (location.state?.orderDetails) {
      handleOrderState(location.state.orderDetails);
    } else {
      fetchLatestOrder();
    }
  }, [location]);

  const handleOrderState = (order) => {
    setOrderDetails(order);
    if (order.products) {
      setOrderItems(order.products);
    } else if (order._id) {
      fetchOrderItems(order._id);
    }
  };

  const fetchLatestOrder = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${apiBaseUrl}/api/orders/latest`);
      handleOrderState(response.data);
    } catch (error) {
      setError("Failed to load order details");
      console.error("Order fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderItems = async (orderId) => {
    try {
      const { data } = await axios.get(`${apiBaseUrl}/api/orders/${orderId}/items`);
      setOrderItems(data);
    } catch (error) {
      console.error("Order items error:", error);
    }
  };

  const handlePaymentMethodChange = (method) => {
    setSelectedMethod(method);
    setError(null);
  };

  const processKhaltiPayment = () => {
    if (!khaltiPublicKey || !orderDetails?.total) {
      setError("Payment configuration error");
      return;
    }

    const config = {
      publicKey: khaltiPublicKey,
      productIdentity: orderDetails._id,
      productName: "Order Payment",
      productUrl: window.location.origin,
      amount: Math.round(orderDetails.total * 100),
      eventHandler: {
        onSuccess: (payload) => verifyKhaltiPayment(payload),
        onError: (err) => {
          setError("Payment failed. Please try again.");
          console.error("Khalti error:", err);
        },
        onClose: () => console.log("Widget closed")
      },
      paymentPreference: ["KHALTI"],
    };

    try {
      new KhaltiCheckout(config).show();
    } catch (err) {
      setError("Failed to initialize payment");
      console.error("Khalti init error:", err);
    }
  };

  const verifyKhaltiPayment = async (payload) => {
    try {
      setLoading(true);
      const { data } = await axios.post(`${apiBaseUrl}/payments/verify-khalti`, {
        token: payload.token,
        amount: payload.amount,
        orderId: orderDetails._id,
      });

      if (data?.success) {
        navigate("/payment-success", { 
          state: { 
            paymentDetails: data.data,
            orderDetails,
            orderItems,
            paymentMethod: "khalti"
          } 
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
      console.error("Verification error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCashOnDelivery = async () => {
    try {
      setLoading(true);
      const { data } = await axios.put(
        `${apiBaseUrl}/api/orders/${orderDetails._id}/payment`,
        { paymentMethod: "cod", paymentStatus: "pending" }
      );
      
      navigate("/payment-success", { 
        state: { 
          orderDetails: data,
          orderItems,
          paymentMethod: "cod"
        } 
      });
    } catch (err) {
      setError("Failed to confirm COD");
      console.error("COD error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayment = () => {
    setError(null);
    selectedMethod === "khalti" ? processKhaltiPayment() : handleCashOnDelivery();
  };

  const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : "N/A";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">Processing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-blue-600 transition"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-blue-600 py-4 px-6">
                <div className="flex items-center text-white">
                  <ShoppingBag className="h-6 w-6 mr-2" />
                  <h2 className="text-xl font-bold">Order Summary</h2>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                {orderDetails ? (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Order ID:</span>
                        <span className="font-medium">{orderDetails._id?.substring(0, 8)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Date:</span>
                        <span className="font-medium">{formatDate(orderDetails.createdAt)}</span>
                      </div>
                      {orderDetails.customer && (
                        <div className="space-y-1">
                          <div className="flex justify-between items-start text-sm">
                            <span className="text-gray-500">Deliver to:</span>
                            <div className="text-right">
                              <p className="font-medium">{orderDetails.customer.name}</p>
                              <p className="text-gray-600">{orderDetails.customer.address}</p>
                            </div>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Contact:</span>
                            <span className="font-medium">{orderDetails.customer.phone}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t">
                      <h3 className="font-semibold mb-3">Items</h3>
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {orderItems.map((item, i) => (
                          <div key={i} className="flex justify-between items-center text-sm pb-2">
                            <div className="flex items-center">
                              <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded mr-2">
                                {item.quantity}
                              </span>
                              {item.name}
                            </div>
                            <span>${item.price?.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal:</span>
                        <span>${orderDetails.total?.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Shipping:</span>
                        <span>Free</span>
                      </div>
                      <div className="flex justify-between pt-3 border-t text-lg font-bold text-blue-600">
                        <span>Total:</span>
                        <span>${orderDetails.total?.toFixed(2)}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-center text-gray-500">No order details available</p>
                )}
              </div>
            </div>

            <div className="mt-6 bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center mb-3">
                <Truck className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="font-semibold">Estimated Delivery</h3>
              </div>
              <div className="bg-blue-50 text-blue-800 p-3 rounded-md text-sm">
                <Clock className="h-5 w-5 mr-2 inline" />
                24-48 hours after confirmation
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-blue-600 py-4 px-6">
                <div className="flex items-center text-white">
                  <CreditCard className="h-6 w-6 mr-2" />
                  <h2 className="text-xl font-bold">Payment Method</h2>
                </div>
              </div>

              <div className="p-6">
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                    <p className="text-red-700">{error}</p>
                  </div>
                )}

                <div className="space-y-4 mb-8">
                  {/* Khalti Option */}
                  <div 
                    className={`border-2 rounded-lg p-4 cursor-pointer ${
                      selectedMethod === "khalti" ? "border-purple-500 bg-purple-50" : "border-gray-200"
                    }`}
                    onClick={() => handlePaymentMethodChange("khalti")}
                  >
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                        selectedMethod === "khalti" ? "border-purple-500 bg-purple-500" : "border-gray-400"
                      }`}>
                        {selectedMethod === "khalti" && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">
                          <span className="text-purple-700">Khalti</span>
                          <span className="text-gray-500 text-sm ml-2">(Instant Payment)</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">Secure online payment</p>
                      </div>
                      <img src={khalti} alt="Khalti" className="h-8" />
                    </div>
                  </div>

                  {/* COD Option */}
                  <div 
                    className={`border-2 rounded-lg p-4 cursor-pointer ${
                      selectedMethod === "cod" ? "border-green-500 bg-green-50" : "border-gray-200"
                    }`}
                    onClick={() => handlePaymentMethodChange("cod")}
                  >
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                        selectedMethod === "cod" ? "border-green-500 bg-green-500" : "border-gray-400"
                      }`}>
                        {selectedMethod === "cod" && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">
                          <span className="text-green-700">Cash on Delivery</span>
                          <span className="text-gray-500 text-sm ml-2">(Pay Later)</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">Pay when item arrives</p>
                      </div>
                      <Banknote className="h-6 w-6 text-green-500" />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <div className="flex items-center text-gray-700">
                    <Shield className="h-5 w-5 text-blue-600 mr-2" />
                    <h3 className="font-medium">Secure Payment Guarantee</h3>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Your payment information is encrypted and securely processed.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => navigate(-1)}
                    className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition flex-1"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleProcessPayment}
                    disabled={!orderDetails}
                    className={`px-6 py-3 rounded-lg text-white flex-1 ${
                      selectedMethod === "khalti" 
                        ? "bg-purple-600 hover:bg-purple-700" 
                        : "bg-green-600 hover:bg-green-700"
                    } transition`}
                  >
                    {selectedMethod === "khalti" ? "Pay with Khalti" : "Confirm COD"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;