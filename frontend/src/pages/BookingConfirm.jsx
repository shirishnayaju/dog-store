import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Check, Clock, User, Phone, Navigation, Info, Dog, PawPrint, Activity, Share2, Download, Home, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion } from 'framer-motion';

// Fix for Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      duration: 0.5,
      when: "beforeChildren",
      staggerChildren: 0.15
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { duration: 0.4 }
  }
};

const successVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 15
    }
  }
};

export default function BookingConfirm() {
  const location = useLocation();
  const navigate = useNavigate();
  const [bookingDetails, setBookingDetails] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState("");
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  
  // Centers information with coordinates
  const vaccinationCenters = {
    "Main Center": {
      address: "Radhe Radhe, Bhaktapur",
      coordinates: [27.6757748, 85.3979919],
      phone: "+977-1-4123456",
      hours: "9:00 AM - 5:00 PM"
    }
  };

  // Function to request the user's location
  const requestUserLocation = () => {
    setLocationError("");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("User position:", position);
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (err) => {
          console.error("Error obtaining location:", err.code, err.message);
          setLocationError(
            `Could not retrieve location (Error ${err.code}: ${err.message}). Please ensure location access is allowed.`
          );
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      setLocationError("Geolocation is not supported by this browser.");
    }
  };

  // Attempt to get the user's location on component mount
  useEffect(() => {
    requestUserLocation();
  }, []);

  useEffect(() => {
    // Get booking details from location state or sessionStorage
    const details = location.state?.bookingDetails;
    
    if (details) {
      setBookingDetails(details);
      // Save to session storage for page refreshes
      sessionStorage.setItem('vaccinationBooking', JSON.stringify(details));
    } else {
      // Try to retrieve from session storage
      const savedDetails = sessionStorage.getItem('vaccinationBooking');
      if (savedDetails) {
        setBookingDetails(JSON.parse(savedDetails));
      } else {
        // No details found, redirect to home
        navigate('/');
      }
    }
  }, [location, navigate]);

  // Initialize and update the map
  useEffect(() => {
    if (!bookingDetails || !mapContainerRef.current) return;

    const centerName = bookingDetails.vaccinationCenter || "Main Center";
    const center = vaccinationCenters[centerName];
    
    if (!center || !center.coordinates) return;

    // Initialize map if it doesn't exist
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView(center.coordinates, 15);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: ''
      }).addTo(mapRef.current);
    } else {
      // Just update the view if map already exists
      mapRef.current.setView(center.coordinates, 15);
    }

    // Clear any existing markers
    mapRef.current.eachLayer(layer => {
      if (layer instanceof L.Marker) {
        mapRef.current.removeLayer(layer);
      }
    });

    // Add marker for vaccination center
    const marker = L.marker(center.coordinates)
      .addTo(mapRef.current)
      .bindPopup(`<b>${centerName}</b><br>${center.address}<br>Phone: ${center.phone}`);

    // Add user location marker if available
    if (userLocation) {
      const userMarker = L.marker([userLocation.lat, userLocation.lng], {
        icon: new L.Icon({
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
          shadowSize: [41, 41],
          className: 'user-location-marker'
        })
      }).addTo(mapRef.current).bindPopup('Your location');

      // Draw a line between user and vaccination center
      const latlngs = [
        [userLocation.lat, userLocation.lng],
        center.coordinates
      ];
      L.polyline(latlngs, { color: '#4F46E5', weight: 3, dashArray: '5, 8' }).addTo(mapRef.current);

      // Fit both markers in view
      const bounds = L.latLngBounds([
        [userLocation.lat, userLocation.lng],
        center.coordinates
      ]);
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }

    // Clean up on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [bookingDetails, userLocation]);

  // Format date for display
  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format time for display
  const formatTime = (timeString) => {
    if (!timeString) return "";
    // Handle 24h format like "13:00"
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Helper function: converts degrees to radians
  const deg2rad = (deg) => deg * (Math.PI / 180);

  // Compute the Haversine distance (in km) between two coordinates
  const computeDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in km
    const dLat = deg2rad(lat2 - lat1);
    const dLng = deg2rad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Function to compute estimated travel time
  const computeTravelTime = (distanceKm) => {
    const timeInMinutes = (distanceKm / 5) * 60;
    if (timeInMinutes < 60) {
      return `${Math.round(timeInMinutes)} min`;
    } else {
      const hours = Math.floor(timeInMinutes / 60);
      const minutes = Math.round(timeInMinutes % 60);
      return `${hours} hr ${minutes} min`;
    }
  };

  // Function to open Google Maps with the center's location
  const openGoogleMaps = () => {
    if (bookingDetails) {
      const centerName = bookingDetails.vaccinationCenter || "Main Center";
      const center = vaccinationCenters[centerName];
      
      if (center && center.coordinates) {
        const url = `https://www.google.com/maps/place/Gharpaluwa+Pets+Solution/@27.6757748,85.395417,17z/data=!3m1!4b1!4m6!3m5!1s0x39eb1b04590683f9:0xecdcd2cec3f42ee1!8m2!3d27.6757748!4d85.3979919!16s%2Fg%2F11hds3qvl8?entry=ttu&g_ep=EgoyMDI1MDQwNy4wIKXMDSoASAFQAw%3D%3D`;
        window.open(url, '_blank');
      }
    }
  };

  // Calculate distance to vaccination center if user location is available
  const getDistanceToCenter = () => {
    if (!userLocation || !bookingDetails) return null;
    
    const centerName = bookingDetails.vaccinationCenter || "Main Center";
    const center = vaccinationCenters[centerName];
    
    if (center && center.coordinates) {
      const [centerLat, centerLng] = center.coordinates;
      const distance = computeDistance(
        userLocation.lat,
        userLocation.lng,
        centerLat,
        centerLng
      );
      
      return {
        distance: distance.toFixed(1),
        travelTime: computeTravelTime(distance)
      };
    }
    
    return null;
  };

  const distanceInfo = getDistanceToCenter();

  // Share appointment details
  const shareAppointment = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Vaccination Appointment',
        text: `My vaccination appointment at ${bookingDetails.vaccinationCenter} on ${formatDate(bookingDetails.appointmentDate)} at ${formatTime(bookingDetails.appointmentTime)}.`,
        url: window.location.href,
      })
      .catch((error) => console.log('Error sharing', error));
    } else {
      // Fallback
      alert("Sharing is not supported in your browser. You can copy the URL instead.");
    }
  };

  if (!bookingDetails) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="flex justify-center items-center h-16 w-16 mx-auto"
            animate={{ 
              rotate: 360 
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <div className="h-16 w-16 rounded-full border-t-4 border-b-4 border-indigo-600"></div>
          </motion.div>
          <motion.p 
            className="mt-6 text-gray-600 font-medium"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Loading your confirmation details...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  const centerDetails = vaccinationCenters[bookingDetails.vaccinationCenter || "Main Center"];
  const patientDetails = bookingDetails.patient || {};

  return (
    <motion.div 
      className="max-w-5xl mx-auto mb-12 p-4 sm:p-6 bg-gray-50"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Success Header - Modern design with gradient */}
      <motion.div 
        className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl mb-8 shadow-lg overflow-hidden"
        variants={successVariants}
      >
        <div className="flex items-center p-6">
          <motion.div 
            className="flex-shrink-0 bg-white/20 p-3 rounded-full"
            initial={{ scale: 0 }}
            animate={{ 
              scale: 1,
              transition: {
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.5
              }
            }}
          >
            <Check className="h-8 w-8 text-white" />
          </motion.div>
          <div className="ml-4">
            <motion.h1 
              className="text-2xl md:text-3xl font-bold text-white"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Vaccination Booking Appointment request has been sent to Admin!
            </motion.h1>
            <motion.p 
              className="text-white/90"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              Your appointment confirmation mail will be sent to your respected mail if it has been successfully scheduled and approved by admin.
            </motion.p>
          </div>
        </div>
        
        {/* Appointment summary bar */}
        <motion.div 
          className="bg-indigo-700/40 backdrop-blur-sm p-4 grid grid-cols-1 md:grid-cols-3 gap-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-indigo-200 mr-2" />
            <div>
              <p className="text-xs text-indigo-200">Date</p>
              <p className="text-sm font-medium text-white">{formatDate(bookingDetails.appointmentDate)}</p>
            </div>
          </div>
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-indigo-200 mr-2" />
            <div>
              <p className="text-xs text-indigo-200">Time</p>
              <p className="text-sm font-medium text-white">{formatTime(bookingDetails.appointmentTime)}</p>
            </div>
          </div>
          <div className="flex items-center">
            <Dog className="h-5 w-5 text-indigo-200 mr-2" />
            <div>
              <p className="text-xs text-indigo-200">Pet</p>
              <p className="text-sm font-medium text-white">{bookingDetails.dog?.name || "Not specified"}</p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Location Status - Improved UI */}
      {userLocation ? (
        <motion.div 
          className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl p-5 mb-8 shadow-md relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="text-sm text-white flex items-center mb-3">
            <span className="bg-emerald-600/40 p-2 rounded-full mr-3">
              <Navigation className="h-4 w-4" />
            </span>
            <span className="font-medium">
              Location access granted
              {distanceInfo && (
                <span className="ml-1">
                  — Distance: <span className="font-bold">{distanceInfo.distance} km</span> 
                  <span className="mx-1">•</span> 
                  Est. walking time: <span className="font-bold">{distanceInfo.travelTime}</span>
                </span>
              )}
            </span>
          </div>
          
          {/* Interactive Map */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 shadow-inner">
            <div 
              ref={mapContainerRef} 
              className="w-full h-64 rounded-lg border border-teal-400/30 overflow-hidden shadow-sm"
            ></div>
            <div className="mt-3 text-white/80 text-sm flex items-center">
              <Info className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>Interactive map showing directions from your location to the vaccination center</span>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-8 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="text-sm text-amber-800 flex items-center">
            <span className="bg-amber-200 p-2 rounded-full mr-3">
              <Info className="h-4 w-4 text-amber-700" />
            </span>
            <span className="font-medium">User location not available. Allow location access to see distance to center.</span>
          </div>
          {locationError && (
            <div className="text-sm text-red-600 mt-2 ml-12">{locationError}</div>
          )}
          <Button
            onClick={requestUserLocation}
            variant="outline"
            className="mt-3 ml-12 bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200"
          >
            <Navigation className="h-4 w-4 mr-2" />
            Try Getting Location Again
          </Button>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Booking Details Card */}
        <motion.div 
          className="lg:col-span-2 space-y-6"
          variants={itemVariants}
        >
          <motion.div 
            className="bg-white rounded-xl shadow-md overflow-hidden"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            {/* Card Header */}
            <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
              <h2 className="text-xl font-semibold text-gray-800">Appointment Details</h2>
            </div>
            
            <div className="p-6">
              {/* Owner Information */}
              <motion.div 
                className="mb-8 pb-6 border-b border-gray-100"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                transition={{ delayChildren: 0.9, staggerChildren: 0.15 }}
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <User className="h-5 w-5 text-indigo-500 mr-2" />
                  Owner Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <motion.div 
                    className="bg-gray-50 rounded-lg p-4"
                    variants={itemVariants}
                    whileHover={{ y: -2, transition: { duration: 0.2 } }}
                  >
                    <p className="text-sm text-gray-500">Owner Name</p>
                    <p className="font-medium text-gray-800 mt-1">{patientDetails.name || "Not specified"}</p>
                  </motion.div>
                  
                  <motion.div 
                    className="bg-gray-50 rounded-lg p-4"
                    variants={itemVariants}
                    whileHover={{ y: -2, transition: { duration: 0.2 } }}
                  >
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <p className="font-medium text-gray-800 mt-1">{patientDetails.phoneNumber || "Not specified"}</p>
                  </motion.div>
                  
                  <motion.div 
                    className="bg-gray-50 rounded-lg p-4 md:col-span-2"
                    variants={itemVariants}
                    whileHover={{ y: -2, transition: { duration: 0.2 } }}
                  >
                    <p className="text-sm text-gray-500">City</p>
                    <p className="font-medium text-gray-800 mt-1">{patientDetails.city || "Not specified"}</p>
                  </motion.div>
                </div>
              </motion.div>
              
              {/* Pet Information */}
              <motion.div 
                className="mb-8 pb-6 border-b border-gray-100"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                transition={{ delayChildren: 1.0, staggerChildren: 0.15 }}
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Dog className="h-5 w-5 text-indigo-500 mr-2" />
                  Pet Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <motion.div 
                    className="bg-gray-50 rounded-lg p-4"
                    variants={itemVariants}
                    whileHover={{ y: -2, transition: { duration: 0.2 } }}
                  >
                    <p className="text-sm text-gray-500">Dog Name</p>
                    <p className="font-medium text-gray-800 mt-1">{bookingDetails.dog?.name || "Not specified"}</p>
                  </motion.div>
                  
                  <motion.div 
                    className="bg-gray-50 rounded-lg p-4"
                    variants={itemVariants}
                    whileHover={{ y: -2, transition: { duration: 0.2 } }}
                  >
                    <p className="text-sm text-gray-500">Dog Breed</p>
                    <p className="font-medium text-gray-800 mt-1">{bookingDetails.dog?.breed || "Not specified"}</p>
                  </motion.div>
                  
                  <motion.div 
                    className="bg-gray-50 rounded-lg p-4 md:col-span-2"
                    variants={itemVariants}
                    whileHover={{ y: -2, transition: { duration: 0.2 } }}
                  >
                    <p className="text-sm text-gray-500">Dog Behaviour</p>
                    <p className="font-medium text-gray-800 mt-1">{bookingDetails.dog?.behaviour || "Not specified"}</p>
                  </motion.div>
                </div>
              </motion.div>
              
              {/* Appointment Details */}
              <motion.div 
                className="mb-8 pb-6 border-b border-gray-100"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                transition={{ delayChildren: 1.1, staggerChildren: 0.15 }}
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Calendar className="h-5 w-5 text-indigo-500 mr-2" />
                  Appointment Details
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <motion.div 
                    className="bg-gray-50 rounded-lg p-4"
                    variants={itemVariants}
                    whileHover={{ y: -2, transition: { duration: 0.2 } }}
                  >
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-medium text-gray-800 mt-1">{formatDate(bookingDetails.appointmentDate)}</p>
                  </motion.div>
                  
                  <motion.div 
                    className="bg-gray-50 rounded-lg p-4"
                    variants={itemVariants}
                    whileHover={{ y: -2, transition: { duration: 0.2 } }}
                  >
                    <p className="text-sm text-gray-500">Time</p>
                    <p className="font-medium text-gray-800 mt-1">{formatTime(bookingDetails.appointmentTime)}</p>
                  </motion.div>
                </div>
              </motion.div>
              
              {/* Center & Vaccine Details */}
              <motion.div 
                className="mb-8 pb-6 border-b border-gray-100"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                transition={{ delayChildren: 1.2, staggerChildren: 0.15 }}
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <MapPin className="h-5 w-5 text-indigo-500 mr-2" />
                  Center & Vaccine Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <motion.div 
                    className="bg-gray-50 rounded-lg p-4"
                    variants={itemVariants}
                    whileHover={{ y: -2, transition: { duration: 0.2 } }}
                  >
                    <p className="text-sm text-gray-500">Vaccination Center</p>
                    <p className="font-medium text-gray-800 mt-1">{bookingDetails.vaccinationCenter}</p>
                    <p className="text-sm text-gray-600 mt-1">{centerDetails?.address}</p>
                  </motion.div>
                  
                  <motion.div 
                    className="bg-gray-50 rounded-lg p-4"
                    variants={itemVariants}
                    whileHover={{ y: -2, transition: { duration: 0.2 } }}
                  >
                    <p className="text-sm text-gray-500">Center Hours</p>
                    <p className="font-medium text-gray-800 mt-1">{centerDetails?.hours}</p>
                    <p className="text-sm text-gray-600 mt-1">Phone: {centerDetails?.phone}</p>
                  </motion.div>
                  
                  <motion.div 
                    className="bg-gray-50 rounded-lg p-4 md:col-span-2"
                    variants={itemVariants}
                    whileHover={{ y: -2, transition: { duration: 0.2 } }}
                  >
                    <p className="text-sm text-gray-500">Vaccine Name</p>
                    <p className="font-medium text-gray-800 mt-1">{bookingDetails.vaccines?.[0]?.name || "Not specified"}</p>
                  </motion.div>
                </div>
              </motion.div>
              
              {/* Important Instructions */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                transition={{ delayChildren: 1.3, staggerChildren: 0.1 }}
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Info className="h-5 w-5 text-indigo-500 mr-2" />
                  Important Instructions
                </h3>
                
                <motion.div 
                  className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-r-lg"
                  variants={itemVariants}
                >
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-indigo-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Please arrive 15 minutes before your scheduled appointment time.</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-indigo-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Bring a valid mail having your booking confirmation.</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-indigo-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Wear a mask and follow social distancing guidelines at the center.</span>
                      </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-indigo-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>If you're feeling unwell on the day of your appointment, please cancel appointment.</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-indigo-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>After vaccination, your dog will be monitored for 15-30 minutes at the center.</span>
                    </li>
                  </ul>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* Sidebar with Map and Actions */}
        <motion.div 
          className="space-y-6"
          variants={itemVariants}
        >
          {/* Center Location Card */}
          <motion.div 
            className="bg-white rounded-xl shadow-md overflow-hidden"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.0 }}
          >
            <div className="bg-indigo-500 px-6 py-4">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Center Location
              </h2>
            </div>
            
            {/* Image Container */}
            <motion.div 
              className="p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.1 }}
            >
              <motion.div 
                className="rounded-lg overflow-hidden shadow-sm"
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              >
                <img 
                  src="/src/Image/image.png" 
                  alt="Vaccination center location" 
                  className="w-full h-48 object-cover object-center"
                />
              </motion.div>
              
              <motion.div 
                className="mt-4 text-gray-600 text-sm"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.2 }}
              >
                <p>
                  {centerDetails?.address || "Radhe Radhe, Bhaktapur"}
                </p>
                <p className="mt-1">
                  Operating hours: {centerDetails?.hours || "9:00 AM - 5:00 PM"}
                </p>
              </motion.div>
              
              <motion.div
                className="mt-4"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button 
                  onClick={openGoogleMaps}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center"
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Open in Google Maps
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Actions Card */}
          <motion.div 
            className="bg-white rounded-xl shadow-md overflow-hidden"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.2 }}
          >
            <div className="bg-indigo-500 px-6 py-4">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Actions
              </h2>
            </div>
            
            <div className="p-4 space-y-3">
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button 
                  onClick={() => window.print()}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Print Confirmation
                </Button>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button 
                  onClick={shareAppointment}
                  className="w-full bg-amber-500 hover:bg-amber-600 flex items-center justify-center"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Appointment
                </Button>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button 
                  onClick={() => navigate('/')}
                  className="w-full bg-gray-600 text-gray-800 hover:bg-gray-400 flex items-center justify-center"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </motion.div>
            </div>
          </motion.div>
          
          {/* QR Code Card */}
          <motion.div 
            className="bg-white rounded-xl shadow-md overflow-hidden"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.3 }}
          >
            <div className="bg-indigo-500 px-6 py-4">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <Check className="h-5 w-5 mr-2" />
                Booking Reference
              </h2>
            </div>
            
            <div className="p-6 flex flex-col items-center">
              {/* Placeholder QR code */}
              <div className="h-32 w-32 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <rect x="10" y="10" width="30" height="30" fill="#4F46E5" />
                  <rect x="60" y="10" width="30" height="30" fill="#4F46E5" />
                  <rect x="10" y="60" width="30" height="30" fill="#4F46E5" />
                  <rect x="60" y="60" width="10" height="10" fill="#4F46E5" />
                  <rect x="80" y="60" width="10" height="10" fill="#4F46E5" />
                  <rect x="60" y="80" width="10" height="10" fill="#4F46E5" />
                  <rect x="80" y="80" width="10" height="10" fill="#4F46E5" />
                  <rect x="45" y="45" width="10" height="10" fill="#4F46E5" />
                </svg>
              </div>
              
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">Booking Reference</p>
                <p className="font-bold text-indigo-600 text-xl mt-1">
                  {/* Generate a fake booking reference */}
                  {`VX${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Show this QR code when you arrive at the center
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Bottom CTA */}
      <motion.div 
        className="mt-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 shadow-lg text-white flex flex-col md:flex-row justify-between items-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
      >
        <div>
          <h3 className="text-lg font-semibold">Need to make changes?</h3>
          <p className="text-purple-100">
            Call us at {centerDetails?.phone || "+977-1-4123456"} to reschedule or cancel your appointment.
          </p>
        </div>
        <Button 
          onClick={() => navigate('/support')}
          className="mt-4 md:mt-0  bg-purple-500 text-indigo-700 hover:bg-gray-100 hover:text-black flex items-center"
        >
          Contact Support
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </motion.div>
    </motion.div>
  );
}