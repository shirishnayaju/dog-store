import { Outlet, Link } from "react-router-dom";
import { LayoutDashboard, ShoppingBag, Package, Users, Calendar, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Logo from "../Image/logo.jpg"

const Admin = () => {
  const { user, logout } = useAuth(); // Access user and logout function

  // Handle logout action
  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex h-screen bg-gradient-to-r from-blue-700 to-blue-900">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 shadow-lg flex flex-col">
        <div className="p-6 flex items-center space-x-4">
          {/* Logo Section */}
          <img 
             src={Logo} alt="Gharpaluwa Logo"
            className="h-10 w-10 rounded-full object-cover shadow-md"
          />
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
            <p className="text-sm text-gray-400 mt-1">Manage your store efficiently</p>
          </div>
        </div>
        
        <nav className="mt-6 flex-1">
          <ul>
            <li>
              <Link
                to="/admin"
                className="flex items-center px-6 py-3 text-white hover:bg-blue-600 hover:text-white transition-colors duration-200"
              >
                <LayoutDashboard className="mr-3 h-5 w-5" />
                <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link
                to="/admin/products"
                className="flex items-center px-6 py-3 text-white hover:bg-blue-600 hover:text-white transition-colors duration-200"
              >
                <Package className="mr-3 h-5 w-5" />
                <span>Products</span>
              </Link>
            </li>
            <li>
              <Link
                to="/admin/orders"
                className="flex items-center px-6 py-3 text-white hover:bg-blue-600 hover:text-white transition-colors duration-200"
              >
                <ShoppingBag className="mr-3 h-5 w-5" />
                <span>Orders</span>
              </Link>
            </li>
            <li>
              <Link
                to="/admin/customers"
                className="flex items-center px-6 py-3 text-white hover:bg-blue-600 hover:text-white transition-colors duration-200"
              >
                <Users className="mr-3 h-5 w-5" />
                <span>Customers</span>
              </Link>
            </li>
            <li>
              <Link
                to="/admin/bookings"
                className="flex items-center px-6 py-3 text-white hover:bg-blue-600 hover:text-white transition-colors duration-200"
              >
                <Calendar className="mr-3 h-5 w-5" />
                <span>Bookings</span>
              </Link>
            </li>
          </ul>
        </nav>

        {/* Logout button at the bottom */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-white bg-blue-600 hover:bg-blue-500 transition-colors duration-200 rounded"
          >
            <LogOut className="mr-3 h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Welcome Message */}
        <div className="bg-gray-900 p-6 rounded-lg shadow-inner mb-8 flex justify-between items-center">
          <div>
            {user ? (
              <h2 className="text-3xl font-bold text-yellow-400">
                Welcome Back, <span className="text-white">{user.name}</span>
              </h2>
            ) : (
              <p className="text-xl text-gray-400">Loading user data...</p>
            )}
          </div>
        </div>

        {/* Nested Admin Routes */}
        <div className="bg-gray-900 p-6 rounded-lg shadow-inner text-white">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Admin;
