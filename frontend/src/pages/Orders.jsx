import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Eye, FileText, Calendar, User, Package, CreditCard, 
  ChevronDown, ChevronUp, Mail, RefreshCw, Filter, 
  CheckCircle, XCircle, Clock, Search, Trash, Download, ArrowDownCircle
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
  const [orderStats, setOrderStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    cancelled: 0
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    // Calculate order statistics
    if (orders.length > 0) {
      const stats = {
        total: orders.length,
        pending: orders.filter(order => order.status?.toLowerCase() === 'pending').length,
        approved: orders.filter(order => order.status?.toLowerCase() === 'approved').length,
        cancelled: orders.filter(order => order.status?.toLowerCase() === 'cancelled').length
      };
      setOrderStats(stats);
    }
  }, [orders]);

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
    <div className="p-6 rounded-xl">
      <div className="mb-6 ">
        <h1 className="text-2xl font-bold text-white flex items-center mb-4">
          <Package className="h-6 w-6 mr-2 text-blue-600" />
          Orders Management
          {isRefreshing && <RefreshCw className="ml-2 h-4 w-4 animate-spin text-blue-500" />}
        </h1>
        <p className="text-white">Manage and track all customer orders in one place</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-blue-700 shadow rounded-lg p-4 border-l-4 border-blue-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-white mb-1">Total Orders</p>
              <p className="text-2xl font-bold text-white">{orderStats.total}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-yellow-700 shadow rounded-lg p-4 border-l-4 border-yellow-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-white mb-1">Pending</p>
              <p className="text-2xl font-bold text-white">{orderStats.pending}</p>
            </div>
            <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-green-700 shadow rounded-lg p-4 border-l-4 border-green-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-white mb-1">Approved</p>
              <p className="text-2xl font-bold text-white">{orderStats.approved}</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-red-700 shadow rounded-lg p-4 border-l-4 border-red-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-white mb-1">Cancelled</p>
              <p className="text-2xl font-bold text-white">{orderStats.cancelled}</p>
            </div>
            <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
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
            
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
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
              
              <button 
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md flex items-center transition-colors duration-200"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="mx-6 mt-6 bg-red-50 text-red-800 p-4 rounded-md flex items-start">
            <XCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 m-6 rounded-lg border border-gray-200">
            <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No orders found</h3>
            <p className="text-gray-500">
              {searchQuery ? 'Try adjusting your search query or filters' : 'No orders match the selected filter'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
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
                          <span className="text-sm font-medium text-gray-900">Rs {parseFloat(order.total || 0).toFixed(2)}</span>
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
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => toggleOrderDetails(order._id)}
                            className={`border border-gray-300 px-3 py-1 rounded-md inline-flex items-center transition-colors duration-150
                              ${expandedOrderId === order._id ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            <span>{expandedOrderId === order._id ? 'Hide' : 'View'}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedOrderId === order._id && (
                      <tr>
                        <td colSpan="6" className="px-6 py-6 bg-blue-50 border-t border-blue-100">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white p-5 rounded-lg shadow border border-gray-200">
                              <h3 className="font-semibold text-lg text-gray-900 flex items-center mb-4 pb-2 border-b">
                                <User className="h-5 w-5 mr-2 text-blue-600" />
                                Customer Information
                              </h3>
                              <div className="text-sm text-gray-600 space-y-3">
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
                                  <div className="mt-3 pt-3 border-t">
                                    <div className="text-gray-500 mb-1">Customer Notes:</div>
                                    <div className="bg-gray-50 p-3 rounded border border-gray-200 italic">{order.customer.orderNotes}</div>
                                  </div>
                                )}
                              </div>
                              
                              <h3 className="font-semibold text-lg text-gray-900 flex items-center mt-6 mb-4 pb-2 border-b">
                                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                                Order Actions
                              </h3>
                              <div className="flex flex-wrap gap-3">
                                <button 
                                  onClick={() => updateOrderStatus(order._id, 'Approved')}
                                  className={`px-4 py-2 rounded-md text-sm flex items-center transition-colors duration-200
                                    ${order.status === 'Approved' 
                                      ? 'bg-green-100 text-green-800 border border-green-200' 
                                      : 'bg-white border border-gray-300 hover:bg-green-50 hover:text-green-700 hover:border-green-200'}`}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Approve Order
                                </button>
                                
                                <button 
                                  onClick={() => updateOrderStatus(order._id, 'Cancelled')}
                                  className={`px-4 py-2 rounded-md text-sm flex items-center transition-colors duration-200
                                    ${order.status === 'Cancelled' 
                                      ? 'bg-red-100 text-red-800 border border-red-200' 
                                      : 'bg-white border border-gray-300 hover:bg-red-50 hover:text-red-700 hover:border-red-200'}`}
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Cancel Order
                                </button>
                                
                                <button 
                                  onClick={() => sendStatusEmail(order, order.status)}
                                  disabled={sendingEmail[order._id] || !order.userEmail}
                                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm flex items-center disabled:opacity-50 transition-colors duration-200"
                                >
                                  {sendingEmail[order._id] ? (
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                  ) : (
                                    <Mail className="h-4 w-4 mr-2" />
                                  )}
                                  Send Email Notification
                                </button>
                              </div>
                              
                              <div className="mt-6">
                                <h3 className="font-semibold text-lg text-gray-900 flex items-center mb-4 pb-2 border-b">
                                  <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                                  Order Timeline
                                </h3>
                                <div className="relative pl-6 border-l-2 border-blue-200 space-y-6">
                                  <div className="relative">
                                    <div className="absolute -left-[25px] h-5 w-5 rounded-full bg-blue-600 flex items-center justify-center">
                                      <div className="h-2 w-2 rounded-full bg-white"></div>
                                    </div>
                                    <div>
                                      <div className="text-sm font-medium text-gray-900">Order Created</div>
                                      <div className="text-xs text-gray-500">{formatDate(order.createdAt)}</div>
                                      <div className="text-sm text-gray-600 mt-1">
                                        Customer placed order with {order.products?.length || 0} item(s)
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="relative">
                                    <div className="absolute -left-[25px] h-5 w-5 rounded-full bg-gray-300 flex items-center justify-center">
                                      <div className="h-2 w-2 rounded-full bg-white"></div>
                                    </div>
                                    <div>
                                      <div className="text-sm font-medium text-gray-900">Status: {order.status || 'Pending'}</div>
                                      <div className="text-xs text-gray-500">{formatDate(order.updatedAt)}</div>
                                      <div className="text-sm text-gray-600 mt-1">
                                        Order status was set to {order.status || 'Pending'}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="bg-white p-5 rounded-lg shadow border border-gray-200">
                              <h3 className="font-semibold text-lg text-gray-900 flex items-center mb-4 pb-2 border-b">
                                <Package className="h-5 w-5 mr-2 text-blue-600" />
                                Order Details
                              </h3>
                              
                              <div className="bg-gray-50 p-4 mb-6 rounded-lg border border-gray-200">
                                <div className="flex justify-between items-center mb-2">
                                  <div className="text-sm text-gray-500">Order ID:</div>
                                  <div className="text-sm font-medium text-gray-900 font-mono">{order._id || "N/A"}</div>
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                  <div className="text-sm text-gray-500">Created Date:</div>
                                  <div className="text-sm font-medium text-gray-900">{formatDate(order.createdAt)}</div>
                                </div>
                                <div className="flex justify-between items-center">
                                  <div className="text-sm text-gray-500">Status:</div>
                                  <span className={`px-3 py-1 inline-flex items-center text-xs leading-5 font-medium rounded-full ${getStatusBadgeClass(order.status)}`}>
                                    {getStatusIcon(order.status)}
                                    <span className="ml-1">{order.status || 'Pending'}</span>
                                  </span>
                                </div>
                              </div>
                              
                              <h4 className="font-medium text-gray-800 mb-3">Products</h4>
                              <div className="overflow-hidden rounded-lg border border-gray-200 mb-6">
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
                                          <td className="px-4 py-3 text-sm text-gray-900 text-right">Rs {parseFloat(product.price).toFixed(2)}</td>
                                          <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">Rs {(parseFloat(product.price) * product.quantity).toFixed(2)}</td>
                                        </tr>
                                      ))
                                    ) : (
                                      <tr>
                                        <td colSpan="4" className="px-4 py-3 text-sm text-gray-500 text-center">No products in this order</td>
                                      </tr>
                                    )}
                                  </tbody>
                                </table>
                              </div>
                              
                              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <div className="flex justify-between items-center mb-2">
                                  <div className="text-sm text-gray-500">Subtotal:</div>
                                  <div className="text-sm font-medium text-gray-900">Rs {parseFloat(order.total || 0).toFixed(2)}</div>
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                  <div className="text-sm text-gray-500">Shipping:</div>
                                  <div className="text-sm font-medium text-gray-900">Rs 0.00</div>
                                </div>
                                <div className="border-t border-gray-200 my-2 pt-2">
                                  <div className="flex justify-between items-center">
                                    <div className="text-base font-medium text-gray-800">Total:</div>
                                    <div className="text-base font-bold text-blue-600">Rs {parseFloat(order.total || 0).toFixed(2)}</div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="mt-6 flex justify-end">
                                <button className="flex items-center text-blue-600 hover:text-blue-800 font-medium">
                                  <ArrowDownCircle className="h-4 w-4 mr-2" />
                                  Download Invoice
                                </button>
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
  );
};

export default Orders;