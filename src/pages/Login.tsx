import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Store, User } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { useGoogleLogin } from '@react-oauth/google';
import { authService } from '../services/auth.service';

export default function Login() {
  const [showPassword, setShowPassword] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');
  const { login, setUserSession } = useAuth();
  const navigate = useNavigate();

  const handleSocialSuccess = (userData: any) => {
    setUserSession(userData);
    if (userData.role === 'ADMIN') {
      navigate('/admin/dashboard');
    } else if (userData.role === 'SHOP_OWNER') {
      navigate('/shop/dashboard');
    } else if (userData.role === 'STAFF') {
      navigate('/staff/dashboard');
    } else {
      navigate('/home');
    }
  };

  const loginGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        const userData = await authService.loginWithGoogle(tokenResponse.access_token);
        handleSocialSuccess(userData);
      } catch (err) {
        setErrorMessage('Đăng nhập Google thất bại');
        setLoading(false);
      }
    },
    onError: () => setErrorMessage('Lỗi xác thực Google')
  });

  const handleFacebookLogin = () => {
    const appId = import.meta.env.VITE_FACEBOOK_APP_ID;
    const redirectUri = import.meta.env.VITE_FACEBOOK_REDIRECT_URI || `${window.location.origin}/login/facebook/callback`;
    if (!appId) {
      setErrorMessage('Chưa cấu hình Facebook Login');
      return;
    }
    window.location.href = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=public_profile%20email`;
  };

  const handleZaloLogin = () => {
    const appId = import.meta.env.VITE_ZALO_APP_ID;
    const redirectUri = import.meta.env.VITE_ZALO_REDIRECT_URI;
    if (!appId || !redirectUri) {
      setErrorMessage('Chưa cấu hình Zalo Login');
      return;
    }
    const state = Math.random().toString(36).substring(7);
    const params = new URLSearchParams({
      app_id: appId,
      redirect_uri: redirectUri,
      state: state
    });
    const finalUrl = `https://oauth.zaloapp.com/v4/permission?${params.toString()}`;
    console.log('Zalo Login URL:', finalUrl);
    window.location.href = finalUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    try {
      const userData = await login(email, password);
      // Redirect based on role after successful login
      if (userData.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (userData.role === 'SHOP_OWNER') {
        navigate('/shop/dashboard');
      } else if (userData.role === 'STAFF') {
        navigate('/staff/dashboard');
      } else {
        navigate('/home');
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      const apiError = error.response?.data;
      if (apiError && apiError.message) {
        // Map backend error messages to user-friendly Vietnamese messages
        const errorCode = Number(apiError.code);
        switch (errorCode) {
          case 10010:
            setErrorMessage('Email không tồn tại trong hệ thống.');
            break;
          case 1012:
            setErrorMessage('Mật khẩu không chính xác. Vui lòng thử lại.');
            break;
          case 1013:
            setErrorMessage('Tài khoản đang chờ phê duyệt. Vui lòng đợi quản trị viên xác nhận.');
            break;
          case 1003:
            setErrorMessage('Phiên đăng nhập hết hạn hoặc không hợp lệ.');
            break;
          default:
            setErrorMessage(apiError.message || 'Đăng nhập thất bại. Vui lòng thử lại sau.');
        }
      } else {
        setErrorMessage('Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 md:p-8 bg-slate-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
      >
        {/* Left: Illustration */}
        <div className="hidden md:flex md:w-1/2 bg-slate-100 items-center justify-center p-12 relative overflow-hidden">
          <div className="relative z-10 text-center">
            <div className="w-full aspect-square max-w-[400px] mx-auto mb-8 rounded-2xl shadow-lg overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=2069&auto=format&fit=crop"
                alt="Happy Dog"
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-3xl font-bold text-[#1a2b4c] mb-4">Chào mừng bạn tới Peteye</h1>
            <p className="text-slate-500 text-lg font-medium">Nơi thú cưng của bạn được chăm sóc như gia đình.</p>
          </div>
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-[#1a2b4c]/5 rounded-full blur-3xl"></div>
        </div>

        {/* Right: Login Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Đăng nhập tài khoản</h2>
            <p className="text-slate-500">Vui lòng nhập thông tin để truy cập hệ thống</p>
          </div>

          {/* Login Type Selection */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-[#1a2b4c] bg-[#1a2b4c]/5 transition-all"
            >
              <User size={24} className="text-[#1a2b4c]" />
              <span className="text-sm font-bold text-[#1a2b4c]">
                Khách hàng
              </span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/shop/login')}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-slate-200 hover:border-[#1a2b4c] transition-all"
            >
              <Store size={24} className="text-slate-400" />
              <span className="text-sm font-bold text-slate-600">
                Cửa hàng
              </span>
            </button>
          </div>

          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium flex items-center gap-3"
            >
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              {errorMessage}
            </motion.div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">Địa chỉ Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  className="w-full pl-12 pr-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-[#1a2b4c]/20 focus:border-[#1a2b4c] outline-none transition-all"
                  placeholder="example@Peteye.vn"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between">
                <label className="text-sm font-semibold text-slate-700">Mật khẩu</label>
                <a className="text-xs font-semibold text-[#1a2b4c] hover:underline" href="#">Quên mật khẩu?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  className="w-full pl-12 pr-12 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-[#1a2b4c]/20 focus:border-[#1a2b4c] outline-none transition-all"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#1a2b4c] text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập ngay'}
            </button>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-4 text-slate-400 text-xs uppercase tracking-wider font-semibold">Hoặc đăng nhập bằng</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <button onClick={() => loginGoogle()} type="button" className="flex items-center justify-center gap-2 py-3 px-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                </svg>
                <span className="text-sm font-semibold hidden lg:inline">Google</span>
              </button>

              <button onClick={handleFacebookLogin} type="button" className="flex items-center justify-center gap-2 py-3 px-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                <svg className="w-5 h-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span className="text-sm font-semibold hidden lg:inline">Facebook</span>
              </button>

              <button onClick={handleZaloLogin} type="button" className="flex items-center justify-center gap-2 py-3 px-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                <span className="font-bold text-[#0068FF] text-xl leading-none">Zalo</span>
                <span className="text-sm font-semibold hidden lg:inline">Zalo</span>
              </button>
            </div>
          </form>

          <div className="mt-10 text-center">
            <p className="text-slate-500 text-sm">
              Chưa có tài khoản? <Link to="/register" className="text-[#1a2b4c] font-bold hover:underline ml-1">Đăng ký miễn phí</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

