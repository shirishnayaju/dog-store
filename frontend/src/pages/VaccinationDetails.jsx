import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from "../components/ui/button";
import { useCart } from '../hooks/useCart'; 
import { Toast } from '../components/ui/toast';
import { ShoppingCart, Check, PlusCircle, MinusCircle, CreditCard, Heart, Package, Star, Calendar, Clock } from 'lucide-react';
import Rating from '../components/ui/Rating'; 
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard'; 
import { ProductModal } from '../components/ProductModal';
import { FaSyringe, FaShieldAlt, FaCalendarAlt, FaClock, FaClipboardCheck, FaPaw } from 'react-icons/fa';

export default function VaccinationProductDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const { addToCart } = useCart();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [productRating, setProductRating] = useState(0); 
  const [userRating, setUserRating] = useState(0); 
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [similarProducts, setSimilarProducts] = useState([]);
  const [isLoadingSimilar, setIsLoadingSimilar] = useState(false);
  const navigate = useNavigate();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [activeTab, setActiveTab] = useState('description'); // Tab state
  const [isWishlist, setIsWishlist] = useState(false); // Wishlist state
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  
  // Category icons for vaccination products
  const categoryIcons = {
    'Vaccination': <FaSyringe className="text-green-500" />,
    'Core Vaccine': <FaShieldAlt className="text-blue-500" />,
    'Non-Core Vaccine': <FaSyringe className="text-purple-500" />,
    'Seasonal Vaccines': <FaCalendarAlt className="text-orange-500" />
  };

  // Fetch product details
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await fetch(`http://localhost:4001/products/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch product details');
        }
        const data = await response.json();
        setProduct(data);
        
        if (data.rating !== undefined) {
          setProductRating(data.rating);
        } else {
          setProductRating(4);
        }
      } catch (error) {
        console.error('Error fetching product details:', error);
        setApiError('Failed to load product details. Please try again later.');
      }
    };

    fetchProductDetails();
  }, [id]);

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(`http://localhost:4001/products/${id}/comments`);
        if (!response.ok) {
          throw new Error('Failed to fetch comments');
        }
        const data = await response.json();
        setComments(data);
        
        if (data.length > 0) {
          const totalRating = data.reduce((sum, comment) => sum + (comment.rating || 0), 0);
          const averageRating = totalRating / data.length;
          setProductRating(averageRating);
        }
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };

    if (id) {
      fetchComments();
    }
  }, [id]);

  // Fetch similar products
  useEffect(() => {
    const fetchSimilarProducts = async () => {
      if (!product || !product.category) return;
      
      setIsLoadingSimilar(true);
      try {
        const url = `http://localhost:4001/products?category=${encodeURIComponent(product.category)}&_limit=6`;
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch similar products');
        }
        const data = await response.json();
        
        const filteredProducts = data.filter(item => {
          const isDifferentProduct = (item.id !== id && item._id !== id);
          const isSameCategory = item.category === product.category;
          return isDifferentProduct && isSameCategory;
        });
        
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
    
    setTimeout(() => {
      setShowConfirmation(false);
    }, 3000);
  };

  const handleBuyNow = () => {
    if (!user) {
      setShowLoginPrompt(true);
      
      setTimeout(() => {
        setShowLoginPrompt(false);
      }, 3000);
      
      return;
    }
    
    addToCart({ ...product, quantity });
    navigate('/checkout');
  };

  const handleQuantityChange = (amount) => {
    setQuantity((prevQuantity) => Math.max(1, Math.min(5, prevQuantity + amount)));
  };

  const toggleWishlist = () => {
    setIsWishlist(!isWishlist);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setShowLoginPrompt(true);
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
        
        if (updatedComments.length > 0) {
          const totalRating = updatedComments.reduce((sum, comment) => sum + (comment.rating || 0), 0);
          const averageRating = totalRating / updatedComments.length;
          setProductRating(averageRating);
        }
        
        setCommentText('');
        setUserRating(0);
      } catch (error) {
        console.error('Error submitting comment:', error);
        
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

  const goToLogin = () => {
    navigate('/login', { state: { from: `/products/${id}` } });
  };

  const getCategoryIcon = (category) => {
    return categoryIcons[category] || <FaSyringe className="text-gray-500" />;
  };

  if (!product) {
    return (
      <div className="flex flex-col justify-center items-center h-64 mt-16">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
        <p className="text-lg font-medium text-gray-600 mt-4">Loading vaccination details...</p>
        {apiError && <p className="text-red-500 mt-4 text-center">{apiError}</p>}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb navigation */}
      <nav className="flex mb-6 text-sm text-gray-500">
        <Link to="/" className="hover:text-blue-600">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/products" className="hover:text-blue-600">Products</Link>
        <span className="mx-2">/</span>
        <Link to={`/products?category=${product.category}`} className="hover:text-blue-600">{product.category}</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium">{product.name}</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Product Image Gallery */}
        <div className="lg:w-2/5">
          <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
            <div className="relative aspect-square">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
              <button 
                onClick={toggleWishlist}
                className={`absolute top-4 right-4 p-2 rounded-full ${isWishlist ? 'bg-red-500' : 'bg-white'} shadow-md hover:shadow-lg transition-all duration-300`}
              >
                <Heart className={`w-5 h-5 ${isWishlist ? 'text-white fill-current' : 'text-gray-600'}`} />
              </button>
            </div>
            
            {/* Product badges */}
            <div className="p-4 flex flex-wrap gap-2">
              {product.isRecommended && (
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center">
                  <FaShieldAlt className="w-3 h-3 mr-1" />
                  Recommended
                </span>
              )}
              {product.isCoreVaccine && (
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center">
                  <Star className="w-3 h-3 mr-1" fill="currentColor" />
                  Core Vaccine
                </span>
              )}
              {product.schedule && (
                <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  {product.schedule}
                </span>
              )}
            </div>
          </div>
          
          {/* Appointment Scheduler Block */}
          <div className="mt-6 bg-blue-50 p-6 rounded-xl border border-blue-200 shadow-sm">
            <h3 className="text-xl font-semibold mb-4 text-blue-800 flex items-center">
              <FaCalendarAlt className="mr-2" /> Schedule Vaccination
            </h3>
            <p className="text-gray-700 mb-4">Book an appointment with our veterinarians for this vaccination.</p>
            <div className="flex items-center text-sm text-gray-600 mb-6">
              <div className="flex items-center mr-4">
                <Clock className="w-4 h-4 mr-1 text-blue-600" />
                <span>Duration: ~15 min</span>
              </div>
              <div className="flex items-center">
                <FaPaw className="w-4 h-4 mr-1 text-blue-600" />
                <span>Vet attendance required</span>
              </div>
            </div>
            <ProductModal 
              productName={product.name} 
              buttonClassName="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg flex items-center justify-center"
            />
          </div>
        </div>

        {/* Product Info */}
        <div className="lg:w-3/5">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-gray-800">{product.name}</h1>
          
          <div className="flex items-center mb-4">
            <div className="flex items-center">
              <Rating rating={productRating} setRating={() => {}} readOnly={true} />
              <span className="ml-2 text-gray-600">({productRating.toFixed(1)})</span>
            </div>
            <span className="mx-3 text-gray-300">|</span>
            <span className="text-gray-600">{comments.length} Reviews</span>
            <span className="mx-3 text-gray-300">|</span>
            <div className="flex items-center">
              <span className="mr-2">{getCategoryIcon(product.category)}</span>
              <span className="font-medium">{product.category || 'Uncategorized'}</span>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="flex items-baseline">
              <p className="text-3xl font-bold text-blue-600">${product.price.toFixed(2)}</p>
              {product.oldPrice && (
                <p className="ml-3 text-lg text-gray-500 line-through">${product.oldPrice.toFixed(2)}</p>
              )}
              {product.oldPrice && (
                <span className="ml-3 bg-red-100 text-red-700 text-sm font-medium px-2 py-0.5 rounded">
                  {Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}% OFF
                </span>
              )}
            </div>
            {product.stock < 10 && (
              <p className="text-sm text-red-600 mt-1">Only {product.stock} appointments left this week</p>
            )}
          </div>
          
          {/* Tabbed content */}
          <div className="mb-8">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button 
                  onClick={() => setActiveTab('description')}
                  className={`py-4 px-6 font-medium text-sm ${activeTab === 'description' 
                    ? 'border-b-2 border-blue-500 text-blue-600' 
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  Description
                </button>
                <button 
                  onClick={() => setActiveTab('details')}
                  className={`py-4 px-6 font-medium text-sm ${activeTab === 'details' 
                    ? 'border-b-2 border-blue-500 text-blue-600' 
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  Details
                </button>
                <button 
                  onClick={() => setActiveTab('ingredients')}
                  className={`py-4 px-6 font-medium text-sm ${activeTab === 'ingredients' 
                    ? 'border-b-2 border-blue-500 text-blue-600' 
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  Ingredients
                </button>
                <button 
                  onClick={() => setActiveTab('recommended')}
                  className={`py-4 px-6 font-medium text-sm ${activeTab === 'recommended' 
                    ? 'border-b-2 border-blue-500 text-blue-600' 
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  For Pets
                </button>
              </nav>
            </div>
            
            <div className="py-4">
              {activeTab === 'description' && (
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              )}
              
              {activeTab === 'details' && (
                <ul className="space-y-2 text-gray-600">
                  {product.details && product.details.length > 0 ? (
                    product.details.map((detail, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="w-5 h-5 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{detail}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-500">No additional details available</li>
                  )}
                </ul>
              )}
              
              {activeTab === 'ingredients' && (
                <ul className="space-y-2 text-gray-600">
                  {product.ingredients && product.ingredients.length > 0 ? (
                    product.ingredients.map((ingredient, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="w-5 h-5 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{ingredient}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-500">No ingredients information available</li>
                  )}
                </ul>
              )}
              
              {activeTab === 'recommended' && (
                <ul className="space-y-2 text-gray-600">
                  {product.recommendedFor && product.recommendedFor.length > 0 ? (
                    product.recommendedFor.map((recommendation, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="w-5 h-5 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{recommendation}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-500">No recommendations available</li>
                  )}
                </ul>
              )}
            </div>
          </div>
          
          {/* Vaccination Schedule Info */}
          <div className="mb-8 bg-yellow-50 p-6 rounded-lg border border-yellow-200">
            <h3 className="text-xl font-semibold mb-3 text-yellow-800">Vaccination Schedule</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start">
                <FaClock className="w-5 h-5 mr-2 text-yellow-600 mt-1" />
                <div>
                  <p className="font-medium text-gray-800">Timing</p>
                  <p className="text-gray-600">{product.timing || 'Consult with veterinarian'}</p>
                </div>
              </div>
              <div className="flex items-start">
                <FaCalendarAlt className="w-5 h-5 mr-2 text-yellow-600 mt-1" />
                <div>
                  <p className="font-medium text-gray-800">Frequency</p>
                  <p className="text-gray-600">{product.frequency || 'As recommended by vet'}</p>
                </div>
              </div>
              <div className="flex items-start">
                <FaPaw className="w-5 h-5 mr-2 text-yellow-600 mt-1" />
                <div>
                  <p className="font-medium text-gray-800">Pet Age</p>
                  <p className="text-gray-600">{product.petAge || 'All ages'}</p>
                </div>
              </div>
              <div className="flex items-start">
                <FaClipboardCheck className="w-5 h-5 mr-2 text-yellow-600 mt-1" />
                <div>
                  <p className="font-medium text-gray-800">Follow-up</p>
                  <p className="text-gray-600">{product.followUp || 'Not required'}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Purchase controls */}
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center space-x-4 mb-6">
              <span className="text-gray-700 font-medium">Quantity:</span>
              <div className="flex items-center">
                <Button 
                  onClick={() => handleQuantityChange(-1)} 
                  className="rounded-l-lg bg-gray-200 hover:bg-gray-300 text-gray-700"
                  disabled={quantity <= 1}
                >
                  <MinusCircle className="w-5 h-5 text-blue-800" />
                </Button>
                <span className="bg-white w-12 h-10 flex items-center justify-center border-y border-gray-200 text-lg font-medium">
                  {quantity}
                </span>
                <Button 
                  onClick={() => handleQuantityChange(1)} 
                  className="rounded-r-lg bg-gray-200 hover:bg-gray-300 text-gray-700"
                  disabled={quantity >= 5}
                >
                  <PlusCircle className="w-5 h-5 text-blue-800" />
                </Button>
              </div>
              <span className="text-sm text-gray-500">(Max 5 per order)</span>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={handleAddToCart} 
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg flex items-center justify-center"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>
              <Button 
                onClick={handleBuyNow} 
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-lg flex items-center justify-center"
              >
                <CreditCard className="w-5 h-5 mr-2" />
                Buy Now
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b border-gray-200 pb-2">
          Customer Reviews
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Review Statistics */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex flex-col items-center text-center mb-6">
                <h3 className="text-5xl font-bold text-blue-600">{productRating.toFixed(1)}</h3>
                <Rating rating={productRating} setRating={() => {}} readOnly={true} />
                <p className="text-gray-600 mt-2">{comments.length} reviews</p>
              </div>
              
              {/* Leave Review Form */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Write a Review</h3>
                {user ? (
                  <form onSubmit={handleCommentSubmit}>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Your Rating
                      </label>
                      <Rating rating={userRating} setRating={setUserRating} size="lg" />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Your Review
                      </label>
                      <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Share your experience with this vaccination..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows="4"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2"
                      disabled={!commentText.trim() || userRating === 0}
                    >
                      Submit Review
                    </Button>
                  </form>
                ) : (
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 mb-3">
                      Please log in to leave a review
                    </p>
                    <Button 
                      onClick={goToLogin} 
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Log In
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Review Listing */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {comments.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {comments.map((comment) => (
                    <div key={comment.id} className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-semibold mr-3">
                            {comment.userName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-800">{comment.userName}</h3>
                            <p className="text-xs text-gray-500">{comment.date}</p>
                          </div>
                        </div>
                        <Rating rating={comment.rating} setRating={() => {}} readOnly={true} />
                      </div>
                      <p className="text-gray-700">{comment.text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-10 text-center">
                  <p className="text-lg text-gray-500">No reviews yet. Be the first to leave a review!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Similar Products Section */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b border-gray-200 pb-2">
          <span className="flex items-center">
            Similar Vaccinations
            {product.category && (
              <>
                <span className="mx-2 text-yellow-500">in</span>
                <span className="text-green-600 flex items-center gap-2">
                  {product.category}
                  <span>{getCategoryIcon(product.category)}</span>
                </span>
              </>
            )}
          </span>
        </h2>
        
        {isLoadingSimilar ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : similarProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
          <div className="bg-gray-50 p-10 rounded-lg text-center">
            <p className="text-lg text-gray-600">
              No similar vaccinations found in this category.
            </p>
          </div>
        )}
      </div>
      
      {/* Toast Notifications */}
      {showConfirmation && (
        <Toast
          title="Vaccination Added"
          description={`"${product.name}" has been added to your cart.`}
          duration={3000}
          onClose={() => setShowConfirmation(false)}
        />
      )}
      
      {showLoginPrompt && (
        <Toast
          title="Login Required"
          description={
            <div>
              <p>Please log in to complete this action.</p>
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
    </div>
  );
}