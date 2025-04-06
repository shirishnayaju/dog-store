import React, { useState, useEffect } from 'react';
import { useCart } from '../hooks/useCart';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { ShoppingBag, MapPin, Phone, User, FileText, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Checkout() {
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

    // Validate phone number
    if (phoneNumber.length !== 10 || !/^[0-9]+$/.test(phoneNumber)) {
      setPhoneError('Phone number must be exactly 10 digits and contain only numbers');
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
        userEmail: userEmail, // Use email instead of userId
      };

      console.log('Order Data:', orderData); // Log the order data

      // Send the order data to the backend
      const response = await axios.post('http://localhost:4001/api/orders', orderData);

      if (response.status === 200 || response.status === 201) {
        // Clear the cart and show success message
        clearCart();
        alert('Thank you for your order! Your order has been placed successfully.');
      } else {
        alert('Failed to place the order. Please try again.');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        
        // More detailed error message
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

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded-lg shadow">
      <div className="flex items-center mb-6">
        <CreditCard className="h-6 w-6 text-green-600 mr-2" />
        <h1 className="text-3xl font-bold text-gray-800">Checkout</h1>
      </div>

      {/* Debug info - can be removed in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-4 p-2 bg-gray-100 text-xs">
          <p>Debug - User Email: {userEmail || 'Not available'}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Left Column - Form */}
        <div className="md:col-span-3 space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center mb-4">
              <User className="h-5 w-5 text-green-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-700">Contact Information</h2>
            </div>
            <div className="space-y-4">
              {/* Name */}
              <div>
                <Label htmlFor="name" className="text-gray-700">
                  Full Name
                </Label>
                <Input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-1"
                  placeholder="Enter your full name"
                />
              </div>
              {/* Phone Number */}
              <div>
                <Label htmlFor="phoneNumber" className="text-gray-700">
                  Phone Number
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
                    className="pl-10"
                    placeholder="10-digit phone number"
                  />
                </div>
                {phoneError && <p className="text-red-500 text-sm mt-1">{phoneError}</p>}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center mb-4">
              <MapPin className="h-5 w-5 text-green-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-700">Delivery Address</h2>
            </div>
            <div className="space-y-4">
              {/* City */}
              <div>
                <Label htmlFor="city" className="text-gray-700">
                  City
                </Label>
                <select
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="block w-full p-2 border border-gray-300 rounded-md mt-1"
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
                <Label htmlFor="colony" className="text-gray-700">
                  Colony/Area
                </Label>
                <Input
                  type="text"
                  id="colony"
                  value={colony}
                  onChange={(e) => setColony(e.target.value)}
                  required
                  className="mt-1"
                  placeholder="Enter your neighborhood/colony"
                />
              </div>
            </div>
          </div>

          {/* Order Notes */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center mb-4">
              <FileText className="h-5 w-5 text-green-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-700">Additional Details</h2>
            </div>
            <div>
              <Label htmlFor="orderNotes" className="text-gray-700">
                Order Notes (Optional)
              </Label>
              <textarea
                id="orderNotes"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="Any special instructions or requests?"
                className="w-full p-2 border border-gray-300 rounded-md mt-1 min-h-24"
              />
            </div>
          </div>
        </div>

        {/* Right Column - Order Summary */}
        <div className="md:col-span-2">
          <div className="bg-green-600 text-white p-4 rounded-lg">
            <div className="flex items-center mb-4">
              <ShoppingBag className="h-5 w-5 mr-2" />
              <h2 className="text-xl font-semibold">Order Summary</h2>
            </div>

            {items.length === 0 ? (
              <div className="text-center py-6 text-green-100">
                <p>Your cart is empty</p>
                <Link to="/products">
                  <button className="mt-4 w-full py-2 px-4 bg-white text-green-600 rounded hover:bg-green-50">
                    Add Items
                  </button>
                </Link>
              </div>
            ) : (
              <>
                <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center border-b border-green-500 pb-2 last:border-0"
                    >
                      <div className="flex items-center">
                        <div className="bg-green-500 w-8 h-8 rounded flex items-center justify-center mr-2">
                          {item.quantity}
                        </div>
                        <span>{item.name}</span>
                      </div>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-green-500 pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t border-green-500">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  {totalError && <p className="text-red-300 text-sm">{totalError}</p>}
                </div>
              </>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <Button
              type="submit"
              className="w-full mt-4 py-6 text-lg bg-green-600 hover:bg-green-700"
              disabled={items.length === 0 || isSubmitting || !userEmail}
            >
              {isSubmitting ? 'Placing Order...' : 
               !userEmail ? 'Valid Login Required' :
               items.length === 0 ? 'Cart Empty' : 
               'Place Order'}
            </Button>
          </form>

          <p className="text-sm text-gray-500 mt-4 text-center">
            By placing your order, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}