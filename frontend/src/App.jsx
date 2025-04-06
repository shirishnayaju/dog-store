import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import CartProvider from './context/CartContext';
import Header from "./components/Header";
import Footer from "./components/Footer";
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

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Admin routes without Header and Footer */}
            <Route path="/admin" element={<Admin />}>
              <Route index element={<Dashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="orders" element={<Orders />} />
              <Route path="customers" element={<Customers />} />
            </Route>
            {/* Main routes with Header and Footer */}
            <Route path="*" element={
              <div className="min-h-screen flex flex-col bg-gray-50">
                <Header />
                <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/products/:id" element={<ProductDetails />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/forgotpassword" element={<ForgotPassword />} />
                    <Route path="/ResetPassword" element={<ResetPassword />} />
                    <Route path="/verification-pending" element={<VerificationPending/>} />
                    <Route path="/VerifyOtp" element={<VerifyOtp/>} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/vaccination" element={<Vaccination />} />
                    <Route path="/vaccination/:id" element={<VaccinationDetails />} />
                    <Route path="/aboutus" element={<Aboutus />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/edit-profile" element={<EditProfile />} />
                    <Route path="/BookingConfirm" element={<BookingConfirm />} />
                    <Route path="/ScheduleVaccination" element={<ScheduleVaccination />} />
                    <Route path="/search" element={<SearchResults />} />
                    
                  </Routes>
                </main>
                <Footer />
              </div>
            } />
             <Route path="/MyBookings" element={<MyBookings />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;