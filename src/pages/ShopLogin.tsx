import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Store, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';

export default function ShopLogin() {
  const [showPassword, setShowPassword] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // FAKE DATA - Skip approval check for testing
      await login(email, password, 'shop');
      // Redirect to shop dashboard after successful login
      navigate('/shop/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      setError('Email hoặc mật khẩu không đúng');
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
        {/* Left: Branding */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#1a2b4c] to-slate-900 items-center justify-center p-12 relative overflow-hidden">
          <div className="relative z-10 text-white text-center">
            <div className="size-24 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Store size={48} className="text-white" />
            </div>
            <h1 className="text-4xl font-black leading-tight mb-6">Đối tác Peteye</h1>
            <p className="text-slate-300 text-lg mb-10">
              Quản lý cửa hàng, dịch vụ và khách hàng của bạn một cách chuyên nghiệp
            </p>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h3 className="font-bold mb-4">Lợi ích khi tham gia</h3>
              <ul className="text-left space-y-2 text-sm text-slate-200">
                <li className="flex items-start gap-2">
                  <span className="text-[#2dd4bf]">✓</span>
                  <span>Tiếp cận hàng ngàn khách hàng tiềm năng</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#2dd4bf]">✓</span>
                  <span>Quản lý lịch hẹn và đơn hàng dễ dàng</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#2dd4bf]">✓</span>
                  <span>Hệ thống thanh toán an toàn</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#2dd4bf]">✓</span>
                  <span>Hỗ trợ marketing và quảng bá</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=2071&auto=format&fit=crop')] bg-cover bg-center"></div>
        </div>

        {/* Right: Login Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="size-12 bg-[#1a2b4c] rounded-xl flex items-center justify-center">
                <Store size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Đăng nhập</h2>
                <p className="text-sm text-slate-500">Dành cho Cửa hàng/Phòng khám</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
              <div className="flex-1">
                <p className="text-sm text-red-800 font-medium">{error}</p>
                {error.includes('chờ phê duyệt') && (
                  <p className="text-xs text-red-600 mt-1">
                    Liên hệ: support@Peteye.vn hoặc 1900-xxxx
                  </p>
                )}
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">Email đăng ký</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  className="w-full pl-12 pr-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-[#1a2b4c]/20 focus:border-[#1a2b4c] outline-none transition-all" 
                  placeholder="shop@example.com" 
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
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          <div className="mt-8 space-y-4">
            <div className="text-center">
              <p className="text-slate-500 text-sm">
                Chưa có tài khoản? <Link to="/shop/register" className="text-[#1a2b4c] font-bold hover:underline ml-1">Đăng ký làm đối tác</Link>
              </p>
            </div>
            
            <div className="text-center">
              <Link to="/login" className="text-sm text-slate-500 hover:text-slate-700 flex items-center justify-center gap-2 font-bold">
                ← Đăng nhập với tư cách khách hàng
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

