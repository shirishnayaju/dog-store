import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import logo from '../Image/logo.jpg'; 
import { Button } from "../components/ui/button";
import { useAuth } from "../context/AuthContext";
import {
  User, 
  Phone, 
  MapPin, 
  Calendar, 
  Clock, 
  Navigation, 
  Dog, 
  PawPrint, 
  Activity, 
  ArrowLeft,
  Printer,
  FileText,
  Check,
  AlertTriangle
} from "lucide-react";

// Helper functions for date and time formatting
const formatDate = (dateString) => {
  if (!dateString) return "Not specified";
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatTime = (timeString) => {
  if (!timeString) return "Not specified";
  return timeString;
};

// Vaccination Centers Information
const vaccinationCenters = {
  "Main Center": {
    address: "Radhe Radhe, Bhaktapur",
    coordinates: [27.7172, 85.3240],
    phone: "+977-1-4123456",
    hours: "9:00 AM - 5:00 PM"
  }
};

export default function MyBookings() {
  const { user, isInitialized } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [bookingDetails, setBookingDetails] = useState(null);
  const [centerDetails, setCenterDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingId, setBookingId] = useState(null);

  useEffect(() => {
    // Wait for authentication initialization
    if (!isInitialized) return;

    const fetchBookingDetails = async () => {
      try {
        // Check if user is authenticated
        if (!user) {
          navigate('/login', { 
            state: { 
              from: location.pathname, 
              message: 'Please log in to view your bookings' 
            } 
          });
          return;
        }

        // Get booking ID from navigation state
        const id = location.state?.bookingId;
        setBookingId(id);

        if (!id) {
          throw new Error("No booking ID provided. Please select a booking from your profile.");
        }

        // Fetch specific booking details
        const response = await axios.get(
          `http://localhost:4001/api/vaccinations/${id}`,
          { 
            headers: { 
              "Content-Type": "application/json", 
              Authorization: `Bearer ${user.token}` 
            } 
          }
        );

        // Set booking details
        setBookingDetails(response.data);

        // Determine vaccination center details
        const centerInfo = vaccinationCenters[response.data.vaccinationCenter || "Main Center"];
        setCenterDetails(centerInfo);

        setError(null);
      } catch (err) {
        // Handle specific error scenarios
        if (err.response && err.response.status === 401) {
          // Token might be expired
          navigate('/login', { 
            state: { 
              from: location.pathname, 
              message: 'Your session has expired. Please log in again.' 
            } 
          });
          return;
        }

        setError(err.message || "Failed to load booking details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookingDetails();
  }, [user, isInitialized, location.state, navigate]);

  // Handle back navigation
  const handleGoBack = () => {
    navigate(-1);
  };

  // Handle print action
  const handlePrint = () => {
    window.print();
  };
 
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl text-center">
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
        <p className="text-gray-600">Loading booking details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-3" />
          <h2 className="text-2xl font-bold mb-2 text-red-700">Error</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <Button 
            onClick={() => navigate('/profile')} 
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Back to Profile
          </Button>
        </div>
      </div>
    );
  }

  // If no booking found
  if (!bookingDetails) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
          <h2 className="text-2xl font-bold mb-2 text-yellow-700">No Booking Found</h2>
          <p className="text-yellow-600 mb-6">Unable to retrieve booking details.</p>
          <Button 
            onClick={() => navigate('/profile')} 
            className="bg-yellow-600 hover:bg-yellow-700 text-white"
          >
            Back to Profile
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="print:mb-8 mb-8 flex flex-col md:flex-row justify-between items-center border-b pb-6 print:border-b-2 print:border-gray-400">
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold text-blue-700 mb-1 print:text-black">
            GharPaluwa
          </h1>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Pet Vaccination Booking
          </h2>
          <p className="text-sm text-gray-600 print:text-gray-800">
            Reference: #{bookingId?.substring(bookingId.length - 8)}
          </p>
        </div>
        
        <img 
          src={logo} 
          alt="GharPaluwa Logo" 
          className="w-32 h-32 object-contain mt-4 md:mt-0 print:w-24 print:h-24"
        />
      </div>

      {/* Non-printable controls */}
      <div className="mb-6 print:hidden flex flex-col sm:flex-row gap-4">
        <Button 
          variant="outline" 
          className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
          onClick={handleGoBack}
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Profile
        </Button>
        <Button 
          className="flex-1 bg-green-600 text-white hover:bg-green-700"
          onClick={handlePrint}
        >
          <Printer className="h-5 w-5 mr-2" />
          Print This Statement
        </Button>
      </div>

      {/* Main content - optimized for print */}
      <div className="bg-white border border-gray-200 rounded-lg print:border-0 print:shadow-none shadow-md">
        {/* Booking Details Header */}
        <div className="bg-blue-700 text-white p-4 rounded-t-lg print:bg-gray-800">
          <div className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            <h2 className="text-xl font-bold">Vaccination Appointment Details</h2>
          </div>
        </div>

        <div className="p-6">
          {/* Owner Information */}
          <div className="mb-8 pb-6 border-b border-gray-200 print:border-dashed">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <User className="h-5 w-5 text-blue-600 mr-2 print:text-gray-700" />
              Owner Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start p-3 bg-gray-50 rounded-lg print:bg-gray-100">
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium text-gray-800">{bookingDetails.patient?.name || "Not specified"}</p>
                </div>
              </div>
              
              <div className="flex items-start p-3 bg-gray-50 rounded-lg print:bg-gray-100">
                <div>
                  <p className="text-sm text-gray-500">Phone Number</p>
                  <p className="font-medium text-gray-800">{bookingDetails.patient?.phoneNumber || "Not specified"}</p>
                </div>
              </div>
              
              <div className="flex items-start p-3 bg-gray-50 rounded-lg print:bg-gray-100">
                <div>
                  <p className="text-sm text-gray-500">City</p>
                  <p className="font-medium text-gray-800">{bookingDetails.patient?.city || "Not specified"}</p>
                </div>
              </div>
              
              <div className="flex items-start p-3 bg-gray-50 rounded-lg print:bg-gray-100">
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-800">{bookingDetails.patient?.email || user?.email || "Not specified"}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Appointment Information */}
          <div className="mb-8 pb-6 border-b border-gray-200 print:border-dashed">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Calendar className="h-5 w-5 text-blue-600 mr-2 print:text-gray-700" />
              Appointment Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start p-3 bg-blue-50 rounded-lg print:bg-blue-50">
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium text-gray-800">{formatDate(bookingDetails.appointmentDate)}</p>
                </div>
              </div>
              
              <div className="flex items-start p-3 bg-blue-50 rounded-lg print:bg-blue-50">
                <div>
                  <p className="text-sm text-gray-500">Time</p>
                  <p className="font-medium text-gray-800">{formatTime(bookingDetails.appointmentTime)}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Vaccination Center Information */}
          <div className="mb-8 pb-6 border-b border-gray-200 print:border-dashed">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <MapPin className="h-5 w-5 text-blue-600 mr-2 print:text-gray-700" />
              Vaccination Center
            </h3>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">{bookingDetails.vaccinationCenter}</h4>
              <div className="space-y-2 text-gray-600">
                <p className="flex items-center">
                  <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                  {centerDetails?.address}
                </p>
                <p className="flex items-center">
                  <Phone className="h-4 w-4 text-gray-500 mr-2" />
                  {centerDetails?.phone}
                </p>
                <p className="flex items-center">
                  <Clock className="h-4 w-4 text-gray-500 mr-2" />
                  Center Hours: {centerDetails?.hours}
                </p>
              </div>
            </div>
          </div>

          {/* Pet and Vaccination Information */}
          <div className="mb-8 pb-6 border-b border-gray-200 print:border-dashed">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Dog className="h-5 w-5 text-blue-600 mr-2 print:text-gray-700" />
              Pet & Vaccination Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start p-3 bg-purple-50 rounded-lg print:bg-purple-50">
                <div>
                  <p className="text-sm text-gray-500">Pet Name</p>
                  <p className="font-medium text-gray-800">{bookingDetails.dog?.name || "Not specified"}</p>
                </div>
              </div>
              
              <div className="flex items-start p-3 bg-purple-50 rounded-lg print:bg-purple-50">
                <div>
                  <p className="text-sm text-gray-500">Breed</p>
                  <p className="font-medium text-gray-800">{bookingDetails.dog?.breed || "Not specified"}</p>
                </div>
              </div>
              
              <div className="flex items-start p-3 bg-purple-50 rounded-lg print:bg-purple-50">
                <div>
                  <p className="text-sm text-gray-500">Behaviour</p>
                  <p className="font-medium text-gray-800">{bookingDetails.dog?.behaviour || "Not specified"}</p>
                </div>
              </div>
              
              <div className="flex items-start p-3 bg-green-50 rounded-lg print:bg-green-50">
                <div>
                  <p className="text-sm text-gray-500">Vaccine</p>
                  <p className="font-medium text-gray-800">{bookingDetails.vaccines?.[0]?.name || "Not specified"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Important Instructions */}
          <div className="print:page-break-inside-avoid">
            <h3 className="text-lg font-semibold text-red-600 mb-4 flex items-center print:text-red-700">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Important Instructions
            </h3>
            
            <div className="bg-red-50 p-4 rounded-lg border border-red-100 print:bg-red-50">
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Please arrive 15 minutes before your scheduled appointment time.</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Bring a valid ID and this printed booking confirmation.</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Wear a mask and follow social distancing guidelines at the center.</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>If you're feeling unwell on the day of your appointment, please reschedule.</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>After vaccination, your dog will be monitored for 15-30 minutes at the center.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 text-center text-gray-500 text-sm print:border-t print:mt-4 print:pt-4">
          <p>This is an official vaccination appointment confirmation from GharPaluwa Pet Care.</p>
          <p className="mt-1">For any questions, please contact us at support@gharpaluwa.com or call {centerDetails?.phone}</p>
          <p className="font-medium mt-4 text-blue-600 print:text-black">Thank you for choosing GharPaluwa for your pet's healthcare!</p>
        </div>
      </div>

      {/* Print timestamp - only visible when printed */}
      <div className="hidden print:block text-right text-xs text-gray-500 mt-4">
        Printed on: {new Date().toLocaleString()}
      </div>
    </div>
  );
}