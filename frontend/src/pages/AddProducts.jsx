import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, AlertCircle, Loader, Image as ImageIcon, CheckCircle, Package, RefreshCw, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../context/ToastContext'; // Import useToast
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
  }, [isEditing, id, addToast]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const requiredFields = ['name', 'description', 'price', 'category', 'imageUrl'];
    const missingFields = requiredFields.filter(field => !formData[field].trim());
    
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
    <>
      <div className="p-6">
        {/* Title and actions row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0 flex items-center">
            <Package className="h-6 w-6 mr-3 text-blue-600" />
            {isEditing ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button
            onClick={() => navigate('/admin/products')}
            className="flex items-center gap-2 px-4 py-2 bg-amber-700 text-white border   hover:bg-amber-900 border-amber-800 transition-colors"
          >
            <ArrowLeft size={18} />
            <span>Back to Products</span>
          </button>
        </div>

      {/* Error message (optional - can keep for inline errors) */}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image URL & Preview */}
            <div className="col-span-1 md:col-span-2 bg-gray-50 p-4 rounded-lg border border-gray-100">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <ImageIcon size={18} className="text-blue-600" />
                  <span>Product Image URL*</span>
                </div>
              </label>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="https://example.com/image.jpg"
                required
              />
              {formData.imageUrl && (
                <div className="mt-4 flex items-center gap-4">
                  <div className="w-32 h-32 border rounded-lg overflow-hidden bg-white shadow-sm">
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.src = 'https://placehold.co/150x150?text=Invalid+URL';
                      }}
                    />
                  </div>
                  <div className="text-sm text-gray-500">
                    <p className="font-medium mb-1">Image Preview</p>
                    <p className="text-xs opacity-75">Make sure your image URL is valid and accessible</p>
                  </div>
                </div>
              )}
            </div>

            {/* Product Name */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium mb-2 text-gray-700">Product Name*</label>
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
                  onChange={handleInputChange}
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
                  onChange={handleInputChange}
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
              <p className="mt-1 text-xs text-gray-500">Choose the most relevant category for this product</p>
            </div>

            {/* Lists */}
            <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Ingredients*</label>
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
                <label className="block text-sm font-medium mb-2 text-gray-700">Recommended For*</label>
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

            {/* Details and Description */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium mb-2 text-gray-700">Product Details*</label>
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

            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium mb-2 text-gray-700">Description*</label>
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
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/admin/products')}
              className="px-6 py-2.5 bg-amber-700 text-white border   hover:bg-amber-900 border-amber-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitLoading}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-sm"
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
  
  {/* Notification Dialog */}      <Dialog open={showNotificationDialog} onOpenChange={setShowNotificationDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-500" />
              Send Product Notification
            </DialogTitle>
            <DialogDescription>
              Would you like to send a notification about this new product to all users and subscribers?
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-16 h-16 bg-white rounded border overflow-hidden">
                {createdProductData?.image && (
                  <img 
                    src={createdProductData.image} 
                    alt={createdProductData.name} 
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/150x150?text=Product';
                    }}
                  />
                )}
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{createdProductData?.name}</h3>
                <p className="text-sm text-gray-500">{createdProductData?.category}</p>
                <p className="text-sm font-medium text-blue-600">Rs {createdProductData?.price?.toFixed(2)}</p>
              </div>
            </div>
            
            <div className="text-sm text-gray-600 mt-2 border-t border-blue-100 pt-3">
              <p className="mb-2">
                <strong>What happens when you notify users:</strong>
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs">
                <li>Email notifications will be sent to all registered users</li>
                <li>Newsletter subscribers will also be notified</li>
                <li>The notification will include product details and image</li>
                <li>Users can click directly from the email to view the product</li>
              </ul>
            </div>
          </div>
            <DialogFooter className="flex flex-row justify-end gap-2 mt-4">
            <Button 
              variant="outline" 
              onClick={handleSkipNotification}
              className="bg-amber-700 hover:bg-amber-700 border-amber-800"
              disabled={submitLoading}
            >
              Skip
            </Button>
            <Button 
              onClick={handleSendNotification}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center"
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
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductForm;