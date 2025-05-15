import React, { useState, useEffect } from 'react';
import { UserCheck, ShoppingBag, AlertCircle, CheckCircle, Clock } from 'lucide-react';

const RecentActivities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:4001';
        const response = await fetch(`${API_URL}/api/dashboard/activities`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch activities: ${response.status}`);
        }

        const data = await response.json();
        
        // Format the activities        // Check if data is an array before mapping
        const formattedActivities = Array.isArray(data) ? data.map(activity => {
          if (!activity) return null;
          
          try {
            // Format times to relative time - with error handling
            const time = formatRelativeTime(new Date(activity.time || Date.now()));
            
            // Add appropriate icons
            let icon;
            switch (activity.type) {
              case 'order':
                icon = <ShoppingBag className={`h-4 w-4 ${activity.status === 'completed' ? 'text-blue-500' : activity.status === 'refunded' ? 'text-red-500' : 'text-yellow-500'}`} />;
                break;
              case 'customer':
                icon = <UserCheck className="h-4 w-4 text-green-500" />;
                break;
              case 'booking':
                icon = <CheckCircle className="h-4 w-4 text-purple-500" />;
                break;
              default:
                icon = <Clock className="h-4 w-4 text-gray-500" />;
            }
            
            // Ensure amount is a number if it exists
            let amount = activity.amount;
            if (amount !== undefined && amount !== null) {
              amount = parseFloat(amount);
              if (isNaN(amount)) amount = 0;
            }
            
            return {
              ...activity,
              time,
              icon,
              amount
            };
          } catch (err) {
            console.error("Error formatting activity:", err);
            return null;
          }
        }).filter(Boolean) : [];
        
        setActivities(formattedActivities);
      } catch (err) {
        console.error("Error fetching activities:", err);
        setError(err.message);
        // Set some dummy data in case of error
        setActivities([
          {
            id: 1,
            type: 'order',
            message: 'New order placed',
            customer: 'John Doe',
            amount: '$125.00',
            status: 'completed',
            time: '10 minutes ago',
            icon: <ShoppingBag className="h-4 w-4 text-blue-500" />
          },
          {
            id: 2,
            type: 'customer',
            message: 'New customer registered',
            customer: 'Jane Smith',
            status: 'new',
            time: '1 hour ago',
            icon: <UserCheck className="h-4 w-4 text-green-500" />
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);
  // Function to format date to relative time (e.g., "2 hours ago")
  const formatRelativeTime = (date) => {
    try {
      if (!date || isNaN(date.getTime())) {
        return 'Unknown time';
      }
      
      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);
      
      if (diffInSeconds < 0) {
        // Future date
        return 'Upcoming';
      }
      
      if (diffInSeconds < 60) {
        return 'Just now';
      }
      
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      if (diffInMinutes < 60) {
        return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
      }
      
      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) {
        return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
      }
      
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 30) {
        return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
      }
      
      try {
        const month = date.toLocaleString('default', { month: 'short' });
        const day = date.getDate();
        return `${month} ${day}`;
      } catch (e) {
        // If locale string fails
        return `${date.getMonth() + 1}/${date.getDate()}`;
      }
    } catch (error) {
      console.error("Error formatting relative time:", error);
      return "Unknown time";
    }
  };
  const getStatusBadge = (status) => {
    const statusStyles = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      refunded: 'bg-red-100 text-red-800',
      confirmed: 'bg-purple-100 text-purple-800',
      new: 'bg-blue-100 text-blue-800',
      processing: 'bg-indigo-100 text-indigo-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };

    return (
      <span className={`text-xs px-2 py-1 rounded-full ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };
  
  if (error && !activities.length) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activities</h3>
        <div className="bg-red-50 p-3 rounded border border-red-100">
          <p className="text-red-600 text-sm">Error loading activities</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activities</h3>
      <div className="divide-y divide-gray-100">
        {loading ? (
          // Loading placeholders
          Array(5).fill().map((_, i) => (
            <div key={i} className="py-3 flex items-start">
              <div className="mr-4 mt-1">
                <div className="w-5 h-5 bg-gray-200 rounded-full animate-pulse"></div>
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/6 animate-pulse"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-1/3 mt-2 animate-pulse"></div>
                <div className="flex justify-between items-center mt-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/6 animate-pulse"></div>
                </div>
              </div>
            </div>
          ))
        ) : activities.length > 0 ? (
          // Actual activities
          activities.map(activity => (
            <div key={activity.id} className="py-3 flex items-start">
              <div className="mr-4 mt-1">{activity.icon}</div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
                <p className="text-sm text-gray-500">{activity.customer}</p>                <div className="flex justify-between items-center mt-1">
                  {activity.amount && <p className="text-sm font-medium">${typeof activity.amount === 'number' ? activity.amount.toFixed(2) : activity.amount}</p>}
                  {getStatusBadge(activity.status)}
                </div>
              </div>
            </div>
          ))
        ) : (
          // No activities
          <div className="py-6 text-center">
            <p className="text-gray-500 text-sm">No recent activities</p>
          </div>
        )}
      </div>
      <div className="mt-4 pt-2 border-t border-gray-100">
        <button className="text-blue-600 text-sm font-medium hover:text-blue-800 transition-colors">
          View All Activities
        </button>
      </div>
    </div>
  );
};

export default RecentActivities;
