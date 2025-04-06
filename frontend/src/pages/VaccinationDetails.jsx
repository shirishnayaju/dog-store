import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from "../components/ui/button";
import { useCart } from '../hooks/useCart'; 
import { Toast } from '../components/ui/toast';
import { ShoppingCart, Check, PlusCircle, MinusCircle, CreditCard } from 'lucide-react';
import Rating from '../components/ui/Rating'; 
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard'; 
import { ProductModal } from '../components/ProductModal';
import { FaSyringe, FaShieldAlt, FaCalendarAlt } from 'react-icons/fa';

export default function ProductDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const { addToCart } = useCart();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [quantity, setQuantity] = useState(1);
  
  // Separate state variables for product rating and user input rating
  const [productRating, setProductRating] = useState(0); 
  const [userRating, setUserRating] = useState(0); 
  
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [similarProducts, setSimilarProducts] = useState([]);
  const [isLoadingSimilar, setIsLoadingSimilar] = useState(false);
  const navigate = useNavigate();
  
  // New state for login prompt toast
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  // Error state for API issues
  const [apiError, setApiError] = useState(null);
  
  // Category icons matching exactly what's in Products.js
  const categoryIcons = {
    'Vaccination': <FaSyringe className="text-green-500" />,
    'Core Vaccine': <FaShieldAlt className="text-blue-500" />,
    'Non-Core Vaccine': <FaSyringe className="text-purple-500" />,
    'Seasonal Vaccines': <FaCalendarAlt className="text-orange-500" />
  };

  // Fetch product details from the backend
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await fetch(`http://localhost:4001/products/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch product details');
        }
        const data = await response.json();
        setProduct(data);
        
        // If product has a rating property, use it directly
        if (data.rating !== undefined) {
          setProductRating(data.rating);
        } else {
          // Otherwise, set a default rating
          setProductRating(4);
        }
      } catch (error) {
        console.error('Error fetching product details:', error);
        setApiError('Failed to load product details. Please try again later.');
      }
    };

    fetchProductDetails();
  }, [id]);

  // Fetch comments from the backend
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(`http://localhost:4001/products/${id}/comments`);
        if (!response.ok) {
          throw new Error('Failed to fetch comments');
        }
        const data = await response.json();
        setComments(data);
        
        // If comments exist, calculate average rating from comments
        if (data.length > 0) {
          const totalRating = data.reduce((sum, comment) => sum + (comment.rating || 0), 0);
          const averageRating = totalRating / data.length;
          setProductRating(averageRating);
        }
      } catch (error) {
        console.error('Error fetching comments:', error);
        // Keep existing rating if comments fetch fails
      }
    };

    if (id) {
      fetchComments();
    }
  }, [id]);

  // Fetch similar products based on the product's category
  useEffect(() => {
    const fetchSimilarProducts = async () => {
      if (!product || !product.category) return;
      
      setIsLoadingSimilar(true);
      try {
        // Debug URL being requested
        const url = `http://localhost:4001/products?category=${encodeURIComponent(product.category)}&_limit=6`;
        console.log('Requesting similar products from:', url);
        console.log('Current product category:', product.category);
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch similar products');
        }
        const data = await response.json();
        
        // Improved filtering to ensure category match
        const filteredProducts = data.filter(item => {
          // First ensure it's not the current product 
          const isDifferentProduct = (item.id !== id && item._id !== id);
          
          // Then ensure it's actually from the same category as requested
          const isSameCategory = item.category === product.category;
          
          return isDifferentProduct && isSameCategory;
        });
        
        // Log results for debugging
        console.log(`Found ${filteredProducts.length} products in category: ${product.category}`);
    
        
        // Limit to 3 similar products
        setSimilarProducts(filteredProducts.slice(0, 6));
      } catch (error) {
        console.error('Error fetching similar products:', error);
      } finally {
        setIsLoadingSimilar(false);
      }
    };

    if (product) {
      fetchSimilarProducts();
    }
  }, [product, id]);

  const handleAddToCart = () => {
    addToCart({ ...product, quantity });
    setShowConfirmation(true);
    
    // Auto-hide confirmation after 3 seconds
    setTimeout(() => {
      setShowConfirmation(false);
    }, 3000);
  };

  // Updated Buy Now function to check for login
  const handleBuyNow = () => {
    if (!user) {
      // Show login prompt if user is not logged in
      setShowLoginPrompt(true);
      
      // Auto-hide login prompt after 3 seconds
      setTimeout(() => {
        setShowLoginPrompt(false);
      }, 3000);
      
      return;
    }
    
    // Proceed with checkout if user is logged in
    addToCart({ ...product, quantity });
    navigate('/checkout');
  };

  const handleQuantityChange = (amount) => {
    setQuantity((prevQuantity) => Math.max(1, Math.min(5, prevQuantity + amount))); // Ensure quantity is between 1 and 5
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in to leave a comment.');
      return;
    }

    if (commentText.trim() && userRating > 0) {
      try {
        const response = await fetch(`http://localhost:4001/products/${id}/comments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userName: user?.name || 'Anonymous',
            text: commentText,
            rating: userRating,
            date: new Date().toLocaleDateString()
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to submit comment');
        }

        const newComment = await response.json();
        const updatedComments = [...comments, newComment];
        setComments(updatedComments);
        
        // Update product rating based on all comments including the new one
        if (updatedComments.length > 0) {
          const totalRating = updatedComments.reduce((sum, comment) => sum + (comment.rating || 0), 0);
          const averageRating = totalRating / updatedComments.length;
          setProductRating(averageRating);
        }
        
        setCommentText('');
        setUserRating(0); // Reset the user rating input after submission
      } catch (error) {
        console.error('Error submitting comment:', error);
        
        // Fallback: Add comment locally if server request fails
        const newComment = {
          id: Date.now(),
          userName: user?.name || 'Anonymous',
          text: commentText,
          rating: userRating,
          date: new Date().toLocaleDateString()
        };
        
        const updatedComments = [...comments, newComment];
        setComments(updatedComments);
        setCommentText('');
        setUserRating(0);
      }
    }
  };

  // Function to redirect to login page
  const goToLogin = () => {
    navigate('/login', { state: { from: `/products/${id}` } });
  };

  // Get the appropriate category icon
  const getCategoryIcon = (category) => {
    return categoryIcons[category] || <FaTag className="text-gray-500" />;
  };

  if (!product) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
        {apiError && <p className="text-red-500 mt-4">{apiError}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* First Div: Product Image and Ingredients */}
        <div className="md:w-1/3 flex flex-col gap-8">
          <div className="w-full h-90">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-lg shadow-md" />
          </div>
          <div className="bg-gray-100 p-6 rounded-lg shadow-inner">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Ingredients</h2>
            <ul className="space-y-2 text-gray-600">
              {product.ingredients && product.ingredients.length > 0 ? (
                product.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="w-5 h-5 mr-2 text-green-500" />
                    {ingredient}
                  </li>
                ))
              ) : (
                <li className="text-gray-500">No ingredients information available</li>
              )}
            </ul>
          </div>
          <div className="bg-gray-100 p-6 rounded-lg shadow-inner">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Recommended For</h2>
            <ul className="space-y-2 text-gray-600">
              {product.recommendedFor && product.recommendedFor.length > 0 ? (
                product.recommendedFor.map((recommendedFor, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="w-5 h-5 mr-2 text-green-500" />
                    {recommendedFor}
                  </li>
                ))
              ) : (
                <li className="text-gray-500">No recommendations available</li>
              )}
            </ul>
          </div>
        </div>

        {/* Second Div: Product Details */}
        <div className="md:w-1/3">
          <h1 className="text-3xl font-bold mb-4 text-blue-600">{product.name}</h1>
          <div className="flex items-center mb-6">
            <span className="text-gray-600 mr-2">Category</span>
            <div className="flex items-center bg-blue-100 px-3 py-1 rounded-full">
              <span className="mr-2">{getCategoryIcon(product.category)}</span>
              <span className="font-medium">{product.category || 'Uncategorized'}</span>
            </div>
          </div>
          <p className="text-2xl font-semibold mb-4 text-green-600">${product.price.toFixed(2)}</p>
          
          {/* Display read-only product rating using the Rating component */}
          <div className="mb-4">
            <Rating rating={productRating} setRating={() => {}} readOnly={true} />
            <span className="ml-2 text-gray-600">({productRating.toFixed(1)})</span>
          </div>
          
          <p className="mb-6 text-gray-600">{product.description}</p>
          
          {/* Quantity Controls */}
          <div className="flex items-center space-x-4 mb-6">
            <Button onClick={() => handleQuantityChange(-1)} className="bg-red-500 hover:bg-red-600 text-white flex items-center">
              <MinusCircle className="w-5 h-5" />
            </Button>
            <span className="text-xl">{quantity}</span>
            <Button onClick={() => handleQuantityChange(1)} className="bg-green-500 hover:bg-green-600 text-white flex items-center">
              <PlusCircle className="w-5 h-5" />
            </Button>
          </div>
          
          {/* Add to Cart and Buy Now Buttons */}
          <div className="flex space-x-4 mb-6">
            <Button onClick={handleAddToCart} className="bg-blue-500 hover:bg-blue-600 text-white flex items-center">
              <ShoppingCart className="w-5 h-5 mr-2" />
              Add to Cart
            </Button>
            <Button onClick={handleBuyNow} className="bg-yellow-500 hover:bg-yellow-600 text-white flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Buy Now
            </Button>
          </div>
            {/* Schedule Appointment Button - Now with login check */}
            <div className="mt-4 mb-6">
            <ProductModal 
              productName={product.name} 
              buttonClassName="text-sm w-full" 
            />
          </div>   
          
          {/* Toast Notification for Add to Cart */}
          {showConfirmation && (
            <Toast
              title="Product Added"
              description={`"${product.name}" has been added to your cart.`}
              duration={3000}
              onClose={() => setShowConfirmation(false)}
            />
          )}
          
          {/* Login Prompt Toast */}
          {showLoginPrompt && (
            <Toast
              title="Login Required"
              description={
                <div>
                  <p>Please log in to complete purchase.</p>
                  <Button 
                    onClick={goToLogin} 
                    className="mt-2 bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    Go to Login
                  </Button>
                </div>
              }
              duration={3000}
              onClose={() => setShowLoginPrompt(false)}
            />
          )}
          
          {/* Additional Product Details */}
          <div className="bg-gray-100 p-6 rounded-lg shadow-inner">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Product Details</h2>
            <ul className="space-y-2 text-gray-600">
              {product.details && product.details.length > 0 ? (
                product.details.map((detail, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="w-5 h-5 mr-2 text-green-500" />
                    {detail}
                  </li>
                ))
              ) : (
                <li className="text-gray-500">No additional details available</li>
              )}
            </ul>
          </div>
        </div>

        {/* Third Div: Leave Comments and Display Comments */}
        <div className="md:w-1/3 flex flex-col gap-8">
          {/* Display Comments Section */}
          <div className="bg-gray-100 p-6 rounded-lg shadow-inner">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Comments 💭</h2>
            <ul className="space-y-4 overflow-y-auto h-60">
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <li key={comment.id} className="bg-white p-4 rounded-lg shadow">
                    <p className="text-lg font-semibold text-gray-800">{comment.userName}</p>
                    <div className="flex items-center mb-2">
                      <Rating rating={comment.rating} setRating={() => {}} readOnly={true} />
                    </div>
                    <p className="text-gray-700">{comment.text}</p>
                    <small className="text-gray-500">{comment.date}</small>
                  </li>
                ))
              ) : (
                <li className="text-center text-gray-500 py-4">No comments yet. Be the first to comment!</li>
              )}
            </ul>
          </div>
          
          {/* Leave Comments and Rating Section */}
          <div className="bg-gray-200 p-6 rounded-lg shadow-inner">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Leave Comments and Rating</h2>
            {user ? (
              <form onSubmit={handleCommentSubmit} className="mb-6">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Leave a comment..."
                  className="w-full p-2 mb-2 border border-gray-300 rounded-lg"
                  rows="4"
                />
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-4 text-gray-800">Rate This Product</h2>
                  {/* Interactive rating input for user */}
                  <Rating rating={userRating} setRating={setUserRating} />
                </div>
                <Button 
                  type="submit" 
                  className="bg-blue-500 hover:bg-blue-600 text-white mt-2"
                  disabled={!commentText.trim() || userRating === 0}
                >
                  Submit
                </Button>
              </form>
            ) : (
              <p className="text-center text-gray-600">
                Please <Link to="/login" className="text-blue-500 hover:underline">log in</Link> to leave a comment.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Similar Products Section - Using ProductCard component */}
      <div className="mt-12 mb-8">
        <h2 className="text-2xl font-bold mb-6 text-blue-600 border-b-2 border-blue-500 pb-2">
          <span className="flex items-center">
          Similar Products in <span className="ml-2 text-black">{product.category}</span><span className="ml-2">{getCategoryIcon(product.category)}</span>
          </span>
        </h2>
        
        {isLoadingSimilar ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : similarProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {similarProducts.map((similarProduct) => (
              <ProductCard 
                key={similarProduct._id || similarProduct.id} 
                product={{
                  ...similarProduct,
                  _id: similarProduct._id || similarProduct.id,
                  rating: similarProduct.rating || 4,
                  stock: similarProduct.stock || 10
                }} 
                categoryIcons={categoryIcons}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-600 py-8">
            No similar products found in this category.
          </p>
        )}
      </div>
    </div>
  );
}