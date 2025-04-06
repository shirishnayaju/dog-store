import React, { useEffect, useState } from 'react';
import { Button } from "../components/ui/button";
import { FaBone, FaFootballBall, FaBed, FaTag, FaUtensils, FaPills, FaHeart } from 'react-icons/fa';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { motion } from 'framer-motion';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    axios.get('http://localhost:4001/products')
      .then(response => {
        setProducts(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching products:", err);
        setError("Failed to load products.");
        setLoading(false);
      });
  }, []);

  const categories = ['All', 'Food', 'Toys', 'Accessories', 'Wet Foods', 'Cage', 'Supplements'];
  
  const categoryIcons = {
    'All': <FaHeart className="text-pink-500" />,
    'Food': <FaUtensils className="text-yellow-500" />,
    'Toys': <FaFootballBall className="text-amber-800" />,
    'Accessories': <FaTag className="text-purple-500" />,
    'Wet Foods': <FaBone className="text-green-500" />,
    'Cage': <FaBed className="text-orange-500" />,
    'Supplements': <FaPills className="text-red-500" />
  };

  // Category button colors for active state
  const categoryColors = {
    'All': 'bg-pink-600 hover:bg-pink-700',
    'Food': 'bg-yellow-600 hover:bg-yellow-700',
    'Toys': 'bg-amber-800 hover:bg-amber-900',
    'Accessories': 'bg-purple-600 hover:bg-purple-700',
    'Wet Foods': 'bg-green-600 hover:bg-green-700', 
    'Cage': 'bg-orange-600 hover:bg-orange-700',
    'Supplements': 'bg-red-600 hover:bg-red-700'
  };

  const filteredProducts = activeCategory === 'All' 
    ? products 
    : products.filter(product => product.category === activeCategory);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-b-blue-500 border-l-transparent border-r-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-lg font-medium text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 p-6 rounded-lg max-w-md">
          <h2 className="text-red-800 text-xl font-bold mb-2">Error</h2>
          <p className="text-red-700">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4 bg-red-600 hover:bg-red-700">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <motion.h1
          className="text-4xl font-bold text-blue-600 mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          Our Pet Products
        </motion.h1>
        <motion.p
          className="text-lg text-gray-600 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          Discover the best products for your furry friends!
        </motion.p>
        
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {categories.map(category => (
            <motion.div
              key={category}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Button
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full flex items-center gap-2 transition-all ${
                  activeCategory === category 
                    ? `${categoryColors[category]} text-white shadow-md` 
                    : 'bg-blue-800 text-white hover:bg-blue-900'
                }`}
              >
                <span>{categoryIcons[category]}</span>
                <span>{category}</span>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.map(product => (
          <motion.div
            key={product._id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <ProductCard 
              product={product} 
              categoryIcons={categoryIcons}
            />
          </motion.div>
        ))}
      </div>
      
      {filteredProducts.length === 0 && (
        <motion.div
          className="text-center py-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-lg text-gray-600">No products found in this category.</p>
        </motion.div>
      )}
    </div>
  );
}
