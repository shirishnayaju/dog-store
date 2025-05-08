import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "../components/ui/button";
import { FaBone, FaFootballBall, FaBed, FaTag, FaLink, FaUtensils, FaPills, FaHeart } from 'react-icons/fa';
import { ArrowRight, ShoppingBag, UserPlus, LogIn, ArrowUpCircle, ShieldCheck, HeartHandshake, Syringe, User, Heart } from 'lucide-react';
import Puppies from '../Image/puppies.png'; 
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext'; // Import useAuth

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleCategory, setVisibleCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { user } = useAuth(); // Get the current user from AuthContext
  const [subscribeEmail, setSubscribeEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribeMessage, setSubscribeMessage] = useState('');
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [isValidEmail, setIsValidEmail] = useState(true);
  
  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

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

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setSubscribeEmail(value);
    
    if (value) {
      const isValid = validateEmail(value);
      setIsValidEmail(isValid);
      setEmailError(isValid ? '' : 'Please enter a valid email address');
    } else {
      setIsValidEmail(true);
      setEmailError('');
    }
  };

  const handleSubscribe = () => {
    // First validate the email
    if (!subscribeEmail) {
      setEmailError('Email is required');
      setIsValidEmail(false);
      return;
    }
    
    if (!validateEmail(subscribeEmail)) {
      setEmailError('Please enter a valid email address');
      setIsValidEmail(false);
      return;
    }

    setIsSubscribing(true);
    axios.post('http://localhost:4001/api/newsletter/subscribe', { email: subscribeEmail })
      .then(response => {
        setSubscribeMessage('Successfully subscribed!');
        setSubscribeSuccess(true);
        setSubscribeEmail('');
      })
      .catch(error => {
        setSubscribeMessage('Failed to subscribe. Please try again.');
        setSubscribeSuccess(false);
      })
      .finally(() => {
        setIsSubscribing(false);
      });
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
        <div className="relative mb-20">
          {user ? (
            // Welcome message for logged-in users - Enhanced with better layout and more features
            <motion.div 
              className="col-span-full bg-gradient-to-br from-emerald-50 to-emerald-100 p-8 md:p-10 rounded-3xl shadow-xl border border-emerald-100 overflow-hidden relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              whileHover={{ y: -6, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)" }}
            >
              {/* Enhanced decorative elements with animated gradients */}
              <div 
                className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-300 opacity-10 rounded-full"
                style={{
                  background: "radial-gradient(circle, rgba(110,231,183,0.3) 0%, rgba(5,150,105,0.1) 70%)",
                  animation: "pulse 8s infinite"
                }}
              ></div>
              <div 
                className="absolute -left-10 -bottom-10 w-40 h-40 bg-emerald-400 opacity-10 rounded-full"
                style={{
                  background: "radial-gradient(circle, rgba(110,231,183,0.3) 0%, rgba(5,150,105,0.1) 70%)",
                  animation: "pulse 8s infinite reverse"
                }}
              ></div>
              
              <div className="flex flex-col md:flex-row items-start md:items-center gap-8 relative z-10">
                <motion.div 
                  className="bg-gradient-to-br from-emerald-300 to-emerald-500 p-6 rounded-full shadow-lg"
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                  <User className="w-12 h-12 text-white" />
                </motion.div>
                <div className="flex-1">
                  <h3 className="text-2xl md:text-3xl font-bold mb-4 text-emerald-800 flex items-center gap-2">
                    Welcome back, {user.name || "Friend"}! 
                    <motion.span 
                      initial={{ rotate: -20 }} 
                      animate={{ rotate: 20 }} 
                      transition={{ yoyo: Infinity, duration: 0.5, repeatDelay: 1.5 }}
                    >👋</motion.span>
                  </h3>
                  
                  {/* Quick stats - New personalized section */}
                  <div className="bg-white/50 p-4 rounded-lg mb-5 backdrop-blur-sm border border-emerald-100">
                    <p className="text-emerald-800 font-medium mb-3">
                      <span className="inline-block bg-emerald-100 rounded-full px-2 py-1 text-xs font-semibold text-emerald-700 mr-2">NEW</span>
                      Here's your personalized dashboard:
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white p-3 rounded-lg shadow-sm text-center">
                        <p className="text-2xl font-bold text-emerald-600">0</p>
                        <p className="text-xs text-gray-600">Orders in Progress</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg shadow-sm text-center">
                        <p className="text-2xl font-bold text-amber-600">0</p>
                        <p className="text-xs text-gray-600">Pet Vaccinations</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg shadow-sm text-center">
                        <p className="text-2xl font-bold text-blue-600">0</p>
                        <p className="text-xs text-gray-600">Wishlist Items</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg shadow-sm text-center">
                        <p className="text-2xl font-bold text-purple-600">0</p>
                        <p className="text-xs text-gray-600">Reward Points</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-5">
                    <p className="text-gray-700 text-lg font-medium">
                      We're thrilled to see you again! Here's how to make the most of your Gharpaluwa experience:
                    </p>
                    <div className="grid md:grid-cols-3 gap-4 mt-6">
                      <motion.div 
                        className="bg-white p-4 rounded-xl shadow-md border-l-4 border-teal-500"
                        whileHover={{ scale: 1.03, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      >
                        <div className="bg-teal-100 w-12 h-12 rounded-full flex items-center justify-center mb-3 mx-auto">
                          <ShoppingBag className="w-6 h-6 text-teal-600" />
                        </div>
                        <h4 className="font-semibold text-center mb-2 text-teal-800">Browse Categories</h4>
                        <p className="text-sm text-gray-600 text-center">Explore our products by selecting a category below</p>
                      </motion.div>
                      
                      <motion.div 
                        className="bg-white p-4 rounded-xl shadow-md border-l-4 border-pink-500"
                        whileHover={{ scale: 1.03, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      >
                        <div className="bg-pink-100 w-12 h-12 rounded-full flex items-center justify-center mb-3 mx-auto">
                          <Heart className="w-6 h-6 text-pink-600" />
                        </div>
                        <h4 className="font-semibold text-center mb-2 text-pink-800">Featured Products</h4>
                        <p className="text-sm text-gray-600 text-center">Check out our most popular items further down this page</p>
                      </motion.div>
                      
                      <motion.div 
                        className="bg-white p-4 rounded-xl shadow-md border-l-4 border-purple-500"
                        whileHover={{ scale: 1.03, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      >
                        <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mb-3 mx-auto">
                          <Syringe className="w-6 h-6 text-purple-600" />
                        </div>
                        <h4 className="font-semibold text-center mb-2 text-purple-800">Pet Services</h4>
                        <p className="text-sm text-gray-600 text-center">Don't forget about our pet vaccination services!</p>
                      </motion.div>
                    </div>
                    
                    <div className="flex flex-wrap gap-3 mt-8 pt-4 border-t border-emerald-200">
                      <Link to="/products">
                        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 rounded-full shadow-md px-6 py-5 h-auto">
                          Browse Products <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                      <Link to="/profile">
                        <Button variant="outline" className="border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 flex items-center gap-2 rounded-full px-6 py-5 h-auto">
                          Your Profile <User className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                      <Link to="/vaccination">
                        <Button variant="outline" className="border-2 border-purple-600 text-purple-700 hover:bg-purple-50 flex items-center gap-2 rounded-full px-6 py-5 h-auto">
                          Book Vaccination <Syringe className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            // For non-logged in users - Enhanced with improved visuals and clearer CTA
            <div className="grid md:grid-cols-2 gap-6 md:gap-10">
              <motion.div 
                className="bg-gradient-to-br from-yellow-50 to-yellow-200 p-8 rounded-3xl shadow-xl overflow-hidden relative border border-yellow-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                whileHover={{ 
                  y: -8, 
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.2)" 
                }}
              >
                {/* Enhanced decorative elements */}
                <div 
                  className="absolute -right-20 -top-20 w-64 h-64 rounded-full"
                  style={{
                    background: "radial-gradient(circle, rgba(252,211,77,0.3) 0%, rgba(251,191,36,0.1) 70%)",
                    animation: "pulse 8s infinite"
                  }}
                ></div>
                <div 
                  className="absolute -left-10 -bottom-10 w-40 h-40 rounded-full"
                  style={{
                    background: "radial-gradient(circle, rgba(252,211,77,0.3) 0%, rgba(251,191,36,0.1) 70%)",
                    animation: "pulse 8s infinite reverse"
                  }}
                ></div>
                
                <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                  <motion.div 
                    className="bg-gradient-to-br from-yellow-300 to-yellow-500 p-5 rounded-full shadow-lg flex-shrink-0 mb-4 md:mb-0"
                    whileHover={{ rotate: 10, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  >
                    <UserPlus className="w-10 h-10 text-white" />
                  </motion.div>
                  <div className="flex-1 text-center md:text-left">
                    <motion.h3 
                      className="text-2xl font-bold mb-3 text-yellow-800"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      New Customer?
                    </motion.h3>
                    <motion.p 
                      className="mb-5 text-gray-700 text-lg"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      Sign up today and get <span className="font-bold text-yellow-600">10% off</span> your first order!
                    </motion.p>
                    
                    {/* Benefits list - New addition */}
                    <motion.ul 
                      className="space-y-2 mb-5 text-left mx-auto md:mx-0 max-w-xs"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <li className="flex items-center text-yellow-800">
                        <span className="bg-yellow-300 p-1 rounded-full mr-2">✓</span>
                        Exclusive member-only discounts
                      </li>
                      <li className="flex items-center text-yellow-800">
                        <span className="bg-yellow-300 p-1 rounded-full mr-2">✓</span>
                        Save your favorite products
                      </li>
                      <li className="flex items-center text-yellow-800">
                        <span className="bg-yellow-300 p-1 rounded-full mr-2">✓</span>
                        Track your orders easily
                      </li>
                    </motion.ul>
                    
                    <Link to="/signup">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                        <Button className="bg-yellow-500 hover:bg-yellow-600 text-white flex items-center gap-2 rounded-full shadow-md px-8 py-6 h-auto text-lg">
                          Sign Up Now <ArrowRight className="w-5 h-5 ml-1 animate-pulse" />
                        </Button>
                      </motion.div>
                    </Link>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="bg-gradient-to-br from-blue-50 to-blue-200 p-8 rounded-3xl shadow-xl overflow-hidden relative border border-blue-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                whileHover={{ 
                  y: -8, 
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.2)" 
                }}
              >
                {/* Enhanced decorative elements */}
                <div 
                  className="absolute -right-20 -top-20 w-64 h-64 rounded-full"
                  style={{
                    background: "radial-gradient(circle, rgba(96,165,250,0.3) 0%, rgba(59,130,246,0.1) 70%)",
                    animation: "pulse 8s infinite"
                  }}
                ></div>
                <div 
                  className="absolute -left-10 -bottom-10 w-40 h-40 rounded-full"
                  style={{
                    background: "radial-gradient(circle, rgba(96,165,250,0.3) 0%, rgba(59,130,246,0.1) 70%)",
                    animation: "pulse 8s infinite reverse"
                  }}
                ></div>
                
                <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                  <motion.div 
                    className="bg-gradient-to-br from-blue-300 to-blue-500 p-5 rounded-full shadow-lg flex-shrink-0 mb-4 md:mb-0"
                    whileHover={{ rotate: -10, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  >
                    <LogIn className="w-10 h-10 text-white" />
                  </motion.div>
                  <div className="flex-1 text-center md:text-left">
                    <motion.h3 
                      className="text-2xl font-bold mb-3 text-blue-800"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      Returning Customer?
                    </motion.h3>
                    <motion.p 
                      className="mb-5 text-gray-700 text-lg"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      Welcome back! Check out our latest arrivals and <span className="font-bold text-blue-600">special offers</span>!
                    </motion.p>
                    
                    {/* Recent additions - New feature highlight */}
                    <motion.div 
                      className="bg-white/50 backdrop-blur-sm p-3 rounded-lg mb-5 border border-blue-100"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      <p className="font-medium text-blue-800 mb-2 text-sm">
                        <span className="inline-block bg-blue-100 rounded-full px-2 py-1 text-xs font-semibold text-blue-700 mr-1">NEW</span>
                        Recently added:
                      </p>
                      <div className="flex justify-center md:justify-start space-x-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-500">
                          <ShoppingBag size={14} />
                        </div>
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-500">
                          <Syringe size={14} />
                        </div>
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-500">
                          <Heart size={14} />
                        </div>
                      </div>
                    </motion.div>
                    
                    <Link to="/login">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                        <Button className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2 rounded-full shadow-md px-8 py-6 h-auto text-lg">
                          Login Now <ArrowRight className="w-5 h-5 ml-1 animate-pulse" />
                        </Button>
                      </motion.div>
                    </Link>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>

        {/* Services Section */}
        <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeIn}
        className="mb-16"
      >
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-blue-800 mb-4">Our Comprehensive Services</h2>
          <div className="w-24 h-1 bg-yellow-400 mx-auto rounded-full"></div>
        </div>
        
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          <ServiceCard 
            icon={<ShieldCheck className="w-12 h-12 text-blue-500" />}
            title="Quality Products"
            description="We offer a curated selection of premium dog food, toys, and accessories."
            bgColor="bg-blue-50"
            iconBg="bg-blue-100"
          />
          <ServiceCard 
            icon={<ShoppingBag className="w-12 h-12 text-indigo-500" />}
            title="E-commerce Platform"
            description="Shop for a wide range of dog products anytime, anywhere."
            bgColor="bg-indigo-50"
            iconBg="bg-indigo-100"
          />
          <ServiceCard 
            icon={<HeartHandshake className="w-12 h-12 text-purple-500" />}
            title="Customer Care"
            description="Our dedicated team is always ready to assist you with any queries."
            bgColor="bg-purple-50"
            iconBg="bg-purple-100"
          />
          <ServiceCard 
            icon={<Syringe className="w-12 h-12 text-green-500" />}
            title="Vaccination Services"
            description="Professional in-house vaccination services to keep your pet healthy."
            bgColor="bg-green-50"
            iconBg="bg-green-100"
          />
        </motion.div>
      </motion.div>

      
        {/* Instagram Feed Section - New Addition */}
        <motion.div
          className="mb-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-blue-800 mb-4">
              <span className="inline-flex items-center">
                <svg className="w-8 h-8 mr-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C14.717 2 15.056 2.01 16.122 2.06C17.187 2.11 17.912 2.277 18.55 2.525C19.21 2.779 19.766 3.123 20.322 3.678C20.8305 4.1779 21.224 4.78259 21.475 5.45C21.722 6.087 21.89 6.813 21.94 7.878C21.987 8.944 22 9.283 22 12C22 14.717 21.99 15.056 21.94 16.122C21.89 17.187 21.722 17.912 21.475 18.55C21.2247 19.2178 20.8311 19.8226 20.322 20.322C19.822 20.8303 19.2173 21.2238 18.55 21.475C17.913 21.722 17.187 21.89 16.122 21.94C15.056 21.987 14.717 22 12 22C9.283 22 8.944 21.99 7.878 21.94C6.813 21.89 6.088 21.722 5.45 21.475C4.78233 21.2245 4.17753 20.8309 3.678 20.322C3.16941 19.8222 2.77593 19.2175 2.525 18.55C2.277 17.913 2.11 17.187 2.06 16.122C2.013 15.056 2 14.717 2 12C2 9.283 2.01 8.944 2.06 7.878C2.11 6.812 2.277 6.088 2.525 5.45C2.77524 4.78218 3.1688 4.17732 3.678 3.678C4.17767 3.16923 4.78243 2.77573 5.45 2.525C6.088 2.277 6.812 2.11 7.878 2.06C8.944 2.013 9.283 2 12 2Z" stroke="url(#instagram-gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 12C16 13.0609 15.5786 14.0783 14.8284 14.8284C14.0783 15.5786 13.0609 16 12 16C10.9391 16 9.92172 15.5786 9.17157 14.8284C8.42143 14.0783 8 13.0609 8 12C8 10.9391 8.42143 9.92172 9.17157 9.17157C9.92172 8.42143 10.9391 8 12 8C13.0609 8 14.0783 8.42143 14.8284 9.17157C15.5786 9.92172 16 10.9391 16 12Z" stroke="url(#instagram-gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="16.5" cy="7.5" r="1.5" fill="url(#instagram-gradient)"/>
                  <defs>
                    <linearGradient id="instagram-gradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#FFDD55"/>
                      <stop offset="0.5" stopColor="#FF543E"/>
                      <stop offset="1" stopColor="#C837AB"/>
                    </linearGradient>
                  </defs>
                </svg>
                #GharpaluwaFamily
              </span>
            </h2>
            <div className="w-24 h-1 bg-yellow-400 mx-auto rounded-full mb-6"></div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Share your pet moments with us on Instagram using <span className="font-semibold">#GharpaluwaFamily</span>
            </p>
          </div>

          {/* Instagram Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
            {/* Instagram Post 1 */}
            <motion.div 
              className="relative aspect-square overflow-hidden rounded-xl shadow-md cursor-pointer group"
              whileHover={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex flex-col justify-end p-4">
                <p className="text-white text-sm font-medium truncate">@happy_dog_owner</p>
                <p className="text-white/80 text-xs">Buddy loves his new toys! 🥰 #GharpaluwaFamily</p>
              </div>
              <img 
                src="/src/Image/Dog2.jpg" 
                alt="Instagram post of a happy dog with toys" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute top-3 right-3 z-20">
                <div className="bg-white/70 backdrop-blur-sm p-1 rounded-full">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C14.717 2 15.056 2.01 16.122 2.06C17.187 2.11 17.912 2.277 18.55 2.525C19.21 2.779 19.766 3.123 20.322 3.678C20.8305 4.1779 21.224 4.78259 21.475 5.45C21.722 6.087 21.89 6.813 21.94 7.878C21.987 8.944 22 9.283 22 12C22 14.717 21.99 15.056 21.94 16.122C21.89 17.187 21.722 17.912 21.475 18.55C21.2247 19.2178 20.8311 19.8226 20.322 20.322C19.822 20.8303 19.2173 21.2238 18.55 21.475C17.913 21.722 17.187 21.89 16.122 21.94C15.056 21.987 14.717 22 12 22C9.283 22 8.944 21.99 7.878 21.94C6.813 21.89 6.088 21.722 5.45 21.475C4.78233 21.2245 4.17753 20.8309 3.678 20.322C3.16941 19.8222 2.77593 19.2175 2.525 18.55C2.277 17.913 2.11 17.187 2.06 16.122C2.013 15.056 2 14.717 2 12C2 9.283 2.01 8.944 2.06 7.878C2.11 6.812 2.277 6.088 2.525 5.45C2.77524 4.78218 3.1688 4.17732 3.678 3.678C4.17767 3.16923 4.78243 2.77573 5.45 2.525C6.088 2.277 6.812 2.11 7.878 2.06C8.944 2.013 9.283 2 12 2Z" stroke="url(#instagram-mini-gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 12C16 13.0609 15.5786 14.0783 14.8284 14.8284C14.0783 15.5786 13.0609 16 12 16C10.9391 16 9.92172 15.5786 9.17157 14.8284C8.42143 14.0783 8 13.0609 8 12C8 10.9391 8.42143 9.92172 9.17157 9.17157C9.92172 8.42143 10.9391 8 12 8C13.0609 8 14.0783 8.42143 14.8284 9.17157C15.5786 9.92172 16 10.9391 16 12Z" stroke="url(#instagram-mini-gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <defs>
                      <linearGradient id="instagram-mini-gradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#FFDD55"/>
                        <stop offset="0.5" stopColor="#FF543E"/>
                        <stop offset="1" stopColor="#C837AB"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
            </motion.div>
            
            {/* Instagram Post 2 */}
            <motion.div 
              className="relative aspect-square overflow-hidden rounded-xl shadow-md cursor-pointer group"
              whileHover={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex flex-col justify-end p-4">
                <p className="text-white text-sm font-medium truncate">@pawsome_life</p>
                <p className="text-white/80 text-xs">Max after his vaccination at Gharpaluwa. So brave! 💉 #PetCare</p>
              </div>
              <img 
                src="/src/Image/Dog6.jpg" 
                alt="Instagram post of a dog after vaccination" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute top-3 right-3 z-20">
                <div className="bg-white/70 backdrop-blur-sm p-1 rounded-full">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C14.717 2 15.056 2.01 16.122 2.06C17.187 2.11 17.912 2.277 18.55 2.525C19.21 2.779 19.766 3.123 20.322 3.678C20.8305 4.1779 21.224 4.78259 21.475 5.45C21.722 6.087 21.89 6.813 21.94 7.878C21.987 8.944 22 9.283 22 12C22 14.717 21.99 15.056 21.94 16.122C21.89 17.187 21.722 17.912 21.475 18.55C21.2247 19.2178 20.8311 19.8226 20.322 20.322C19.822 20.8303 19.2173 21.2238 18.55 21.475C17.913 21.722 17.187 21.89 16.122 21.94C15.056 21.987 14.717 22 12 22C9.283 22 8.944 21.99 7.878 21.94C6.813 21.89 6.088 21.722 5.45 21.475C4.78233 21.2245 4.17753 20.8309 3.678 20.322C3.16941 19.8222 2.77593 19.2175 2.525 18.55C2.277 17.913 2.11 17.187 2.06 16.122C2.013 15.056 2 14.717 2 12C2 9.283 2.01 8.944 2.06 7.878C2.11 6.812 2.277 6.088 2.525 5.45C2.77524 4.78218 3.1688 4.17732 3.678 3.678C4.17767 3.16923 4.78243 2.77573 5.45 2.525C6.088 2.277 6.812 2.11 7.878 2.06C8.944 2.013 9.283 2 12 2Z" stroke="url(#instagram-mini-gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 12C16 13.0609 15.5786 14.0783 14.8284 14.8284C14.0783 15.5786 13.0609 16 12 16C10.9391 16 9.92172 15.5786 9.17157 14.8284C8.42143 14.0783 8 13.0609 8 12C8 10.9391 8.42143 9.92172 9.17157 9.17157C9.92172 8.42143 10.9391 8 12 8C13.0609 8 14.0783 8.42143 14.8284 9.17157C15.5786 9.92172 16 10.9391 16 12Z" stroke="url(#instagram-mini-gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <defs>
                      <linearGradient id="instagram-mini-gradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#FFDD55"/>
                        <stop offset="0.5" stopColor="#FF543E"/>
                        <stop offset="1" stopColor="#C837AB"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
            </motion.div>
            
            {/* Instagram Post 3 */}
            <motion.div 
              className="relative aspect-square overflow-hidden rounded-xl shadow-md cursor-pointer group"
              whileHover={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex flex-col justify-end p-4">
                <p className="text-white text-sm font-medium truncate">@puppylover2025</p>
                <p className="text-white/80 text-xs">Luna's first premium food from @Gharpaluwa has arrived! #HappyPup</p>
              </div>
              <img 
                src="/src/Image/puppies.png" 
                alt="Instagram post of puppy with premium dog food" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute top-3 right-3 z-20">
                <div className="bg-white/70 backdrop-blur-sm p-1 rounded-full">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C14.717 2 15.056 2.01 16.122 2.06C17.187 2.11 17.912 2.277 18.55 2.525C19.21 2.779 19.766 3.123 20.322 3.678C20.8305 4.1779 21.224 4.78259 21.475 5.45C21.722 6.087 21.89 6.813 21.94 7.878C21.987 8.944 22 9.283 22 12C22 14.717 21.99 15.056 21.94 16.122C21.89 17.187 21.722 17.912 21.475 18.55C21.2247 19.2178 20.8311 19.8226 20.322 20.322C19.822 20.8303 19.2173 21.2238 18.55 21.475C17.913 21.722 17.187 21.89 16.122 21.94C15.056 21.987 14.717 22 12 22C9.283 22 8.944 21.99 7.878 21.94C6.813 21.89 6.088 21.722 5.45 21.475C4.78233 21.2245 4.17753 20.8309 3.678 20.322C3.16941 19.8222 2.77593 19.2175 2.525 18.55C2.277 17.913 2.11 17.187 2.06 16.122C2.013 15.056 2 14.717 2 12C2 9.283 2.01 8.944 2.06 7.878C2.11 6.812 2.277 6.088 2.525 5.45C2.77524 4.78218 3.1688 4.17732 3.678 3.678C4.17767 3.16923 4.78243 2.77573 5.45 2.525C6.088 2.277 6.812 2.11 7.878 2.06C8.944 2.013 9.283 2 12 2Z" stroke="url(#instagram-mini-gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 12C16 13.0609 15.5786 14.0783 14.8284 14.8284C14.0783 15.5786 13.0609 16 12 16C10.9391 16 9.92172 15.5786 9.17157 14.8284C8.42143 14.0783 8 13.0609 8 12C8 10.9391 8.42143 9.92172 9.17157 9.17157C9.92172 8.42143 10.9391 8 12 8C13.0609 8 14.0783 8.42143 14.8284 9.17157C15.5786 9.92172 16 10.9391 16 12Z" stroke="url(#instagram-mini-gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <defs>
                      <linearGradient id="instagram-mini-gradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#FFDD55"/>
                        <stop offset="0.5" stopColor="#FF543E"/>
                        <stop offset="1" stopColor="#C837AB"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
            </motion.div>
            
            {/* Instagram Post 4 */}
            <motion.div 
              className="relative aspect-square overflow-hidden rounded-xl shadow-md cursor-pointer group"
              whileHover={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex flex-col justify-end p-4">
                <p className="text-white text-sm font-medium truncate">@dog_mommy</p>
                <p className="text-white/80 text-xs">Rocky enjoying his new bed from @Gharpaluwa! Best purchase ever ❤️</p>
              </div>
              <img 
                src="/src/Image/Dog.jpg" 
                alt="Instagram post of dog in new bed" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute top-3 right-3 z-20">
                <div className="bg-white/70 backdrop-blur-sm p-1 rounded-full">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C14.717 2 15.056 2.01 16.122 2.06C17.187 2.11 17.912 2.277 18.55 2.525C19.21 2.779 19.766 3.123 20.322 3.678C20.8305 4.1779 21.224 4.78259 21.475 5.45C21.722 6.087 21.89 6.813 21.94 7.878C21.987 8.944 22 9.283 22 12C22 14.717 21.99 15.056 21.94 16.122C21.89 17.187 21.722 17.912 21.475 18.55C21.2247 19.2178 20.8311 19.8226 20.322 20.322C19.822 20.8303 19.2173 21.2238 18.55 21.475C17.913 21.722 17.187 21.89 16.122 21.94C15.056 21.987 14.717 22 12 22C9.283 22 8.944 21.99 7.878 21.94C6.813 21.89 6.088 21.722 5.45 21.475C4.78233 21.2245 4.17753 20.8309 3.678 20.322C3.16941 19.8222 2.77593 19.2175 2.525 18.55C2.277 17.913 2.11 17.187 2.06 16.122C2.013 15.056 2 14.717 2 12C2 9.283 2.01 8.944 2.06 7.878C2.11 6.812 2.277 6.088 2.525 5.45C2.77524 4.78218 3.1688 4.17732 3.678 3.678C4.17767 3.16923 4.78243 2.77573 5.45 2.525C6.088 2.277 6.812 2.11 7.878 2.06C8.944 2.013 9.283 2 12 2Z" stroke="url(#instagram-mini-gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 12C16 13.0609 15.5786 14.0783 14.8284 14.8284C14.0783 15.5786 13.0609 16 12 16C10.9391 16 9.92172 15.5786 9.17157 14.8284C8.42143 14.0783 8 13.0609 8 12C8 10.9391 8.42143 9.92172 9.17157 9.17157C9.92172 8.42143 10.9391 8 12 8C13.0609 8 14.0783 8.42143 14.8284 9.17157C15.5786 9.92172 16 10.9391 16 12Z" stroke="url(#instagram-mini-gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <defs>
                      <linearGradient id="instagram-mini-gradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#FFDD55"/>
                        <stop offset="0.5" stopColor="#FF543E"/>
                        <stop offset="1" stopColor="#C837AB"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
            </motion.div>
          </div>

          {/* View All Button */}
          <div className="flex justify-center mt-8">
            <a 
              href="https://www.instagram.com/gharpaluwa/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-full text-gray-700 font-medium shadow-sm hover:bg-gray-50 hover:border-gray-400 transition-all duration-300"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C14.717 2 15.056 2.01 16.122 2.06C17.187 2.11 17.912 2.277 18.55 2.525C19.21 2.779 19.766 3.123 20.322 3.678C20.8305 4.1779 21.224 4.78259 21.475 5.45C21.722 6.087 21.89 6.813 21.94 7.878C21.987 8.944 22 9.283 22 12C22 14.717 21.99 15.056 21.94 16.122C21.89 17.187 21.722 17.912 21.475 18.55C21.2247 19.2178 20.8311 19.8226 20.322 20.322C19.822 20.8303 19.2173 21.2238 18.55 21.475C17.913 21.722 17.187 21.89 16.122 21.94C15.056 21.987 14.717 22 12 22C9.283 22 8.944 21.99 7.878 21.94C6.813 21.89 6.088 21.722 5.45 21.475C4.78233 21.2245 4.17753 20.8309 3.678 20.322C3.16941 19.8222 2.77593 19.2175 2.525 18.55C2.277 17.913 2.11 17.187 2.06 16.122C2.013 15.056 2 14.717 2 12C2 9.283 2.01 8.944 2.06 7.878C2.11 6.812 2.277 6.088 2.525 5.45C2.77524 4.78218 3.1688 4.17732 3.678 3.678C4.17767 3.16923 4.78243 2.77573 5.45 2.525C6.088 2.277 6.812 2.11 7.878 2.06C8.944 2.013 9.283 2 12 2Z" stroke="url(#instagram-button-gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 12C16 13.0609 15.5786 14.0783 14.8284 14.8284C14.0783 15.5786 13.0609 16 12 16C10.9391 16 9.92172 15.5786 9.17157 14.8284C8.42143 14.0783 8 13.0609 8 12C8 10.9391 8.42143 9.92172 9.17157 9.17157C9.92172 8.42143 10.9391 8 12 8C13.0609 8 14.0783 8.42143 14.8284 9.17157C15.5786 9.92172 16 10.9391 16 12Z" stroke="url(#instagram-button-gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <defs>
                  <linearGradient id="instagram-button-gradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#FFDD55"/>
                    <stop offset="0.5" stopColor="#FF543E"/>
                    <stop offset="1" stopColor="#C837AB"/>
                  </linearGradient>
                </defs>
              </svg>
              Follow us on Instagram
            </a>
          </div>
        </motion.div>

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

        {/* Newsletter Section */}
        <motion.div
          className="mb-20 bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl overflow-hidden shadow-xl"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="p-10 md:p-12 relative">
            {/* Decorative elements */}
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-400 opacity-20 rounded-full"></div>
            <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-blue-400 opacity-20 rounded-full"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="md:w-1/2 text-white">
                <h2 className="text-3xl text-yellow-400 md:text-4xl font-bold mb-4">Join Me For Product Notifications!</h2>
                <h2 className="text-3xl md:text-2xl font-bold mb-4">Let's all Subscribe for all product notification!!</h2>
                <p className="text-blue-100 text-lg mb-6">
                  Subscribe to our newsletter to receive exclusive updates, discounts, and pet care tips.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <input 
                    type="email" 
                    value={subscribeEmail}
                    onChange={handleEmailChange}
                    placeholder="Enter your email" 
                    className="px-6 py-4 rounded-full shadow-inner w-full sm:max-w-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                  <Button 
                    onClick={handleSubscribe}
                    disabled={isSubscribing}
                    className="bg-yellow-500 hover:bg-yellow-600 text-blue-800 font-semibold rounded-full px-8 py-4 shadow-lg disabled:opacity-70"
                  >
                    {isSubscribing ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-blue-800 border-t-transparent rounded-full animate-spin"></div>
                        <span>Subscribing...</span>
                      </div>
                    ) : (
                      "Subscribe Now"
                    )}
                  </Button>
                </div>
                {emailError && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 px-4 py-2 rounded-lg bg-red-100/30 text-red-100 border border-red-200/50"
                  >
                    <p className="text-sm">{emailError}</p>
                  </motion.div>
                )}
                {subscribeMessage && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-3 px-4 py-2 rounded-lg ${
                      subscribeSuccess 
                        ? 'bg-green-100/30 text-green-100 border border-green-200/50' 
                        : 'bg-red-100/30 text-red-100 border border-red-200/50'
                    }`}
                  >
                    <p className="text-sm">{subscribeMessage}</p>
                  </motion.div>
                )}
                <p className="text-blue-200 text-xs mt-4">
                  By subscribing, you agree to receive marketing emails. You can unsubscribe at any time.
                </p>
              </div>
              
              <div className="hidden md:block">
                <motion.div 
                  className="bg-white p-4 rounded-full shadow-xl"
                  animate={{ 
                    y: [0, -10, 0],
                  }}
                  transition={{ 
                    repeat: Infinity,
                    duration: 3,
                    ease: "easeInOut" 
                  }}
                >
                  <div className="bg-yellow-100 p-4 rounded-full">
                    <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5Z" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M3 7L12 13L21 7" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </motion.div>
              </div>
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

// Service Card Component
function ServiceCard({ icon, title, description, bgColor = "bg-white", iconBg = "bg-blue-50" }) {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  return (
    <motion.div 
      variants={cardVariants}
      className={`${bgColor} p-8 rounded-2xl shadow-md flex flex-col items-center transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}
    >
      <div className={`p-4 rounded-full ${iconBg} mb-4`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-gray-800">{title}</h3>
      <p className="text-gray-600 text-center">{description}</p>
    </motion.div>
  );
}