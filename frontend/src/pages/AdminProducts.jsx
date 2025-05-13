import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Edit, Trash2, Search, PlusCircle, Filter, ArrowUpDown, Eye, RefreshCw, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../context/ToastContext'; // Import useToast

const AdminProducts = () => {
  const navigate = useNavigate();
  const API_URL = 'http://localhost:4001';
  const { addToast } = useToast(); // Use the toast context
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
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
  // Function to fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log('Fetching products from:', `${API_URL}/products`);
      const { data } = await axios.get(`${API_URL}/products`);
      console.log('Products received:', data.length);
      setProducts(data);
    } catch (err) {
      console.error('Error details:', err);
      addToast({
        title: 'Error',
        description: 'Failed to load products: ' + (err.response?.data?.message || err.message),
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, [API_URL, addToast]);
    // Listen for product updates from other components
  useEffect(() => {
    // Create event handler function
    const handleProductUpdate = (event) => {
      console.log("AdminProducts: Detected product update event");
      
      // Log the updated product if available in the event detail
      if (event.detail && event.detail.product) {
        console.log("Updated product data:", event.detail.product);
        
        // Optimistically update the products list if we have the updated product
        setProducts(prevProducts => {
          // Check if this is an update to an existing product
          const updatedProductId = event.detail.product._id;
          const existingIndex = prevProducts.findIndex(p => p._id === updatedProductId);
          
          if (existingIndex !== -1) {
            // Replace the existing product with the updated one
            const updatedProducts = [...prevProducts];
            updatedProducts[existingIndex] = event.detail.product;
            
            addToast({
              title: 'Product Updated',
              description: `${event.detail.product.name} has been updated successfully.`,
              type: 'success'
            });
            
            return updatedProducts;
          } else {
            // It's a new product - add it to the beginning of the list
            addToast({
              title: 'Product Added',
              description: `${event.detail.product.name} has been added successfully.`,
              type: 'success'
            });
            
            return [event.detail.product, ...prevProducts];
          }
        });
      } else {
        // If we don't have the product data, just fetch all products
        fetchProducts();
      }
    };
    
    window.addEventListener('productUpdated', handleProductUpdate);
    
    return () => {
      window.removeEventListener('productUpdated', handleProductUpdate);
    };
  }, [addToast]);

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
       product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
      addToast({
        title: 'Success',
        description: `Product "${productToDelete.name}" deleted successfully`,
        type: 'success'
      });
      setShowDeleteConfirm(false);
      setProductToDelete(null);
    } catch (err) {
      addToast({
        title: 'Error',
        description: 'Failed to delete product: ' + (err.response?.data?.message || err.message),
        type: 'error'
      });
    }
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setFilterCategory('');
    setSortField('name');
    setSortDirection('asc');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 h-64">
        <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        <p className="ml-4 text-lg text-gray-600">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Title and actions row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0 flex items-center">
          <Package className="h-6 w-6 mr-3 text-blue-600" />
          Product Management
        </h2>        <div className="flex space-x-3">
          <button 
            onClick={() => {
              fetchProducts();
              addToast({
                title: 'Refreshing',
                description: 'Refreshing products list...',
                type: 'info'
              });
            }} 
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
            title="Refresh products"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Loading...' : ''}
          </button>
          <Link
            to="/admin/addproducts"
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 flex items-center shadow-md transition-all hover:-translate-y-0.5"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            Add New Product
          </Link>
        </div>
      </div>

      {/* Search and filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="pl-10 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none transition-all"
            >
              <option value="">All Categories</option>
              {categoryOptions.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div className="flex justify-between md:justify-end items-center">
            <button
              onClick={resetFilters}
              className="text-blue-600 hover:text-blue-800 text-sm underline mr-2"
            >
              Reset Filters
            </button>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {filteredProducts.length} of {products.length} products
            </span>
          </div>
        </div>
      </div>

      {/* Products table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSortChange('name')}
                    className="flex items-center focus:outline-none hover:text-blue-600 transition-colors"
                  >
                    Product
                    {sortField === 'name' ? (
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    ) : null}
                  </button>
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSortChange('category')}
                    className="flex items-center focus:outline-none hover:text-blue-600 transition-colors"
                  >
                    Category
                    {sortField === 'category' ? (
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    ) : null}
                  </button>
                </th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSortChange('price')}
                    className="flex items-center ml-auto focus:outline-none hover:text-blue-600 transition-colors"
                  >
                    Price
                    {sortField === 'price' ? (
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    ) : null}
                  </button>
                </th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <motion.tr 
                    key={product._id} 
                    className="hover:bg-blue-50 transition-colors"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    layout
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <div className="h-12 w-12 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                          {product.image ? (
                            <img 
                              src={product.image} 
                              alt={product.name} 
                              className="h-12 w-12 object-cover"
                              onError={(e) => {
                                e.target.src = 'https://placehold.co/40x40?text=NA';
                              }}
                            />
                          ) : (
                            <div className="h-12 w-12 flex items-center justify-center text-gray-500">N/A</div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 line-clamp-1">
                            {product.name}
                          </div>
                          <div className="text-xs text-gray-500 max-w-xs truncate">
                            {product.description?.substring(0, 50)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      Rs {product.price.toFixed(2)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link 
                          to={`/products/${product._id}`} 
                          target="_blank"
                          className="p-1.5 rounded-md text-gray-500 hover:bg-blue-100 hover:text-blue-600"
                          title="View"
                        >
                          <Eye className="h-5 w-5" />
                        </Link>
                        <Link 
                          to={`/admin/products/edit/${product._id}`}
                          className="p-1.5 rounded-md text-gray-500 hover:bg-blue-100 hover:text-blue-600"
                          title="Edit"
                        >
                          <Edit className="h-5 w-5" />
                        </Link>
                        <button
                          onClick={() => confirmDelete(product)}
                          className="p-1.5 rounded-md text-gray-500 hover:bg-red-100 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                    {searchTerm || filterCategory ? (
                      <div>
                        <p className="mb-2">No products match your search criteria.</p>
                        <button
                          onClick={resetFilters}
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
              className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Confirm Deletion
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <span className="font-semibold">{productToDelete.name}</span>? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteProduct}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
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