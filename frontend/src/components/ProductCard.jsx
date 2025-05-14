import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "./ui/button";
import { useCart } from '../hooks/useCart'; 
import { FaShoppingCart, FaStar } from 'react-icons/fa';
import { useToast } from '../context/ToastContext'; // Adjust path as needed

function ProductCard({ product, categoryIcons }) {
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const [quantity, setQuantity] = useState(1); // Default quantity is 1
  const navigate = useNavigate();

  const handleAddToCart = () => {
    addToCart({ ...product, quantity });
    
    // Using the toast system
    addToast({
      title: "Product Added",
      description: `"${product.name}" has been added to your cart.`,
      duration: 3000,
      type: 'success'
    });
  };

  const handleViewDetails = () => {
    // Navigate and ensure page scrolls to top
    navigate(`/products/${product._id}`);
    window.scrollTo(0, 0);
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 flex flex-col h-full">
      <div className="relative">
        {product.isNew && (
          <span className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            NEW
          </span>
        )}
        {product.discount > 0 && (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            {product.discount}% OFF
          </span>
        )}
        <div className="h-48 overflow-hidden bg-gray-200">
          {product.image ? (
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-full object-cover hover:transform hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-gray-400 text-4xl">
                {categoryIcons && categoryIcons[product.category]}
              </span>
            </div>
          )}
        </div>
      </div>
      
      <div className="p-4 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-lg font-semibold text-gray-800 line-clamp-2 hover:text-blue-600 transition-colors">
            {product.name}
          </h2>
        </div>
        
        <div className="flex items-center mb-2">
          <div className="flex text-yellow-400 mr-2">
            {[...Array(5)].map((_, i) => (
              <FaStar 
                key={i}
                className={i < (product.rating || 3) ? "text-yellow-400" : "text-gray-300"}
                size={14}
              />
            ))}
          </div>
        </div>
        
        <div className="mb-2">
          <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
            {categoryIcons && categoryIcons[product.category]}
            {product.category}
          </span>
        </div>
        
        <div className="mt-auto">
          <div className="flex justify-between items-center mb-3">
            {product.oldPrice ? (
              <div className="flex items-center">
                <span className="text-lg font-bold text-blue-600">
                  Rs {product.price.toFixed(2)}
                </span>
                <span className="text-gray-400 text-sm line-through ml-2">
                  Rs {product.oldPrice.toFixed(2)}
                </span>
              </div>
            ) : (
              <span className="text-lg font-bold text-blue-600">
                Rs {product.price.toFixed(2)}
              </span>
            )}
          
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleViewDetails}
              variant="outline" 
              className="flex-grow w-full border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
            >
              View Details
            </Button>
            <Button 
              onClick={handleAddToCart} 
              className="bg-blue-600 hover:bg-blue-700 text-white p-2"
              disabled={product.stock <= 0}
            >
              <FaShoppingCart />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;