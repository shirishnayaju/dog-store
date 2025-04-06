import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "../components/ui/button";
import { FaBone, FaFootballBall, FaBed, FaTag, FaUtensils, FaPills, FaHeart } from 'react-icons/fa';
import { ArrowRight, ShoppingBag, Gift, UserPlus, LogIn } from 'lucide-react';
import Puppies from '../Image/puppies.png'; 
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { motion } from 'framer-motion';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleCategory, setVisibleCategory] = useState('All');

  useEffect(() => {
    axios.get('http://localhost:4001/products') 
      .then(response => {
        setFeaturedProducts(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching products:", err);
        setError("Failed to load products.");
        setLoading(false);
      });
  }, []);

  const categoryIcons = {
    'All': <FaHeart className="text-pink-500" />,
    'Food': <FaUtensils className="text-yellow-500" />,
    'Toys': <FaFootballBall className="text-amber-800" />,
    'Supplements': <FaPills className="text-red-500" />,
    'Accessories': <FaTag className="text-purple-500" />,
    'Wet Foods': <FaBone className="text-green-500" />,
    'Cage': <FaBed className="text-orange-500" />
  };

  const categoryColors = {
    'All': 'bg-pink-600 hover:bg-pink-700',
    'Food': 'bg-yellow-600 hover:bg-yellow-700',
    'Toys': 'bg-amber-800 hover:bg-amber-900',
    'Supplements': 'bg-red-600 hover:bg-red-700',
    'Accessories': 'bg-purple-600 hover:bg-purple-700',
    'Wet Foods': 'bg-green-600 hover:bg-green-700', 
    'Cage': 'bg-orange-600 hover:bg-orange-700'
  };

  const categories = ['All','Food', 'Toys', 'Supplements', 'Accessories', 'Wet Foods', 'Cage'];
 
  const filteredProducts = visibleCategory === 'All' 
    ? featuredProducts 
    : featuredProducts.filter(product => product.category === visibleCategory);

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
      {/* Hero Section */}
      <motion.div
        className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl shadow-xl overflow-hidden mb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 3 }}
      >
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="p-12 md:p-16 lg:p-20 flex-1">
            <motion.h2 
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 4 }}
            >
              Welcome to GHARPALUWA
            </motion.h2>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">Find the best products for your furry friend!</p>
            <Link to="/products">
            <motion.h2 
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 2 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            
            >
            <Button className=" text-blue-700 hover:text-blue-600 hover:bg-blue-50 flex items-center gap-3 px-8 py-3 text-lg shadow-md rounded-lg">
                Shop Now <ShoppingBag className="w-6 h-6" />
              </Button>
              </motion.h2>
            </Link>
          </div>
          <div className="w-full md:w-1/2 h-64 md:h-auto hobver: overflow-hidden">
            <motion.img 
              src={Puppies} 
              alt="Happy dog" 
              className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500" 
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 2 }}
              
            />
          </div>
        </div>
      </motion.div>

      {/* Promotional Cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <motion.div 
          className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 md:p-8 rounded-xl shadow-md flex items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <div className="mr-6 bg-yellow-200 p-4 rounded-full">
            <UserPlus className="w-8 h-8 text-yellow-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-2 text-yellow-800">New Customer?</h3>
            <p className="mb-4 text-gray-700">Sign up today and get 10% off your first order!</p>
            <Link to="/signup">
              <Button className="bg-yellow-500 hover:bg-yellow-600 text-white flex items-center gap-2">
                Sign Up Now <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
        <motion.div 
          className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 md:p-8 rounded-xl shadow-md flex items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <div className="mr-6 bg-blue-200 p-4 rounded-full">
            <LogIn className="w-8 h-8 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-2 text-blue-800">Returning Customer?</h3>
            <p className="mb-4 text-gray-700">Check out our latest arrivals and special offers!</p>
            <Link to="/login">
              <Button className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2">
                Login Now <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Featured Products Section */}
      <div className="mb-16">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-blue-600">Featured Products</h2>
        </div>

        {/* Category Selection */}
        <div className="flex flex-wrap gap-2 mb-8 overflow-x-auto pb-2">
          {categories.map(category => (
            <motion.div 
              key={category}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Button
                onClick={() => setVisibleCategory(category)}
                className={`px-4 py-2 rounded-full flex items-center gap-2 transition-all ${
                  visibleCategory === category 
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

        {/* Category Display */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl shadow-lg p-8 mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex items-center">
              {categoryIcons[visibleCategory]} 
              <span className="ml-2">{visibleCategory}</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 w-full">
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
            <div className="text-center py-16">
              <p className="text-lg text-white">No products found in this category.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
