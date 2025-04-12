import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { FaSearch, FaFilter, FaSort, FaTimes } from 'react-icons/fa';
import { FaSyringe, FaShieldAlt, FaCalendarAlt } from 'react-icons/fa';
import { FaBone, FaFootballBall, FaBed, FaTag, FaUtensils, FaPills } from 'react-icons/fa';
import ProductCard from '../components/ProductCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "../components/ui/button";

export default function SearchResults() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('relevance');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [resultsCount, setResultsCount] = useState(0);

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

  // Extract unique categories from products
  useEffect(() => {
    if (products.length > 0) {
      const uniqueCategories = [...new Set(products.map(product => product.category))];
      setCategories(uniqueCategories);
    }
  }, [products]);

  // Memoized filtering and sorting function
  const filterAndSortProducts = useCallback((productList) => {
    // First, filter by search query
    let result = productList.filter(product => 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Apply category filter if selected
    if (selectedCategory !== 'all') {
      result = result.filter(product => product.category === selectedCategory);
    }

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
      case 'nameDesc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        // Relevance sorting (keep original order)
        break;
    }

    setResultsCount(result.length);
    return result;
  }, [searchQuery, priceRange, sortBy, selectedCategory]);

  // Fetch products and filter
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:4001/products');
        setProducts(response.data);
        const filtered = filterAndSortProducts(response.data);
        setFilteredProducts(filtered);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products.");
      } finally {
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
    const safeMin = Math.max(0, Number(min) || 0);
    const safeMax = Math.max(0, Number(max) || 1000);

    // Ensure min is not greater than max
    setPriceRange([
      Math.min(safeMin, safeMax), 
      Math.max(safeMin, safeMax)
    ]);
    
    const filtered = filterAndSortProducts(products);
    setFilteredProducts(filtered);
  };

  // Handle category change
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    const filtered = filterAndSortProducts(products);
    setFilteredProducts(filtered);
  };

  // Reset all filters
  const resetFilters = () => {
    setPriceRange([0, 1000]);
    setSortBy('relevance');
    setSelectedCategory('all');
    
    // Re-apply filters to products
    const filtered = filterAndSortProducts(products);
    setFilteredProducts(filtered);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-6 text-xl font-medium text-gray-700">Fetching products...</p>
          <p className="mt-2 text-gray-500">We're finding the best matches for "{searchQuery}"</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 max-w-md mx-auto bg-white rounded-lg shadow-lg">
          <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full">
            <FaTimes className="text-red-600 text-xl" />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-800">Error Loading Products</h2>
          <p className="mt-2 text-gray-600">{error}</p>
          <Button 
            className="mt-6"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-blue-600 flex items-center gap-3">
                <FaSearch className="text-blue-500" /> Search Results
              </h1>
              <p className="text-gray-600 mt-2">
                {resultsCount} {resultsCount === 1 ? 'result' : 'results'} for "{searchQuery}"
              </p>
            </div>
            
            {/* Mobile filter button */}
            <Button 
              variant="outline"
              className="mt-4 md:hidden flex items-center gap-2"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
            >
              <FaFilter /> {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </div>

          {/* Desktop filters */}
          <div className="hidden md:block mt-6 p-4 bg-white rounded-lg shadow-sm">
            <div className="flex flex-wrap items-center gap-6">
              {/* Sort control */}
              <div className="w-48">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FaSort className="inline mr-2" /> Sort By
                </label>
                <select 
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                >
                  <option value="relevance">Relevance</option>
                  <option value="priceAsc">Price: Low to High</option>
                  <option value="priceDesc">Price: High to Low</option>
                  <option value="nameAsc">Name: A to Z</option>
                  <option value="nameDesc">Name: Z to A</option>
                </select>
              </div>

              {/* Price range control */}
              <div className="w-64">
                <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    min="0"
                    value={priceRange[0]}
                    onChange={(e) => handlePriceRangeChange(e.target.value, priceRange[1])}
                    className="w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                    placeholder="Min"
                  />
                  <span>to</span>
                  <input 
                    type="number" 
                    min="0"
                    value={priceRange[1]}
                    onChange={(e) => handlePriceRangeChange(priceRange[0], e.target.value)}
                    className="w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                    placeholder="Max"
                  />
                </div>
              </div>

              {/* Category filter */}
              <div className="flex-grow">
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleCategoryChange('all')}
                    className={`px-3 py-1 rounded-full text-sm ${
                      selectedCategory === 'all' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => handleCategoryChange(category)}
                      className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
                        selectedCategory === category 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {categoryIcons[category]} {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reset filters */}
              <Button 
                variant="ghost" 
                size="sm"
                onClick={resetFilters}
                className="text-blue-600"
              >
                Reset Filters
              </Button>
            </div>
          </div>

          {/* Mobile filters */}
          <AnimatePresence>
            {showMobileFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 p-4 bg-white rounded-lg shadow-sm overflow-hidden md:hidden"
              >
                <div className="space-y-6">
                  {/* Sort control */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <FaSort className="inline mr-2" /> Sort By
                    </label>
                    <select 
                      value={sortBy}
                      onChange={(e) => handleSortChange(e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                    >
                      <option value="relevance">Relevance</option>
                      <option value="priceAsc">Price: Low to High</option>
                      <option value="priceDesc">Price: High to Low</option>
                      <option value="nameAsc">Name: A to Z</option>
                      <option value="nameDesc">Name: Z to A</option>
                    </select>
                  </div>

                  {/* Price range control */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        min="0"
                        value={priceRange[0]}
                        onChange={(e) => handlePriceRangeChange(e.target.value, priceRange[1])}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                        placeholder="Min"
                      />
                      <span>to</span>
                      <input 
                        type="number" 
                        min="0"
                        value={priceRange[1]}
                        onChange={(e) => handlePriceRangeChange(priceRange[0], e.target.value)}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                        placeholder="Max"
                      />
                    </div>
                  </div>

                  {/* Category filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleCategoryChange('all')}
                        className={`px-3 py-1 rounded-full text-sm ${
                          selectedCategory === 'all' 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        All
                      </button>
                      {categories.map(category => (
                        <button
                          key={category}
                          onClick={() => handleCategoryChange(category)}
                          className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
                            selectedCategory === category 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          }`}
                        >
                          {categoryIcons[category]} {category}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Reset filters */}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={resetFilters}
                    className="w-full"
                  >
                    Reset All Filters
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <>
            {/* Product count */}
            <p className="text-sm text-gray-500 mb-4">
              Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
            </p>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, staggerChildren: 0.1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ 
                    scale: 1.03,
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                  }}
                  className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <ProductCard 
                    product={product} 
                    categoryIcons={categoryIcons}
                  />
                </motion.div>
              ))}
            </motion.div>
          </>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-16 bg-white rounded-lg shadow-sm"
          >
            <div className="flex justify-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                <FaSearch className="text-4xl text-gray-400" />
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mt-6 mb-2">
              No Products Found
            </h2>
            <p className="text-gray-500 max-w-md mx-auto">
              We couldn't find any products matching your criteria. Try adjusting your filters or searching for something else.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={resetFilters}
                className="flex items-center gap-2"
              >
                <FaFilter /> Reset Filters
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.history.back()}
                className="flex items-center gap-2"
              >
                Browse All Products
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}