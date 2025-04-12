import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { paymentDetails, orderDetails, paymentMethod } = location.state || {};

  // If no payment details are available, redirect to home
  if (!orderDetails) {
    setTimeout(() => {
      navigate("/");
    }, 3000);
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-green-500 py-6 px-6 text-center">
          <svg
            className="w-16 h-16 text-white mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            ></path>
          </svg>
          <h1 className="text-2xl font-bold text-white mt-2">
            Payment Successful!
          </h1>
        </div>

        <div className="p-6">
          {orderDetails ? (
            <>
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Order Details</h2>
                <p className="text-gray-700">Order ID: {orderDetails._id}</p>
                <p className="text-gray-700">
                  Total Amount: NPR {orderDetails.total?.toFixed(2)}
                </p>
                <p className="text-gray-700">
                  Payment Method: {paymentMethod === "cod" ? "Cash on Delivery" : "Khalti"}
                </p>
                
                {paymentDetails && paymentDetails.idx && (
                  <p className="text-gray-700">
                    Transaction ID: {paymentDetails.idx}
                  </p>
                )}
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                <p className="text-blue-700">
                  {paymentMethod === "cod" 
                    ? "Your order has been placed successfully. You will pay when your order is delivered."
                    : "Your payment has been processed successfully. We'll send you an email with your order details."}
                </p>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-700">
                No order details found. Redirecting to home page...
              </p>
            </div>
          )}

          <div className="mt-6 flex justify-center">
            <button
              onClick={() => navigate("/orders")}
              className="px-6 py-2 mr-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              View My Orders
            </button>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-2 bg-gray-300 rounded-md hover:bg-gray-400 transition"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;