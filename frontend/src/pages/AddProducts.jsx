import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, AlertCircle, Loader, Image as ImageIcon, CheckCircle, Package, RefreshCw, Bell, Info, DollarSign, Tag, Layers, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../context/ToastContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { Button } from "../components/ui/button";

const ProductForm = ({ isEditing = false }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const API_URL = 'http://localhost:4001';
  const { addToast } = useToast(); // Use toast context
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
  const [imageLoading, setImageLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadMethod, setUploadMethod] = useState('url'); // 'url' or 'file'
  const [error, setError] = useState(null);
  const [showNotificationDialog, setShowNotificationDialog] = useState(false);
  const [createdProductData, setCreatedProductData] = useState(null);

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
          
          // If there's an image URL, set the upload method to URL
          if (data.image) {
            setUploadMethod('url');
          }
        } catch (err) {
          const errorMessage = `Failed to load product: ${err.response?.data?.message || err.message}`;
          setError(errorMessage);
          addToast({
            title: 'Error',
            description: errorMessage,
            type: 'error'
          });
        } finally {
          setLoading(false);
        }
      };
      fetchProduct();
    }
  }, [isEditing, id, addToast]);const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      
      // Create preview URL for the selected image
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      
      // Reset any previous URL input
      setFormData({
        ...formData,
        imageUrl: ''
      });
    }
  };

  const handleUploadImage = async () => {
    if (!imageFile) {
      addToast({
        title: 'Error',
        description: 'Please select an image file first',
        type: 'error'
      });
      return;
    }
    
    setImageLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      
      const response = await axios.post(`${API_URL}/api/upload/product-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setFormData(prev => ({
        ...prev,
        imageUrl: response.data.imageUrl
      }));
      
      addToast({
        title: 'Success',
        description: 'Image uploaded successfully!',
        type: 'success'
      });
      
    } catch (err) {
      console.error('Image upload error:', err);
      addToast({
        title: 'Upload Failed',
        description: err.response?.data?.message || 'Failed to upload image. Please try again.',
        type: 'error'
      });
    } finally {
      setImageLoading(false);
    }
  };
  const validateForm = () => {
    const baseRequiredFields = ['name', 'description', 'price', 'category'];
    let missingFields = baseRequiredFields.filter(field => !formData[field].trim());
    
    // Check if we have either imageUrl or a file to upload
    if (!formData.imageUrl.trim() && !imageFile) {
      missingFields.push('image');
    }
    
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
  };  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError(null);
    
    if (!validateForm()) {
      setSubmitLoading(false);
      return;
    }

    try {
      // If we have an image file but haven't uploaded it yet, do that first
      if (imageFile && !formData.imageUrl) {
        try {
          const formDataUpload = new FormData();
          formDataUpload.append('image', imageFile);
          
          const uploadResponse = await axios.post(`${API_URL}/api/upload/product-image`, formDataUpload, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
          
          // Update the imageUrl with the uploaded file URL
          formData.imageUrl = uploadResponse.data.imageUrl;
        } catch (uploadErr) {
          console.error('Image upload error during form submission:', uploadErr);
          addToast({
            title: 'Upload Failed',
            description: 'Failed to upload product image. Please try uploading manually first.',
            type: 'error'
          });
          setSubmitLoading(false);
          return;
        }
      }
      
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

      console.log(`Submitting product data to ${isEditing ? 'update' : 'create'} endpoint:`, payload);
      console.log(`Request URL: ${API_URL}/products${isEditing ? `/${id}` : ''}`);
      
      let response;
      if (isEditing) {
        response = await axios.put(`${API_URL}/products/${id}`, payload);
        console.log("Update response:", response.data);
        
        // Update products in AdminProducts.jsx by forcing a reload
        window.dispatchEvent(new CustomEvent('productUpdated', { 
          detail: { product: response.data } 
        }));

        // Show success toast notification
        addToast({
          title: 'Success',
          description: `Product ${isEditing ? 'updated' : 'added'} successfully!`,
          type: 'success'
        });
        
        // Navigate after successful edit
        setTimeout(() => {
          console.log("Navigating to products list after successful edit");
          navigate('/admin/products');
        }, 1500);
      } else {
        // For creating new products
        response = await axios.post(`${API_URL}/products`, payload);
        console.log("Create response:", response.data);
        
        // Store the created product data and show notification dialog
        setCreatedProductData(response.data);
        setShowNotificationDialog(true);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                         err.response?.data?.error || 
                         'Failed to save product. Please try again.';
      setError(errorMessage);
      addToast({
        title: 'Error',
        description: errorMessage,
        type: 'error'
      });
      console.error('Submission error:', err.response?.data || err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  // Clean up any object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 h-64">
        <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
        <p className="ml-3 font-medium text-gray-600">Loading product data...</p>
      </div>
    );
  }  // Function to handle sending notification to all users
  const handleSendNotification = async () => {
    try {
      setSubmitLoading(true);
      
      // Call the API to send notifications
      const response = await axios.post(`${API_URL}/api/notifications/send-product-notification`, {
        productData: createdProductData
      });
      
      // Show success message
      addToast({
        title: 'Notification Sent',
        description: `${response.data.recipients} users and subscribers have been notified about the new product "${createdProductData?.name}"!`,
        type: 'success'
      });
      
    } catch (error) {
      // Handle error
      const errorMessage = error.response?.data?.message || 'Failed to send notifications. Please try again.';
      addToast({
        title: 'Notification Error',
        description: errorMessage,
        type: 'error'
      });
      console.error('Notification error:', error.response?.data || error.message);
    } finally {
      setSubmitLoading(false);
      
      // Close the dialog
      setShowNotificationDialog(false);
      
      // Update products list
      window.dispatchEvent(new CustomEvent('productUpdated', { 
        detail: { product: createdProductData } 
      }));
      
      // Reset form after creating a new product
      setFormData(initialFormState);
    }
  };
    // Function to handle canceling notification and continuing
  const handleSkipNotification = () => {
    // Close the dialog
    setShowNotificationDialog(false);
    
    // Update products list without sending notification
    window.dispatchEvent(new CustomEvent('productUpdated', { 
      detail: { product: createdProductData } 
    }));
    
    // Show success toast notification
    addToast({
      title: 'Product Added',
      description: 'Product added successfully without sending notifications.',
      type: 'success'
    });
    
    // Reset form after creating a new product
    setFormData(initialFormState);
    
    // Navigate to products list after a delay
    setTimeout(() => {
      navigate('/admin/products');
    }, 1000);
  };
  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section with improved styling */}
        <div className="py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-gray-200 pb-4">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Package className="h-7 w-7 mr-3 text-blue-600" />
              {isEditing ? 'Edit Product' : 'Add New Product'}
            </h1>
            <button
              onClick={() => navigate('/admin/products')}
              className="mt-4 sm:mt-0 flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition-all duration-200"
            >
              <ArrowLeft size={18} />
              <span>Back to Products</span>
            </button>
          </div>
          
          {/* Subtitle / Instructions */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8 rounded-r-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <Info className="h-5 w-5 text-blue-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-800">
                  {isEditing 
                    ? 'Update your product information below. All fields marked with * are required.' 
                    : 'Fill out the form below to add a new product to your inventory. All fields marked with * are required.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center shadow-sm"
            >
              <AlertCircle className="inline mr-2 flex-shrink-0" />
              <span className="flex-grow">{error}</span>
              <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900">
                &times;
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden"
        >
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
            <h2 className="text-xl font-medium text-gray-800">Product Information</h2>
            <p className="text-sm text-gray-500 mt-1">Enter the details of your product below</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Primary Info */}
              <div className="col-span-1 lg:col-span-2 space-y-6">
                {/* Product Name */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    <div className="flex items-center gap-2">
                      <Tag size={16} className="text-blue-600" />
                      <span>Product Name*</span>
                    </div>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter product name"
                    required
                  />
                </div>
                
                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    <div className="flex items-center gap-2">
                      <Info size={16} className="text-blue-600" />
                      <span>Description*</span>
                    </div>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter detailed product description"
                    rows="4"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">Provide a comprehensive description of the product including benefits and features</p>
                </div>
                
                {/* Price and Category in same row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      <div className="flex items-center gap-2">
                        <DollarSign size={16} className="text-blue-600" />
                        <span>Price*</span>
                      </div>
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 flex items-center px-3 pointer-events-none bg-gray-100 border-r border-gray-300 rounded-l-lg">
                        <span className="text-gray-500 font-medium">Rs</span>
                      </div>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        step="0.01"
                        min="0"
                        className="w-full pl-16 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:shadow-md"
                        placeholder="0.00"
                        required
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Enter product price in Rupees</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      <div className="flex items-center gap-2">
                        <Layers size={16} className="text-blue-600" />
                        <span>Category*</span>
                      </div>
                    </label>
                    <div className="relative">
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:shadow-md appearance-none"
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
                </div>
                
                {/* Lists in a 2 column layout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      <div className="flex items-center gap-2">
                        <Layers size={16} className="text-blue-600" />
                        <span>Ingredients*</span>
                      </div>
                    </label>
                    <textarea
                      name="ingredients"
                      value={formData.ingredients}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter ingredients, separated by commas"
                      rows="3"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">Example: Chicken, Rice, Vegetables</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-blue-600" />
                        <span>Recommended For*</span>
                      </div>
                    </label>
                    <textarea
                      name="recommendedFor"
                      value={formData.recommendedFor}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter recommendations, separated by commas"
                      rows="3"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">Example: Adult dogs, Puppies, Small breeds</p>
                  </div>
                </div>

                {/* Product Details */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    <div className="flex items-center gap-2">
                      <Info size={16} className="text-blue-600" />
                      <span>Product Details*</span>
                    </div>
                  </label>
                  <textarea
                    name="details"
                    value={formData.details}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter product details, separated by commas"
                    rows="3"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">Example: Grain-free, High protein, Organic</p>
                </div>
              </div>
              
              {/* Right Column - Image Upload */}
              <div className="col-span-1 space-y-6">
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
                  <label className="block text-base font-medium mb-3 text-gray-800">
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
                        name="imageUrl"
                        value={formData.imageUrl}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="https://example.com/image.jpg"
                      />
                      {formData.imageUrl && (
                        <div className="mt-4 flex flex-col items-center bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                          <div className="w-full h-48 overflow-hidden rounded-lg bg-gray-50 flex items-center justify-center">
                            <img
                              src={formData.imageUrl}
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
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors bg-white">
                        <input
                          type="file"
                          id="imageFile"
                          name="imageFile"
                          onChange={handleImageChange}
                          accept="image/*"
                          className="hidden"
                        />
                        <label htmlFor="imageFile" className="cursor-pointer flex flex-col items-center">
                          {imagePreview ? (
                            <div className="flex flex-col items-center">
                              <div className="w-full h-48 overflow-hidden rounded-lg bg-gray-50 flex items-center justify-center mb-3">
                                <img src={imagePreview} alt="Preview" className="max-w-full max-h-full object-contain" />
                              </div>
                              <p className="text-sm text-blue-600 font-medium mt-2 py-1 px-3 bg-blue-50 rounded-full">Change image</p>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center py-8">
                              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-blue-50 mb-4">
                                <ImageIcon className="h-8 w-8 text-blue-500" />
                              </div>
                              <p className="text-gray-700 font-medium">Upload product image</p>
                              <p className="text-xs text-gray-500 mt-1">JPG, PNG, or GIF up to 5MB</p>
                            </div>
                          )}
                        </label>
                      </div>
                      
                      {imagePreview && (
                        <div className="mt-4 flex justify-center">
                          <button
                            type="button"
                            onClick={handleUploadImage}
                            disabled={imageLoading}
                            className="px-4 py-2.5 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm hover:shadow"
                          >
                            {imageLoading ? (
                              <>
                                <Loader className="h-4 w-4 animate-spin" />
                                <span>Uploading...</span>
                              </>
                            ) : (
                              <>
                                <Save className="h-4 w-4" />
                                <span>Upload to Server</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100 text-xs text-blue-700">
                    <strong>Pro Tip:</strong> For the best appearance, use square images with a minimum resolution of 500x500 pixels.
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/admin/products')}
                className="px-6 py-3 rounded-lg bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 transition-all duration-200 shadow-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitLoading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow flex items-center gap-2"
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
      </div>
      
      {/* Notification Dialog with improved styling */}
      <Dialog open={showNotificationDialog} onOpenChange={setShowNotificationDialog}>
        <DialogContent className="sm:max-w-md rounded-xl p-0 overflow-hidden">
          <DialogHeader className="p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Bell className="h-5 w-5 text-white" />
              Send Product Notification
            </DialogTitle>
            <DialogDescription className="text-blue-100 mt-1">
              Would you like to notify users about your new product?
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-6">
            <div className="bg-blue-50 rounded-xl border border-blue-100 p-4 mb-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-white rounded-lg border overflow-hidden shadow-sm flex items-center justify-center">
                  {createdProductData?.image ? (
                    <img 
                      src={createdProductData.image} 
                      alt={createdProductData.name} 
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => {
                        e.target.src = 'https://placehold.co/150x150?text=Product';
                      }}
                    />
                  ) : (
                    <Package className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">{createdProductData?.name || 'New Product'}</h3>
                  <p className="text-sm text-gray-600">{createdProductData?.category || 'Uncategorized'}</p>
                  <p className="text-sm font-medium text-blue-600 mt-1">Rs {createdProductData?.price?.toFixed(2) || '0.00'}</p>
                </div>
              </div>
            </div>
            
            <div className="text-sm text-gray-600 mt-4 border-t border-gray-100 pt-4">
              <p className="font-medium text-gray-800 mb-3 flex items-center">
                <Bell className="h-4 w-4 mr-2 text-blue-600" />
                Notification will be sent to:
              </p>
              <ul className="space-y-2 pl-6">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>All registered users</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Email newsletter subscribers</span>
                </li>
              </ul>
            </div>
          </div>
          
          <DialogFooter className="bg-gray-50 p-6 border-t border-gray-200">
            <div className="flex flex-row justify-end gap-3 w-full">
              <Button 
                variant="outline" 
                onClick={handleSkipNotification}
                className="bg-white hover:bg-gray-50 border-gray-300 text-gray-800"
                disabled={submitLoading}
              >
                Skip Notification
              </Button>
              <Button 
                onClick={handleSendNotification}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center shadow-sm"
                disabled={submitLoading}
              >
                {submitLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Bell className="h-4 w-4 mr-2" />
                    Notify All Users
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductForm;