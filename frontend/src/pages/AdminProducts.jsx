import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Edit, Trash2, Search, PlusCircle, Filter, ArrowUpDown, CheckCircle, AlertCircle, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminProducts = () => {
  const navigate = useNavigate();
  const API_URL = 'http://localhost:4001';
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  // Category options
  const categoryOptions = [
    'All',
    'Accessories',
    'Toys',
    'Food',
    'Wet Foods',
    'Cage',
    'Belts',
    'Vaccination',
    'Supplements',
    'Core Vaccine',
    'Non-core Vaccine',
    'Seasonal Vaccines'
  ];

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${API_URL}/products`);
        setProducts(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load products: ' + (err.response?.data?.message || err.message));
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [API_URL]);

  // Sort products
  const sortProducts = (a, b) => {
    if (sortField === 'price') {
      return sortDirection === 'asc' 
        ? a.price - b.price 
        : b.price - a.price;
    } else if (sortField === 'name') {
      return sortDirection === 'asc' 
        ? a.name.localeCompare(b.name) 
        : b.name.localeCompare(a.name);
    } else if (sortField === 'category') {
      return sortDirection === 'asc' 
        ? a.category.localeCompare(b.category) 
        : b.category.localeCompare(a.category);
    }
    return 0;
  };

  // Filter and sort products
  const filteredProducts = products
    .filter(product => 
      (filterCategory === '' || filterCategory === 'All' || product.category === filterCategory) &&
      (searchTerm === '' || 
       product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
       product.category.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort(sortProducts);

  // Handle sort change
  const handleSortChange = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Open delete confirmation dialog
  const confirmDelete = (product) => {
    setProductToDelete(product);
    setShowDeleteConfirm(true);
  };

  // Delete product
  const deleteProduct = async () => {
    if (!productToDelete) return;
    
    try {
      await axios.delete(`${API_URL}/products/${productToDelete._id}`);
      setProducts(products.filter(p => p._id !== productToDelete._id));
      setSuccess(`Product "${productToDelete.name}" deleted successfully`);
      setShowDeleteConfirm(false);
      setProductToDelete(null);
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to delete product: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 h-64">
        <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        <p className="ml-4 text-lg text-gray-600">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      {/* Header with title and add button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 sm:mb-0">
          Product Management
        </h2>
        <Link
          to="/admin/products/add"
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 flex items-center"
        >
          <PlusCircle className="h-5 w-5 mr-2" />
          Add New Product
        </Link>
      </div>

      {/* Success and error messages */}
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 rounded-lg flex items-center"
        >
          <AlertCircle className="inline mr-2 flex-shrink-0" />
          <span className="flex-grow">{error}</span>
          <button onClick={() => setError(null)} className="text-red-700 dark:text-red-400 hover:text-red-900">
            &times;
          </button>
        </motion.div>
      )}
      
      {success && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-400 rounded-lg flex items-center"
        >
          <CheckCircle className="inline mr-2 flex-shrink-0" />
          <span className="flex-grow">{success}</span>
          <button onClick={() => setSuccess(null)} className="text-green-700 dark:text-green-400 hover:text-green-900">
            &times;
          </button>
        </motion.div>
      )}

      {/* Search and filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Filter className="h-5 w-5 text-gray-400" />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="pl-10 w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white appearance-none"
          >
            <option value="">All Categories</option>
            {categoryOptions.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        
        <div className="text-right text-sm text-gray-500 dark:text-gray-400 self-end">
          Showing {filteredProducts.length} of {products.length} products
        </div>
      </div>

      {/* Products table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                <button
                  onClick={() => handleSortChange('name')}
                  className="flex items-center focus:outline-none"
                >
                  Product
                  {sortField === 'name' ? (
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  ) : null}
                </button>
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                <button
                  onClick={() => handleSortChange('category')}
                  className="flex items-center focus:outline-none"
                >
                  Category
                  {sortField === 'category' ? (
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  ) : null}
                </button>
              </th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                <button
                  onClick={() => handleSortChange('price')}
                  className="flex items-center ml-auto focus:outline-none"
                >
                  Price
                  {sortField === 'price' ? (
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  ) : null}
                </button>
              </th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 bg-gray-100 dark:bg-gray-600 rounded-md overflow-hidden">
                        {product.image ? (
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            className="h-10 w-10 object-cover"
                            onError={(e) => {
                              e.target.src = 'https://placehold.co/40x40?text=NA';
                            }}
                          />
                        ) : (
                          <div className="h-10 w-10 flex items-center justify-center text-gray-500 dark:text-gray-400">N/A</div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                          {product.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 max-w-xs truncate">
                          {product.description?.substring(0, 50)}...
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-right">
                    Rs {product.price.toFixed(2)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Link 
                        to={`/products/${product._id}`} 
                        target="_blank"
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        title="View"
                      >
                        <Eye className="h-5 w-5" />
                      </Link>
                      <Link 
                        to={`/admin/products/edit/${product._id}`}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Edit"
                      >
                        <Edit className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={() => confirmDelete(product)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        title="Delete"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  {searchTerm || filterCategory ? (
                    <div>
                      <p className="mb-2">No products match your search criteria.</p>
                      <button
                        onClick={() => { setSearchTerm(''); setFilterCategory(''); }}
                        className="text-blue-600 hover:underline"
                      >
                        Clear filters
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p className="mb-2">No products found. Get started by adding your first product.</p>
                      <Link
                        to="/admin/products/add"
                        className="text-blue-600 hover:underline"
                      >
                        Add product
                      </Link>
                    </div>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {showDeleteConfirm && productToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Confirm Deletion
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Are you sure you want to delete <span className="font-semibold">{productToDelete.name}</span>? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteProduct}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminProducts;