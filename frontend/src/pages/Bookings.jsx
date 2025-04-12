import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Eye, FileText, Calendar, User, ChevronDown, ChevronUp, Mail, Activity, 
  Clock, MapPin, RefreshCw, Filter, Search, Syringe, CheckCircle, 
  XCircle, AlertTriangle, PawPrint, Heart, Trash, Hash
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

  useEffect(() => {
    fetchBookings();
  }, []);

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
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-10 w-10 animate-spin mx-auto text-blue-500 mb-4" />
          <p className="text-lg text-gray-600">Loading vaccination bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg mb-6 p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
              <Syringe className="h-6 w-6 mr-2 text-blue-600" />
              Vaccination Appointments
              {isRefreshing && <RefreshCw className="ml-2 h-4 w-4 animate-spin text-blue-500" />}
            </h1>
            
            <div className="flex flex-col md:flex-row items-start md:items-center gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search bookings..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:ring-blue-500 focus:border-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex items-center space-x-2 w-full md:w-auto">
                <div className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-md">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-transparent border-none text-gray-700 focus:ring-0 focus:outline-none pr-8"
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
              </div>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-800 p-4 rounded-md mb-6 flex items-start">
              <XCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {filteredBookings.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <Syringe className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No vaccination bookings found</h3>
              <p className="text-gray-500">
                {searchQuery ? 'Try adjusting your search query or filters' : 'No bookings match the selected filter'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pet Owner</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pet Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBookings.map((booking) => (
                    <React.Fragment key={booking._id}>
                      <tr className={`hover:bg-blue-50 transition-colors duration-150 ${expandedBookingId === booking._id ? 'bg-blue-50' : ''}`}>
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
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-500">{booking.appointmentTime || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex items-center text-xs leading-5 font-medium rounded-full ${getStatusBadgeClass(booking.status)}`}>
                            {getStatusIcon(booking.status)}
                            <span className="ml-1">{booking.status || 'Scheduled'}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button 
                            onClick={() => toggleBookingDetails(booking._id)}
                            className={`bg-white border border-gray-300 hover:bg-gray-50 px-3 py-1 rounded-md inline-flex items-center transition-colors duration-150
                              ${expandedBookingId === booking._id ? 'bg-blue-50 border-blue-300 text-blue-600' : 'text-gray-700'}`}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            <span>{expandedBookingId === booking._id ? 'Hide' : 'View'}</span>
                            {expandedBookingId === booking._id ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />}
                          </button>
                        </td>
                      </tr>
                      {expandedBookingId === booking._id && (
                        <tr>
                          <td colSpan="7" className="px-6 py-4 bg-blue-50 border-t border-blue-100">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                <h3 className="font-medium text-gray-900 flex items-center mb-3 pb-2 border-b">
                                  <User className="h-4 w-4 mr-2 text-blue-600" />
                                  Pet Owner Details
                                </h3>
                                <div className="text-sm text-gray-600 space-y-2">
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
                                </div>
                                
                                {booking.patient?.specialInstructions && (
                                  <div className="mt-4 pt-2 border-t">
                                    <div className="text-gray-500 mb-1">Special Instructions:</div>
                                    <div className="bg-gray-50 p-2 rounded border border-gray-200 italic">{booking.patient.specialInstructions}</div>
                                  </div>
                                )}
                                
                                <h3 className="font-medium text-gray-900 flex items-center mt-6 mb-3 pb-2 border-b">
                                  <PawPrint className="h-4 w-4 mr-2 text-blue-600" />
                                  Pet Details
                                </h3>
                                <div className="text-sm text-gray-600 space-y-2">
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
                                
                                <h3 className="font-medium text-gray-900 flex items-center mt-6 mb-3 pb-2 border-b">
                                  <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                                  Booking Timeline
                                </h3>
                                <div className="space-y-3">
                                  <div className="flex items-start">
                                    <div className="h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center mt-0.5">
                                      <div className="h-2 w-2 rounded-full bg-white"></div>
                                    </div>
                                    <div className="ml-3">
                                      <div className="text-sm font-medium text-gray-900">Booking Created</div>
                                      <div className="text-xs text-gray-500">{formatDate(booking.createdAt)}</div>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-start">
                                    <div className="h-5 w-5 rounded-full bg-gray-300 flex items-center justify-center mt-0.5">
                                      <div className="h-2 w-2 rounded-full bg-white"></div>
                                    </div>
                                    <div className="ml-3">
                                      <div className="text-sm font-medium text-gray-900">Last Updated</div>
                                      <div className="text-xs text-gray-500">{formatDate(booking.updatedAt)}</div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                <h3 className="font-medium text-gray-900 flex items-center mb-3 pb-2 border-b">
                                  <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                                  Appointment Details
                                </h3>
                                <div className="text-sm text-gray-600 space-y-2 mb-6">
                                  <div className="grid grid-cols-3 gap-2">
                                    <div className="text-gray-500">Date:</div>
                                    <div className="col-span-2 font-medium">{formatAppointmentDate(booking.appointmentDate)}</div>
                                  </div>
                                  <div className="grid grid-cols-3 gap-2">
                                    <div className="text-gray-500">Time:</div>
                                    <div className="col-span-2 font-medium">{booking.appointmentTime || 'N/A'}</div>
                                  </div>
                                  <div className="grid grid-cols-3 gap-2">
                                    <div className="text-gray-500">Center:</div>
                                    <div className="col-span-2 font-medium">{booking.vaccinationCenter || 'N/A'}</div>
                                  </div>
                                </div>
                                
                                <h3 className="font-medium text-gray-900 flex items-center mb-3 pb-2 border-b">
                                  <Syringe className="h-4 w-4 mr-2 text-blue-600" />
                                  Vaccines
                                </h3>
                                <div className="overflow-hidden rounded-lg border border-gray-200 mb-6">
                                  <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                      <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Vaccine Name</th>
                                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Dose</th>
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
                                          </tr>
                                        ))
                                      ) : (
                                        <tr>
                                          <td colSpan="2" className="px-4 py-3 text-sm text-gray-500 text-center">No vaccines specified</td>
                                        </tr>
                                      )}
                                    </tbody>
                                    <tfoot className="bg-gray-50">
                                      <tr>
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">Total Amount:</td>
                                        <td className="px-4 py-3 text-sm font-bold text-blue-600 text-center">${parseFloat(booking.totalAmount || 0).toFixed(2)}</td>
                                      </tr>
                                    </tfoot>
                                  </table>
                                </div>
                                
                                <h3 className="font-medium text-gray-900 flex items-center mb-3 pb-2 border-b">
                                  <FileText className="h-4 w-4 mr-2 text-blue-600" />
                                  Booking Management
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                  <button 
                                    onClick={() => updateBookingStatus(booking._id, 'Confirmed')}
                                    className={`px-3 py-2 rounded-md text-sm flex items-center text-black
                                      ${booking.status === 'Confirmed' 
                                        ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                                        : 'bg-white border border-gray-300 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200'}`}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Confirm
                                  </button>
                                  
                                  <button 
                                    onClick={() => updateBookingStatus(booking._id, 'Completed')}
                                    className={`px-3 py-2 rounded-md text-sm flex items-center text-black
                                      ${booking.status === 'Completed' 
                                        ? 'bg-green-100 text-green-800 border border-green-200' 
                                        : 'bg-white border border-gray-300 hover:bg-green-50 hover:text-green-700 hover:border-green-200'}`}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Complete
                                  </button>
                                  
                                  <button 
                                    onClick={() => updateBookingStatus(booking._id, 'Cancelled')}
                                    className={`px-3 py-2 rounded-md text-sm flex items-center text-black
                                      ${booking.status === 'Cancelled' 
                                        ? 'bg-red-100 text-red-800 border border-red-200' 
                                        : 'bg-white border border-gray-300 hover:bg-red-50 hover:text-red-700 hover:border-red-200'}`}
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Cancel
                                  </button>
                                  
                                  <button 
                                    onClick={() => updateBookingStatus(booking._id, 'No-show')}
                                    className={`px-3 py-2 rounded-md text-sm flex items-center text-black
                                      ${booking.status === 'No-show' 
                                        ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' 
                                        : 'bg-white border border-grey-300 hover:bg-yellow-50 hover:text-yellow-700 hover:border-yellow-200'}`}
                                  >
                                    <AlertTriangle className="h-4 w-4 mr-1" />
                                    No-show
                                  </button>
                                </div>
                                
                                <div className="mt-4 pt-2 border-t">
                                  <div className="flex justify-between items-center">
                                    <button 
                                      onClick={() => sendStatusEmail(booking, booking.status)}
                                      disabled={sendingEmail[booking._id] || !booking.userEmail}
                                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-md text-sm flex items-center disabled:opacity-50 transition-colors duration-200"
                                    >
                                      {sendingEmail[booking._id] ? (
                                        <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                                      ) : (
                                        <Mail className="h-4 w-4 mr-1" />
                                      )}
                                      Send Email Notification
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        <div className="text-center text-gray-500 text-sm">
          Showing {filteredBookings.length} of {bookings.length} vaccination bookings
        </div>
      </div>
    </div>
  );
};

export default VaccinationBookings;