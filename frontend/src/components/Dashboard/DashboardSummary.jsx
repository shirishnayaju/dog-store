import React, { useState, useEffect } from 'react';
import { Activity, ShoppingCart, Users, Calendar } from 'lucide-react';

const DashboardSummary = () => {
  const [stats, setStats] = useState({
    productCount: 0,
    orderCount: 0,
    customerCount: 0,
    vaccinationCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:4001';
        const response = await fetch(`${API_URL}/api/dashboard/stats`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch stats: ${response.status}`);
        }

        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg border border-red-200 mb-6">
        <p className="text-red-600">Error loading dashboard data: {error}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Revenue Card */}
      <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500 flex items-center">
        <div className="p-3 rounded-full bg-blue-100 mr-4">
          <Activity className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">TOTAL PRODUCTS</p>
          {loading ? (
            <div className="h-6 bg-gray-200 animate-pulse rounded w-16 my-1"></div>
          ) : (
            <p className="text-xl font-bold">{stats.productCount}</p>
          )}
          <p className="text-xs text-green-500 flex items-center">
            <span className="mr-1">↑</span> 8% increase
          </p>
        </div>
      </div>

      {/* Total Orders Card */}
      <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-indigo-500 flex items-center">
        <div className="p-3 rounded-full bg-indigo-100 mr-4">
          <ShoppingCart className="h-6 w-6 text-indigo-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">TOTAL ORDERS</p>
          {loading ? (
            <div className="h-6 bg-gray-200 animate-pulse rounded w-16 my-1"></div>
          ) : (
            <p className="text-xl font-bold">{stats.orderCount}</p>
          )}
          <p className="text-xs text-green-500 flex items-center">
            <span className="mr-1">↑</span> 12% increase
          </p>
        </div>
      </div>

      {/* Total Customers Card */}
      <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500 flex items-center">
        <div className="p-3 rounded-full bg-green-100 mr-4">
          <Users className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">TOTAL CUSTOMERS</p>
          {loading ? (
            <div className="h-6 bg-gray-200 animate-pulse rounded w-16 my-1"></div>
          ) : (
            <p className="text-xl font-bold">{stats.customerCount}</p>
          )}
          <p className="text-xs text-green-500 flex items-center">
            <span className="mr-1">↑</span> 5% increase
          </p>
        </div>
      </div>

      {/* Total Bookings Card */}
      <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-yellow-500 flex items-center">
        <div className="p-3 rounded-full bg-yellow-100 mr-4">
          <Calendar className="h-6 w-6 text-yellow-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">TOTAL BOOKINGS</p>
          {loading ? (
            <div className="h-6 bg-gray-200 animate-pulse rounded w-16 my-1"></div>
          ) : (
            <p className="text-xl font-bold">{stats.vaccinationCount}</p>
          )}
          <p className="text-xs text-green-500 flex items-center">
            <span className="mr-1">↑</span> 15% increase
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardSummary;
