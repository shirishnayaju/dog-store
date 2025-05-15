import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, ShoppingBag, Package, Users, Calendar, LogOut, Bell, Settings, User, Menu, ChevronDown } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext"; 
import Logo from "../Image/logo.jpg";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import DashboardCharts from "../components/Dashboard/DashboardCharts";
import DashboardSummary from "../components/Dashboard/DashboardSummary";
import RecentActivities from "../components/Dashboard/RecentActivities";

const Admin = () => {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [notificationsCount] = useState(3);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [chartsLoading, setChartsLoading] = useState(true);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowProfileDropdown(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Simulate loading chart data
  useEffect(() => {
    if (location.pathname === "/admin") {
      setChartsLoading(true);
      const timer = setTimeout(() => {
        setChartsLoading(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  const confirmLogout = () => {
    setShowLogoutDialog(true);
  };

  const handleLogout = () => {
    const result = logout();
    
    if (result?.showToast) {
      addToast(result.showToast);
    }
    
    navigate('/home');
    setShowLogoutDialog(false);
  };

  const cancelLogout = () => {
    setShowLogoutDialog(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: "/admin", icon: <LayoutDashboard className="h-5 w-5" />, label: "Dashboard" },
    { path: "/admin/products", icon: <Package className="h-5 w-5" />, label: "Products" },
    { path: "/admin/addproducts", icon: <Calendar className="h-5 w-5" />, label: "Add Products" },
    { path: "/admin/orders", icon: <ShoppingBag className="h-5 w-5" />, label: "Orders" },
    { path: "/admin/customers", icon: <Users className="h-5 w-5" />, label: "Customers" },
    { path: "/admin/bookings", icon: <Calendar className="h-5 w-5" />, label: "Bookings" },
  ];

  return (
    <>
      <div className="flex flex-col h-screen bg-gray-100">
        {/* Top Navigation Bar */}
        <header className="bg-gradient-to-r from-blue-700 to-blue-900 text-white shadow-lg z-10">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex items-center space-x-3">
                <img 
                  src={Logo} 
                  alt="Gharpaluwa Logo"
                  className="h-10 w-10 rounded-full object-cover border-2 border-white"
                />
                <div className="hidden md:block">
                  <h1 className="text-xl font-bold">Admin Panel</h1>
                  <p className="text-xs text-blue-200">Gharpaluwa Store</p>
                </div>
              </div>
              
              {/* Desktop Navigation */}
              <nav className="hidden md:block">
                <ul className="flex space-x-1">
                  {navItems.map((item) => (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          isActive(item.path) 
                            ? "bg-white text-blue-700" 
                            : "text-blue-100 hover:bg-blue-800 hover:text-white"
                        }`}
                      >
                        <span className="mr-2">{item.icon}</span>
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

                {/* User Profile Dropdown */}
                <div className="relative">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowProfileDropdown(!showProfileDropdown);
                    }}
                    className="flex items-center space-x-2 p-1 rounded-full hover:bg-blue-800 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white border-2 border-white">
                      {user?.avatar ? (
                        <img src={user.avatar} alt="User" className="h-full w-full rounded-full object-cover" />
                      ) : (
                        <User className="h-5 w-5" />
                      )}
                    </div>
                    <span className="hidden md:flex items-center text-sm font-medium">
                      {user?.name || "Admin"}
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </span>
                  </button>
                  
                  {/* Profile Dropdown */}
                  {showProfileDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-800">{user?.name}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                   
                      <button 
                        onClick={confirmLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>

                {/* Mobile Menu Button */}
                <button 
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="md:hidden text-white hover:text-blue-200 focus:outline-none"
                >
                  <Menu className="h-6 w-6" />
                </button>
            </div>
          </div>
          
          {/* Mobile Menu */}
          {showMobileMenu && (
            <nav className="md:hidden bg-blue-800 border-t border-blue-600">
              <ul className="flex flex-col px-4 py-2 space-y-1">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center px-4 py-2 rounded-md text-sm font-medium ${
                        isActive(item.path) 
                          ? "bg-white text-blue-700" 
                          : "text-blue-100 hover:bg-blue-700"
                      }`}
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <span className="mr-3">{item.icon}</span>
                      {item.label}
                    </Link>
                  </li>
                ))}
                <li className="border-t border-blue-600 pt-2 mt-2">
                  <button 
                    onClick={confirmLogout}
                    className="flex items-center w-full px-4 py-2 rounded-md text-sm font-medium text-red-300 hover:bg-blue-700 hover:text-white"
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    Logout
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </header>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Secondary Bar - Breadcrumb/Context */}
          <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  {location.pathname === "/admin" ? "Dashboard" : 
                  location.pathname === "/admin/products" ? "Products" :
                  location.pathname === "/admin/addproducts" ? "Add Products" :
                  location.pathname === "/admin/orders" ? "Orders" :
                  location.pathname === "/admin/customers" ? "Customers" :
                  location.pathname === "/admin/bookings" ? "Bookings" : "Settings"}
                </h2>
                {user && (
                  <p className="text-sm text-gray-500">
                    Welcome back, <span className="font-medium text-blue-600">{user.name}</span>
                  </p>
                )}
              </div>
              
              {/* Action buttons could go here */}
            </div>
          </div>          {/* Content Area */}
          <main className="flex-1 overflow-y-auto bg-gray-100 p-6">
            {/* Welcome Banner for Dashboard */}
            {location.pathname === "/admin" && (
              <>
                <div className="mb-6 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg shadow-lg p-6 text-white">
                  <h1 className="text-3xl font-bold">
                    Welcome Back, <span className="text-yellow-300">{user?.name || "Admin"}</span>
                  </h1>
                  <p className="mt-2 text-blue-100">
                    Here's what's happening with your store today
                  </p>
                </div>                {/* Dashboard Components */}
                <div className="mb-6">
                  <DashboardSummary />
                </div>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                  <div className="lg:col-span-2">
                    {chartsLoading ? (
                      <div className="bg-white p-6 rounded-lg shadow-md h-96 flex flex-col items-center justify-center">
                        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-500">Loading dashboard data...</p>
                      </div>
                    ) : (
                      <DashboardCharts />
                    )}
                  </div>
                  <div>
                    {chartsLoading ? (
                      <div className="bg-white p-6 rounded-lg shadow-md h-96 flex items-center justify-center">
                        <div className="w-full space-y-3">
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      </div>
                    ) : (
                      <RecentActivities />
                    )}
                  </div>
                </div>
              </>
            )}
            
            {/* Main Content Area */}
            <div className={`bg-white rounded-lg shadow-lg ${location.pathname === "/admin" ? "" : "p-6"}`}>
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LogOut className="h-5 w-5 text-red-500" />
              Confirm Admin Logout
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to log out of your admin account?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row justify-end gap-2 mt-4">
            <Button 
              variant="outline" 
              onClick={cancelLogout}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleLogout}
              className="flex items-center"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Admin;