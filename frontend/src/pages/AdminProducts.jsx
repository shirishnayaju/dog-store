import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, AlertCircle, Loader } from 'lucide-react';

const ProductForm = ({ isEditing = false }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const API_URL = 'http://localhost:4001';

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    imageUrl: '',
    ingredients: '',
    recommendedFor: '',
    details: ''
  });

  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

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
      setTimeout(() => navigate('/admin/products'), 1500);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader size={36} className="text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      {/* Header and navigation */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
        <button
          onClick={() => navigate('/admin/products')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeft size={18} />
          <span>Back to Products</span>
        </button>
      </div>

      {/* Error/Success messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 rounded-lg">
          <AlertCircle className="inline mr-2" />
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-400 rounded-lg">
          Product {isEditing ? 'updated' : 'created'} successfully!
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Image URL & Preview */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium mb-1">Image URL*</label>
            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-lg dark:bg-gray-700"
              placeholder="https://example.com/image.jpg"
              required
            />
            {formData.imageUrl && (
              <div className="mt-4">
                <label className="block text-sm font-medium mb-1">Preview</label>
                <div className="w-32 h-32 border rounded-lg overflow-hidden">
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      if (e.target.src !== 'https://placehold.co/150x150?text=Invalid+URL') {
                        e.target.src = 'https://placehold.co/150x150?text=Invalid+URL';
                      } else {
                        e.target.onerror = null;
                        e.target.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                      }
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Product Name */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium mb-1">Product Name*</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-lg dark:bg-gray-700"
              required
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium mb-1">Price*</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center">$</span>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                className="w-full pl-8 p-2 border rounded-lg dark:bg-gray-700"
                required
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-1">Category*</label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-lg dark:bg-gray-700"
              required
            />
          </div>

          {/* Ingredients */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium mb-1">Ingredients*</label>
            <input
              type="text"
              name="ingredients"
              value={formData.ingredients}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-lg dark:bg-gray-700"
              placeholder="Comma-separated list"
              required
            />
          </div>

          {/* Recommended For */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium mb-1">Recommended For*</label>
            <input
              type="text"
              name="recommendedFor"
              value={formData.recommendedFor}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-lg dark:bg-gray-700"
              placeholder="Comma-separated list"
              required
            />
          </div>

          {/* Details */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium mb-1">Details*</label>
            <input
              type="text"
              name="details"
              value={formData.details}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-lg dark:bg-gray-700"
              placeholder="Comma-separated list"
              required
            />
          </div>

          {/* Description */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium mb-1">Description*</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-lg dark:bg-gray-700"
              rows="4"
              required
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="px-4 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {submitLoading ? (
              <Loader className="animate-spin mr-2 inline" />
            ) : (
              <Save className="mr-2 inline" />
            )}
            {isEditing ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;