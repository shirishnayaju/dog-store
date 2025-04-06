import React, { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { FaSearch } from 'react-icons/fa';
import { FaSyringe, FaShieldAlt, FaCalendarAlt } from 'react-icons/fa';
import { FaBone, FaFootballBall, FaBed, FaTag, FaUtensils, FaPills } from 'react-icons/fa';
import ProductCard from '../components/ProductCard';
import { motion } from 'framer-motion';
import { Button } from "../components/ui/button";

export default function SearchResults() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('relevance');
  const [priceRange, setPriceRange] = useState([0, 1000]);

  // Get search query from URL
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search') || '';

  // Category icons 
  const categoryIcons = {
    'Food': <FaUtensils className="text-yellow-500" />,
    'Toys': <FaFootballBall className="text-amber-800" />,
    'Accessories': <FaTag className="text-purple-500" />,
    'Wet Foods': <FaBone className="text-green-500" />,
    'Cage': <FaBed className="text-orange-500" />,
    'Supplements': <FaPills className="text-red-500" />,
    'Vaccination': <FaSyringe className="text-green-500" />,
    'Core Vaccine': <FaShieldAlt className="text-blue-500" />,
    'Non-Core Vaccine': <FaSyringe className="text-purple-500" />,
    'Seasonal Vaccines': <FaCalendarAlt className="text-orange-500" />
  };

  // Memoized filtering and sorting function
  const filterAndSortProducts = useCallback((productList) => {
    // First, filter by search query
    let result = productList.filter(product => 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Apply price range filter
    result = result.filter(product => 
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // Apply sorting
    switch(sortBy) {
      case 'priceAsc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'priceDesc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'nameAsc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // Relevance sorting (keep original order)
        break;
    }

    return result;
  }, [searchQuery, priceRange, sortBy]);

  // Fetch products and filter
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:4001/products');
        setProducts(response.data);
        const filtered = filterAndSortProducts(response.data);
        setFilteredProducts(filtered);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products.");
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filterAndSortProducts]);

  // Handle sorting change
  const handleSortChange = (value) => {
    setSortBy(value);
    const filtered = filterAndSortProducts(products);
    setFilteredProducts(filtered);
  };

  // Handle price range change with validation
  const handlePriceRangeChange = (min, max) => {
    // Ensure min and max are non-negative numbers
    const safeMin = Math.max(0, Number(min));
    const safeMax = Math.max(0, Number(max));

    // Ensure min is not greater than max
    setPriceRange([
      Math.min(safeMin, safeMax), 
      Math.max(safeMin, safeMax)
    ]);
    
    const filtered = filterAndSortProducts(products);
    setFilteredProducts(filtered);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-b-blue-500 border-l-transparent border-r-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-lg font-medium text-gray-600">Searching products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-blue-600 flex items-center gap-3">
          <FaSearch /> Search Results
        </h1>
        <p className="text-gray-600 mt-2">
          Showing results for "{searchQuery}"
        </p>
      </motion.div>

      {/* Filters and Sorting */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Sort By</label>
            <select 
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="mt-1 block w-full rounded-md border border-black shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
            >
              <option value="relevance">Relevance</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
              <option value="nameAsc">Name: A to Z</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Price Range</label>
            <div className="flex items-center rounded-md gap-2">
              <input 
                type="number" 
                min="0"
                value={priceRange[0]}
                onChange={(e) => handlePriceRangeChange(e.target.value, priceRange[1])}
                className="w-24 rounded-md focus:border-blue-300 focus:ring focus:ring-blue-200 shadow-sm"
                placeholder="Min"
              />
              <span>-</span>
              <input 
                type="number" 
                min="0"
                value={priceRange[1]}
                onChange={(e) => handlePriceRangeChange(priceRange[0], e.target.value)}
                className="w-24 rounded-md focus:border-blue-300 focus:ring focus:ring-blue-200 shadow-sm"
                placeholder="Max"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          {filteredProducts.map(product => (
            <motion.div
              key={product._id}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <ProductCard 
                product={product} 
                categoryIcons={categoryIcons}
              />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center py-16 bg-gray-100 rounded-lg"
        >
          <FaSearch className="mx-auto text-5xl text-gray-400 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            No Products Found
          </h2>
          <p className="text-gray-500">
            We couldn't find any products matching "{searchQuery}".
          </p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => window.history.back()}
          >
            Go Back
          </Button>
        </motion.div>
      )}
    </div>
  );
}