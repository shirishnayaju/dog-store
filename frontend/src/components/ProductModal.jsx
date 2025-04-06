import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "../components/ui/button";
import { Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function ProductModal({ 
  productName, 
  productPrice, 
  vaccinationCenter = "Main Center", 
  buttonClassName 
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
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
  };
  
  // Get today's date for min date attribute
  const today = new Date().toISOString().split('T')[0];
  
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
            className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full overflow-y-auto max-h-screen"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Schedule {productName} Vaccination
            </h2>
            
            <form onSubmit={handleSubmit}>
              {/* Patient Information Inputs */}
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="1234567890"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Address</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
              
              {/* Dog Information Inputs */}
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Dog Name</label>
                <input
                  type="text"
                  value={dogName}
                  onChange={(e) => setDogName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Dog Breed</label>
                <input
                  type="text"
                  value={dogBreed}
                  onChange={(e) => setDogBreed(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Dog Behaviour</label>
                <select
                  value={dogBehaviour}
                  onChange={(e) => setDogBehaviour(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                >
                  <option value="">Select Dog Behaviour</option>
                  <option value="Friendly">Friendly</option>
                  <option value="Playful">Playful</option>
                  <option value="Aggressive">Aggressive</option>
                </select>
              </div>
              
              {/* Appointment Details */}
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Select Date</label>
                <input
                  type="date"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  min={today}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Select Time</label>
                <select
                  value={appointmentTime}
                  onChange={(e) => setAppointmentTime(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
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
              
              {/* Optional Special Instructions */}
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Special Instructions (Optional)</label>
                <textarea
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded h-24"
                  placeholder="Any special requirements or medical conditions we should be aware of"
                />
              </div>
              
              {/* Additional Booking Details */}
              <div className="mb-4">
                <p className="text-gray-700">Vaccination Center: {vaccinationCenter}</p>
                {productPrice && (
                  <p className="text-gray-700">Price: ${productPrice.toFixed(2)}</p>
                )}
              </div>
              
              {/* Form Action Buttons */}
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  onClick={handleModalClose}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                  disabled={isSubmitting || !userEmail}
                >
                  {isSubmitting ? 'Submitting...' : 
                   !userEmail ? 'Valid Login Required' : 
                   'Confirm Appointment'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}