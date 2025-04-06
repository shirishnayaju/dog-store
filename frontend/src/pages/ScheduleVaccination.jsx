import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "../components/ui/button";
import { Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios'; // Make sure axios is installed

// Changed to default export
export default function VaccinationBookingForm({ productName, buttonClassName }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [patientName, setPatientName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [vaccinationCenter, setVaccinationCenter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Define vaccines based on selected product
  const getVaccineDetails = () => {
    // This is simplified - you might want to fetch actual product details from an API
    return {
      name: productName,
      doseNumber: 1,
      price: productName.includes('Basic') ? 50 : 75
    };
  };
  
  // Pre-fill user data if available
  useEffect(() => {
    if (user && user.displayName) {
      setPatientName(user.displayName);
    }
    if (user && user.phoneNumber) {
      setPhoneNumber(user.phoneNumber);
    }
  }, [user]);
  
  const handleModalOpen = useCallback(() => {
    if (!user) {
      alert('Please log in to schedule a vaccination appointment.');
      navigate('/login');
      return;
    }
    setIsModalOpen(true);
  }, [user, navigate]);
  
  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    // Reset form fields
    setAppointmentDate('');
    setAppointmentTime('');
    setSpecialInstructions('');
    setVaccinationCenter('');
    setError(null);
  }, []);
  
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const vaccineDetails = getVaccineDetails();
    
    try {
      // Prepare data according to your backend schema
      const bookingData = {
        patient: {
          name: patientName,
          phoneNumber: phoneNumber,
          city: city,
          address: address,
          specialInstructions: specialInstructions
        },
        vaccines: [vaccineDetails],
        totalAmount: vaccineDetails.price,
        userEmail: user.email,
        appointmentDate: appointmentDate,
        appointmentTime: appointmentTime,
        vaccinationCenter: vaccinationCenter
      };
      
      // Send data to backend API
      const response = await axios.post('/api/vaccinations', bookingData);
      
      // Handle successful booking
      alert(`Appointment for ${productName} successfully scheduled for ${appointmentDate} at ${appointmentTime}`);
      setLoading(false);
      handleModalClose();
      
      // Optionally navigate to a booking confirmation page
      navigate(`/BookingConfirm/${response.data._id}`);
    } catch (err) {
      setLoading(false);
      
      // Handle specific error cases
      if (err.response && err.response.data) {
        if (err.response.status === 400 && err.response.data.message.includes('time slot is already booked')) {
          setError('This time slot is already booked. Please select another time.');
        } else if (err.response.data.missingFields) {
          setError(`Missing required fields: ${err.response.data.missingFields.join(', ')}`);
        } else {
          setError(err.response.data.message || 'An error occurred during booking');
        }
      } else {
        setError('Unable to connect to the server. Please try again later.');
      }
      
      console.error('Booking error:', err);
    }
  }, [
    patientName, 
    phoneNumber, 
    city, 
    address, 
    specialInstructions, 
    appointmentDate, 
    appointmentTime, 
    vaccinationCenter, 
    productName, 
    user, 
    navigate, 
    handleModalClose
  ]);
  
  // Get today's date in YYYY-MM-DD format for min date attribute
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
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Schedule for {productName}</h2>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              {/* Patient Information */}
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Your Name</label>
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
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Special Instructions</label>
                <textarea
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="Any special requirements or medical conditions"
                  className="w-full p-2 border border-gray-300 rounded h-24"
                />
              </div>
              
              {/* Vaccination Center */}
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Vaccination Center</label>
                <select
                  value={vaccinationCenter}
                  onChange={(e) => setVaccinationCenter(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                >
                  <option value="">Select a vaccination center</option>
                  <option value="Main Clinic">Main Clinic</option>
                  <option value="North Branch">North Branch</option>
                  <option value="South Branch">South Branch</option>
                  <option value="East Branch">East Branch</option>
                  <option value="West Branch">West Branch</option>
                </select>
              </div>
              
              {/* Appointment Timing */}
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
              
              <div className="mb-6">
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
              
              {/* Product Information Display */}
              <div className="mb-6 p-3 bg-gray-100 rounded">
                <h3 className="font-bold text-gray-800">Vaccination Details</h3>
                <p>Vaccine: {productName}</p>
                <p>Price: ${getVaccineDetails().price}</p>
              </div>
              
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
                  disabled={loading}
                  className={`${loading ? 'bg-blue-400' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
                >
                  {loading ? 'Processing...' : 'Confirm Appointment'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}