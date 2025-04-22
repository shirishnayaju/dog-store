import { useState, useEffect } from "react";
import { Users, Package, ShoppingCart, Calendar } from "lucide-react";

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

  const StatCard = ({ title, value, icon, color }) => {
    return (
      <div className={`bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow duration-300`}>
        <div className="flex items-center justify-between mb-4">
          <div className={`p-2 rounded-full ${color}`}>
            {icon}
          </div>
          <span className="text-sm font-medium text-gray-500">
            {loading ? "Updating..." : "Last 30 days"}
          </span>
        </div>
        
        <h2 className="text-lg font-medium text-gray-700 mb-1">{title}</h2>
        
        {loading ? (
          <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
        ) : (
          <p className="text-3xl font-bold text-black">{value.toLocaleString()}</p>
        )}
      </div>
    );
  };

  if (error) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-white">Dashboard</h1>
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow">
          <div className="flex items-center">
            <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="font-medium">Error loading dashboard data: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white mb-4 md:mb-0">Dashboard Overview</h1>
        
        <button 
          onClick={() => window.location.reload()} 
          className="flex items-center px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors duration-200"
        >
          <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh Data
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Products" 
          value={stats.products} 
          icon={<Package className="h-5 w-5 text-purple-600" />} 
          color="bg-purple-100" 
        />
        
        <StatCard 
          title="Orders" 
          value={stats.orders} 
          icon={<ShoppingCart className="h-5 w-5 text-blue-600" />} 
          color="bg-blue-100" 
        />
        
        <StatCard 
          title="Customers" 
          value={stats.customers} 
          icon={<Users className="h-5 w-5 text-green-600" />} 
          color="bg-green-100" 
        />
        
        <StatCard 
          title="Vaccinations" 
          value={stats.vaccinations} 
          icon={<Calendar className="h-5 w-5 text-amber-600" />} 
          color="bg-amber-100" 
        />
      </div>
    </div>
  );
};

export default Dashboard;