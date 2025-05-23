import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { Button } from "../components/ui/button";
import { Trash2, ShoppingBag, ArrowLeft, CreditCard, AlertCircle, Plus, Minus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext"; // Updated to use ToastContext
import { motion, AnimatePresence } from "framer-motion";

export default function Cart() {
  const { items, removeFromCart, total, addToCart, subtractFromCart, updateQuantity } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast(); // Using the same toast context as VaccinationCard
  const [removeItemId, setRemoveItemId] = useState(null);

  useEffect(() => {
    console.log("Cart Component Items:", items);
  }, [items]);

  const handleProceedToCheckout = () => {
    if (!user) {
      // Using ToastContext instead of local state for login prompt
      addToast({
        title: "Login Required",
        description: "Please log in to proceed with checkout",
        duration: 3000,
        type: 'warning'
      });
      return;
    }
    navigate("/checkout");
  };

  const goToLogin = () => {
    navigate("/login", { state: { from: "/cart" } });
  };

  const handleRemoveItem = (id) => {
    setRemoveItemId(id);
    setTimeout(() => {
      removeFromCart(id);
      setRemoveItemId(null);
      
      // Add toast notification when item is removed
      addToast({
        title: "Item Removed",
        description: "The item has been removed from your cart.",
        duration: 3000,
        type: 'info'
      });
    }, 300);
  };

  // Calculate estimated tax (for display purposes)
  const estimatedTax = total * 0.1; // 10% tax rate
  const finalTotal = total + estimatedTax;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          className="bg-white rounded-xl shadow-lg overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Cart Header */}
          <div className="bg-blue-600 text-white p-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl md:text-3xl font-bold flex items-center">
                <ShoppingBag className="w-6 h-6 md:w-8 md:h-8 mr-3" />
                Your Shopping Cart
              </h1>
              <span className="text-blue-100 bg-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                {items.length} {items.length === 1 ? "item" : "items"}
              </span>
            </div>
          </div>

          {/* Cart Content */}
          <div className="p-6">
            {items.length === 0 ? (
              <motion.div
                className="text-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="bg-blue-50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                  <ShoppingBag className="w-12 h-12 text-blue-500" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">Your cart is empty</h2>
                <p className="text-gray-500 mb-8">Looks like you haven't added any products yet.</p>
                <Link to="/products">
                  <Button className="px-8 py-6 h-auto text-lg bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                    Browse Products
                  </Button>
                </Link>
              </motion.div>
            ) : (
              <>
                {/* Cart Items */}
                <motion.div
                  className="mb-8"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
                  }}
                >
                  <div className="hidden md:grid grid-cols-12 gap-4 text-sm font-medium text-gray-500 mb-4 px-4">
                    <div className="col-span-6">Product</div>
                    <div className="col-span-2 text-center">Quantity</div>
                    <div className="col-span-2 text-right">Total</div>
                  </div>
                  

                  {items.map((item) => (
                    <motion.div
                      key={item.id.toString()}
                      className={`border border-gray-100 rounded-lg p-4 mb-4 hover:border-blue-100 hover:bg-blue-50 transition-all ${
                        removeItemId === item.id ? "opacity-50 scale-95" : ""
                      }`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <div className="grid grid-cols-12 gap-4 items-center">
                        {/* Product Image & Info */}
                        <div className="col-span-12 md:col-span-6">
                          <div className="flex items-center">
                            <div className="h-20 w-20 bg-gray-100 rounded-lg flex items-center justify-center mr-4 overflow-hidden">
                              {item.image ? (
                                <img src={item.image} alt={item.name} className="h-16 w-16 object-contain" />
                              ) : (
                                <ShoppingBag className="h-8 w-8 text-blue-300" />
                              )}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-800">{item.name}</h3>
                              <p className="text-sm text-gray-500">Rs {item.price.toFixed(2)} each</p>
                            </div>
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="col-span-5 md:col-span-2">
                          <div className="flex items-center justify-center bg-gray-100 rounded-lg p-1">
                            <motion.button
                              onClick={() => {
                                subtractFromCart(item.id);
                                addToast({
                                  title: "Quantity Updated",
                                  description: `${item.name} quantity decreased.`,
                                  duration: 2000,
                                  type: 'info'
                                });
                              }}
                              className="h-8 w-8 rounded-md bg-white text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center shadow-sm"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-4 w-4" />
                            </motion.button>
                            <span className="mx-3 font-medium text-gray-800">{item.quantity}</span>                            <motion.button
                              onClick={() => {
                                if (item.quantity < 5) {
                                  // Increment quantity by exactly 1 instead of doubling
                                  updateQuantity(item.id, item.quantity + 1);
                                  addToast({
                                    title: "Quantity Updated",
                                    description: `${item.name} quantity increased.`,
                                    duration: 2000,
                                    type: 'info'
                                  });
                                } else {
                                  addToast({
                                    title: "Maximum Limit Reached",
                                    description: `You can only add up to 5 of ${item.name}.`,
                                    duration: 3000,
                                    type: 'warning'
                                  });
                                }
                              }}
                              className="h-8 w-8 rounded-md bg-white text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center shadow-sm"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              disabled={item.quantity >= 5}
                            >
                              <Plus className="h-4 w-4" />
                            </motion.button>
                          </div>
                        </div>


                        {/* Total & Remove */}
                        <div className="col-span-4 md:col-span-2 text-right flex items-center justify-end">
                          <span className="font-medium text-blue-600">Rs {(item.price * item.quantity).toFixed()}</span>
                        </div>
                         <div className="col-span-4 md:col-span-2 text-right flex items-center justify-end"><Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(item.id)}
                            className="ml-2 text-gray-400 hover:text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button></div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Order Summary */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h3>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span className="font-medium text-gray-800">Rs {total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Shipping</span>
                      <span className="italic">Calculated at checkout</span>
                    </div>
                    <div className="border-t border-gray-200 pt-3 mt-3">
                      <div className="flex justify-between">
                        <span className="text-lg font-bold text-gray-800">Total</span>
                        <span className="text-lg font-bold text-blue-600">Rs {finalTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                    <Link to="/products" className="order-2 md:order-1">
                      <motion.button
                        className="w-full py-3 px-4 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 flex items-center justify-center font-medium"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Continue Shopping
                      </motion.button>
                    </Link>
                    
                    <motion.button
                      onClick={handleProceedToCheckout}
                      className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center font-medium order-1 md:order-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Proceed to Checkout
                    </motion.button>
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>

    </div>
  );
}