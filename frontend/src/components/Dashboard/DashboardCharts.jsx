import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { Package, ShoppingCart, Users, ChevronRight } from 'lucide-react';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const DashboardCharts = () => {
  const [chartData, setChartData] = useState({
    salesData: [],
    topProducts: [],
    userStats: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(true);
        const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:4001';
        const response = await fetch(`${API_URL}/api/dashboard/charts`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch chart data: ${response.status}`);
        }

        const data = await response.json();
        setChartData(data);
      } catch (err) {
        console.error("Error fetching chart data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, []);

  // Sales over time chart
  const salesChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Monthly Revenue',
        font: {
          size: 16
        }
      },
    },
  };
  const salesChartData = {
    labels: Array.isArray(chartData.salesData) 
      ? chartData.salesData.map(item => item?.month || '') 
      : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Sales ($)',
        data: Array.isArray(chartData.salesData) 
          ? chartData.salesData.map(item => parseFloat(item?.sales) || 0)
          : [12000, 19000, 3000, 5000, 15000, 3000, 20000, 17000, 19000, 22000, 24000, 30000],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.3,
      },
    ],
  };

  // Top products chart
  const productChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Top Selling Products',
        font: {
          size: 16
        }
      },
    },
  };
  const productChartData = {
    labels: Array.isArray(chartData.topProducts) 
      ? chartData.topProducts.map(product => product?.name || 'Unknown Product') 
      : ['Dry Food', 'Puppy Food', 'Toys', 'Grooming', 'Accessories'],
    datasets: [
      {
        label: 'Units Sold',
        data: Array.isArray(chartData.topProducts)
          ? chartData.topProducts.map(product => parseInt(product?.unitsSold) || 0)
          : [65, 59, 80, 81, 56],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // User demographics
  const userStatsOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: 'Customer Demographics',
        font: {
          size: 16
        }
      },
    },
  };
  const userStatsData = {
    labels: ['New Users', 'Returning Users', 'Premium Members'],
    datasets: [
      {
        data: [
          parseInt(chartData.userStats?.newUsers) || 300,
          parseInt(chartData.userStats?.returningUsers) || 250,
          parseInt(chartData.userStats?.premiumMembers) || 100
        ],
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 206, 86, 0.6)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };
  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
        <p className="text-red-600">Error loading chart data: {error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Loading placeholders */}
        <div className="bg-white p-4 rounded-lg shadow-md h-64 flex items-center justify-center">
          <div className="w-10 h-10 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md h-64 flex items-center justify-center">
          <div className="w-10 h-10 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md h-64 flex items-center justify-center">
          <div className="w-10 h-10 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md h-64 flex items-center justify-center">
          <div className="space-y-2 animate-pulse w-full">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-10 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Sales Chart */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <Line options={salesChartOptions} data={salesChartData} />
      </div>      {/* Product Chart */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <Bar options={productChartOptions} data={productChartData} />
      </div>


      {/* Statistics Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
          <h3 className="text-gray-500 text-sm font-medium">TOTAL ORDERS</h3>
          <p className="text-2xl font-bold">
            {Array.isArray(chartData.salesData) && chartData.salesData.length > 0
              ? chartData.salesData.reduce((total, month) => total + (parseFloat(month.sales) || 0), 0)
              : 0}
          </p>
          <div className="flex items-center mt-2">
            <span className="text-green-500 text-sm font-medium">↑ 12%</span>
            <span className="text-gray-500 text-sm ml-2">vs last month</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500">
          <h3 className="text-gray-500 text-sm font-medium">TOTAL REVENUE</h3>
          <p className="text-2xl font-bold">${
            Array.isArray(chartData.salesData) && chartData.salesData.length > 0
              ? chartData.salesData.reduce((total, month) => total + (parseFloat(month.sales) || 0), 0).toLocaleString() 
              : 0
          }</p>
          <div className="flex items-center mt-2">
            <span className="text-green-500 text-sm font-medium">↑ 8%</span>
            <span className="text-gray-500 text-sm ml-2">vs last month</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-yellow-500">
          <h3 className="text-gray-500 text-sm font-medium">ACTIVE USERS</h3>
          <p className="text-2xl font-bold">
            {((parseInt(chartData.userStats?.newUsers) || 0) + (parseInt(chartData.userStats?.returningUsers) || 0))}
          </p>
          <div className="flex items-center mt-2">
            <span className="text-green-500 text-sm font-medium">↑ 5%</span>
            <span className="text-gray-500 text-sm ml-2">vs last month</span>
          </div>
        </div>
      </div>
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
      
    </div>

  );
};

export default DashboardCharts;
