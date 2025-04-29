import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useCart } from '../hooks/useCart';
import { ShoppingCart, User, Search, Menu, X, LogOut } from 'lucide-react';
import Logo from '../Image/logo.jpg';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { Button } from "../components/ui/button";

export default function Header() {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const { items } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    
    if (searchQuery.trim()) {
      navigate(`/search?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const confirmLogout = () => {
    setShowLogoutDialog(true);
  };

  const handleLogout = () => {
    const result = logout();
    
    // Show toast notification
    if (result?.showToast) {
      addToast(result.showToast);
    }
    
    navigate('/home');
    setShowLogoutDialog(false);
  };

  const cancelLogout = () => {
    setShowLogoutDialog(false);
  };

  const isAdmin = user && user.role === 'admin';

  const NavLinks = () => (
    <>
      {isAdmin ? (
        <>
          <li className="text-base font-medium">
            <Link to="/admin" className="hover:text-blue-200 transition-colors py-2 px-3">
              Admin
            </Link>
          </li>
          <li className="text-base font-medium">
            <button
              onClick={confirmLogout}
              className="hover:text-blue-200 transition-colors py-2 px-3"
            >
              Logout
            </button>
          </li>
        </>
      ) : (
        <>
          <li className="text-base font-medium">
            <Link to="/home" className="hover:text-blue-200 transition-colors py-2 px-3">
              Home
            </Link>
          </li>
          <li className="text-base font-medium">
            <Link to="/products" className="hover:text-blue-200 transition-colors py-2 px-3">
              Products
            </Link>
          </li>
          <li className="text-base font-medium">
            <Link to="/vaccination" className="hover:text-blue-200 transition-colors py-2 px-3">
              Vaccination
            </Link>
          </li>
          <li className="text-base font-medium">
            <Link to="/aboutus" className="hover:text-blue-200 transition-colors py-2 px-3">
              About Us
            </Link>
          </li>
          {user ? (
            <>
              <li className="text-base font-medium">
                <Link to="/profile" className="flex items-center hover:text-blue-200 transition-colors py-2 px-3">
                  <User className="w-5 h-5 mr-2" />
                  <span className="hidden sm:inline">Profile</span>
                </Link>
              </li>
              <li className="text-base font-medium">
                <button
                  onClick={confirmLogout}
                  className="hover:text-blue-200 transition-colors py-2 px-3"
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li className="text-base font-medium">
                <Link to="/login" className="hover:text-blue-200 transition-colors py-2 px-3">
                  Login
                </Link>
              </li>
              <li className="text-base font-medium">
                <Link to="/signup" className="hover:text-blue-200 transition-colors py-2 px-3">
                  Sign Up
                </Link>
              </li>
            </>
          )}
        </>
      )}
    </>
  );

  return (
    <>
      <header className="bg-blue-600 text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            {/* Logo & Brand */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <img src={Logo} alt="Gharpaluwa Logo" className="w-12 h-12 rounded-full mr-3" />
                <span className="text-2xl md:text-3xl font-bold">GHARPALUWA</span>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center">
              <Link to="/cart" className="mr-4 relative">
                <ShoppingCart className="w-6 h-6" />
                {items.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-white text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                    {items.length}
                  </span>
                )}
              </Link>
              <button 
                onClick={toggleMobileMenu} 
                className="text-white focus:outline-none"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-2">
              {/* Search Bar */}
              <form onSubmit={handleSearch} className="relative mr-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="rounded-full pl-4 pr-10 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 w-64"
                  placeholder="Search products..."
                />
                <button 
                  type="submit"
                  className="absolute right-0 top-0 mt-2 mr-3"
                >
                  <Search className="w-5 h-5 text-gray-500" />
                </button>
              </form>

              {/* Cart Icon with Count */}
              {!isAdmin && (
                <Link to="/cart" className="flex items-center hover:text-blue-200 transition-colors py-2 px-3 mr-2">
                  <ShoppingCart className="w-5 h-5 mr-1" />
                  <span className="inline">Cart</span>
                  {items.length > 0 && (
                    <span className="ml-1 bg-white text-blue-600 rounded-full px-2 py-0.5 text-xs font-bold">
                      {items.length}
                    </span>
                  )}
                </Link>
              )}

              {/* Navigation Links */}
              <nav>
                <ul className="flex items-center">
                  <NavLinks />
                </ul>
              </nav>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-blue-700 px-4 pb-4">
            <form onSubmit={handleSearch} className="py-3">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-full pl-4 pr-10 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="Search products..."
                />
                <button 
                  type="submit"
                  className="absolute right-0 top-0 mt-2 mr-3"
                >
                  <Search className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </form>
            <nav>
              <ul className="flex flex-col space-y-2">
                <NavLinks />
              </ul>
            </nav>
          </div>
        )}
      </header>

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LogOut className="h-5 w-5 text-red-500" />
              Confirm Logout
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to log out of your account?
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
}