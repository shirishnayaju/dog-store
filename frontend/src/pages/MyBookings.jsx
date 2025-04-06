import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import logo from '../Image/logo.jpg'; 
import { Button } from "../components/ui/button";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
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
  ArrowLeft
} from "lucide-react";

// Variants for animation
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1
  }
};

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

  useEffect(() => {
    // Wait for authentication initialization
    if (!isInitialized) return;

    const fetchBookingDetails = async () => {
      // Extensive Debugging Logs
      console.group("Authentication Debug");
      console.log("Full User Object:", JSON.stringify(user, null, 2));
      console.log("Is Initialized:", isInitialized);
      console.log("Location State:", location.state);
      console.groupEnd();

      try {
        // Check if user is authenticated
        if (!user) {
          console.error("No user object found");
          navigate('/login', { 
            state: { 
              from: location.pathname, 
              message: 'Please log in to view your bookings' 
            } 
          });
          return;
        }

        // Get booking ID from navigation state
        const bookingId = location.state?.bookingId;

        if (!bookingId) {
          throw new Error("No booking ID provided. Please select a booking from your profile.");
        }

        // Fetch specific booking details
        const response = await axios.get(
          `http://localhost:4001/api/vaccinations/${bookingId}`,
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
        console.error("Detailed Booking Fetch Error:", err);
        
        // More detailed error logging
        if (err.response) {
          console.error("Response Error:", {
            status: err.response.status,
            data: err.response.data
          });

          // Handle specific error scenarios
          if (err.response.status === 401) {
            // Token might be expired
            navigate('/login', { 
              state: { 
                from: location.pathname, 
                message: 'Your session has expired. Please log in again.' 
              } 
            });
            return;
          }
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
 
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl text-center">
        Loading booking details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl text-center text-red-500">
        <h2 className="text-2xl font-bold mb-4">Error</h2>
        <p>{error}</p>
        <Button 
          onClick={() => navigate('/profile')} 
          className="mt-4"
        >
          Back to Profile
        </Button>
      </div>
    );
  }

  // If no booking found
  if (!bookingDetails) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl text-center">
        <h2 className="text-2xl font-bold mb-4">No Booking Found</h2>
        <p>Unable to retrieve booking details.</p>
        <Button 
          onClick={() => navigate('/profile')} 
          className="mt-4"
        >
          Back to Profile
        </Button>
      </div>
    );
  }

  return (
    
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-row space-x-52 items-center mb-8">
      <h1 className="text-3xl font-bold text-yellow-500 mb-4">
    GharPaluwa 
   <br/> Pet Vaccination Booking details<br/>
   <span className="text-xl font-normal text-black">You can see details and print the details and take with you while going for vaccination.</span>
  </h1>
  <img 
    src={logo} 
    alt="logo" 
    className="w-40 max-w-md rounded-lg shadow-md object-cover"
  />

</div>
      <motion.div 
        className="md:col-span-2 space-y-6"
        variants={itemVariants}
      >
        <motion.div 
          className="bg-white shadow-md rounded-lg p-6"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <h2 className="text-xl font-bold text-blue-600 mb-4">Booking Details</h2>
          
          {/* Patient Information */}
          <motion.div 
            className="mb-6 pb-6 border-b border-gray-200"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            transition={{ delayChildren: 0.9, staggerChildren: 0.2 }}
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Owner Information</h3>
            <div className="space-y-4">
              <motion.div 
                className="flex items-start"
                variants={itemVariants}
              >
                <div className="bg-purple-100 p-2 rounded-lg mr-3">
                  <User className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Owner Name</p>
                  <p className="font-medium text-gray-800">{bookingDetails.patient?.name || "Not specified"}</p>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-start"
                variants={itemVariants}
              >
                <div className="bg-purple-100 p-2 rounded-lg mr-3">
                  <Phone className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone Number</p>
                  <p className="font-medium text-gray-800">{bookingDetails.patient?.phoneNumber || "Not specified"}</p>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-start"
                variants={itemVariants}
              >
                <div className="bg-purple-100 p-2 rounded-lg mr-3">
                  <MapPin className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">City</p>
                  <p className="font-medium text-gray-800">{bookingDetails.patient?.city || "Not specified"}</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
          
          <motion.div 
            className="space-y-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            transition={{ delayChildren: 1.2, staggerChildren: 0.2 }}
          >
            <motion.div 
              className="flex items-start"
              variants={itemVariants}
            >
              <div className="bg-purple-100 p-2 rounded-lg mr-3">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Appointment Date & Time</p>
                <p className="font-medium text-gray-800">
                  {formatDate(bookingDetails.appointmentDate)}, {formatTime(bookingDetails.appointmentTime)}
                </p>
              </div>
            </motion.div>
            
            <motion.div 
              className="flex items-start"
              variants={itemVariants}
            >
              <div className="bg-purple-100 p-2 rounded-lg mr-3">
                <MapPin className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Vaccination Center</p>
                <p className="font-medium text-gray-800">{bookingDetails.vaccinationCenter}</p>
                <p className="text-gray-600">{centerDetails?.address}</p>
              </div>
            </motion.div>
            
            <motion.div 
              className="flex items-start"
              variants={itemVariants}
            >
              <div className="bg-purple-100 p-2 rounded-lg mr-3">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Center Hours</p>
                <p className="font-medium text-gray-800">{centerDetails?.hours}</p>
                <p className="text-gray-600">Phone: {centerDetails?.phone}</p>
              </div>
            </motion.div>
          </motion.div>

          <motion.div 
            className="mt-6 pt-6 border-t border-gray-200"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 1.5 }}
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Vaccination Information</h3>
            <motion.div 
              className="space-y-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              transition={{ delayChildren: 1.6, staggerChildren: 0.2 }}
            >
              <motion.div 
                className="flex items-start"
                variants={itemVariants}
              >
                <div className="bg-purple-100 p-2 rounded-lg mr-3">
                  <Navigation className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Vaccine Name</p>
                  <p className="font-medium text-gray-800">{bookingDetails.vaccines?.[0]?.name || "Not specified"}</p>
                </div>
              </motion.div>

              <motion.div 
                className="flex items-start"
                variants={itemVariants}
              >
                <div className="bg-purple-100 p-2 rounded-lg mr-3">
                  <Dog className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Dog Name</p>
                  <p className="font-medium text-gray-800">{bookingDetails.dog?.name || "Not specified"}</p>
                </div>
              </motion.div>

              <motion.div 
                className="flex items-start"
                variants={itemVariants}
              >
                <div className="bg-purple-100 p-2 rounded-lg mr-3">
                  <PawPrint className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Dog Breed</p>
                  <p className="font-medium text-gray-800">{bookingDetails.dog?.breed || "Not specified"}</p>
                </div>
              </motion.div>

              <motion.div 
                className="flex items-start"
                variants={itemVariants}
              >
                <div className="bg-purple-100 p-2 rounded-lg mr-3">
                  <Activity className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Dog Behaviour</p>
                  <p className="font-medium text-gray-800">{bookingDetails.dog?.behaviour || "Not specified"}</p>
                </div>
              </motion.div>
            </motion.div>

            <h3 className="text-lg mt-6 pt-6 font-semibold text-red-500 mb-3 border-t border-gray-200">Important Instructions</h3>
            <motion.ul 
              className="list-disc pl-5 space-y-2 text-gray-700"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              transition={{ delayChildren: 1.8, staggerChildren: 0.1 }}
            >
              <motion.li variants={itemVariants}>Please arrive 15 minutes before your scheduled appointment time.</motion.li>
              <motion.li variants={itemVariants}>Bring a valid mail having your booking confirmation.</motion.li>
              <motion.li variants={itemVariants}>Wear a mask and follow social distancing guidelines at the center.</motion.li>
              <motion.li variants={itemVariants}>If you're feeling unwell on the day of your appointment, please cancel appointment.</motion.li>
              <motion.li variants={itemVariants}>After vaccination, Dog will be monitored for 15-30 minutes at the center.</motion.li>
            </motion.ul>
          </motion.div>
        </motion.div>
      </motion.div>
      <Button 
  variant="outline" 
  className="w-full mt-4 bg-blue-600 text-white hover:bg-blue-200 transition-colors duration-300 flex items-center justify-center space-x-2"
  onClick={handleGoBack}
>
  <ArrowLeft className="h-5 w-5 mr-2" />
  Back to Profile
</Button>
<Button 
  onClick={() => {
    window.print();
  }}
  className="w-full mt-4 bg-green-500 text-white hover:bg-green-600 transition-colors duration-300 flex items-center justify-center space-x-2"
>
  <PawPrint className="h-5 w-5 mr-2" />
  Print Statement
</Button>
    </div>
  );
}