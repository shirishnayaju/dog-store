import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Eye, FileText, Calendar, User, Package, CreditCard, 
  ChevronDown, ChevronUp, Mail, RefreshCw, Filter, 
  CheckCircle, XCircle, Clock, Search, Trash
} from 'lucide-react';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sendingEmail, setSendingEmail] = useState({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setIsRefreshing(true);
      const response = await axios.get('http://localhost:4001/api/orders');
      setOrders(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders. Please try again later.');
    } finally {
      setLoading(false);
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const toggleOrderDetails = (orderId) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
    } else {
      setExpandedOrderId(orderId);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`http://localhost:4001/api/orders/${orderId}`, { status: newStatus });
      fetchOrders();
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Failed to update order status');
    }
  };

  const sendStatusEmail = async (order, status) => {
    if (!order.userEmail) {
      alert('No email address found for this customer');
      return;
    }

    try {
      setSendingEmail(prev => ({ ...prev, [order._id]: true }));
      await axios.post('http://localhost:4001/api/send-order-email', {
        email: order.userEmail,
        orderDetails: order,
        status: status || order.status
      });
      alert(`Email notification sent to ${order.userEmail}`);
    } catch (err) {
      console.error('Error sending email notification:', err);
      alert('Failed to send email notification');
    } finally {
      setSendingEmail(prev => ({ ...prev, [order._id]: false }));
    }
  };

  // Filter orders based on status and search query
  const filteredOrders = orders
    .filter(order => statusFilter === 'all' || order.status?.toLowerCase() === statusFilter.toLowerCase())
    .filter(order => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        (order._id && order._id.toLowerCase().includes(query)) ||
        (order.customer?.name && order.customer.name.toLowerCase().includes(query)) ||
        (order.userEmail && order.userEmail.toLowerCase().includes(query))
      );
    });

  if (loading && !isRefreshing) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-10 w-10 animate-spin mx-auto text-blue-500 mb-4" />
          <p className="text-lg text-gray-600">Loading orders...</p>
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
              <Package className="h-6 w-6 mr-2 text-blue-600" />
              Orders Management
              {isRefreshing && <RefreshCw className="ml-2 h-4 w-4 animate-spin text-blue-500" />}
            </h1>
            
            <div className="flex flex-col md:flex-row items-start md:items-center gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search orders..."
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
                    <option value="all">All Orders</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                
                <button 
                  onClick={fetchOrders}
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

          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No orders found</h3>
              <p className="text-gray-500">
                {searchQuery ? 'Try adjusting your search query or filters' : 'No orders match the selected filter'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <React.Fragment key={order._id}>
                      <tr className={`hover:bg-blue-50 transition-colors duration-150 ${expandedOrderId === order._id ? 'bg-blue-50' : ''}`}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="font-mono">{(order._id || "").substring(0, 8)}...</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 mr-3">
                              {order.customer?.name ? order.customer.name.charAt(0).toUpperCase() : '?'}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{order.customer?.name || 'N/A'}</div>
                              <div className="text-xs text-gray-500">{order.userEmail || 'No email'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <CreditCard className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm font-medium text-gray-900">${parseFloat(order.total || 0).toFixed(2)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-500">{formatDate(order.createdAt)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex items-center text-xs leading-5 font-medium rounded-full ${getStatusBadgeClass(order.status)}`}>
                            {getStatusIcon(order.status)}
                            <span className="ml-1">{order.status || 'Pending'}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button 
                            onClick={() => toggleOrderDetails(order._id)}
                            className={`bg-white border border-gray-300 hover:bg-gray-50 px-3 py-1 rounded-md inline-flex items-center transition-colors duration-150
                              ${expandedOrderId === order._id ? 'bg-blue-50 border-blue-300 text-blue-600' : 'text-gray-700'}`}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            <span>{expandedOrderId === order._id ? 'Hide' : 'View'}</span>
                            {expandedOrderId === order._id ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />}
                          </button>
                        </td>
                      </tr>
                      {expandedOrderId === order._id && (
                        <tr>
                          <td colSpan="6" className="px-6 py-4 bg-blue-50 border-t border-blue-100">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                <h3 className="font-medium text-gray-900 flex items-center mb-3 pb-2 border-b">
                                  <User className="h-4 w-4 mr-2 text-blue-600" />
                                  Customer Details
                                </h3>
                                <div className="text-sm text-gray-600 space-y-2">
                                  <div className="grid grid-cols-3 gap-2">
                                    <div className="text-gray-500">Name:</div>
                                    <div className="col-span-2 font-medium">{order.customer?.name || 'N/A'}</div>
                                  </div>
                                  <div className="grid grid-cols-3 gap-2">
                                    <div className="text-gray-500">Phone:</div>
                                    <div className="col-span-2 font-medium">{order.customer?.phoneNumber || 'N/A'}</div>
                                  </div>
                                  <div className="grid grid-cols-3 gap-2">
                                    <div className="text-gray-500">City:</div>
                                    <div className="col-span-2 font-medium">{order.customer?.city || 'N/A'}</div>
                                  </div>
                                  <div className="grid grid-cols-3 gap-2">
                                    <div className="text-gray-500">Colony:</div>
                                    <div className="col-span-2 font-medium">{order.customer?.colony || 'N/A'}</div>
                                  </div>
                                  <div className="grid grid-cols-3 gap-2">
                                    <div className="text-gray-500">Email:</div>
                                    <div className="col-span-2 font-medium">{order.userEmail || 'N/A'}</div>
                                  </div>
                                  {order.customer?.orderNotes && (
                                    <div className="mt-2 pt-2 border-t">
                                      <div className="text-gray-500 mb-1">Notes:</div>
                                      <div className="bg-gray-50 p-2 rounded border border-gray-200 italic">{order.customer.orderNotes}</div>
                                    </div>
                                  )}
                                </div>
                                
                                <h3 className="font-medium text-gray-900 flex items-center mt-6 mb-3 pb-2 border-b">
                                  <FileText className="h-4 w-4 mr-2 text-blue-600" />
                                  Order Management
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                  <button 
                                    onClick={() => updateOrderStatus(order._id, 'Approved')}
                                    className={`px-3 py-2 rounded-md text-black text-sm flex items-center 
                                      ${order.status === 'Approved' 
                                        ? 'bg-green-100 text-green-800 border border-green-200' 
                                        : 'bg-white border border-gray-300 hover:bg-green-50 hover:text-green-700 hover:border-green-200'}`}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Approve Order
                                  </button>
                                  
                                  <button 
                                    onClick={() => updateOrderStatus(order._id, 'Cancelled')}
                                    className={`px-3 py-2 rounded-md text-black text-sm flex items-center
                                      ${order.status === 'Cancelled' 
                                        ? 'bg-red-100 text-red-800 border border-red-200' 
                                        : 'bg-white border border-gray-300 hover:bg-red-50 hover:text-red-700 hover:border-red-200'}`}
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Cancel Order
                                  </button>
                                  
                                  <button 
                                    onClick={() => sendStatusEmail(order, order.status)}
                                    disabled={sendingEmail[order._id] || !order.userEmail}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-md text-sm flex items-center disabled:opacity-50 transition-colors duration-200"
                                  >
                                    {sendingEmail[order._id] ? (
                                      <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                                    ) : (
                                      <Mail className="h-4 w-4 mr-1" />
                                    )}
                                    Send Notification
                                  </button>
                                </div>
                                
                                <div className="mt-6">
                                  <h3 className="font-medium text-gray-900 flex items-center mb-3 pb-2 border-b">
                                    <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                                    Order Timeline
                                  </h3>
                                  <div className="space-y-3">
                                    <div className="flex items-start">
                                      <div className="h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center mt-0.5">
                                        <div className="h-2 w-2 rounded-full bg-white"></div>
                                      </div>
                                      <div className="ml-3">
                                        <div className="text-sm font-medium text-gray-900">Order Created</div>
                                        <div className="text-xs text-gray-500">{formatDate(order.createdAt)}</div>
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-start">
                                      <div className="h-5 w-5 rounded-full bg-gray-300 flex items-center justify-center mt-0.5">
                                        <div className="h-2 w-2 rounded-full bg-white"></div>
                                      </div>
                                      <div className="ml-3">
                                        <div className="text-sm font-medium text-gray-900">Last Updated</div>
                                        <div className="text-xs text-gray-500">{formatDate(order.updatedAt)}</div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                <h3 className="font-medium text-gray-900 flex items-center mb-3 pb-2 border-b">
                                  <Package className="h-4 w-4 mr-2 text-blue-600" />
                                  Order Items
                                </h3>
                                <div className="overflow-x-auto rounded-lg border border-gray-200">
                                  <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                      <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Qty</th>
                                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                      {order.products && order.products.length > 0 ? (
                                        order.products.map((product, idx) => (
                                          <tr key={idx} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm text-gray-900">{product.name}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900 text-center">{product.quantity}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900 text-right">${parseFloat(product.price).toFixed(2)}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">${(parseFloat(product.price) * product.quantity).toFixed(2)}</td>
                                          </tr>
                                        ))
                                      ) : (
                                        <tr>
                                          <td colSpan="4" className="px-4 py-3 text-sm text-gray-500 text-center">No products in this order</td>
                                        </tr>
                                      )}
                                    </tbody>
                                    <tfoot className="bg-gray-50">
                                      <tr>
                                        <td colSpan="3" className="px-4 py-3 text-sm font-medium text-gray-900 text-right">Subtotal:</td>
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">${parseFloat(order.total || 0).toFixed(2)}</td>
                                      </tr>
                                      <tr>
                                        <td colSpan="3" className="px-4 py-3 text-sm font-bold text-gray-900 text-right border-t">Total:</td>
                                        <td className="px-4 py-3 text-sm font-bold text-blue-600 text-right border-t">${parseFloat(order.total || 0).toFixed(2)}</td>
                                      </tr>
                                    </tfoot>
                                  </table>
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
          Showing {filteredOrders.length} of {orders.length} orders
        </div>
      </div>
    </div>
  );
};

export default Orders;