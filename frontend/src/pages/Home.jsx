import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "../components/ui/button";
import { FaBone, FaFootballBall, FaBed, FaTag, FaLink, FaUtensils, FaPills, FaHeart } from 'react-icons/fa';
import { ArrowRight, ShoppingBag, UserPlus, LogIn, Search, ArrowUpCircle } from 'lucide-react';
import Puppies from '../Image/puppies.png'; 
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleCategory, setVisibleCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    
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
      
    // Scroll to top button visibility
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const categoryIcons = {
    'All': <FaHeart className="text-pink-500" />,
    'Food': <FaUtensils className="text-yellow-500" />,
    'Toys': <FaFootballBall className="text-amber-800" />,
    'Supplements': <FaPills className="text-red-500" />,
    'Accessories': <FaTag className="text-purple-500" />,
    'Belts': <FaLink className="text-gray-500" />,
    'Wet Foods': <FaBone className="text-green-500" />,
    'Cage': <FaBed className="text-orange-500" />

  };

  const categoryColors = {
    'All': 'bg-pink-600 hover:bg-pink-700',
    'Food': 'bg-yellow-600 hover:bg-yellow-700',
    'Toys': 'bg-amber-800 hover:bg-amber-900',
    'Supplements': 'bg-red-600 hover:bg-red-700',
    'Accessories': 'bg-purple-600 hover:bg-purple-700',
    'Belts': 'bg-gray-600 hover:bg-gray-700',
    'Wet Foods': 'bg-green-600 hover:bg-green-700', 
    'Cage': 'bg-orange-600 hover:bg-orange-700'
  };

  const categories = ['All', 'Food', 'Toys', 'Supplements', 'Accessories', 'Belts','Wet Foods', 'Cage'];
 
  const filteredProducts = visibleCategory === 'All' 
    ? featuredProducts.filter(product => product.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : featuredProducts.filter(product => 
        product.category === visibleCategory && 
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-b-blue-500 border-l-transparent border-r-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-lg font-medium text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="bg-red-50 p-6 rounded-lg max-w-md shadow-lg border border-red-100">
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div
          className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-2xl shadow-2xl overflow-hidden mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="p-8 md:p-12 lg:p-16 flex-1">
              <motion.h1 
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Welcome to <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-yellow-500">GHARPALUWA</span>
              </motion.h1>
              <motion.p 
                className="text-xl md:text-2xl mb-8 text-blue-100"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Premium products for your beloved pets
              </motion.p>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <Link to="/products">
                  <Button className="bg-yellow-500 text-blue-700 hover:bg-yellow-400 flex items-center gap-3 px-8 py-6 text-lg font-semibold rounded-full shadow-lg transition-all duration-300 transform hover:scale-105">
                    Shop Now <ShoppingBag className="w-6 h-6" />
                  </Button>
                </Link>
              </motion.div>
            </div>
            <motion.div 
              className="w-full md:w-1/2 h-64 md:h-auto overflow-hidden"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              <img 
                src={Puppies} 
                alt="Happy puppies" 
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500" 
              />
            </motion.div>
          </div>
        </motion.div>

        {/* Promotional Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          <motion.div 
            className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-8 rounded-2xl shadow-lg flex items-center group cursor-pointer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ y: -5 }}
          >
            <div className="mr-6 bg-yellow-200 p-4 rounded-full shadow-md transform group-hover:scale-110 transition-transform duration-300">
              <UserPlus className="w-8 h-8 text-yellow-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2 text-yellow-800">New Customer?</h3>
              <p className="mb-4 text-gray-700">Sign up today and get 10% off your first order!</p>
              <Link to="/signup">
                <Button className="bg-yellow-500 hover:bg-yellow-600 text-white flex items-center gap-2 rounded-full shadow-md transform group-hover:translate-x-2 transition-transform duration-300">
                  Sign Up Now <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
          <motion.div 
            className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl shadow-lg flex items-center group cursor-pointer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ y: -5 }}
          >
            <div className="mr-6 bg-blue-200 p-4 rounded-full shadow-md transform group-hover:scale-110 transition-transform duration-300">
              <LogIn className="w-8 h-8 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2 text-blue-800">Returning Customer?</h3>
              <p className="mb-4 text-gray-700">Check out our latest arrivals and special offers!</p>
              <Link to="/login">
                <Button className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2 rounded-full shadow-md transform group-hover:translate-x-2 transition-transform duration-300">
                  Login Now <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Featured Products Section */}
        <motion.div 
          className="mb-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-blue-800">Featured Products</h2>
            <Link to="/products">
              <Button className="bg-blue-500 hover:bg-blue-900 text-blue-800 flex items-center gap-2 px-4 py-2 rounded-full">
                View All <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {/* Category Selection */}
          <div className="flex flex-wrap gap-3 mb-8 overflow-x-auto pb-3">
            {categories.map(category => (
              <motion.div 
                key={category}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => setVisibleCategory(category)}
                  className={`px-5 py-2 rounded-full flex items-center gap-2 transition-all ${
                    visibleCategory === category 
                      ? `${categoryColors[category]} text-white shadow-lg` 
                      : 'bg-blue-600 text-white hover:bg-blue-800'
                  }`}
                >
                  <span>{categoryIcons[category]}</span>
                  <span>{category}</span>
                </Button>
              </motion.div>
            ))}
          </div>

          {/* Category Display */}
          <motion.div 
            className="bg-white rounded-2xl shadow-xl p-8 mb-12 border border-gray-100"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold flex items-center text-gray-800">
                {categoryIcons[visibleCategory]} 
                <span className="ml-2">{visibleCategory} Products</span>
              </h2>
            </div>
            
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
                {filteredProducts.map(product => (
                  <motion.div 
                    key={product._id} 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    whileHover={{ y: -5 }}
                  >
                    <ProductCard 
                      product={product} 
                      categoryIcons={categoryIcons}
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-blue-50 rounded-xl p-8 text-center">
                <p className="text-lg text-blue-800">No products found in this category{searchQuery ? ` matching "${searchQuery}"` : ''}.</p>
                <Button 
                  onClick={() => {setSearchQuery(''); setVisibleCategory('All');}} 
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Reset Filters
                </Button>
              </div>
            )}
          </motion.div>
        </motion.div>

        {/* Testimonials Section */}
        <motion.div 
          className="mb-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl font-bold text-blue-800 mb-8">What Our Customers Say</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { 
                name: "Sarah Johnson", 
                image: "/api/placeholder/80/80",
                text: "My dog absolutely loves the toys I bought from GHARPALUWA! The quality is amazing and they've lasted much longer than any other toys we've tried." 
              },
              { 
                name: "Michael Chen", 
                image: "/api/placeholder/80/80",
                text: "The premium dog food has made such a difference in my puppy's coat and energy levels. I'm a customer for life!" 
              },
              { 
                name: "Emily Rodriguez", 
                image: "/api/placeholder/80/80",
                text: "Great customer service and fast delivery. The pet bed I ordered is perfect and my cat hasn't left it since it arrived!" 
              }
            ].map((testimonial, index) => (
              <motion.div 
                key={index} 
                className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="flex items-center mb-4">
                  <img src={testimonial.image} alt={testimonial.name} className="w-12 h-12 rounded-full mr-4" />
                  <h3 className="font-semibold text-gray-800">{testimonial.name}</h3>
                </div>
                <p className="text-gray-600 italic">"{testimonial.text}"</p>
                <div className="mt-4 flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Newsletter Section */}
        <motion.div 
          className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-2xl shadow-2xl p-8 mb-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Join Our Newsletter</h2>
            <p className="text-blue-100 mb-6">Subscribe to receive updates on new products, special offers, and pet care tips.</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="flex-1 px-4 py-3 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <Button className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-full font-semibold">
                Subscribe
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
      <AnimatePresence>
        {showScrollTop && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="fixed bottom-16 left-16 bg-blue-600 text-white p-3 rounded-full shadow-lg z-50 hover:bg-blue-700 transition-colors"
                  onClick={scrollToTop}
                >
                  <ArrowUpCircle size={24} />
                </motion.button>
              )}
      </AnimatePresence>
    </div>
  );
}