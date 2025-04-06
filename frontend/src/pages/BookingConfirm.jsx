import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Check, Clock, User, Phone, Navigation, Info } from 'lucide-react';
import { Button } from '../components/ui/button';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {  Dog, PawPrint, Activity } from 'lucide-react';
import { motion } from 'framer-motion'; // Import Framer Motion

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
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { duration: 0.5 }
  }
};

const successVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: { 
      type: "spring",
      stiffness: 200,
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
      coordinates: [27.7172, 85.3240], // Latitude, Longitude
      phone: "+977-1-4123456",
      hours: "9:00 AM - 5:00 PM"
    },
    "Downtown Clinic": {
      address: "45 Health Street, Lalitpur",
      coordinates: [27.6588, 85.3247],
      phone: "+977-1-5987654",
      hours: "8:00 AM - 4:00 PM"
    },
    "East Wing Hospital": {
      address: "78 Care Road, Bhaktapur",
      coordinates: [27.6710, 85.4298],
      phone: "+977-1-6678901",
      hours: "8:30 AM - 4:30 PM"
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
      L.polyline(latlngs, { color: 'blue', dashArray: '5, 10' }).addTo(mapRef.current);

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
        const [lat, lng] = center.coordinates;
        const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
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

  if (!bookingDetails) {
    return (
      <div className="flex justify-center items-center h-screen">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto"
            animate={{ 
              rotate: 360 
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear"
            }}
          ></motion.div>
          <motion.p 
            className="mt-4 text-gray-600"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Loading confirmation details...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  const centerDetails = vaccinationCenters[bookingDetails.vaccinationCenter || "Main Center"];
  const patientDetails = bookingDetails.patient || {};

  return (
    <motion.div 
      className="max-w-4xl mx-auto  mb-4 p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Success Header */}
      <motion.div 
        className="bg-blue-500 border-8 border-blue-700 p-4 rounded-lg mb-4"
        variants={successVariants}
      >
        <div className="flex items-center">
          <motion.div 
            className="flex-shrink-0"
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
          <div className="ml-3">
            <motion.h1 
              className="text-2xl font-bold text-white"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Vaccination Booking Confirmed!
            </motion.h1>
            <motion.p 
              className="text-white"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              Your appointment has been successfully scheduled.
            </motion.p>
          </div>
        </div>
      </motion.div>

      {/* Location Status - WITHOUT ANY ANIMATIONS as requested */}
      {userLocation ? (
        <div className="bg-blue-600 border border-green-200 rounded-md p-4 mb-6 mt-4 relative z-10">
          <div className="text-sm text-white flex items-center mb-4">
            <span className="bg-black p-1 rounded-full mr-2">
              <Navigation className="h-4 w-4" />
            </span>
            <span>
              Location access granted. The distance to the vaccination center is
              {distanceInfo && (
                <span className="ml-2 font-semibold">
                  ({distanceInfo.distance} km, approx. {distanceInfo.travelTime} walking)
                </span>
              )}
            </span>
          </div>
          
          {/* Map Component - Now below the status text */}
          <div className="bg-blue-500 shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Location</h2>
            {/* Leaflet Map Container with fixed height */}
            <div 
              ref={mapContainerRef} 
              className="w-full h-64 rounded-lg border border-gray-300 bg-gray-100 overflow-hidden"
            ></div>
            <div className="mt-4">
              <div className="text-white text-sm">Interactive map showing the vaccination center location.</div>
              <div className="text-white text-sm mt-2">
                Your location is shown on the map with directions to the center.
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-100 rounded-md p-4 mb-6">
          <div className="text-sm text-yellow-700 flex items-center">
            <Info className="h-4 w-4 mr-2" />
            <span>User location not available. Allow location access to see distance to center.</span>
          </div>
          {locationError && (
            <div className="text-sm text-red-500 mt-2 ml-6">{locationError}</div>
          )}
          <Button
            onClick={requestUserLocation}
            variant="outline"
            className="mt-3 ml-6 text-yellow-700 border-yellow-200 hover:bg-yellow-50"
          >
            Try Getting Location Again
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Booking Details */}
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
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Booking Details</h2>
            
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
                    <p className="font-medium text-gray-800">{patientDetails.name || "Not specified"}</p>
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
                    <p className="font-medium text-gray-800">{patientDetails.phoneNumber || "Not specified"}</p>
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
                    <p className="font-medium text-gray-800">{patientDetails.city || "Not specified"}</p>
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
        <Dog className="h-5 w-5 text-purple-600" /> {/* Assuming you import Dog icon from lucide-react */}
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
        <PawPrint className="h-5 w-5 text-purple-600" /> {/* Assuming you import PawPrint icon from lucide-react */}
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
        <Activity className="h-5 w-5 text-purple-600" /> {/* Assuming you import Activity icon from lucide-react */}
      </div>
      <div>
        <p className="text-sm text-gray-500">Dog Behaviour</p>
        <p className="font-medium text-gray-800">{bookingDetails.dog?.behaviour || "Not specified"}</p>
      </div>
    </motion.div>
  </motion.div>

              <h3 className="text-lg mt-6 pt-6 font-semibold text-gray-800 mb-3 border-t border-gray-200">Important Instructions</h3>
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

        {/* Map and Actions */}
        <motion.div 
          className="space-y-8"
          variants={itemVariants}
        >
          <motion.div 
            className="bg-blue-600 shadow-md w-80 rounded-lg p-6"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.0 }}
          >
            <h2 className="text-xl font-semibold text-white mb-4">Location</h2>
            {/* Made the image container larger and ensured full fit */}
            <motion.div 
              className="h-80 w-80 rounded-lg border border-gray-300 bg-gray-100 overflow-hidden"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 1.1 }}
              whileHover={{ scale: 1.03 }}
            >
              <img 
                src="/src/Image/image.png" 
                alt="Vaccination center location" 
                className="w-full h-full object-cover object-center"
              />
            </motion.div>
            <div className="mt-4">
              <motion.p 
                className="text-white text-sm"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.2 }}
              >
                Click the button below to see the exact location on Google Maps.
              </motion.p>
            </div>
          </motion.div>

          <motion.div 
            className="bg-white shadow-md rounded-lg p-6"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.3 }}
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Options</h2>
            <div className="space-y-3">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  onClick={openGoogleMaps}
                  className="w-full bg-purple-500 hover:bg-purple-600"
                >
                  Location on Google Map
                </Button>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                 onClick={() => navigate(`/MyBookings`)}
                  className="w-full bg-yellow-500 hover:bg-yellow-600"
                >
                  Print Confirmation
                </Button>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  onClick={() => navigate('/')}
                  className="w-full bg-blue-500 hover:bg-blue-600"
                >
                  Back to Home
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}