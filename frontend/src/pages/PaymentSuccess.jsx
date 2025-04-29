import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, ShoppingBag, FileText, CreditCard, ArrowRight, Home } from "lucide-react";

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { paymentDetails, orderDetails, orderItems = [], paymentMethod } = location.state || {};

  useEffect(() => {
    // If no order details are available, redirect to home
    if (!orderDetails) {
      const timer = setTimeout(() => {
        navigate("/");
      }, 3000);
      return () => clearTimeout(timer); // Clean up on unmount
    }
  }, [orderDetails, navigate]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Determine icon and color based on payment method
  const getPaymentMethodStyles = () => {
    if (paymentMethod === "khalti") {
      return {
        bgColor: "bg-purple-500",
        textColor: "text-purple-700",
        bgLight: "bg-purple-50",
        borderColor: "border-purple-500"
      };
    }
    return {
      bgColor: "bg-green-500",
      textColor: "text-green-700",
      bgLight: "bg-green-50",
      borderColor: "border-green-500"
    };
  };

  const styles = getPaymentMethodStyles();

  if (!orderDetails) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-8 text-center max-w-md w-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Order information not found</h2>
          <p className="text-gray-600 mt-2">Redirecting to home page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className={`${styles.bgColor} py-8 px-6 text-center`}>
          <div className="bg-white rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-4 shadow-md">
            <CheckCircle className="w-12 h-12 text-green-500" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold text-white">
            Payment Successful!
          </h1>
          <p className="text-white text-opacity-90 mt-2">
            Thank you for your order. We've received your payment.
          </p>
        </div>

        {/* Order Info */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
            <div>
              <p className="text-sm text-gray-500">Order Date</p>
              <p className="font-medium">{formatDate(orderDetails.createdAt)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Order ID</p>
              <p className="font-medium">{orderDetails._id?.substring(0, 12)}</p>
            </div>
          </div>

          {/* Payment Details */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-gray-600" />
              Payment Details
            </h2>
            
            <div className={`${styles.bgLight} border-l-4 ${styles.borderColor} p-4 rounded-r-md mb-4`}>
              <div className="flex items-center">
                <div className="flex-1">
                  <p className={`${styles.textColor} font-medium`}>
                    {paymentMethod === "cod" ? "Cash on Delivery" : "Paid via Khalti"}
                  </p>
                  <p className="text-gray-600 text-sm mt-1">
                    {paymentMethod === "cod" 
                      ? "You will pay when your order is delivered" 
                      : "Your online payment has been processed"
                    }
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold">
                    Rs {orderDetails.total?.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {paymentDetails && paymentDetails.idx && (
              <div className="bg-gray-50 rounded-md p-3 text-sm">
                <p className="text-gray-700">
                  <span className="font-medium">Transaction ID:</span> {paymentDetails.idx}
                </p>
              </div>
            )}
          </div>

          {/* Order Items Summary */}
          {orderItems && orderItems.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3 flex items-center">
                <ShoppingBag className="w-5 h-5 mr-2 text-gray-600" />
                Order Summary
              </h2>
              
              <div className="bg-gray-50 rounded-lg p-4 max-h-40 overflow-y-auto">
                {orderItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                    <div className="flex items-center">
                      <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs mr-3">
                        {item.quantity}
                      </span>
                      <span className="text-gray-800">{item.name}</span>
                    </div>
                    <span className="font-medium">Rs {(item.price * item.quantity)?.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* What's Next */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-blue-800 mb-2 flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              What's Next?
            </h3>
            <ul className="text-sm text-blue-700 space-y-2">
              <li className="flex items-start">
                <ArrowRight className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>Your order confirmation has been sent to your email address</span>
              </li>
              <li className="flex items-start">
                <ArrowRight className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>
                  {paymentMethod === "cod" 
                    ? "Our delivery team will contact you before delivery" 
                    : "Your items are being prepared for shipping"
                  }
                </span>
              </li>
              <li className="flex items-start">
                <ArrowRight className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>Expected delivery within 24-48 hours</span>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate("/profile")}
              className={`px-6 py-3 ${styles.bgColor} text-white rounded-lg hover:opacity-90 transition flex-1 flex justify-center items-center`}
            >
              <FileText className="w-4 h-4 mr-2" />
              View My Orders
            </button>
            <button
              onClick={() => navigate("/products")}
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition flex-1 flex justify-center items-center"
            >
              <Home className="w-4 h-4 mr-2" />
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;