import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { Button } from "../components/ui/button";
import { Trash2, ShoppingBag } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Toast } from "../components/ui/toast";
import { motion, AnimatePresence } from "framer-motion";

export default function Cart() {
  const { items, removeFromCart, total, addToCart, subtractFromCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  useEffect(() => {
    console.log("Cart Component Items:", items);
  }, [items]);

  const handleProceedToCheckout = () => {
    if (!user) {
      setShowLoginPrompt(true);
      setTimeout(() => setShowLoginPrompt(false), 3000);
      return;
    }
    navigate("/checkout");
  };

  const goToLogin = () => {
    navigate("/login", { state: { from: "/cart" } });
  };

  return (
    <motion.div
      className="max-w-3xl mx-auto p-6 bg-blue-600 text-white rounded-lg shadow"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center justify-between mb-8 border-b border-blue-400 pb-4">
        <h1 className="text-3xl font-bold">Your Shopping Cart</h1>
        <span className="text-blue-100">
          {items.length} {items.length === 1 ? "item" : "items"}
        </span>
      </div>

      {items.length === 0 ? (
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <ShoppingBag className="w-16 h-16 mx-auto text-blue-200 mb-4" />
          <p className="text-xl mb-6">Your cart is empty</p>
          <Link to="/products">
            <button className="px-6 py-2 rounded bg-white text-blue-600 hover:bg-blue-50">
              Start Shopping
            </button>
          </Link>
        </motion.div>
      ) : (
        <>
          <motion.div
            className="mb-6"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
            }}
          >
            {items.map((item) => (
              <motion.div
                key={item.id.toString()}
                className="flex items-center border-b border-blue-400 py-4 last:border-0"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="h-24 w-24 bg-blue-500 rounded flex items-center justify-center mr-4">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="h-20 w-20 object-contain" />
                  ) : (
                    <ShoppingBag className="h-10 w-10 text-blue-200" />
                  )}
                </div>

                <div className="flex-grow">
                  <h2 className="font-medium text-lg">{item.name}</h2>
                  <p className="text-sm text-blue-100 mb-2">${item.price.toFixed(2)} each</p>

                  <div className="flex items-center mt-2">
                    <motion.button
                      onClick={() => subtractFromCart(item.id)}
                      className="h-8 w-8 p-0 rounded-full bg-blue-500 hover:bg-blue-400 flex items-center justify-center"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <span className="text-white text-xl font-bold">-</span>
                    </motion.button>
                    <span className="mx-3 font-medium">{item.quantity}</span>
                    <motion.button
                      onClick={() => addToCart(item)}
                      className="h-8 w-8 p-0 rounded-full bg-blue-500 hover:bg-blue-400 flex items-center justify-center"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <span className="text-white text-xl font-bold">+</span>
                    </motion.button>

                    <span className="ml-auto font-medium">${(item.price * item.quantity).toFixed(2)}</span>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromCart(item.id)}
                      className="ml-4 text-blue-200 hover:text-white hover:bg-blue-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <div className="border-t border-blue-400 pt-4 mt-6">
            <div className="flex justify-between mb-2">
              <span>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>
            <div className="flex justify-between font-bold text-lg mt-4">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>

            <div className="mt-8 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
              <Link to="/products" className="md:flex-1">
                <motion.button
                  className="w-full py-2 px-4 rounded border border-black bg-white text-blue-600 hover:bg-blue-800 hover:text-white"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Continue Shopping
                </motion.button>
              </Link>
              <Link to="/checkout" className="md:flex-1">
              <motion.button
                onClick={handleProceedToCheckout}
                className="w-full py-2 px-4 rounded border border-black bg-white text-blue-600 hover:bg-blue-800 hover:text-white md:flex-1"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Proceed to Checkout
              </motion.button>
              </Link>
            </div>
          </div>

          <AnimatePresence>
            {showLoginPrompt && (
              <motion.div
                className="fixed bottom-10 right-10 bg-white text-black p-4 rounded-lg shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.4 }}
              >
                <p className="text-lg font-semibold">Login Required</p>
                <p className="text-sm text-gray-700">Please log in to proceed to checkout.</p>
                <Button onClick={goToLogin} className="mt-2 bg-blue-500 hover:bg-blue-600 text-white">
                  Go to Login
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </motion.div>
  );
}
