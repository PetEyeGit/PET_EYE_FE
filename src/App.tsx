import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
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
import ShopStaff from './pages/shop/ShopStaff';
import ShopAIAssistant from './pages/shop/ShopAIAssistant';

import StaffLayout from './pages/staff/StaffLayout';
import StaffDashboard from './pages/staff/StaffDashboard';
import StaffTasks from './pages/staff/StaffTasks';
import StaffProfile from './pages/staff/StaffProfile';

import Profile, { ProfileLayout } from './pages/Profile';
import OrderHistory from './pages/OrderHistory';
import BookingHistory from './pages/BookingHistory';
import ClinicDetail from './pages/ClinicDetail';
import PetProfile from './pages/PetProfile';
import Messaging from './pages/Messaging';
import VetSearch from './pages/VetSearch';
import Payment from './pages/Payment';
import ProfilePets from './pages/ProfilePets';
import ProfileSecurity from './pages/ProfileSecurity';
import CameraView from './pages/CameraView';
import ZaloCallback from './pages/ZaloCallback';
import FacebookCallback from './pages/FacebookCallback';
import BookingSuccess from './pages/BookingSuccess';
import PaymentFailure from './pages/PaymentFailure';
import PaymentResult from './pages/PaymentResult';
import CompleteProfile from './pages/CompleteProfile';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminShops from './pages/admin/AdminShops';
import AdminMembers from './pages/admin/AdminMembers';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminMessages from './pages/admin/AdminMessages';
import Chatbot from './components/Chatbot';

// Routes where the global Navbar + Footer should be hidden
const SHOP_ROUTES_PREFIX = '/shop';
const STAFF_ROUTES_PREFIX = '/staff';
const ADMIN_ROUTES_PREFIX = '/admin';
const NO_NAVBAR_ROUTES = ['/login', '/register', '/login/zalo/callback', '/login/facebook/callback', '/complete-profile', '/verify-email', '/forgot-password'];

function AppLayout() {
  const location = useLocation();
  const { user } = useAuth();
  
  const isShopRoute = location.pathname.startsWith(SHOP_ROUTES_PREFIX);
  const isStaffRoute = location.pathname.startsWith(STAFF_ROUTES_PREFIX);
  const isAdminRoute = location.pathname.startsWith(ADMIN_ROUTES_PREFIX);
  const isNoNavbarRoute = NO_NAVBAR_ROUTES.includes(location.pathname);
  const isHomePage = location.pathname === '/home';
  const isCameraPage = location.pathname === '/camera';
  
  // Show customer navbar for:
  // - Landing page (/) when not logged in
  // - Customer pages when logged in
  // Hide for: shop routes, login/register pages, home page (has its own header), camera page
  const shouldShowCustomerNav = !isShopRoute && !isStaffRoute && !isAdminRoute && !isNoNavbarRoute && !isHomePage && !isCameraPage;

  const getRedirectPath = () => {
    if (!user) return "/";
    if (user.requiresEmailUpdate) return "/complete-profile";
    switch (user.role) {
      case 'SHOP_OWNER': return "/shop/dashboard";
      case 'STAFF': return "/staff/dashboard";
      case 'ADMIN': return "/admin/dashboard";
      default: return "/home";
    }
  };

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
          <Route path="/" element={user ? <Navigate to={getRedirectPath()} replace /> : <Home />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/login/zalo/callback" element={<ZaloCallback />} />
          <Route path="/login/facebook/callback" element={<FacebookCallback />} />
          <Route path="/register" element={<Register />} />
          <Route path="/complete-profile" element={<CompleteProfile />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/shop/login" element={<ShopLogin />} />
          <Route path="/shop/register" element={<ShopRegister />} />
          <Route path="/shop/register/success" element={<ShopRegisterSuccess />} />
          
          {/* Admin Routes with Layout */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="shops" element={<AdminShops />} />
            <Route path="members" element={<AdminMembers />} />
            <Route path="notifications" element={<AdminNotifications />} />
            <Route path="messages" element={<AdminMessages />} />
          </Route>

          {/* Shop Routes with Layout */}
          <Route path="/shop" element={<ShopLayout />}>
            <Route path="dashboard" element={<ShopDashboard />} />
            <Route path="bookings" element={<ShopBookings />} />
            <Route path="services" element={<ShopServices />} />
            <Route path="customers" element={<ShopCustomers />} />
            <Route path="camera" element={<ShopCamera />} />
            <Route path="messages" element={<ShopMessages />} />
            <Route path="staff" element={<ShopStaff />} />
            <Route path="profile" element={<ShopProfile />} />
            <Route path="ai-assistant" element={<ShopAIAssistant />} />
          </Route>

          {/* Staff Routes with Layout */}
          <Route path="/staff" element={<StaffLayout />}>
            <Route index element={<Navigate to="/staff/dashboard" replace />} />
            <Route path="dashboard" element={<StaffDashboard />} />
            <Route path="tasks" element={<StaffTasks />} />
            <Route path="profile" element={<StaffProfile />} />
          </Route>

          {/* profile area with persistent sidebar */}
          <Route path="/profile" element={<ProfileLayout />}>
            <Route index element={<Profile />} />
            <Route path="pets" element={<ProfilePets />} />
            <Route path="bookings" element={<BookingHistory />} />
            <Route path="orders" element={<OrderHistory />} />
            <Route path="security" element={<ProfileSecurity />} />
          </Route>
          <Route path="/clinic/:id" element={<ClinicDetail />} />
          <Route path="/pet/:id" element={<PetProfile />} />
          <Route path="/messages" element={<Messaging />} />
          <Route path="/camera" element={<CameraView />} />
          <Route path="/search" element={<VetSearch />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/payment/result" element={<PaymentResult />} />
          <Route path="/booking/success" element={<BookingSuccess />} />
          <Route path="/payment/failure" element={<PaymentFailure />} />
        </Routes>
      </main>

      {shouldShowCustomerNav && <Footer />}

      {/* Chatbot — hiển thị cho tất cả customer pages (kể cả /home) */}
      {!isShopRoute && !isStaffRoute && !isAdminRoute && !isNoNavbarRoute && !isCameraPage && <Chatbot />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" reverseOrder={false} />
      <Router>
        <AppLayout />
      </Router>
    </AuthProvider>
  );
}
