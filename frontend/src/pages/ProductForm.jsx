import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Base API URL with the correct port
const API_BASE_URL = 'http://localhost:4001'; // Updated to use port 4001

const ProductForm = () => {
  const { id } = useParams(); // Will be undefined for "add" mode
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
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
          }
          
          setLoading(false);
        } catch (err) {
          console.error('Error fetching product:', err);
          setError(`Error fetching product: ${err.response?.status || err.message}`);
          setLoading(false);
        }
      };

      fetchProduct();
    }
  }, [id, isEditMode]);

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
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    try {
      // Create a FormData object for multipart/form-data submission
      const formDataToSubmit = new FormData();
      
      // Convert strings to arrays for array fields and add to FormData
      formDataToSubmit.append('name', formData.name);
      formDataToSubmit.append('category', formData.category);
      formDataToSubmit.append('price', parseFloat(formData.price));
      formDataToSubmit.append('description', formData.description);
      
      // Append arrays as JSON strings
      formDataToSubmit.append('ingredients', JSON.stringify(
        formData.ingredients.split(',').map(item => item.trim())
      ));
      
      formDataToSubmit.append('recommendedFor', JSON.stringify(
        formData.recommendedFor.split(',').map(item => item.trim())
      ));
      
      formDataToSubmit.append('details', JSON.stringify(
        formData.details.split('\n').map(item => item.trim()).filter(item => item !== '')
      ));
      
      // Add the image file if a new one was selected
      if (imageFile) {
        formDataToSubmit.append('image', imageFile);
      } else if (isEditMode && imagePreview && !imagePreview.startsWith('blob:')) {
        // If in edit mode and the image wasn't changed, pass the existing URL
        formDataToSubmit.append('existingImage', imagePreview);
      }
      
      let response;
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };
      
      console.log(`Submitting to: ${API_BASE_URL}/products${isEditMode ? `/${id}` : ''}`);
      
      if (isEditMode) {
        response = await axios.put(`${API_BASE_URL}/products/${id}`, formDataToSubmit, config);
      } else {
        response = await axios.post(`${API_BASE_URL}/products`, formDataToSubmit, config);
      }
      
      alert(`Product ${isEditMode ? 'updated' : 'added'} successfully!`);
      navigate('/admin/products');
    } catch (err) {
      console.error(`Error ${isEditMode ? 'updating' : 'adding'} product:`, err);
      setError(`Failed to ${isEditMode ? 'update' : 'add'} product: ${err.response?.status || err.message}`);
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

  if (loading) {
    return <p className="text-center text-gray-800">Loading product data...</p>;
  }

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        {isEditMode ? 'Edit Product' : 'Add New Product'}
      </h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 font-semibold mb-2">
              Product Name*
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter product name"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="category" className="block text-gray-700 font-semibold mb-2">
              Category*
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a category</option>
              {categoryOptions.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label htmlFor="price" className="block text-gray-700 font-semibold mb-2">
              Price*
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              placeholder="Enter price"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="description" className="block text-gray-700 font-semibold mb-2">
              Description*
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="Enter product description"
              rows="4"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="image" className="block text-gray-700 font-semibold mb-2">
              Product Image*
            </label>
            <input
              type="file"
              id="image"
              name="image"
              onChange={handleImageChange}
              accept="image/*"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required={!isEditMode}
            />
            <p className="mt-1 text-sm text-gray-500">
              Upload a product image file (JPEG, PNG, etc.)
            </p>
            {imagePreview && (
              <div className="mt-3 flex justify-center">
                <img 
                  src={imagePreview} 
                  alt="Product preview" 
                  className="max-h-40 rounded border"
                />
              </div>
            )}
          </div>
          
          <div className="mb-4">
            <label htmlFor="ingredients" className="block text-gray-700 font-semibold mb-2">
              Ingredients* (comma separated)
            </label>
            <textarea
              id="ingredients"
              name="ingredients"
              value={formData.ingredients}
              onChange={handleChange}
              required
              placeholder="E.g. Chicken, Rice, Vegetables"
              rows="3"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="recommendedFor" className="block text-gray-700 font-semibold mb-2">
              Recommended For* (comma separated)
            </label>
            <textarea
              id="recommendedFor"
              name="recommendedFor"
              value={formData.recommendedFor}
              onChange={handleChange}
              required
              placeholder="E.g. Adult Dogs, Puppies, Senior Dogs"
              rows="2"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="details" className="block text-gray-700 font-semibold mb-2">
              Product Details* (one per line)
            </label>
            <textarea
              id="details"
              name="details"
              value={formData.details}
              onChange={handleChange}
              required
              placeholder="Enter product details (one per line)"
              rows="5"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex justify-end gap-4 mt-6">
            <button 
              type="button" 
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100"
              onClick={() => navigate('/admin/products')}
              disabled={submitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : isEditMode ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;