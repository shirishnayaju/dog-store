import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "../components/ui/button";
import { FaBone, FaFootballBall, FaBed, FaTag, FaLink, FaUtensils, FaPills, FaHeart } from 'react-icons/fa';
import { ArrowRight, ShoppingBag, UserPlus, LogIn, ArrowUpCircle, ShieldCheck, HeartHandshake, Syringe, User, Calendar, Package, Heart, Star } from 'lucide-react';
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
  const [testimonials, setTestimonials] = useState([]); // Added state for testimonials
  const [loadingTestimonials, setLoadingTestimonials] = useState(true); // Added loading state for testimonials
  const { user } = useAuth(); // Get the current user from AuthContext
  
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
            // Welcome message for logged-in users
            <motion.div 
              className="col-span-full bg-gradient-to-br from-emerald-50 to-emerald-100 p-8 md:p-10 rounded-3xl shadow-xl border border-emerald-100 overflow-hidden relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              whileHover={{ y: -6, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)" }}
            >
              {/* Decorative elements */}
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-300 opacity-10 rounded-full"></div>
              <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-emerald-400 opacity-10 rounded-full"></div>
              
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
            // For non-logged in users - show signup/login options with improved popup feel
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
                {/* Decorative elements */}
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-yellow-300 opacity-20 rounded-full"></div>
                <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-yellow-400 opacity-20 rounded-full"></div>
                
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
                {/* Decorative elements */}
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-300 opacity-20 rounded-full"></div>
                <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-blue-400 opacity-20 rounded-full"></div>
                
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
                      Check out our latest arrivals and <span className="font-bold text-blue-600">special offers</span>!
                    </motion.p>
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