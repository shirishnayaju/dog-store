import React, { useState, useEffect } from 'react';
import { useCart } from '../hooks/useCart';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { 
  ShoppingBag, 
  MapPin, 
  Phone, 
  User, 
  FileText, 
  CreditCard,
  Truck,
  Shield,
  ChevronRight
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Checkout() {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [city, setCity] = useState('');
  const [colony, setColony] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [totalError, setTotalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const [userEmail, setUserEmail] = useState(null);
  const [step, setStep] = useState(1); // For multi-step checkout

  // Debug user object
  useEffect(() => {
    if (user) {
      console.log('Full user object from auth context:', JSON.stringify(user, null, 2));
    }
  }, [user]);

  // Effect to determine the user's email
  useEffect(() => {
    if (user) {
      console.log('Current user object:', user);
      
      // Try to find the email from the user object
      if (user.email) {
        setUserEmail(user.email);
      } else {
        // If we can't find a standard email property, log the entire user object
        console.warn('Could not determine user email property. User object:', user);
        
        // As a fallback, look for any property that could be an email
        const possibleEmailKeys = Object.keys(user).filter(key => 
          typeof user[key] === 'string' && 
          user[key].includes('@') && 
          user[key].includes('.')
        );
        
        if (possibleEmailKeys.length > 0) {
          setUserEmail(user[possibleEmailKeys[0]]);
          console.log('Using fallback email property:', possibleEmailKeys[0]);
        } else {
          console.error('No valid email found in user object');
          setUserEmail(null);
        }
      }
    }
  }, [user]);

  // Pre-fill form with user data if available
  useEffect(() => {
    if (user && user.displayName) {
      setName(user.displayName);
    }
  }, [user]);

  const validateStep = (currentStep) => {
    if (currentStep === 1) {
      // Validate contact info
      if (!name || !phoneNumber) {
        alert('Please fill out all required contact information.');
        return false;
      }
      if (phoneNumber.length !== 10 || !/^[0-9]+$/.test(phoneNumber)) {
        setPhoneError('Phone number must be exactly 10 digits and contain only numbers');
        return false;
      }
      return true;
    } else if (currentStep === 2) {
      // Validate address
      if (!city || !colony) {
        alert('Please fill out your complete delivery address.');
        return false;
      }
      return true;
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate user is logged in
    if (!user) {
      alert('Please log in to place an order.');
      return;
    }

    // Check if user email is available
    if (!userEmail) {
      alert('Valid user email not available. Please log out and log in again.');
      console.error('Missing userEmail:', userEmail);
      console.error('User object:', user);
      return;
    }

    // Validate cart is not empty
    if (items.length === 0) {
      setTotalError('Your cart is empty. Add items to place an order.');
      return;
    }

    // Validate total is greater than 0
    if (total === 0) {
      setTotalError('Order total cannot be zero');
      return;
    }

    // Validate required customer fields
    if (!name || !phoneNumber || !city || !colony) {
      alert('Please fill out all required fields.');
      return;
    }

    setIsSubmitting(true); // Start loading

    try {
      // Prepare the order data
      const orderData = {
        customer: {
          name,
          phoneNumber,
          city,
          colony,
          orderNotes,
        },
        products: items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        total,
        userEmail: userEmail,
      };

      console.log('Order Data:', orderData);

      // Send the order data to the backend
      const response = await axios.post('http://localhost:4001/api/orders', orderData);

      if (response.status === 200 || response.status === 201) {
        // Clear the cart
        clearCart();
        
        // Navigate to payment page with order details
        navigate("/payment", { 
          state: { 
            orderDetails: response.data
          } 
        });
      } else {
        alert('Failed to place the order. Please try again.');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        
        if (error.response.data && error.response.data.missingFields) {
          alert(`Missing fields: ${error.response.data.missingFields.join(', ')}`);
        } else if (error.response.data && error.response.data.message) {
          alert(`Error: ${error.response.data.message}`);
        } else {
          alert(`Error (${error.response.status}): ${JSON.stringify(error.response.data)}`);
        }
      } else {
        alert('An error occurred while placing your order. Please try again.');
      }
    } finally {
      setIsSubmitting(false); // Stop loading
    }
  };

  const handlePhoneNumberChange = (e) => {
    const value = e.target.value;
    if (/^[0-9]*$/.test(value) && value.length <= 10) {
      setPhoneError('');
      setPhoneNumber(value);
    } else {
      setPhoneError('Phone number must contain only numbers and be up to 10 digits');
    }
  };

  // Progress indicators
  const renderProgressBar = () => {
    return (
      <div className="mb-8 mt-2">
        <div className="flex justify-between items-center">
          <div className={`flex flex-col items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 flex items-center justify-center rounded-full ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
              1
            </div>
            <span className="text-xs mt-1">Contact</span>
          </div>
          <div className={`h-1 flex-1 mx-2 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
          <div className={`flex flex-col items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 flex items-center justify-center rounded-full ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
              2
            </div>
            <span className="text-xs mt-1">Address</span>
          </div>
          <div className={`h-1 flex-1 mx-2 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
          <div className={`flex flex-col items-center ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 flex items-center justify-center rounded-full ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
              3
            </div>
            <span className="text-xs mt-1">Review</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto mt-6 p-4 md:p-8 bg-white rounded-xl shadow-lg">
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
        <div className="flex items-center">
          <CreditCard className="h-7 w-7 text-blue-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-800">Checkout</h1>
        </div>
        <div className="text-sm text-gray-500">
          {userEmail ? userEmail : 'Not logged in'}
        </div>
      </div>

      {renderProgressBar()}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Left Column - Form */}
        <div className="lg:col-span-2 space-y-6">
          {step === 1 && (
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center mb-5">
                <User className="h-5 w-5 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-800">Contact Information</h2>
              </div>
              <div className="space-y-5">
                {/* Name */}
                <div>
                  <Label htmlFor="name" className="text-gray-700 font-medium">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="mt-1 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    placeholder="Enter your full name"
                  />
                </div>
                
                {/* Phone Number */}
                <div>
                  <Label htmlFor="phoneNumber" className="text-gray-700 font-medium">
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative mt-1">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Phone className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input
                      type="text"
                      id="phoneNumber"
                      value={phoneNumber}
                      onChange={handlePhoneNumberChange}
                      required
                      className="pl-10 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      placeholder="10-digit phone number"
                    />
                  </div>
                  {phoneError && (
                    <p className="text-red-500 text-sm mt-1">{phoneError}</p>
                  )}
                </div>

                <Button
                  type="button"
                  onClick={handleNextStep}
                  className="mt-4 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center justify-center"
                >
                  Continue to Delivery <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center mb-5">
                <MapPin className="h-5 w-5 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-800">Delivery Address</h2>
              </div>
              <div className="space-y-5">
                {/* City */}
                <div>
                  <Label htmlFor="city" className="text-gray-700 font-medium">
                    City <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="block w-full p-2 mt-1 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    required
                  >
                    <option value="">Select City</option>
                    <option value="Kathmandu">Kathmandu</option>
                    <option value="Bhaktapur">Bhaktapur</option>
                    <option value="Lalitpur">Lalitpur</option>
                  </select>
                </div>
                
                {/* Colony */}
                <div>
                  <Label htmlFor="colony" className="text-gray-700 font-medium">
                    Colony/Area <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    id="colony"
                    value={colony}
                    onChange={(e) => setColony(e.target.value)}
                    required
                    className="mt-1 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    placeholder="Enter your neighborhood/colony"
                  />
                </div>

                {/* Order Notes */}
                <div>
                  <Label htmlFor="orderNotes" className="text-gray-700 font-medium">
                    Order Notes (Optional)
                  </Label>
                  <textarea
                    id="orderNotes"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="Any special instructions or delivery notes"
                    className="w-full p-3 border border-gray-200 rounded-lg mt-1 min-h-24 bg-gray-50 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                </div>

                <div className="flex space-x-4">
                  <Button
                    type="button"
                    onClick={() => setStep(1)}
                    className="mt-4 w-1/3 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg"
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={handleNextStep}
                    className="mt-4 w-2/3 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center justify-center"
                  >
                    Continue to Review <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center mb-5">
                <FileText className="h-5 w-5 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-800">Order Review</h2>
              </div>
              
              <div className="space-y-5">
                {/* Contact Summary */}
                <div className="rounded-lg bg-gray-50 p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-gray-800">Contact Information</h3>
                    <button 
                      onClick={() => setStep(1)} 
                      className="text-blue-600 text-sm hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>{name}</p>
                    <p>Phone: {phoneNumber}</p>
                    <p>{userEmail}</p>
                  </div>
                </div>
                
                {/* Delivery Summary */}
                <div className="rounded-lg bg-gray-50 p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-gray-800">Delivery Address</h3>
                    <button 
                      onClick={() => setStep(2)} 
                      className="text-blue-600 text-sm hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>City: {city}</p>
                    <p>Area: {colony}</p>
                    {orderNotes && (
                      <div className="mt-2 text-xs text-gray-500">
                        <p className="font-medium">Notes:</p>
                        <p>{orderNotes}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Items Summary (visible on mobile only) */}
                <div className="rounded-lg bg-gray-50 p-4 lg:hidden">
                  <h3 className="font-medium text-gray-800 mb-2">Order Items ({items.length})</h3>
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.quantity} × {item.name}</span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200 font-medium flex justify-between">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Button
                    type="button"
                    onClick={() => setStep(2)}
                    className="mt-2 w-1/3 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg"
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={items.length === 0 || isSubmitting || !userEmail}
                    className="mt-2 w-2/3 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center justify-center"
                  >
                    {isSubmitting ? 'Processing...' : 'Place Order'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-6 rounded-xl shadow-md sticky top-6">
            <div className="flex items-center mb-4">
              <ShoppingBag className="h-5 w-5 mr-2" />
              <h2 className="text-xl font-semibold">Order Summary</h2>
            </div>

            {items.length === 0 ? (
              <div className="text-center py-8 text-blue-100">
                <ShoppingBag className="mx-auto h-12 w-12 mb-3 opacity-50" />
                <p className="mb-4">Your cart is empty</p>
                <Link to="/products">
                  <button className="w-full py-2 px-4 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition duration-200">
                    Browse Products
                  </button>
                </Link>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center border-b border-blue-500/30 pb-2 last:border-0"
                    >
                      <div className="flex items-center">
                        <div className="bg-blue-500/30 w-8 h-8 rounded-full flex items-center justify-center mr-3 font-medium">
                          {item.quantity}
                        </div>
                        <span className="text-sm">{item.name}</span>
                      </div>
                      <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-blue-500/30 pt-4 space-y-2">
                  <div className="flex justify-between text-blue-100">
                    <span>Subtotal</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-blue-100">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t border-blue-500/30">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  {totalError && <p className="text-red-300 text-sm">{totalError}</p>}
                </div>

                {/* Trust Badges */}
                <div className="mt-6 pt-6 border-t border-blue-500/30">
                  <div className="flex items-center mb-3 text-blue-100">
                    <Shield className="h-4 w-4 mr-2" />
                    <span className="text-sm">Secure Checkout</span>
                  </div>
                  <div className="flex items-center text-blue-100">
                    <Truck className="h-4 w-4 mr-2" />
                    <span className="text-sm">Free Delivery on All Orders</span>
                  </div>
                </div>
              </>
            )}
          </div>

          <p className="text-xs text-gray-500 mt-4 text-center px-4">
            By placing your order, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}