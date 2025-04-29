import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, AlertCircle, Loader, Image as ImageIcon, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ProductForm = ({ isEditing = false }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const API_URL = 'http://localhost:4001';

  const initialFormState = {
    name: '',
    description: '',
    price: '',
    category: '',
    imageUrl: '',
    ingredients: '',
    recommendedFor: '',
    details: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  // Predefined category options
  const categoryOptions = [
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

  useEffect(() => {
    if (isEditing && id) {
      const fetchProduct = async () => {
        try {
          setLoading(true);
          const { data } = await axios.get(`${API_URL}/products/${id}`);
          setFormData({
            name: data.name,
            description: data.description,
            price: data.price.toString(),
            category: data.category,
            imageUrl: data.image,
            ingredients: data.ingredients.join(', '),
            recommendedFor: data.recommendedFor.join(', '),
            details: data.details.join(', ')
          });
        } catch (err) {
          setError(`Failed to load product: ${err.response?.data?.message || err.message}`);
        } finally {
          setLoading(false);
        }
      };
      fetchProduct();
    }
  }, [isEditing, id]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const requiredFields = ['name', 'description', 'price', 'category', 'imageUrl'];
    const missingFields = requiredFields.filter(field => !formData[field].trim());
    
    if (missingFields.length > 0) {
      setError(`Missing required fields: ${missingFields.join(', ')}`);
      return false;
    }
    
    if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      setError('Price must be a valid positive number');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError(null);
    
    if (!validateForm()) {
      setSubmitLoading(false);
      return;
    }

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        category: formData.category.trim(),
        image: formData.imageUrl.trim(),
        ingredients: formData.ingredients.split(',').map(i => i.trim()).filter(Boolean),
        recommendedFor: formData.recommendedFor.split(',').map(i => i.trim()).filter(Boolean),
        details: formData.details.split(',').map(i => i.trim()).filter(Boolean)
      };

      const response = isEditing 
        ? await axios.put(`${API_URL}/products/${id}`, payload)
        : await axios.post(`${API_URL}/products`, payload);

      setSuccess(true);
      setShowPopup(true);
      
      // Reset form if adding a new product
      if (!isEditing) {
        setFormData(initialFormState);
      }
      
      // Auto close popup and navigate after 2 seconds if editing
      if (isEditing) {
        setTimeout(() => {
          setShowPopup(false);
          navigate('/admin/products');
        }, 2000);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                         err.response?.data?.error || 
                         'Failed to save product. Please try again.';
      setError(errorMessage);
      console.error('Submission error:', err.response?.data || err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  // Function to close the popup
  const closePopup = () => {
    setShowPopup(false);
    if (isEditing) {
      navigate('/admin/products');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader size={36} className="text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
    >
      {/* Success Popup */}
      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 m-4 max-w-sm w-full">
              <div className="flex flex-col items-center text-center">
                <CheckCircle className="text-green-500 w-16 h-16 mb-4" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  Success!
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Product has been {isEditing ? 'updated' : 'added'} successfully.
                </p>
                <div className="flex gap-4">
                  {!isEditing && (
                    <button
                      onClick={() => setShowPopup(false)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Add Another Product
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowPopup(false);
                      navigate('/admin/products');
                    }}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Go to Products
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header and navigation */}
      <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          {isEditing ? 'Edit Product' : 'Add New Product'}
        </h2>
        <button
          onClick={() => navigate('/admin/products')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={18} />
          <span>Back to Products</span>
        </button>
      </div>

      {/* Error/Success messages */}
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 rounded-lg flex items-center"
        >
          <AlertCircle className="inline mr-2 flex-shrink-0" />
          <span className="flex-grow">{error}</span>
        </motion.div>
      )}
      
      {success && !showPopup && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-400 rounded-lg flex items-center"
        >
          <CheckCircle className="inline mr-2 flex-shrink-0" />
          <span className="flex-grow">Product {isEditing ? 'updated' : 'created'} successfully!</span>
        </motion.div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Image URL & Preview */}
          <div className="col-span-1 md:col-span-2 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <ImageIcon size={18} className="text-blue-500" />
                <span>Product Image URL*</span>
              </div>
            </label>
            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="https://example.com/image.jpg"
              required
            />
            {formData.imageUrl && (
              <div className="mt-4 flex items-center gap-4">
                <div className="w-32 h-32 border rounded-lg overflow-hidden bg-white dark:bg-gray-800">
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/150x150?text=Invalid+URL';
                    }}
                  />
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Image preview will appear here
                </div>
              </div>
            )}
          </div>

          {/* Product Name */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">Product Name*</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              required
            />
          </div>

          {/* Price and Category in same row */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">Price*</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center px-3 pointer-events-none bg-gray-100 dark:bg-gray-600 border-r border-gray-300 dark:border-gray-500 rounded-l-lg">
                <span className="text-gray-500 dark:text-gray-300 font-medium">Rs</span>
              </div>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                className="w-full pl-16 p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors hover:border-blue-300 dark:hover:border-blue-500"
                required
              />
              <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Enter product price in Rupees</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">Category*</label>
            <div className="relative">
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full p-3 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors hover:border-blue-300 dark:hover:border-blue-500 appearance-none"
                required
              >
                <option value="">Select a category</option>
                {categoryOptions.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-500 dark:text-gray-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Choose the most relevant category for this product</p>
          </div>

          {/* Lists */}
          <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">Ingredients*</label>
              <textarea
                name="ingredients"
                value={formData.ingredients}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter ingredients, separated by commas"
                rows="3"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">Recommended For*</label>
              <textarea
                name="recommendedFor"
                value={formData.recommendedFor}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter recommendations, separated by commas"
                rows="3"
                required
              />
            </div>
          </div>

          {/* Details and Description */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">Product Details*</label>
            <textarea
              name="details"
              value={formData.details}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Enter product details, separated by commas"
              rows="3"
              required
            />
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">Description*</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Enter detailed product description"
              rows="4"
              required
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitLoading}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {submitLoading ? (
              <>
                <Loader className="animate-spin h-5 w-5" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                <span>{isEditing ? 'Update Product' : 'Create Product'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default ProductForm;