import { Outlet, Link, useLocation } from "react-router-dom";
import { LayoutDashboard, ShoppingBag, Package, Users, Calendar, LogOut, Bell, Settings, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Logo from "../Image/logo.jpg";
import { useState } from "react";

const Admin = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [notificationsCount] = useState(3); // Example state for notifications
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const isActive = (path) => {
    return location.pathname === path ? "bg-blue-500" : "";
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className={`${collapsed ? "w-20" : "w-64"} rounded-xl bg-blue-700 shadow-xl flex flex-col transition-all duration-300 ease-in-out`}>
        <div className={`p-4 flex ${collapsed ? "justify-center" : "items-center space-x-3"} rounded-xl border-b border-gray-700 bg-blue-900`}>
          {/* Logo Section */}
          <img 
            src={Logo} alt="Gharpaluwa Logo"
            className="h-10 w-10 rounded-full object-cover shadow-md"
          />
          {!collapsed && (
            <div>
              <h1 className="text-xl font-bold text-white">Admin Panel</h1>
              <p className="text-xs text-white">Gharpaluwa Store</p>
            </div>
          )}
          <button 
            onClick={() => setCollapsed(!collapsed)} 
            className="ml-auto text-gray-400 hover:text-white"
          >
            {collapsed ? "→" : "←"}
          </button>
        </div>
        
        <nav className="mt-6 flex-1">
          <ul className="space-y-1">
            <li>
              <Link
                to="/admin"
                className={`flex items-center ${collapsed ? "justify-center" : "px-6"} py-3 text-white hover:bg-white hover:text-black transition-colors duration-200 ${isActive("/admin")}`}
              >
                <LayoutDashboard className={`${collapsed ? "" : "mr-3"} h-5 w-5`} />
                {!collapsed && <span>Dashboard</span>}
              </Link>
            </li>
            <li>
              <Link
                to="/admin/products"
                className={`flex items-center ${collapsed ? "justify-center" : "px-6"} py-3 text-white hover:bg-white hover:text-black transition-colors duration-200 ${isActive("/admin/products")}`}
              >
                <Package className={`${collapsed ? "" : "mr-3"} h-5 w-5`} />
                {!collapsed && <span>Products</span>}
              </Link>
            </li>
            <li>
              <Link
                to="/admin/orders"
                className={`flex items-center ${collapsed ? "justify-center" : "px-6"} py-3 text-white hover:bg-white hover:text-black transition-colors duration-200 ${isActive("/admin/orders")}`}
              >
                <ShoppingBag className={`${collapsed ? "" : "mr-3"} h-5 w-5`} />
                {!collapsed && <span>Orders</span>}
              </Link>
            </li>
            <li>
              <Link
                to="/admin/customers"
                className={`flex items-center ${collapsed ? "justify-center" : "px-6"} py-3 text-white hover:bg-white hover:text-black transition-colors duration-200 ${isActive("/admin/customers")}`}
              >
                <Users className={`${collapsed ? "" : "mr-3"} h-5 w-5`} />
                {!collapsed && <span>Customers</span>}
              </Link>
            </li>
            <li>
              <Link
                to="/admin/bookings"
                className={`flex items-center ${collapsed ? "justify-center" : "px-6"} py-3 text-white hover:bg-white hover:text-black transition-colors duration-200 ${isActive("/admin/bookings")}`}
              >
                <Calendar className={`${collapsed ? "" : "mr-3"} h-5 w-5`} />
                {!collapsed && <span>Bookings</span>}
              </Link>
            </li>
          </ul>
        </nav>

        {/* Logout button at the bottom */}
        <div className={`p-4 border-t bg-blue-900 border-gray-700 ${collapsed ? "flex justify-center" : ""}`}>
          <button
            onClick={handleLogout}
            className={`flex items-center ${collapsed ? "p-2 justify-center" : "w-full px-4 py-2"} text-white bg-red-600 hover:bg-red-500 transition-colors duration-200 rounded`}
          >
            <LogOut className={`${collapsed ? "" : "mr-3"} h-5 w-5`} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className="bg-white dark:bg-gray-800 rounded-xl shadow-md z-10">
          <div className="flex items-center justify-between p-4">
            {/* Welcome Message */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                {location.pathname === "/admin" ? "Dashboard" : 
                location.pathname === "/admin/products" ? "Products" :
                location.pathname === "/admin/orders" ? "Orders" :
                location.pathname === "/admin/customers" ? "Customers" :
                location.pathname === "/admin/bookings" ? "Bookings" : "Settings"}
              </h2>
              {user && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Welcome back, <span className="font-medium text-blue-600 dark:text-blue-400">{user.name}</span>!
                </p>
              )}
            </div>
            
            <div className="flex items-center space-x-4"> 
              {/* User Profile */}
              <div className="flex items-center space-x-2 pr-11">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="User" className="h-full w-full rounded-full object-cover" />
                  ) : (
                    <User className="h-6 w-6" />
                  )}
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-700 dark:text-white">{user?.name || "User"}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user?.role || "Administrator"}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-900 p-6">
          {/* Welcome Banner for Dashboard */}
          {location.pathname === "/admin" && (
            <div className="mb-6 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-6 text-white">
              <h1 className="text-3xl font-bold">
                Welcome Back, <span className="text-yellow-300">{user?.name || "Admin"}</span>
              </h1>
              <p className="mt-2 text-blue-100">
                Here's what's happening with your store today
              </p>
           </div>
          )}
          
          {/* Main Content Area */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Admin;