import { useState, useEffect } from "react";
import { Users, Package, ShoppingCart, Calendar, RefreshCw, TrendingUp, ChevronRight, AlertCircle, TrendingDown, DollarSign, Activity } from "lucide-react";
import { motion } from "framer-motion";

const Dashboard = () => {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    customers: 0,
    vaccinations: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        
        const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:4001';
        const response = await fetch(`${API_URL}/api/dashboard/stats`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Response status:', response.status);
        const contentType = response.headers.get('content-type');
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          throw new Error(`Failed to fetch dashboard data: ${response.status} ${response.statusText}`);
        }
        
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          setStats({
            products: data.productCount || 0,
            orders: data.orderCount || 0,
            customers: data.customerCount || 0,
            vaccinations: data.vaccinationCount || 0,
          });
        } else {
          throw new Error('Received non-JSON response from server');
        }
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  // Improved stat card component with animations
  const StatCard = ({ title, value, icon, color, trendIcon, trendValue, trendColor }) => {
    return (
      <motion.div 
        whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`bg-white p-6 rounded-xl border shadow-sm relative overflow-hidden`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-full ${color} text-white`}>
            {icon}
          </div>
          {trendIcon && (
            <div className={`flex items-center text-xs font-medium ${trendColor}`}>
              {trendIcon}
              <span className="ml-1">{trendValue}</span>
            </div>
          )}
        </div>
        
        <h2 className="text-lg font-medium text-gray-700 mb-1">{title}</h2>
        
        {loading ? (
          <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
        ) : (
          <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
        )}
        
        <div className="absolute -right-6 -bottom-10 opacity-10">
          {icon}
        </div>
        
        <a href="#" className="text-blue-600 text-sm font-medium mt-4 inline-flex items-center">
          View Details
          <ChevronRight className="h-4 w-4 ml-1" />
        </a>
      </motion.div>
    );
  };

  // Additional analytics components
  const AnalyticsCard = () => {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="col-span-2 bg-white p-6 rounded-xl border shadow-sm"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-800">Sales Overview</h2>
          <select className="p-1 text-sm border rounded bg-gray-50">
            <option>Last 30 days</option>
            <option>This Month</option>
            <option>This Year</option>
          </select>
        </div>
        <div className="h-64 flex items-center justify-center">
          {loading ? (
            <div className="animate-pulse w-full h-48 bg-gray-200 rounded"></div>
          ) : (
            <div className="text-center text-gray-500">
              <Activity className="h-12 w-12 mx-auto mb-4 text-blue-200" />
              <p>Your analytics chart will appear here</p>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  const QuickActions = () => {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="bg-white p-6 rounded-xl border shadow-sm"
      >
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="space-y-2">
          <a href="/admin/products/add" className="flex items-center justify-between p-3 hover:bg-blue-50 rounded-md transition-colors">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-md mr-3">
                <Package className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-gray-700">Add new product</span>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </a>
          <a href="/admin/orders" className="flex items-center justify-between p-3 hover:bg-blue-50 rounded-md transition-colors">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-md mr-3">
                <ShoppingCart className="h-4 w-4 text-green-600" />
              </div>
              <span className="text-gray-700">View recent orders</span>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </a>
          <a href="/admin/customers" className="flex items-center justify-between p-3 hover:bg-blue-50 rounded-md transition-colors">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-md mr-3">
                <Users className="h-4 w-4 text-purple-600" />
              </div>
              <span className="text-gray-700">Manage customers</span>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </a>
        </div>
      </motion.div>
    );
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow">
          <div className="flex items-center">
            <AlertCircle className="h-6 w-6 mr-2" />
            <p className="font-medium">Error loading dashboard data: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <button 
          onClick={() => window.location.reload()} 
          className="ml-auto flex items-center px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors duration-200"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Data
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Products" 
          value={stats.products} 
          icon={<Package className="h-6 w-6" />} 
          color="bg-indigo-600" 
          trendIcon={<TrendingUp className="h-3 w-3" />}
          trendValue="+12.5%"
          trendColor="text-green-500"
        />
        
        <StatCard 
          title="Orders" 
          value={stats.orders} 
          icon={<ShoppingCart className="h-6 w-6" />} 
          color="bg-blue-600" 
          trendIcon={<TrendingUp className="h-3 w-3" />}
          trendValue="+8.2%"
          trendColor="text-green-500"
        />
        
        <StatCard 
          title="Customers" 
          value={stats.customers} 
          icon={<Users className="h-6 w-6" />} 
          color="bg-green-600" 
          trendIcon={<TrendingUp className="h-3 w-3" />}
          trendValue="+5.3%"
          trendColor="text-green-500"
        />
        
        <StatCard 
          title="Vaccinations" 
          value={stats.vaccinations} 
          icon={<Calendar className="h-6 w-6" />} 
          color="bg-amber-600" 
          trendIcon={<TrendingDown className="h-3 w-3" />}
          trendValue="-2.1%"
          trendColor="text-red-500"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AnalyticsCard />
        <QuickActions />
      </div>
    </div>
  );
};

export default Dashboard;