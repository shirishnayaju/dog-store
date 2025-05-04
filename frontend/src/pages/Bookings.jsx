import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, FileText, Calendar, User, Package, CreditCard, 
  ChevronDown, ChevronUp, Mail, RefreshCw, Filter, 
  CheckCircle, XCircle, Clock, Search, Trash, Download, ArrowDownCircle,
  Syringe, AlertTriangle, PawPrint, Heart, Hash, TrendingUp, TrendingDown
} from 'lucide-react';

const VaccinationBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedBookingId, setExpandedBookingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sendingEmail, setSendingEmail] = useState({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [bookingStats, setBookingStats] = useState({
    total: 0,
    scheduled: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    noShow: 0
  });

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    // Calculate booking statistics
    if (bookings.length > 0) {
      const stats = {
        total: bookings.length,
        scheduled: bookings.filter(booking => booking.status?.toLowerCase() === 'scheduled').length,
        confirmed: bookings.filter(booking => booking.status?.toLowerCase() === 'confirmed').length,
        completed: bookings.filter(booking => booking.status?.toLowerCase() === 'completed').length,
        cancelled: bookings.filter(booking => booking.status?.toLowerCase() === 'cancelled').length,
        noShow: bookings.filter(booking => booking.status?.toLowerCase() === 'no-show').length
      };
      setBookingStats(stats);
    }
  }, [bookings]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setIsRefreshing(true);
      const response = await axios.get('http://localhost:4001/api/vaccinations');
      setBookings(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching vaccination bookings:', err);
      setError('Failed to load vaccination bookings. Please try again later.');
    } finally {
      setLoading(false);
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const toggleBookingDetails = (bookingId) => {
    if (expandedBookingId === bookingId) {
      setExpandedBookingId(null);
    } else {
      setExpandedBookingId(bookingId);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const formatAppointmentDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'no-show':
        return 'bg-yellow-100 text-red-800 border border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'scheduled':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'no-show':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      await axios.put(`http://localhost:4001/api/vaccinations/${bookingId}`, { status: newStatus });
      fetchBookings();
    } catch (err) {
      console.error('Error updating booking status:', err);
      alert('Failed to update booking status');
    }
  };

  const sendStatusEmail = async (booking, status) => {
    if (!booking.userEmail) {
      alert('No email address found for this customer');
      return;
    }

    try {
      setSendingEmail(prev => ({ ...prev, [booking._id]: true }));
      await axios.post('http://localhost:4001/api/send-vaccination-email', {
        email: booking.userEmail,
        bookingDetails: booking,
        status: status || booking.status
      });
      alert(`Email notification sent to ${booking.userEmail}`);
    } catch (err) {
      console.error('Error sending email notification:', err);
      alert('Failed to send email notification');
    } finally {
      setSendingEmail(prev => ({ ...prev, [booking._id]: false }));
    }
  };

  // Filter bookings based on status and search query
  const filteredBookings = bookings
    .filter(booking => statusFilter === 'all' || booking.status?.toLowerCase() === statusFilter.toLowerCase())
    .filter(booking => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        (booking._id && booking._id.toLowerCase().includes(query)) ||
        (booking.patient?.name && booking.patient.name.toLowerCase().includes(query)) ||
        (booking.dog?.name && booking.dog.name.toLowerCase().includes(query)) ||
        (booking.userEmail && booking.userEmail.toLowerCase().includes(query))
      );
    });

  if (loading && !isRefreshing) {
    return (
      <div className="flex items-center justify-center h-64 p-6">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading vaccination bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Title and actions row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0 flex items-center">
          <Syringe className="h-6 w-6 mr-3 text-blue-600" />
          Vaccination Bookings
          {isRefreshing && <RefreshCw className="ml-2 h-4 w-4 animate-spin text-blue-500" />}
        </h2>
        <div className="flex space-x-3">
          <button 
            onClick={fetchBookings}
            disabled={isRefreshing}
            className="flex items-center px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
            title="Refresh bookings"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        <motion.div 
          whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white p-6 rounded-xl border shadow-sm relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-full bg-blue-600 text-white">
              <Syringe className="h-6 w-6" />
            </div>
            <div className="flex items-center text-xs font-medium text-green-500">
              <TrendingUp className="h-3 w-3" />
              <span className="ml-1">+8.1%</span>
            </div>
          </div>
          
          <h2 className="text-lg font-medium text-gray-700 mb-1">Total Bookings</h2>
          <p className="text-3xl font-bold text-gray-900">{bookingStats.total}</p>
          
          <div className="absolute -right-6 -bottom-10 opacity-10">
            <Syringe className="h-24 w-24" />
          </div>
        </motion.div>
        
        <motion.div 
          whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="bg-white p-6 rounded-xl border shadow-sm relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-full bg-yellow-500 text-white">
              <Clock className="h-6 w-6" />
            </div>
            <div className="flex items-center text-xs font-medium text-yellow-500">
              <Clock className="h-3 w-3" />
              <span className="ml-1">Pending</span>
            </div>
          </div>
          
          <h2 className="text-lg font-medium text-gray-700 mb-1">Scheduled</h2>
          <p className="text-3xl font-bold text-gray-900">{bookingStats.scheduled}</p>
          
          <div className="absolute -right-6 -bottom-10 opacity-10">
            <Clock className="h-24 w-24" />
          </div>
        </motion.div>
        
        <motion.div 
          whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white p-6 rounded-xl border shadow-sm relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-full bg-blue-500 text-white">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div className="flex items-center text-xs font-medium text-green-500">
              <TrendingUp className="h-3 w-3" />
              <span className="ml-1">+4.3%</span>
            </div>
          </div>
          
          <h2 className="text-lg font-medium text-gray-700 mb-1">Confirmed</h2>
          <p className="text-3xl font-bold text-gray-900">{bookingStats.confirmed}</p>
          
          <div className="absolute -right-6 -bottom-10 opacity-10">
            <CheckCircle className="h-24 w-24" />
          </div>
        </motion.div>
        
        <motion.div 
          whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="bg-white p-6 rounded-xl border shadow-sm relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-full bg-green-600 text-white">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div className="flex items-center text-xs font-medium text-green-500">
              <TrendingUp className="h-3 w-3" />
              <span className="ml-1">+12.5%</span>
            </div>
          </div>
          
          <h2 className="text-lg font-medium text-gray-700 mb-1">Completed</h2>
          <p className="text-3xl font-bold text-gray-900">{bookingStats.completed}</p>
          
          <div className="absolute -right-6 -bottom-10 opacity-10">
            <CheckCircle className="h-24 w-24" />
          </div>
        </motion.div>
        
        <motion.div 
          whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white p-6 rounded-xl border shadow-sm relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-full bg-red-600 text-white">
              <XCircle className="h-6 w-6" />
            </div>
            <div className="flex items-center text-xs font-medium text-red-500">
              <TrendingDown className="h-3 w-3" />
              <span className="ml-1">-2.3%</span>
            </div>
          </div>
          
          <h2 className="text-lg font-medium text-gray-700 mb-1">Cancelled</h2>
          <p className="text-3xl font-bold text-gray-900">{bookingStats.cancelled}</p>
          
          <div className="absolute -right-6 -bottom-10 opacity-10">
            <XCircle className="h-24 w-24" />
          </div>
        </motion.div>
        
        <motion.div 
          whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.25 }}
          className="bg-white p-6 rounded-xl border shadow-sm relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-full bg-amber-500 text-white">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="flex items-center text-xs font-medium text-amber-500">
              <TrendingDown className="h-3 w-3" />
              <span className="ml-1">-5.1%</span>
            </div>
          </div>
          
          <h2 className="text-lg font-medium text-gray-700 mb-1">No-show</h2>
          <p className="text-3xl font-bold text-gray-900">{bookingStats.noShow}</p>
          
          <div className="absolute -right-6 -bottom-10 opacity-10">
            <AlertTriangle className="h-24 w-24" />
          </div>
        </motion.div>
      </div>
      
      {/* Search & Filters Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="bg-white rounded-lg shadow-sm border mb-6"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="relative w-full md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search bookings..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-md">
                <Filter className="h-4 w-4 text-gray-500" />
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent border-none text-gray-700 focus:ring-0 focus:outline-none pr-8 cursor-pointer"
                >
                  <option value="all">All Bookings</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="no-show">No-show</option>
                </select>
              </div>
              
              <button 
                onClick={fetchBookings}
                disabled={isRefreshing}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center transition-colors duration-200 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              
              <button 
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md flex items-center transition-colors duration-200"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>
        
        {/* Error section */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mx-6 mt-6 bg-red-50 text-red-800 p-4 rounded-md flex items-start"
            >
              <XCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <p className="flex-grow">{error}</p>
              <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900">
                &times;
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state */}
        {filteredBookings.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 m-6 rounded-lg border border-gray-200">
            <Syringe className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No bookings found</h3>
            <p className="text-gray-500">
              {searchQuery ? 'Try adjusting your search query or filters' : 'No bookings match the selected filter'}
            </p>
          </div>
        ) : (
          // Bookings Table
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pet Owner</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pet Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.map((booking) => (
                  <React.Fragment key={booking._id}>
                    <motion.tr 
                      className={`hover:bg-blue-50 transition-colors duration-150 ${expandedBookingId === booking._id ? 'bg-blue-50' : ''}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      layout
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="font-mono">{(booking._id || "").substring(0, 8)}...</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                            {booking.patient?.name ? booking.patient.name.charAt(0).toUpperCase() : '?'}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{booking.patient?.name || 'N/A'}</div>
                            <div className="text-xs text-gray-500">{booking.userEmail || 'No email'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mr-3">
                            <PawPrint className="h-4 w-4" />
                          </div>
                          <div className="text-sm font-medium text-gray-900">{booking.dog?.name || 'N/A'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-500">{formatAppointmentDate(booking.appointmentDate)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex items-center text-xs leading-5 font-medium rounded-full ${getStatusBadgeClass(booking.status)}`}>
                          {getStatusIcon(booking.status)}
                          <span className="ml-1">{booking.status || 'Scheduled'}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => toggleBookingDetails(booking._id)}
                            className={`border border-gray-300 px-3 py-1 rounded-md inline-flex items-center transition-colors duration-150
                              ${expandedBookingId === booking._id ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            <span>{expandedBookingId === booking._id ? 'Hide' : 'View'}</span>
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                    {expandedBookingId === booking._id && (
                      <motion.tr
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <td colSpan="6" className="px-6 py-6 bg-blue-50 border-t border-blue-100">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                              <h3 className="font-semibold text-lg text-gray-900 flex items-center mb-4 pb-2 border-b">
                                <User className="h-5 w-5 mr-2 text-blue-600" />
                                Pet Owner Information
                              </h3>
                              <div className="text-sm text-gray-600 space-y-3">
                                <div className="grid grid-cols-3 gap-2">
                                  <div className="text-gray-500">Name:</div>
                                  <div className="col-span-2 font-medium">{booking.patient?.name || 'N/A'}</div>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                  <div className="text-gray-500">Phone:</div>
                                  <div className="col-span-2 font-medium">{booking.patient?.phoneNumber || 'N/A'}</div>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                  <div className="text-gray-500">City:</div>
                                  <div className="col-span-2 font-medium">{booking.patient?.city || 'N/A'}</div>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                  <div className="text-gray-500">Address:</div>
                                  <div className="col-span-2 font-medium">{booking.patient?.address || 'N/A'}</div>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                  <div className="text-gray-500">Email:</div>
                                  <div className="col-span-2 font-medium">{booking.userEmail || 'N/A'}</div>
                                </div>
                                {booking.patient?.specialInstructions && (
                                  <div className="mt-3 pt-3 border-t">
                                    <div className="text-gray-500 mb-1">Special Instructions:</div>
                                    <div className="bg-gray-50 p-3 rounded border border-gray-200 italic">{booking.patient.specialInstructions}</div>
                                  </div>
                                )}
                              </div>
                              
                              <h3 className="font-semibold text-lg text-gray-900 flex items-center mt-6 mb-4 pb-2 border-b">
                                <PawPrint className="h-5 w-5 mr-2 text-blue-600" />
                                Pet Information
                              </h3>
                              <div className="text-sm text-gray-600 space-y-3">
                                <div className="grid grid-cols-3 gap-2">
                                  <div className="text-gray-500">Name:</div>
                                  <div className="col-span-2 font-medium">{booking.dog?.name || 'N/A'}</div>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                  <div className="text-gray-500">Breed:</div>
                                  <div className="col-span-2 font-medium">{booking.dog?.breed || 'N/A'}</div>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                  <div className="text-gray-500">Behavior:</div>
                                  <div className="col-span-2 font-medium">{booking.dog?.behaviour || 'N/A'}</div>
                                </div>
                              </div>
                              
                              <h3 className="font-semibold text-lg text-gray-900 flex items-center mt-6 mb-4 pb-2 border-b">
                                <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                                Booking Timeline
                              </h3>
                              <div className="relative pl-6 border-l-2 border-blue-200 space-y-6">
                                <div className="relative">
                                  <div className="absolute -left-[25px] h-5 w-5 rounded-full bg-blue-600 flex items-center justify-center">
                                    <div className="h-2 w-2 rounded-full bg-white"></div>
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">Booking Created</div>
                                    <div className="text-xs text-gray-500">{formatDate(booking.createdAt)}</div>
                                    <div className="text-sm text-gray-600 mt-1">
                                      Pet owner scheduled vaccination appointment
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="relative">
                                  <div className="absolute -left-[25px] h-5 w-5 rounded-full bg-gray-300 flex items-center justify-center">
                                    <div className="h-2 w-2 rounded-full bg-white"></div>
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">Status: {booking.status || 'Scheduled'}</div>
                                    <div className="text-xs text-gray-500">{formatDate(booking.updatedAt)}</div>
                                    <div className="text-sm text-gray-600 mt-1">
                                      Booking status was set to {booking.status || 'Scheduled'}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                              <h3 className="font-semibold text-lg text-gray-900 flex items-center mb-4 pb-2 border-b">
                                <Syringe className="h-5 w-5 mr-2 text-blue-600" />
                                Appointment Details
                              </h3>
                              
                              <div className="bg-gray-50 p-4 mb-6 rounded-lg border border-gray-200">
                                <div className="flex justify-between items-center mb-2">
                                  <div className="text-sm text-gray-500">Booking ID:</div>
                                  <div className="text-sm font-medium text-gray-900 font-mono">{booking._id || "N/A"}</div>
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                  <div className="text-sm text-gray-500">Appointment Date:</div>
                                  <div className="text-sm font-medium text-gray-900">{formatAppointmentDate(booking.appointmentDate)}</div>
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                  <div className="text-sm text-gray-500">Appointment Time:</div>
                                  <div className="text-sm font-medium text-gray-900">{booking.appointmentTime || 'N/A'}</div>
                                </div>
                                <div className="flex justify-between items-center">
                                  <div className="text-sm text-gray-500">Status:</div>
                                  <span className={`px-3 py-1 inline-flex items-center text-xs leading-5 font-medium rounded-full ${getStatusBadgeClass(booking.status)}`}>
                                    {getStatusIcon(booking.status)}
                                    <span className="ml-1">{booking.status || 'Scheduled'}</span>
                                  </span>
                                </div>
                              </div>
                              
                              <h4 className="font-medium text-gray-800 mb-3">Vaccines</h4>
                              <div className="overflow-hidden rounded-lg border border-gray-200 mb-6">
                                <table className="min-w-full divide-y divide-gray-200">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Vaccine Name</th>
                                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Dose</th>
                                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-200">
                                    {booking.vaccines && booking.vaccines.length > 0 ? (
                                      booking.vaccines.map((vaccine, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50">
                                          <td className="px-4 py-3 text-sm text-gray-900 flex items-center">
                                            <Heart className="h-4 w-4 mr-2 text-blue-500" />
                                            {vaccine.name}
                                          </td>
                                          <td className="px-4 py-3 text-sm text-gray-900 text-center">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                              <Hash className="h-3 w-3 mr-1" />
                                              {vaccine.doseNumber}
                                            </span>
                                          </td>
                                          <td className="px-4 py-3 text-sm text-gray-900 text-right">Rs {parseFloat(vaccine.price || 0).toFixed(2)}</td>
                                        </tr>
                                      ))
                                    ) : (
                                      <tr>
                                        <td colSpan="3" className="px-4 py-3 text-sm text-gray-500 text-center">No vaccines specified</td>
                                      </tr>
                                    )}
                                  </tbody>
                                </table>
                              </div>
                              
                              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <div className="flex justify-between items-center mb-2">
                                  <div className="text-sm text-gray-500">Subtotal:</div>
                                  <div className="text-sm font-medium text-gray-900">Rs {parseFloat(booking.totalAmount || 0).toFixed(2)}</div>
                                </div>
                                <div className="border-t border-gray-200 my-2 pt-2">
                                  <div className="flex justify-between items-center">
                                    <div className="text-base font-medium text-gray-800">Total:</div>
                                    <div className="text-base font-bold text-blue-600">Rs {parseFloat(booking.totalAmount || 0).toFixed(2)}</div>
                                  </div>
                                </div>
                              </div>
                              
                              <h3 className="font-semibold text-lg text-gray-900 flex items-center mt-6 mb-4 pb-2 border-b">
                                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                                Booking Actions
                              </h3>
                              <div className="flex flex-wrap gap-3">
                                <button 
                                  onClick={() => updateBookingStatus(booking._id, 'Confirmed')}
                                  className={`px-4 py-2 rounded-md text-sm flex items-center transition-colors duration-200
                                    ${booking.status === 'Confirmed' 
                                      ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                                      : 'bg-white border border-gray-300 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200'}`}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Confirm Booking
                                </button>
                                
                                <button 
                                  onClick={() => updateBookingStatus(booking._id, 'Completed')}
                                  className={`px-4 py-2 rounded-md text-sm flex items-center transition-colors duration-200
                                    ${booking.status === 'Completed' 
                                      ? 'bg-green-100 text-green-800 border border-green-200' 
                                      : 'bg-white border border-gray-300 hover:bg-green-50 hover:text-green-700 hover:border-green-200'}`}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Complete Booking
                                </button>
                                
                                <button 
                                  onClick={() => updateBookingStatus(booking._id, 'Cancelled')}
                                  className={`px-4 py-2 rounded-md text-sm flex items-center transition-colors duration-200
                                    ${booking.status === 'Cancelled' 
                                      ? 'bg-red-100 text-red-800 border border-red-200' 
                                      : 'bg-white border border-gray-300 hover:bg-red-50 hover:text-red-700 hover:border-red-200'}`}
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Cancel Booking
                                </button>
                                
                                <button 
                                  onClick={() => sendStatusEmail(booking, booking.status)}
                                  disabled={sendingEmail[booking._id] || !booking.userEmail}
                                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm flex items-center disabled:opacity-50 transition-colors duration-200"
                                >
                                  {sendingEmail[booking._id] ? (
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                  ) : (
                                    <Mail className="h-4 w-4 mr-2" />
                                  )}
                                  Send Email Notification
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>
                      </motion.tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
      
      <div className="text-center text-gray-500 text-sm mt-4">
        Showing {filteredBookings.length} of {bookings.length} vaccination bookings
      </div>
    </div>
  );
};

export default VaccinationBookings;