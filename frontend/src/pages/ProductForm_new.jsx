import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import { ArrowLeft, Save, AlertCircle, Loader, Image as ImageIcon, CheckCircle, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Base API URL with the correct port
const API_BASE_URL = 'http://localhost:4001';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const { addToast } = useToast();
  
  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadMethod, setUploadMethod] = useState('file'); // Add uploadMethod state
  const [imageUrl, setImageUrl] = useState(''); // Add imageUrl state
  const [imageLoading, setImageLoading] = useState(false); // Add imageLoading state
  
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
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
    ingredients: '',
    recommendedFor: '',
    details: ''
  });

  // Fetch product data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchProduct = async () => {
        try {
          setLoading(true);
          const response = await axios.get(`${API_BASE_URL}/products/${id}`);
          const product = response.data;
          
          setFormData({
            name: product.name,
            category: product.category,
            price: product.price,
            description: product.description,
            ingredients: Array.isArray(product.ingredients) ? product.ingredients.join(', ') : '',
            recommendedFor: Array.isArray(product.recommendedFor) ? product.recommendedFor.join(', ') : '',
            details: Array.isArray(product.details) ? product.details.join('\n') : ''
          });
          
          // Set image preview if an image URL exists
          if (product.image) {
            setImagePreview(product.image);
            setImageUrl(product.image); // Set the imageUrl value
            setUploadMethod('url'); // Default to URL method if product has an image
          }
        } catch (err) {
          console.error('Error fetching product:', err);
          setError(`Error fetching product: ${err.response?.status || err.message}`);
          
          addToast({
            title: 'Error',
            description: `Failed to load product data: ${err.response?.data?.message || err.message}`,
            type: 'error'
          });
        } finally {
          setLoading(false);
        }
      };

      fetchProduct();
    }
  }, [id, isEditMode, addToast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      
      // Create preview URL for the selected image
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      
      // Switch to file upload mode if not already
      setUploadMethod('file');
      
      // Reset URL input when file is selected
      setImageUrl('');
    }
  };

  const validateForm = () => {
    const requiredFields = ['name', 'description', 'price', 'category'];
    const missingFields = requiredFields.filter(field => !formData[field].toString().trim());
    
    if (missingFields.length > 0) {
      const errorMessage = `Missing required fields: ${missingFields.join(', ')}`;
      setError(errorMessage);
      addToast({
        title: 'Validation Error',
        description: errorMessage,
        type: 'error'
      });
      return false;
    }
    
    if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      const errorMessage = 'Price must be a valid positive number';
      setError(errorMessage);
      addToast({
        title: 'Validation Error',
        description: errorMessage,
        type: 'error'
      });
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    if (!validateForm()) {
      setSubmitting(false);
      return;
    }
    
    try {
      // Convert strings to arrays
      const ingredientsArray = formData.ingredients.split(',').map(item => item.trim()).filter(item => item !== '');
      const recommendedForArray = formData.recommendedFor.split(',').map(item => item.trim()).filter(item => item !== '');
      const detailsArray = formData.details.split('\n').map(item => item.trim()).filter(item => item !== '');
      
      // Create payload object
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        category: formData.category.trim(),
        ingredients: ingredientsArray,
        recommendedFor: recommendedForArray,
        details: detailsArray
      };
        // Handle image URL or file upload based on selected method
      if (uploadMethod === 'url' && imageUrl) {
        // Use the direct URL provided by user
        payload.image = imageUrl;
      } 
      else if (uploadMethod === 'file' && imageFile) {
        // Upload the image file to the server
        setImageLoading(true);
        try {
          const formData = new FormData();
          formData.append('image', imageFile);
          
          const uploadResponse = await axios.post(`${API_BASE_URL}/api/upload/product-image`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
          
          // Get the uploaded image URL and use it
          payload.image = uploadResponse.data.imageUrl;
          console.log('Image uploaded successfully:', payload.image);
          
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
          addToast({
            title: 'Upload Failed',
            description: uploadError.response?.data?.message || 'Failed to upload image. Please try again.',
            type: 'error'
          });
          throw uploadError; // Re-throw to stop the submission
        } finally {
          setImageLoading(false);
        }
      }
      else if (isEditMode && imagePreview && !imagePreview.startsWith('blob:')) {
        // Use existing image URL for edit mode when no new image is selected
        payload.image = imagePreview;
      } else {
        // No image selected, set empty string or default placeholder
        payload.image = '';
      }
      
      console.log(`Submitting to: ${API_BASE_URL}/products${isEditMode ? `/${id}` : ''}`);
      console.log("Payload data:", payload);
      
      let response;
      if (isEditMode) {
        response = await axios.put(`${API_BASE_URL}/products/${id}`, payload);
      } else {
        response = await axios.post(`${API_BASE_URL}/products`, payload);
      }
      
      console.log("Server response:", response.data);
      
      // Show success toast notification
      addToast({
        title: 'Success',
        description: `Product ${isEditMode ? 'updated' : 'added'} successfully!`,
        type: 'success'
      });
      
      // Trigger update event for AdminProducts component
      window.dispatchEvent(new CustomEvent('productUpdated', { 
        detail: { product: response.data } 
      }));
      
      // Navigate back to product list after a short delay
      setTimeout(() => {
        navigate('/admin/products');
      }, 1000);
    } catch (err) {
      console.error(`Error ${isEditMode ? 'updating' : 'adding'} product:`, err);
      const errorMessage = err.response?.data?.message || err.message;
      
      setError(`Failed to ${isEditMode ? 'update' : 'add'} product: ${errorMessage}`);
      
      // Show error toast notification
      addToast({
        title: 'Error',
        description: `Failed to ${isEditMode ? 'update' : 'add'} product: ${errorMessage}`,
        type: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };
  // Clean up the object URL when component unmounts or when a new file is selected
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);
  
  // Update imagePreview when imageUrl changes (for URL upload method)
  useEffect(() => {
    if (uploadMethod === 'url') {
      setImagePreview(imageUrl);
    }
  }, [imageUrl, uploadMethod]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 h-64">
        <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
        <p className="ml-3 font-medium text-gray-600">Loading product data...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Title and actions row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0 flex items-center">
          <Package className="h-6 w-6 mr-3 text-blue-600" />
          {isEditMode ? 'Edit Product' : 'Add New Product'}
        </h2>
        <button
          onClick={() => navigate('/admin/products')}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft size={18} />
          <span>Back to Products</span>
        </button>
      </div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center"
          >
            <AlertCircle className="inline mr-2 flex-shrink-0" />
            <span className="flex-grow">{error}</span>
            <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900">
              &times;
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-lg shadow-sm border overflow-hidden"
      >
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">            {/* Image Upload */}
            <div className="col-span-1 md:col-span-3 bg-gray-50 p-4 rounded-lg border border-gray-100">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <ImageIcon size={18} className="text-blue-600" />
                  <span>Product Image*</span>
                </div>
              </label>
              
              {/* Upload Method Toggle with improved styling */}
              <div className="flex mb-4 border border-gray-300 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setUploadMethod('url')}
                  className={`flex-1 px-4 py-2.5 text-sm font-medium ${
                    uploadMethod === 'url' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  } transition-all duration-200`}
                >
                  Enter URL
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMethod('file')}
                  className={`flex-1 px-4 py-2.5 text-sm font-medium ${
                    uploadMethod === 'file' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  } transition-all duration-200`}
                >
                  Upload Image
                </button>
              </div>
              
              {/* Conditional Content Based on Upload Method */}
              {uploadMethod === 'url' ? (
                <div>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value);
                      setImagePreview(e.target.value);
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="https://example.com/image.jpg"
                  />
                  {imageUrl && (
                    <div className="mt-4 flex flex-col items-center bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                      <div className="w-full h-48 overflow-hidden rounded-lg bg-gray-50 flex items-center justify-center">
                        <img
                          src={imageUrl}
                          alt="Preview"
                          className="max-w-full max-h-full object-contain"
                          onError={(e) => {
                            e.target.src = 'https://placehold.co/150x150?text=Invalid+URL';
                          }}
                        />
                      </div>
                      <div className="text-sm text-gray-500 mt-3 text-center">
                        <p className="font-medium mb-1">Image Preview</p>
                        <p className="text-xs opacity-75">Make sure your image URL is valid and accessible</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer">
                    <input
                      type="file"
                      id="image"
                      name="image"
                      onChange={handleImageChange}
                      accept="image/*"
                      className="hidden"
                      required={!isEditMode && !imagePreview}
                    />
                    <label htmlFor="image" className="cursor-pointer flex flex-col items-center">
                      {imagePreview && imagePreview.startsWith('blob:') ? (
                        <div className="flex flex-col items-center">
                          <img src={imagePreview} alt="Preview" className="h-40 w-auto object-contain mb-2" />
                          <p className="text-sm text-blue-600 font-medium mt-2">Change image</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <ImageIcon className="h-12 w-12 text-gray-400 mb-2" />
                          <p className="text-gray-500 font-medium">Upload product image</p>
                          <p className="text-xs text-gray-400 mt-1">JPG, PNG, or GIF up to 5MB</p>
                        </div>
                      )}
                    </label>
                  </div>
                  {imagePreview && imagePreview.startsWith('blob:') && (
                    <div className="mt-4 flex justify-center">
                      <p className="text-sm text-gray-600">Image ready for upload. Click "Submit" to save changes.</p>
                    </div>
                  )}
                </div>
              )}
              
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100 text-xs text-blue-700">
                <strong>Pro Tip:</strong> For the best appearance, use square images with a minimum resolution of 500x500 pixels.
              </div>
            </div>

            {/* Product Name */}
            <div className="col-span-1 md:col-span-3">
              <label className="block text-sm font-medium mb-2 text-gray-700">Product Name*</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter product name"
                required
              />
            </div>

            {/* Price and Category in same row */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Price*</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center px-3 pointer-events-none bg-gray-100 border-r border-gray-300 rounded-l-lg">
                  <span className="text-gray-500 font-medium">Rs</span>
                </div>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full pl-16 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors hover:border-blue-300"
                  placeholder="0.00"
                  required
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">Enter product price in Rupees</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Category*</label>
              <div className="relative">
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors hover:border-blue-300 appearance-none"
                  required
                >
                  <option value="">Select a category</option>
                  {categoryOptions.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-500">Choose the most relevant category</p>
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-medium mb-2 text-gray-700">Recommended For*</label>
              <textarea
                name="recommendedFor"
                value={formData.recommendedFor}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter recommendations, separated by commas"
                rows="3"
                required
              />
              <p className="mt-1 text-xs text-gray-500">Example: Adult dogs, Puppies, Small breeds</p>
            </div>

            {/* Lists */}
            <div className="col-span-1 md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Ingredients*</label>
                <textarea
                  name="ingredients"
                  value={formData.ingredients}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter ingredients, separated by commas"
                  rows="3"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">Example: Chicken, Rice, Vegetables</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Product Details*</label>
                <textarea
                  name="details"
                  value={formData.details}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter product details, one feature per line"
                  rows="4"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">Example: Grain-free, High protein, Organic</p>
              </div>
            </div>

            <div className="col-span-1 md:col-span-3">
              <label className="block text-sm font-medium mb-2 text-gray-700">Description*</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter detailed product description"
                rows="4"
                required
              />
              <p className="mt-1 text-xs text-gray-500">Provide a comprehensive description of the product including benefits and features</p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/admin/products')}
              className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>            <button
              type="submit"
              disabled={submitting || imageLoading}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-sm"
            >
              {submitting || imageLoading ? (
                <>
                  <Loader className="animate-spin h-5 w-5" />
                  <span>{imageLoading ? 'Uploading Image...' : 'Processing...'}</span>
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  <span>{isEditMode ? 'Update Product' : 'Create Product'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ProductForm;
