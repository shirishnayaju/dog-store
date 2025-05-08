import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import CartProvider from './context/CartContext';
import { ToastProvider } from './context/ToastContext'; // Import ToastProvider
import Header from "./components/Header";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop"; // Import the ScrollToTop component
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Checkout from "./pages/Checkout";
import Admin from "./pages/Admin";
import Dashboard from "./pages/Dashboard";
import AdminProducts from "./pages/AdminProducts";
import Orders from "./pages/Orders";
import Customers from "./pages/Customers";
import Vaccination from "./pages/Vaccination";
import VaccinationDetails from "./pages/VaccinationDetails";
import Aboutus from "./pages/Aboutus";
import ProfilePage from "./pages/Profile";
import ForgotPassword from "./pages/Forgotpassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyOtp from "./pages/VerifyOtp";
import VerificationPending from "./pages/VerificationPending";
import EditProfile from "./pages/EditProfile";
import BookingConfirm from "./pages/BookingConfirm";
import MyBookings from "./pages/MyBookings";
import ScheduleVaccination from "./pages/ScheduleVaccination";
import SearchResults from "./pages/SearchResults";
import Bookings from "./pages/Bookings";
import ProductForm from './pages/ProductForm';
import Payment from "./pages/Payment";
import PaymentSuccess from "./pages/PaymentSuccess";
import AddProducts from "./pages/AddProducts";

// Create a layout component for pages that need header and footer
const MainLayout = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-gray-50">
    <Header />
    <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {children}
    </main>
    <Footer />
  </div>
);

function App() {
  return (
    <Router>
      <ScrollToTop /> {/* Add ScrollToTop component here */}
      <AuthProvider>
        <CartProvider>
          <ToastProvider> {/* Add ToastProvider here */}
            <Routes>
              {/* Admin routes without Header and Footer */}
              <Route path="/admin" element={<Admin />}>
                <Route index element={<Dashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="addproducts" element={<AddProducts />} />
                <Route path="orders" element={<Orders />} />
                <Route path="customers" element={<Customers />} />
                <Route path="bookings" element={<Bookings />} />
                <Route path="products/add" element={<ProductForm />} />
                <Route path="products/edit/:id" element={<ProductForm />} />
              </Route>

              {/* Main routes with Header and Footer using the layout pattern */}
              <Route path="/" element={<MainLayout><Home /></MainLayout>} />
              <Route path="/home" element={<MainLayout><Home /></MainLayout>} />
              <Route path="/products" element={<MainLayout><Products /></MainLayout>} />
              <Route path="/products/:id" element={<MainLayout><ProductDetails /></MainLayout>} />
              <Route path="/cart" element={<MainLayout><Cart /></MainLayout>} />
              <Route path="/login" element={<MainLayout><Login /></MainLayout>} />
              <Route path="/forgotpassword" element={<MainLayout><ForgotPassword /></MainLayout>} />
              <Route path="/ResetPassword" element={<MainLayout><ResetPassword /></MainLayout>} />
              <Route path="/verification-pending" element={<MainLayout><VerificationPending/></MainLayout>} />
              <Route path="/VerifyOtp" element={<MainLayout><VerifyOtp/></MainLayout>} />
              <Route path="/signup" element={<MainLayout><Signup /></MainLayout>} />
              <Route path="/checkout" element={<MainLayout><Checkout /></MainLayout>} />
              <Route path="/vaccination" element={<MainLayout><Vaccination /></MainLayout>} />
              <Route path="/vaccination/:id" element={<MainLayout><VaccinationDetails /></MainLayout>} />
              <Route path="/aboutus" element={<MainLayout><Aboutus /></MainLayout>} />
              <Route path="/profile" element={<MainLayout><ProfilePage /></MainLayout>} />
              <Route path="/edit-profile" element={<MainLayout><EditProfile /></MainLayout>} />
              <Route path="/BookingConfirm" element={<MainLayout><BookingConfirm /></MainLayout>} />
              <Route path="/ScheduleVaccination" element={<MainLayout><ScheduleVaccination /></MainLayout>} />
              <Route path="/search" element={<MainLayout><SearchResults /></MainLayout>} />
              <Route path="/payment" element={<MainLayout><Payment /></MainLayout>} />
              <Route path="/payment-success" element={<MainLayout><PaymentSuccess /></MainLayout>} />
              <Route path="/MyBookings" element={<MainLayout><MyBookings /></MainLayout>} />
              
              {/* Catch-all route for 404 pages */}
              <Route path="*" element={<MainLayout><div>Page not found</div></MainLayout>} />
            </Routes>
          </ToastProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;