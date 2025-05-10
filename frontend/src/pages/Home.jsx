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
              className="col-span-full bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 p-8 md:p-10 rounded-3xl shadow-xl border border-emerald-100 overflow-hidden relative"
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
              <div 
                className="absolute right-1/4 top-1/3 w-20 h-20 bg-cyan-400 opacity-10 rounded-full"
                style={{
                  background: "radial-gradient(circle, rgba(34,211,238,0.4) 0%, rgba(8,145,178,0.1) 70%)",
                  animation: "pulse 6s infinite"
                }}
              ></div>
              
              <div className="flex flex-col md:flex-row items-start md:items-center gap-8 relative z-10">
                
                <div className="flex-1">
                  <div className="flex items-center">
                    <motion.div 
                      className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 p-1 mr-3 md:hidden"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.8 }}
                    >
                      <User className="w-8 h-8 text-white" />
                    </motion.div>
                    <h3 className="text-2xl md:text-3xl font-bold mb-4 md:mb-2 text-emerald-800 flex items-center gap-2 bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
                      Welcome back, {user.name || "Friend"}! 
                      <motion.span 
                        initial={{ rotate: -20 }} 
                        animate={{ rotate: 20 }} 
                        transition={{ yoyo: Infinity, duration: 0.5, repeatDelay: 1.5 }}
                      >🐩</motion.span>
                    </h3>
                  </div>
                  
                  <motion.div 
                    className="h-1 w-20 bg-gradient-to-r from-emerald-500 to-teal-500 mb-4 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: "5rem" }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  ></motion.div>
                  
                  <div className="space-y-5">
                    <p className="text-gray-700 text-lg font-medium">
                      We're thrilled to see you again! Here's how to make the most of your Gharpaluwa experience:
                    </p>
                    <div className="grid md:grid-cols-3 gap-4 mt-6">
                      <motion.div 
                        className="bg-white/80 backdrop-blur-sm p-5 rounded-xl shadow-md border-t-4 border-teal-500 overflow-hidden relative group"
                        whileHover={{ 
                          y: -8, 
                          boxShadow: "0 15px 30px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" 
                        }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      >
                        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal-300 via-teal-500 to-teal-700 transform origin-left group-hover:scale-x-100 transition-transform duration-300"></div>
                        <div className="bg-gradient-to-br from-teal-100 to-teal-200 w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto shadow-inner transition-transform group-hover:scale-110 duration-300">
                          <ShoppingBag className="w-8 h-8 text-teal-600" />
                        </div>
                        <h4 className="font-semibold text-center mb-3 text-teal-800 text-lg">Browse Categories</h4>
                        <p className="text-sm text-gray-600 text-center mb-4">Explore our products by selecting a category below</p>
                        <Link to="/products" className="block">
                          <Button className="bg-green-600 hover:from-teal-600 hover:bg-green-500 w-full text-white flex items-center justify-center gap-2 rounded-lg shadow-md py-3 h-auto transition-all duration-300 transform group-hover:translate-y-0">
                            Browse Products <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </Link>
                      </motion.div>
                      
                      <motion.div 
                        className="bg-white/80 backdrop-blur-sm p-5 rounded-xl shadow-md border-t-4 border-pink-500 overflow-hidden relative group"
                        whileHover={{ 
                          y: -8, 
                          boxShadow: "0 15px 30px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" 
                        }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      >
                        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-pink-300 via-pink-500 to-pink-700 transform origin-left group-hover:scale-x-100 transition-transform duration-300"></div>
                        <div className="bg-gradient-to-br from-pink-100 to-pink-200 w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto shadow-inner transition-transform group-hover:scale-110 duration-300">
                          <Heart className="w-8 h-8 text-pink-600" />
                        </div>
                        <h4 className="font-semibold text-center mb-3 text-pink-800 text-lg">Your Account</h4>
                        <p className="text-sm text-gray-600 text-center mb-4">Access your profile, orders, and favorite products</p>
                        <Link to="/profile" className="block">
                          <Button variant="outline" className="w-full border-2 bg-pink-500 border-pink-500 text-pink-700 hover:bg-pink-400 flex items-center justify-center gap-2 rounded-lg py-3 h-auto group-hover:border-pink-600 transition-colors duration-300">
                            Your Profile <User className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </Link>
                      </motion.div>
                      
                      <motion.div 
                        className="bg-white/80 backdrop-blur-sm p-5 rounded-xl shadow-md border-t-4 border-purple-500 overflow-hidden relative group"
                        whileHover={{ 
                          y: -8, 
                          boxShadow: "0 15px 30px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" 
                        }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      >
                        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-300 via-purple-500 to-purple-700 transform origin-left group-hover:scale-x-100 transition-transform duration-300"></div>
                        <div className="bg-gradient-to-br from-purple-100 to-purple-200 w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto shadow-inner transition-transform group-hover:scale-110 duration-300">
                          <Syringe className="w-8 h-8 text-purple-600" />
                        </div>
                        <h4 className="font-semibold text-center mb-3 text-purple-800 text-lg">Pet Services</h4>
                        <p className="text-sm text-gray-600 text-center mb-4">Schedule vaccinations and health services for your pet</p>
                        <Link to="/vaccination" className="block">
                          <Button variant="outline" className="w-full border-2 bg-purple-500 border-purple-500 text-purple-700 hover:bg-purple-400 flex items-center justify-center gap-2 rounded-lg py-3 h-auto group-hover:border-purple-600 transition-colors duration-300">
                            Book Vaccination <Syringe className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </Link>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            // For non-logged in users - Enhanced with improved visuals and clearer CTA
            <div className="grid md:grid-cols-2 gap-6 md:gap-10">
              <motion.div 
                className="bg-gradient-to-r from-yellow-50 via-yellow-100 to-amber-100 p-8 rounded-3xl shadow-xl overflow-hidden relative border border-yellow-200"
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
                <div 
                  className="absolute left-1/4 top-1/3 w-16 h-16 bg-amber-400 opacity-10 rounded-full"
                  style={{
                    background: "radial-gradient(circle, rgba(251,191,36,0.4) 0%, rgba(245,158,11,0.1) 70%)",
                    animation: "pulse 6s infinite"
                  }}
                ></div>
                
                <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                  <motion.div 
                    className="bg-gradient-to-tr from-amber-400 to-yellow-300 p-5 rounded-full shadow-lg flex-shrink-0 mb-4 md:mb-0"
                    whileHover={{ rotate: [0, -5, 5, -5, 0], scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <UserPlus className="w-10 h-10 text-white drop-shadow-md" />
                  </motion.div>
                  <div className="flex-1 text-center md:text-left">
                    <motion.h3 
                      className="text-2xl md:text-3xl font-bold mb-3 bg-gradient-to-r from-amber-700 to-yellow-700 bg-clip-text text-transparent"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      New Customer?
                    </motion.h3>
                    
                    <motion.div 
                      className="h-1 w-16 bg-gradient-to-r from-amber-400 to-yellow-400 mb-4 rounded-full hidden md:block"
                      initial={{ width: 0 }}
                      animate={{ width: "4rem" }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    ></motion.div>
                    
                    <motion.p 
                      className="mb-5 text-gray-700 text-lg"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      Sign up today and get <span className="font-bold text-amber-600 bg-yellow-100 px-2 py-0.5 rounded-md">10% off</span> your first order!
                    </motion.p>
                    
                    {/* Benefits list with enhanced styling */}
                    <motion.ul 
                      className="space-y-3 mb-6 text-left mx-auto md:mx-0 max-w-xs"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <motion.li 
                        className="flex items-center text-amber-800 bg-white/70 backdrop-blur-sm p-2 pl-3 rounded-lg shadow-sm" 
                        whileHover={{ x: 5 }}
                      >
                        <span className="bg-gradient-to-r from-amber-400 to-yellow-400 p-1 rounded-full mr-3 flex items-center justify-center shadow-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </span>
                        Exclusive member-only discounts
                      </motion.li>
                      <motion.li 
                        className="flex items-center text-amber-800 bg-white/70 backdrop-blur-sm p-2 pl-3 rounded-lg shadow-sm" 
                        whileHover={{ x: 5 }}
                      >
                        <span className="bg-gradient-to-r from-amber-400 to-yellow-400 p-1 rounded-full mr-3 flex items-center justify-center shadow-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </span>
                        Save your favorite products
                      </motion.li>
                      <motion.li 
                        className="flex items-center text-amber-800 bg-white/70 backdrop-blur-sm p-2 pl-3 rounded-lg shadow-sm" 
                        whileHover={{ x: 5 }}
                      >
                        <span className="bg-gradient-to-r from-amber-400 to-yellow-400 p-1 rounded-full mr-3 flex items-center justify-center shadow-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </span>
                        Track your orders easily
                      </motion.li>
                    </motion.ul>
                    
                    <Link to="/signup">
                      <motion.div 
                        whileHover={{ scale: 1.05 }} 
                        whileTap={{ scale: 0.98 }}
                        className="relative group"
                      >
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full opacity-70 blur group-hover:opacity-100 transition duration-200"></div>
                        <Button className="relative bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white flex items-center gap-2 rounded-full shadow-md px-8 py-6 h-auto text-lg font-medium">
                          Sign Up Now 
                          <ArrowRight className="w-5 h-5 ml-1 transition-transform group-hover:translate-x-1" />
                        </Button>
                      </motion.div>
                    </Link>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="bg-gradient-to-r from-blue-50 via-sky-50 to-cyan-50 p-8 rounded-3xl shadow-xl overflow-hidden relative border border-blue-100"
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
                <div 
                  className="absolute right-1/4 top-1/3 w-16 h-16 rounded-full"
                  style={{
                    background: "radial-gradient(circle, rgba(14,165,233,0.4) 0%, rgba(3,105,161,0.1) 70%)",
                    animation: "pulse 6s infinite"
                  }}
                ></div>
                
                <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                  <motion.div 
                    className="bg-gradient-to-tr from-blue-500 to-sky-400 p-5 rounded-full shadow-lg flex-shrink-0 mb-4 md:mb-0"
                    whileHover={{ rotate: [0, 5, -5, 5, 0], scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <LogIn className="w-10 h-10 text-white drop-shadow-md" />
                  </motion.div>
                  <div className="flex-1 text-center md:text-left">
                    <motion.h3 
                      className="text-2xl md:text-3xl font-bold mb-3 bg-gradient-to-r from-blue-700 to-sky-700 bg-clip-text text-transparent"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      Returning Customer?
                    </motion.h3>
                    
                    <motion.div 
                      className="h-1 w-16 bg-gradient-to-r from-blue-500 to-sky-500 mb-4 rounded-full hidden md:block"
                      initial={{ width: 0 }}
                      animate={{ width: "4rem" }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                    ></motion.div>
                    
                    <motion.p 
                      className="mb-5 text-gray-700 text-lg"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      Welcome back! Check out our <span className="font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-md">latest arrivals</span> and special offers!
                    </motion.p>
                    
                    {/* Recent additions with enhanced styling */}
                    <motion.div 
                      className="bg-white/70 backdrop-blur-sm p-4 rounded-lg mb-6 border border-blue-100 shadow-sm"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      <p className="font-medium text-blue-800 mb-3 text-sm flex items-center">
                        <span className="inline-block bg-gradient-to-r from-blue-600 to-sky-500 text-white rounded-full px-2 py-1 text-xs font-semibold mr-2">NEW</span>
                        Recently added items:
                      </p>
                      <div className="flex justify-center md:justify-start space-x-3">
                        <motion.div 
                          className="group relative"
                          whileHover={{ y: -3 }}
                        >
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center shadow-sm text-blue-600 group-hover:text-blue-700 transition-colors">
                            <ShoppingBag size={18} />
                          </div>
                          <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-blue-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">New toys</span>
                        </motion.div>
                        <motion.div 
                          className="group relative"
                          whileHover={{ y: -3 }}
                        >
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center shadow-sm text-blue-600 group-hover:text-blue-700 transition-colors">
                            <Syringe size={18} />
                          </div>
                          <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-blue-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Vaccination</span>
                        </motion.div>
                        <motion.div 
                          className="group relative"
                          whileHover={{ y: -3 }}
                        >
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center shadow-sm text-blue-600 group-hover:text-blue-700 transition-colors">
                            <Heart size={18} />
                          </div>
                          <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-blue-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Accessories</span>
                        </motion.div>
                      </div>
                    </motion.div>
                    
                    <Link to="/login">
                      <motion.div 
                        whileHover={{ scale: 1.05 }} 
                        whileTap={{ scale: 0.98 }}
                        className="relative group"
                      >
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-sky-400 rounded-full opacity-70 blur group-hover:opacity-100 transition duration-200"></div>
                        <Button className="relative bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 text-white flex items-center gap-2 rounded-full shadow-md px-8 py-6 h-auto text-lg font-medium">
                          Login Now
                          <ArrowRight className="w-5 h-5 ml-1 transition-transform group-hover:translate-x-1" />
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
            <h2 className="text-3xl md:text-4xl font-bold text-blue-800 mb-4 relative inline-block">
              <span className="inline-flex items-center bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 bg-clip-text text-transparent">
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
              <motion.span 
                className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-red-500 to-purple-500 rounded-full"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
              ></motion.span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto mt-6">
              Share your pet moments with us on Instagram using <span className="font-semibold text-pink-500">#GharpaluwaFamily</span>
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
                <p className="text-white text-sm font-medium truncate">@pawsandplants._</p>
                <p className="text-white/80 text-xs">This cute face is sponsored by belly rubs🥹❤️</p>
              </div>
              <img 
              src="src\Image\Screenshot 2025-05-08 222623.png"  
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
                <p className="text-white text-sm font-medium truncate">@lifewithfurs</p>
                <p className="text-white/80 text-xs">6 pups up for adoption (male and female)
FREE VACCINATION, NEUTER AND SPAY for those who wants to adopt ❤️❤️
CALL 9860574321
or DM @gharpaluwa
@lets_adopt @project_fade</p>
              </div>
              <img 
                src="src\Image\Screenshot 2025-05-08 222554.png" 
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
                <p className="text-white text-sm font-medium truncate">@_broly_husky</p>
                <p className="text-white/80 text-xs">Vaxed
                #vaccinated #siberianhusky #huskysofinstagram #huskynation #huskylover #huskyphotography #huskylove #huskysiberiano #mansbestfriend🐶</p>
              </div>
              <img 
              src="src\Image\Screenshot 2025-05-08 222518.png"
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
                <p className="text-white text-sm font-medium truncate">@beobebaa</p>
                <p className="text-white/80 text-xs">happy Beo day!</p>
              </div>
              <img 
                src="src\Image\Screenshot 2025-05-08 222652.png" 
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
          <div className="flex justify-end mt-8">
            <a 
              href="https://www.instagram.com/gharpaluwa/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 text-white font-medium rounded-full shadow-lg hover:shadow-xl transform transition-all duration-300 hover:-translate-y-1"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C14.717 2 15.056 2.01 16.122 2.06C17.187 2.11 17.912 2.277 18.55 2.525C19.21 2.779 19.766 3.123 20.322 3.678C20.8305 4.1779 21.224 4.78259 21.475 5.45C21.722 6.087 21.89 6.813 21.94 7.878C21.987 8.944 22 9.283 22 12C22 14.717 21.99 15.056 21.94 16.122C21.89 17.187 21.722 17.912 21.475 18.55C21.2247 19.2178 20.8311 19.8226 20.322 20.322C19.822 20.8303 19.2173 21.2238 18.55 21.475C17.913 21.722 17.187 21.89 16.122 21.94C15.056 21.987 14.717 22 12 22C9.283 22 8.944 21.99 7.878 21.94C6.813 21.89 6.088 21.722 5.45 21.475C4.78233 21.2245 4.17753 20.8309 3.678 20.322C3.16941 19.8222 2.77593 19.2175 2.525 18.55C2.277 17.913 2.11 17.187 2.06 16.122C2.013 15.056 2 14.717 2 12C2 9.283 2.01 8.944 2.06 7.878C2.11 6.812 2.277 6.088 2.525 5.45C2.77524 4.78218 3.1688 4.17732 3.678 3.678C4.17767 3.16923 4.78243 2.77573 5.45 2.525C6.088 2.277 6.812 2.11 7.878 2.06C8.944 2.013 9.283 2 12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 12C16 13.0609 15.5786 14.0783 14.8284 14.8284C14.0783 15.5786 13.0609 16 12 16C10.9391 16 9.92172 15.5786 9.17157 14.8284C8.42143 14.0783 8 13.0609 8 12C8 10.9391 8.42143 9.92172 9.17157 9.17157C9.92172 8.42143 10.9391 8 12 8C13.0609 8 14.0783 8.42143 14.8284 9.17157C15.5786 9.92172 16 10.9391 16 12Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="16.5" cy="7.5" r="1.5" fill="white"/>
              </svg>
              <span>Follow us on Instagram</span>
            </a>
          </div>
        </motion.div>

        {/* Featured Products Section */}
        <motion.div 
          className="mb-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div className="relative mb-4 md:mb-0">
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent">Featured Products</h2>
              <motion.div 
                className="h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-500 mt-2"
                initial={{ width: 0 }}
                whileInView={{ width: "6rem" }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
              ></motion.div>
            </div>
            <Link to="/products">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white flex items-center gap-2 px-6 py-3 rounded-lg shadow-md transform transition-all">
                  View All Products
                  <ArrowRight className="w-4 h-4 animate-pulse" />
                </Button>
              </motion.div>
            </Link>
          </div>

          {/* Category Selection - Enhanced with animation and better styling */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="bg-white/70 backdrop-blur-sm p-4 rounded-xl shadow-md mb-8 border border-gray-200 overflow-x-auto"
          >
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              {categories.map(category => (
                <motion.div 
                  key={category}
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={() => setVisibleCategory(category)}
                    className={`px-5 py-2 rounded-full flex items-center gap-2 transition-all ${
                      visibleCategory === category 
                        ? `${categoryColors[category]} text-black shadow-lg` 
                        : 'bg-blue-600 text-black border hover:bg-blue-400'
                    }`}
                  >
                    <span>{categoryIcons[category]}</span>
                    <span>{category}</span>
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>

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
          className="mb-20 bg-gradient-to-r from-blue-700 to-indigo-900 rounded-3xl overflow-hidden shadow-2xl border border-blue-600/20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="p-10 md:p-12 relative">
            {/* Decorative elements */}
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-400 opacity-20 rounded-full animate-pulse"></div>
            <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-blue-400 opacity-20 rounded-full animate-pulse" style={{ animationDelay: "1s" }}></div>
            <div className="absolute right-1/4 top-1/2 w-24 h-24 bg-yellow-400 opacity-10 rounded-full animate-pulse" style={{ animationDelay: "1.5s" }}></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="md:w-1/2 text-white">
                <motion.span
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                  className="inline-block bg-yellow-500 text-blue-900 font-bold px-4 py-1 rounded-full mb-4"
                >
                  STAY UPDATED
                </motion.span>
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  viewport={{ once: true }}
                  className="text-3xl md:text-4xl font-bold mb-2 text-gradient bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-yellow-200"
                >
                  Join Our Newsletter
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="text-blue-100 text-lg mb-6"
                >
                  Subscribe to receive exclusive updates, discounts, and pet care tips for your furry friend!
                </motion.p>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  viewport={{ once: true }}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <div className="relative w-full sm:max-w-sm">
                    <input 
                      type="email" 
                      value={subscribeEmail}
                      onChange={handleEmailChange}
                      placeholder="Enter your email" 
                      className="pl-12 pr-6 py-4 rounded-full shadow-inner w-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-300"
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                    </div>
                  </div>
                  <Button 
                    onClick={handleSubscribe}
                    disabled={isSubscribing}
                    className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-blue-900 font-semibold rounded-full px-8 py-4 shadow-lg disabled:opacity-70 transform transition-transform duration-300 hover:scale-105"
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
                </motion.div>
                {emailError && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 px-4 py-2 rounded-lg bg-red-100/30 text-red-100 border border-red-200/50"
                  >
                    <p className="text-sm flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      {emailError}
                    </p>
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
                    <p className="text-sm flex items-center gap-2">
                      {subscribeSuccess ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                          <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="15" y1="9" x2="9" y2="15" />
                          <line x1="9" y1="9" x2="15" y2="15" />
                        </svg>
                      )}
                      {subscribeMessage}
                    </p>
                  </motion.div>
                )}
                <motion.p 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  viewport={{ once: true }}
                  className="text-blue-200 text-xs mt-4 flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                  By subscribing, you agree to receive marketing emails. You can unsubscribe at any time.
                </motion.p>
              </div>
              
              <div className="hidden md:block">
                <motion.div 
                  className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl shadow-xl border border-white/20"
                  animate={{ 
                    y: [0, -10, 0],
                  }}
                  transition={{ 
                    repeat: Infinity,
                    duration: 3,
                    ease: "easeInOut" 
                  }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 p-6 rounded-xl">
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
            whileHover={{ scale: 1.1, y: -5 }}
            whileTap={{ scale: 0.9 }}
            className="fixed bottom-8 left-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-xl z-50 hover:shadow-2xl transition-all duration-300"
            onClick={scrollToTop}
            aria-label="Scroll to top"
          >
            <ArrowUpCircle size={24} strokeWidth={2.5} className="animate-bounce-gentle" />
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