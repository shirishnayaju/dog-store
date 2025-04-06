import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "./ui/button";
import { useCart } from '../hooks/useCart';
import { FaShoppingCart, FaStar } from 'react-icons/fa';
import { Toast } from '../components/ui/toast';

export default function VaccinationCard({ vaccine, categoryIcons }) {
  // Safety check - if vaccine is undefined, don't render the component
  if (!vaccine) {
    return null;
  }

  const { addToCart } = useCart();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [quantity, setQuantity] = useState(1); // Default quantity is 1

  const handleAddToCart = () => {
    addToCart({ ...vaccine, quantity });
    setShowConfirmation(true);
    // Auto-hide confirmation after 3 seconds
    setTimeout(() => {
      setShowConfirmation(false);
    }, 3000);
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 flex flex-col h-full">
      <div className="relative">
        {vaccine.isNew && (
          <span className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            NEW
          </span>
        )}
        {vaccine.discount > 0 && (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            {vaccine.discount}% OFF
          </span>
        )}
        <div className="h-48 overflow-hidden bg-gray-200">
          {vaccine.image ? (
            <img
              src={vaccine.image}
              alt={vaccine.name}
              className="w-full h-full object-cover hover:transform hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-gray-400 text-4xl">
                {categoryIcons && categoryIcons[vaccine.category]}
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="p-4 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-lg font-semibold text-gray-800 line-clamp-2 hover:text-blue-600 transition-colors">
            {vaccine.name}
          </h2>
        </div>
        <div className="flex items-center mb-2">
          <div className="flex text-yellow-400 mr-2">
            {[...Array(5)].map((_, i) => (
              <FaStar
                key={i}
                className={i < (vaccine.rating || 3) ? "text-yellow-400" : "text-gray-300"}
                size={14}
              />
            ))}
          </div>
        </div>
        <div className="mb-2">
          <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
            {categoryIcons && categoryIcons[vaccine.category]}
            {vaccine.category}
          </span>
        </div>
        <div className="mt-auto">
          <div className="flex justify-between items-center mb-3">
            {vaccine.oldPrice ? (
              <div className="flex items-center">
                <span className="text-lg font-bold text-blue-600">
                  ${vaccine.price.toFixed(2)}
                </span>
                <span className="text-gray-400 text-sm line-through ml-2">
                  ${vaccine.oldPrice.toFixed(2)}
                </span>
              </div>
            ) : (
              <span className="text-lg font-bold text-blue-600">
                ${vaccine.price.toFixed(2)}
              </span>
            )}
            <span className="text-xs text-gray-500">
              {vaccine.stock > 0 ? `${vaccine.stock} in stock` : "Out of stock"}
            </span>
          </div>
          <div className="flex gap-2">
            <Link to={`/vaccination/${vaccine._id}`} className="flex-grow">
              <Button
                variant="outline"
                className="w-full border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
              >
                View Details
              </Button>
            </Link>
            <Button
              onClick={handleAddToCart}
              className="bg-blue-600 hover:bg-blue-700 text-white p-2"
              disabled={vaccine.stock <= 0}
            >
              <FaShoppingCart />
            </Button>
          </div>
        </div>
      </div>
      {/* Toast Notification for Add to Cart */}
      {showConfirmation && (
        <Toast
          title="Product Added"
          description={`"${vaccine.name}" has been added to your cart.`}
          duration={3000}
          onClose={() => setShowConfirmation(false)}
        />
      )}
    </div>
  );
}