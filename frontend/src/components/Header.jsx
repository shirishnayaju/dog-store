import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../hooks/useCart';
import { ShoppingCart, User, Search } from 'lucide-react';
import Logo from '../Image/logo.jpg';

export default function Header() {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault(); // Prevent default form submission
    
    // Trim the search query and check if it's not empty
    if (searchQuery.trim()) {
      // Navigate to products page with search query as a parameter
      navigate(`/search?search=${encodeURIComponent(searchQuery.trim())}`);
      
      // Optional: Reset search input after navigation
      setSearchQuery('');
    }
  };

  return (
    <header className="bg-blue-600 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center justify-evenly">
            <img src={Logo} alt="Gharpaluwa Logo" className="w-16 h-16 rounded-full mr-2" />
            <Link to="/" className="text-4xl font-bold">
              GHARPALUWA
            </Link>
          </div>
          <nav>
            <ul className="flex items-center space-x-4">
              {/* Show different navigation items based on user role */}
              {user && user.role === 'admin' ? (
                <>
                  <li>
                    <button
                      onClick={logout}
                      className="hover:text-blue-200 transition-colors"
                    >
                      LogOut
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li><Link to="/home" className="hover:text-blue-200 transition-colors">HOme</Link></li>
                  <li><Link to="/products" className="hover:text-blue-200 transition-colors">PrOducts</Link></li>
                  <li>
                    <Link to="/cart" className="flex items-center hover:text-blue-200 transition-colors">
                      <ShoppingCart className="w-5 h-5 mr-1" />
                      <span className="hidden sm:inline">CArt</span>
                      <span className="ml-1 bg-white text-blue-600 rounded-full px-2 py-1 text-xs font-bold">
                        {items.length}
                      </span>
                    </Link>
                  </li>
                  <li><Link to="/vaccination" className="hover:text-blue-200 transition-colors">VacCinatiOn</Link></li>
                  <li>
                    <form onSubmit={handleSearch} className="relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="rounded-full pl-4 pr-10 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100"
                        placeholder="Search..."
                      />
                      <button 
                        type="submit"
                        className="absolute right-0 top-0 mt-2 mr-2"
                      >
                        <Search className="w-5 h-5 text-gray-500" />
                      </button>
                    </form>
                  </li>
                  {user ? (
                    <>
                      <li>
                        <Link to="/profile" className="flex items-center hover:text-blue-200 transition-colors">
                          <User className="w-5 h-5 mr-1" />
                          <span className="hidden sm:inline">PrOfile</span>
                        </Link>
                      </li>
                      {user.role === 'admin' && (
                        <li>
                          <Link to="/admin" className="hover:text-blue-200 transition-colors">AdMin</Link>
                        </li>
                      )}
                      <li><Link to="/Aboutus" className="hover:text-blue-200 transition-colors">AbOut Us</Link></li>
                      <li>
                        <button
                          onClick={logout}
                          className="hover:text-blue-200 transition-colors"
                        >
                          LogOut
                        </button>
                      </li>
                    </>
                  ) : (
                    <>
                      <li><Link to="/login" className="hover:text-blue-200 transition-colors">Login</Link></li>
                      <li><Link to="/signup" className="hover:text-blue-200 transition-colors">Sign Up</Link></li>
                      <li><Link to="/Aboutus" className="hover:text-blue-200 transition-colors">AbOut Us</Link></li>
                    </>
                  )}
                </>
              )}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}