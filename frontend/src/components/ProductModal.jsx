import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "../components/ui/button";
import { 
  Calendar, 
  User, 
  Phone, 
  MapPin, 
  MessageSquare, 
  PawPrint, 
  Clock, 
  XCircle, 
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function ProductModal({ 
  productName, 
  productPrice, 
  vaccinationCenter = "Main Center", 
  buttonClassName 
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  
  // Patient Information
  const [patientName, setPatientName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  
  // Dog Information
  const [dogName, setDogName] = useState('');
  const [dogBreed, setDogBreed] = useState('');
  const [dogBehaviour, setDogBehaviour] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState(null);
  
  // Determine user email
  useEffect(() => {
    if (user) {
      console.log('Current user object:', user);
      
      // Try to find the email from the user object
      if (user.email) {
        setUserEmail(user.email);
      } else {
        // Fallback method to find email
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
  
  // Modal open handler
  const handleModalOpen = useCallback(() => {
    if (!user) {
      alert('Please log in to schedule a vaccination appointment.');
      navigate('/login');
      return;
    }
    
    // Pre-fill patient information if available
    if (user.displayName) {
      setPatientName(user.displayName);
    }
    
    setIsModalOpen(true);
  }, [user, navigate]);
  
  // Modal close handler
  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setCurrentStep(1);
  }, []);
  
  // Form submission handler
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    // Check user authentication
    if (!user) {
      alert('Please log in to schedule an appointment.');
      navigate('/login');
      return;
    }
    
    // Check user email
    if (!userEmail) {
      alert('Valid user email not available. Please log out and log in again.');
      return;
    }
    
    // Validate required fields
    const requiredFields = [
      { value: appointmentDate, name: 'Appointment Date' },
      { value: appointmentTime, name: 'Appointment Time' },
      { value: patientName, name: 'Patient Name' },
      { value: phoneNumber, name: 'Phone Number' },
      { value: city, name: 'City' },
      { value: address, name: 'Address' },
      { value: dogName, name: 'Dog Name' },
      { value: dogBreed, name: 'Dog Breed' },
      { value: dogBehaviour, name: 'Dog Behaviour' }
    ];
    
    const missingFields = requiredFields
      .filter(field => !field.value)
      .map(field => field.name);
    
    if (missingFields.length > 0) {
      alert(`Please fill out the following fields: ${missingFields.join(', ')}`);
      return;
    }
    
    // Validate phone number
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phoneNumber.replace(/\D/g, ''))) {
      alert('Please enter a valid 10-digit phone number.');
      return;
    }
    
    setIsSubmitting(true);
    
    // Prepare vaccination booking data
    const vaccinationData = {
      patient: {
        name: patientName,
        phoneNumber: phoneNumber,
        city: city,
        address: address,
        specialInstructions: specialInstructions
      },
      dog: {
        name: dogName,
        breed: dogBreed,
        behaviour: dogBehaviour
      },
      vaccines: [{
        name: productName,
        doseNumber: 1 
      }],
      totalAmount: productPrice || 0,
      userEmail: userEmail,
      appointmentDate: new Date(appointmentDate).toISOString(),
      appointmentTime: appointmentTime,
      vaccinationCenter: vaccinationCenter
    };
    
    try {
      const response = await fetch('http://localhost:4001/api/vaccinations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(vaccinationData),
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Vaccination booking successful:', result);
        
        // Close the modal
        setIsModalOpen(false);
        
        // Prepare booking details for confirmation page
        const bookingDetails = {
          ...vaccinationData,
          bookingId: result.id || result._id || Date.now().toString()
        };
        
        // Reset form fields
        resetFormFields();
        
        // Navigate to confirmation page
        navigate('/BookingConfirm', { 
          state: { bookingDetails } 
        });
      } else {
        const errorData = await response.json();
        console.error('Booking failed:', errorData);
        alert(`Failed to book appointment: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error during vaccination booking:', error);
      alert('Error connecting to the server. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  }, [
    appointmentDate, 
    appointmentTime, 
    productName, 
    productPrice, 
    patientName, 
    phoneNumber, 
    city, 
    address, 
    specialInstructions,
    dogName,
    dogBreed,
    dogBehaviour,
    user, 
    navigate, 
    vaccinationCenter, 
    userEmail
  ]);
  
  // Reset form fields
  const resetFormFields = () => {
    setAppointmentDate('');
    setAppointmentTime('');
    setPatientName('');
    setPhoneNumber('');
    setCity('');
    setAddress('');
    setSpecialInstructions('');
    setDogName('');
    setDogBreed('');
    setDogBehaviour('');
    setCurrentStep(1);
  };
  
  // Get today's date for min date attribute
  const today = new Date().toISOString().split('T')[0];
  
  // Next step handler
  const handleNextStep = (e) => {
    e.preventDefault();
    
    // Validate fields for current step
    if (currentStep === 1) {
      if (!appointmentDate || !appointmentTime) {
        alert('Please select both date and time for your appointment.');
        return;
      }
    } else if (currentStep === 2) {
      if (!patientName || !phoneNumber || !city || !address) {
        alert('Please fill all required owner information fields.');
        return;
      }
      
      // Validate phone number
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(phoneNumber.replace(/\D/g, ''))) {
        alert('Please enter a valid 10-digit phone number.');
        return;
      }
    }
    
    setCurrentStep(currentStep + 1);
  };
  
  // Previous step handler
  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
  };
  
  // Render step indicators
  const renderStepIndicators = () => {
    return (
      <div className="flex justify-center mb-6">
        <div className="flex items-center">
          <div className={`flex items-center justify-center h-8 w-8 rounded-full ${currentStep >= 1 ? 'bg-purple-500 text-white' : 'bg-gray-200'}`}>
            1
          </div>
          <div className={`h-1 w-8 ${currentStep >= 2 ? 'bg-purple-500' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center justify-center h-8 w-8 rounded-full ${currentStep >= 2 ? 'bg-purple-500 text-white' : 'bg-gray-200'}`}>
            2
          </div>
          <div className={`h-1 w-8 ${currentStep >= 3 ? 'bg-purple-500' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center justify-center h-8 w-8 rounded-full ${currentStep >= 3 ? 'bg-purple-500 text-white' : 'bg-gray-200'}`}>
            3
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <>
      <Button
        onClick={handleModalOpen}
        className={`bg-purple-500 hover:bg-purple-600 text-white flex items-center ${buttonClassName || ''}`}
      >
        <Calendar className="w-5 h-5 mr-2" />
        Schedule Vaccination
      </Button>
      
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div 
            className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full overflow-y-auto max-h-screen"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-purple-600">
                {productName} Vaccination
              </h2>
              <button 
                onClick={handleModalClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            {renderStepIndicators()}
            
            <div className="bg-purple-50 p-4 mb-6 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-700 font-medium">{vaccinationCenter}</p>
                  {productPrice && (
                    <p className="text-purple-600 font-bold">Rs {productPrice.toFixed(2)}</p>
                  )}
                </div>
                <PawPrint className="w-8 h-8 text-purple-500" />
              </div>
            </div>
            
            <form onSubmit={handleSubmit}>
              {/* Step 1: Appointment Selection */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Select Appointment Time</h3>
                  
                  <div className="mb-4">
                    <label className="flex items-center text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 mr-2 text-purple-500" />
                      Select Date
                    </label>
                    <input
                      type="date"
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                      min={today}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-300 focus:border-purple-500 outline-none transition"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="flex items-center text-gray-700 mb-2">
                      <Clock className="w-4 h-4 mr-2 text-purple-500" />
                      Select Time
                    </label>
                    <select
                      value={appointmentTime}
                      onChange={(e) => setAppointmentTime(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-300 focus:border-purple-500 outline-none transition"
                      required
                    >
                      <option value="">Select a time</option>
                      <option value="09:00">9:00 AM</option>
                      <option value="10:00">10:00 AM</option>
                      <option value="11:00">11:00 AM</option>
                      <option value="13:00">1:00 PM</option>
                      <option value="14:00">2:00 PM</option>
                      <option value="15:00">3:00 PM</option>
                      <option value="16:00">4:00 PM</option>
                    </select>
                  </div>
                  
                  <div className="flex justify-end mt-6">
                    <Button
                      type="button"
                      onClick={handleNextStep}
                      className="bg-purple-500 hover:bg-purple-600 text-white"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Step 2: Owner Information */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Owner Information</h3>
                  
                  <div className="mb-4">
                    <label className="flex items-center text-gray-700 mb-2">
                      <User className="w-4 h-4 mr-2 text-purple-500" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-300 focus:border-purple-500 outline-none transition"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="flex items-center text-gray-700 mb-2">
                      <Phone className="w-4 h-4 mr-2 text-purple-500" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-300 focus:border-purple-500 outline-none transition"
                      placeholder="1234567890"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="flex items-center text-gray-700 mb-2">
                        <MapPin className="w-4 h-4 mr-2 text-purple-500" />
                        City
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-300 focus:border-purple-500 outline-none transition"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="flex items-center text-gray-700 mb-2">
                        <MapPin className="w-4 h-4 mr-2 text-purple-500" />
                        Address
                      </label>
                      <textarea
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-300 focus:border-purple-500 outline-none transition"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-between mt-6">
                    <Button
                      type="button"
                      onClick={handlePrevStep}
                      className="bg-yellow-800 hover:bg-yellow-700 text-gray-800"
                    >
                      Back
                    </Button>
                    <Button
                      type="button"
                      onClick={handleNextStep}
                      className="bg-purple-500 hover:bg-purple-600 text-white"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Step 3: Dog Information and Confirmation */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Dog Information</h3>
                  
                  <div className="mb-4">
                    <label className="flex items-center text-gray-700 mb-2">
                      <PawPrint className="w-4 h-4 mr-2 text-purple-500" />
                      Dog Name
                    </label>
                    <input
                      type="text"
                      value={dogName}
                      onChange={(e) => setDogName(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-300 focus:border-purple-500 outline-none transition"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="flex items-center text-gray-700 mb-2">
                        <PawPrint className="w-4 h-4 mr-2 text-purple-500" />
                        Dog Breed
                      </label>
                      <input
                        type="text"
                        value={dogBreed}
                        onChange={(e) => setDogBreed(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-300 focus:border-purple-500 outline-none transition"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="flex items-center text-gray-700 mb-2">
                        <PawPrint className="w-4 h-4 mr-2 text-purple-500" />
                        Dog Behaviour
                      </label>
                      <select
                        value={dogBehaviour}
                        onChange={(e) => setDogBehaviour(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-300 focus:border-purple-500 outline-none transition"
                        required
                      >
                        <option value="">Select</option>
                        <option value="Friendly">Friendly</option>
                        <option value="Playful">Playful</option>
                        <option value="Aggressive">Aggressive</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="flex items-center text-gray-700 mb-2">
                      <MessageSquare className="w-4 h-4 mr-2 text-purple-500" />
                      Special Instructions (Optional)
                    </label>
                    <textarea
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-300 focus:border-purple-500 outline-none transition h-20"
                      placeholder="Any special requirements or medical conditions we should be aware of"
                    />
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg mt-6 mb-4">
                    <h4 className="font-medium text-blue-700 mb-2">Appointment Summary</h4>
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                      <div className="text-gray-600">Vaccine:</div>
                      <div className="font-medium">{productName}</div>
                      
                      <div className="text-gray-600">Date:</div>
                      <div className="font-medium">{appointmentDate}</div>
                      
                      <div className="text-gray-600">Time:</div>
                      <div className="font-medium">{appointmentTime}</div>
                      
                      <div className="text-gray-600">Center:</div>
                      <div className="font-medium">{vaccinationCenter}</div>
                      
                      {productPrice && (
                        <>
                          <div className="text-gray-600">Price:</div>
                          <div className="font-medium">Rs {productPrice.toFixed(2)}</div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-between mt-6">
                    <Button
                      type="button"
                      onClick={handlePrevStep}
                      className="bg-yellow-800 hover:bg-yellow-700 text-gray-800"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="bg-green-500 hover:bg-green-600 text-white flex items-center"
                      disabled={isSubmitting || !userEmail}
                    >
                      {isSubmitting ? (
                        <>Submitting...</>
                      ) : !userEmail ? (
                        <>Valid Login Required</>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Confirm Booking
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </>
  );
}