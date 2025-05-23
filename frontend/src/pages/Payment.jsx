import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import khalti from "../Image/khalti.png"; // Adjust path as needed
import axios from "axios";
import { 
  CreditCard, 
  Banknote, 
  Shield, 
  ChevronLeft, 
  ShoppingBag, 
  Truck, 
  Clock
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
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:4001";
  // Frontend URL (for return_url)
  const frontendUrl = import.meta.env.VITE_FRONTEND_URL || window.location.origin;

  useEffect(() => {
    // Log configuration for debugging
    console.log("API Base URL:", apiBaseUrl);
    console.log("Frontend URL:", frontendUrl);
    
    // Validate required environment variables
    if (!apiBaseUrl) {
      console.error("API Base URL is missing!");
      setError("Configuration error. Please contact support.");
      return;
    }
  }, [apiBaseUrl, frontendUrl]);

  useEffect(() => {
    // Check if we're returning from Khalti with query params
    const urlParams = new URLSearchParams(window.location.search);
    const pidx = urlParams.get('pidx');
    const status = urlParams.get('status');
    
    if (pidx && status) {
      // Handle returning from Khalti with query parameters
      handleKhaltiReturn({ 
        pidx, 
        status,
        transaction_id: urlParams.get('transaction_id'),
        purchase_order_id: urlParams.get('purchase_order_id')
      });
      return;
    }

    // Regular page load handling
    if (location.state?.orderDetails) {
      handleOrderState(location.state.orderDetails);
    } else {
      fetchLatestOrder();
    }
  }, [location]);

  const handleKhaltiReturn = async (params) => {
    try {
      setLoading(true);
      console.log("Handling Khalti return with params:", params);
      
      // Send to your backend to verify with Khalti using the secret key
      const { data } = await axios.post(`${apiBaseUrl}/payments/verify-khalti-lookup`, {
        pidx: params.pidx
      });
      
      if (data?.success) {
        navigate("/payment-success", { 
          state: { 
            paymentDetails: data.data,
            orderDetails: data.orderDetails,
            orderItems: data.orderItems || [],
            paymentMethod: "khalti"
          } 
        });
      } else {
        setError(data?.message || "Payment verification failed");
        fetchLatestOrder();
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Verification failed";
      setError(errorMsg);
      console.error("Return verification error:", err);
      fetchLatestOrder();
    } finally {
      setLoading(false);
    }
  };

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
      const errorMsg = error.response?.data?.message || "Failed to load order details";
      setError(errorMsg);
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

  const processKhaltiPayment = async () => {
    if (!orderDetails?.total) {
      setError("Order total amount is missing");
      return;
    }

    if (!orderDetails?._id) {
      setError("Order ID is missing");
      return;
    }

    try {
      setLoading(true);
      
      // Calculate amount - Khalti expects amount in paisa (1 NPR = 100 paisa)
      const amountInPaisa = Math.max(1000, Math.round((orderDetails.total || 0) * 100));
      
      console.log("Payment details:", {
        orderId: orderDetails._id,
        amount: orderDetails.total,
        amountInPaisa,
        frontendUrl
      });

      // Initialize payment on server side - using frontendUrl for return URL
      const response = await axios.post(`${apiBaseUrl}/payments/initiate-payment`, {
        purchase_order_id: orderDetails._id,
        purchase_order_name: `Order #${orderDetails._id.substring(0, 8)}`,
        amount: amountInPaisa,
        customer_info: {
          name: orderDetails.customer?.name || "Customer",
          email: orderDetails.customer?.email || "",
          phone: orderDetails.customer?.phone || ""
        },
        // The key difference - use the frontend URL for the return URL
        return_url: `${frontendUrl}/payment-success`
      });

      if (response.data?.payment_url) {
        // Redirect to Khalti payment page
        window.location.href = response.data.payment_url;
      } else {
        setError("Failed to initiate payment");
      }
    } catch (err) {
      console.error("Payment initiation error:", err);
      setError(err.response?.data?.message || "Failed to initiate payment");
    } finally {
      setLoading(false);
    }
  };

  const handleCashOnDelivery = async () => {
    if (!orderDetails?._id) {
      setError("Missing order information. Please reload the page.");
      return;
    }

    try {
      setLoading(true);
      
      // Try multiple endpoint formats if needed
      let endpoint = `${apiBaseUrl}/api/orders/${orderDetails._id}/payment`;
      let requestData = { paymentMethod: "cod", paymentStatus: "pending" };
      let response;
      
      try {
        // First try the /payment endpoint
        console.log("Trying primary endpoint:", endpoint);
        response = await axios.put(endpoint, requestData);
      } catch (primaryErr) {
        if (primaryErr.response?.status === 404) {
          // If 404, try the direct order update endpoint
          console.log("Primary endpoint not found, trying alternative...");
          endpoint = `${apiBaseUrl}/api/orders/${orderDetails._id}`;
          
          response = await axios.put(endpoint, {
            ...requestData,
            _id: orderDetails._id
          });
        } else {
          throw primaryErr;
        }
      }
      
      navigate("/payment-success", { 
        state: { 
          orderDetails: response.data,
          orderItems,
          paymentMethod: "cod"
        } 
      });
    } catch (err) {
      const statusCode = err.response?.status;
      let errorMessage;
      
      if (statusCode === 404) {
        errorMessage = "Payment system unavailable. Please try again later.";
      } else if (statusCode === 401 || statusCode === 403) {
        errorMessage = "Authentication error. Please login again.";
      } else {
        errorMessage = err.response?.data?.message || "Failed to confirm Cash on Delivery";
      }
      
      setError(errorMessage);
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
          <p className="mt-4 text-lg font-medium text-gray-700">Processing your payment...</p>
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
            className="cursor-pointer transition-all bg-blue-500 text-white px-6 py-2 rounded-lg
            border-blue-600 border-b-[4px] hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px]
            active:border-b-[2px] active:brightness-90 active:translate-y-[2px] flex items-center"
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
                        {orderItems.length > 0 ? (
                          orderItems.map((item, i) => (
                            <div key={i} className="flex justify-between items-center text-sm pb-2">
                              <div className="flex items-center">
                                <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded mr-2">
                                  {item.quantity}
                                </span>
                                {item.name}
                              </div>
                              <span>Rs {item.price?.toFixed(2)}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">No items available</p>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 border-t space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal:</span>
                        <span>Rs {orderDetails.total?.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Shipping:</span>
                        <span>Free</span>
                      </div>
                      <div className="flex justify-between pt-3 border-t text-lg font-bold text-blue-600">
                        <span>Total:</span>
                        <span>Rs {orderDetails.total?.toFixed(2)}</span>
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
                    className="cursor-pointer transition-all bg-gray-200 text-gray-800 px-6 py-3 rounded-lg
                    border-gray-300 border-b-[4px] hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px]
                    active:border-b-[2px] active:brightness-90 active:translate-y-[2px] flex-1"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleProcessPayment}
                    disabled={!orderDetails}
                    className={`cursor-pointer transition-all px-6 py-3 rounded-lg text-white flex-1
                    ${selectedMethod === "khalti" 
                      ? "bg-purple-600 border-purple-700" 
                      : "bg-green-600 border-green-700"
                    } border-b-[4px] hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px]
                    active:border-b-[2px] active:brightness-90 active:translate-y-[2px] disabled:opacity-70 disabled:cursor-not-allowed`}
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