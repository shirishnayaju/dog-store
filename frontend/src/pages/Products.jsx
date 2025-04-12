import React, { useEffect, useState } from 'react';
import { Button } from "../components/ui/button";
import { FaBone, FaFootballBall, FaBed, FaTag, FaUtensils, FaPills, FaHeart, FaSearch } from 'react-icons/fa';
import { ArrowUpCircle } from 'lucide-react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { motion, AnimatePresence } from 'framer-motion';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    // Fetch products
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

  // Filter products by both category and search term
  const filteredProducts = products
    .filter(product => activeCategory === 'All' || product.category === activeCategory)
    .filter(product => 
      searchTerm === '' || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-b-blue-500 border-l-transparent border-r-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-lg font-medium text-gray-600">Loading amazing products for your pets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-red-50 to-white">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md border-l-4 border-red-500">
          <h2 className="text-red-600 text-2xl font-bold mb-3">Oops! Something went wrong</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="bg-white rounded-2xl shadow-lg mb-12 overflow-hidden">
          <div className="relative py-12 px-6 md:px-12 text-center">
            <div className="absolute top-0 left-0 w-full h-full bg-blue-600 opacity-10 z-0"></div>
            <div className="relative z-10">
              <motion.h1
                className="text-4xl md:text-5xl font-bold text-blue-700 mb-3"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                Our Pet Products Collection
              </motion.h1>
              <motion.p
                className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                Discover premium products specially curated for the health and happiness of your furry companions.
              </motion.p>
              
              {/* Categories */}
              <div className="flex flex-wrap gap-2 justify-center">
                {categories.map((category, index) => (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={() => setActiveCategory(category)}
                      className={`px-4 py-2 rounded-full flex items-center gap-2 transition-all ${
                        activeCategory === category 
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
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 sm:mb-0">
            {activeCategory !== 'All' ? activeCategory : 'All Products'}
            {searchTerm && <span className="text-blue-600"> • "{searchTerm}"</span>}
          </h2>
          <p className="text-gray-500">
            Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
          </p>
        </div>

        {/* Products Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory + searchTerm}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index % 4 * 0.1 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="h-full"
              >
                <ProductCard 
                  product={product} 
                  categoryIcons={categoryIcons}
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
        
        {filteredProducts.length === 0 && (
          <motion.div
            className="text-center py-16 bg-white rounded-xl shadow-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaSearch className="text-blue-300 text-3xl" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No products found</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              We couldn't find any products matching your search criteria. Try adjusting your filters or search terms.
            </p>
            <Button 
              onClick={() => {
                setActiveCategory('All');
                setSearchTerm('');
              }}
              className="mt-6 bg-blue-600 hover:bg-blue-700"
            >
              Clear Filters
            </Button>
          </motion.div>
        )}
      </div>

      {/* Scroll to top button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg z-50 hover:bg-blue-700 transition-colors"
            onClick={scrollToTop}
          >
            <ArrowUpCircle size={24} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}