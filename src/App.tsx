import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/LandingPage';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Register from './pages/Register';
import ShopLogin from './pages/ShopLogin';
import ShopRegister from './pages/ShopRegister';
import ShopRegisterSuccess from './pages/ShopRegisterSuccess';
import ShopLayout from './pages/shop/ShopLayout';
import ShopDashboard from './pages/shop/ShopDashboard';
import ShopBookings from './pages/shop/ShopBookings';
import ShopServices from './pages/shop/ShopServices';
import ShopCustomers from './pages/shop/ShopCustomers';
import ShopProfile from './pages/shop/ShopProfile';
import ShopCamera from './pages/shop/ShopCamera';
import ShopMessages from './pages/shop/ShopMessages';
import Profile, { ProfileLayout } from './pages/Profile';
import OrderHistory from './pages/OrderHistory';
import BookingHistory from './pages/BookingHistory';
import ClinicDetail from './pages/ClinicDetail';
import PetProfile from './pages/PetProfile';
import Messaging from './pages/Messaging';
import LiveTracking from './pages/LiveTracking';
import VetSearch from './pages/VetSearch';
import Payment from './pages/Payment';
import ProfilePets from './pages/ProfilePets';
import ProfileSecurity from './pages/ProfileSecurity';
import ProfileNotifications from './pages/ProfileNotifications';
import CameraView from './pages/CameraView';

// Routes where the global Navbar + Footer should be hidden
const SHOP_ROUTES_PREFIX = '/shop';
const NO_NAVBAR_ROUTES = ['/login', '/register'];

function AppLayout() {
  const location = useLocation();
  const { user } = useAuth();
  
  const isShopRoute = location.pathname.startsWith(SHOP_ROUTES_PREFIX);
  const isNoNavbarRoute = NO_NAVBAR_ROUTES.includes(location.pathname);
  const isHomePage = location.pathname === '/home';
  const isCameraPage = location.pathname === '/camera';
  
  // Show customer navbar for:
  // - Landing page (/) when not logged in
  // - Customer pages when logged in
  // Hide for: shop routes, login/register pages, home page (has its own header), camera page
  const shouldShowCustomerNav = !isShopRoute && !isNoNavbarRoute && !isHomePage && !isCameraPage;

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans">
      {shouldShowCustomerNav && <Navbar />}

      <main className={`flex-1 flex flex-col h-full grow relative ${shouldShowCustomerNav ? 'overflow-x-hidden' : ''}`}>
        {shouldShowCustomerNav && (
          <>
            <div className="decoration-blob w-96 h-96 bg-primary/20 top-0 left-0 rounded-full translate-x-[-30%] translate-y-[-30%]" />
            <div className="decoration-blob w-96 h-96 bg-secondary/10 top-1/2 right-0 rounded-full translate-x-[30%]" />
          </>
        )}

        <Routes>
          <Route path="/" element={user ? <Navigate to="/home" replace /> : <Home />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/shop/login" element={<ShopLogin />} />
          <Route path="/shop/register" element={<ShopRegister />} />
          <Route path="/shop/register/success" element={<ShopRegisterSuccess />} />
          
          {/* Shop Routes with Layout */}
          <Route path="/shop" element={<ShopLayout />}>
            <Route path="dashboard" element={<ShopDashboard />} />
            <Route path="bookings" element={<ShopBookings />} />
            <Route path="services" element={<ShopServices />} />
            <Route path="customers" element={<ShopCustomers />} />
            <Route path="camera" element={<ShopCamera />} />
            <Route path="messages" element={<ShopMessages />} />
            <Route path="profile" element={<ShopProfile />} />
          </Route>
          {/* profile area with persistent sidebar */}
          <Route path="/profile" element={<ProfileLayout />}>
            <Route index element={<Profile />} />
            <Route path="pets" element={<ProfilePets />} />
            <Route path="bookings" element={<BookingHistory />} />
            <Route path="orders" element={<OrderHistory />} />
            <Route path="security" element={<ProfileSecurity />} />
            <Route path="notifications" element={<ProfileNotifications />} />
          </Route>
          <Route path="/clinic/:id" element={<ClinicDetail />} />
          <Route path="/pet/:id" element={<PetProfile />} />
          <Route path="/messages" element={<Messaging />} />
          <Route path="/live" element={<LiveTracking />} />
          <Route path="/camera" element={<CameraView />} />
          <Route path="/search" element={<VetSearch />} />
          <Route path="/payment" element={<Payment />} />
        </Routes>
      </main>

      {shouldShowCustomerNav && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout />
      </Router>
    </AuthProvider>
  );
}
