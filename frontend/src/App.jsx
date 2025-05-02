import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import CartProvider from './context/CartContext';
import { ToastProvider } from './context/ToastContext'; 
import Header from "./components/Header";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
// Import all pages from the centralized index file
import {
  Home,
  Products,
  ProductDetails,
  Cart,
  Login,
  Signup,
  Checkout,
  Admin,
  Dashboard,
  AdminProducts,
  Orders,
  Customers,
  Vaccination,
  VaccinationDetails,
  Aboutus,
  ProfilePage,
  ForgotPassword,
  ResetPassword,
  VerifyOtp,
  VerificationPending,
  EditProfile,
  BookingConfirm,
  MyBookings,
  ScheduleVaccination,
  SearchResults,
  Bookings,
  ProductForm,
  Payment,
  PaymentSuccess,
  AddProducts
} from './pages';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <AuthProvider>
        <CartProvider>
          <ToastProvider>
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
                      <Route path="/payment" element={<Payment />} />
                      <Route path="/payment-success" element={<PaymentSuccess />} />
                    </Routes>
                  </main>
                  <Footer />
                </div>
              } />
              <Route path="/MyBookings" element={<MyBookings />} />
            </Routes>
          </ToastProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;