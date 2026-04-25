import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, Store } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/user.service';

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [accountType, setAccountType] = React.useState<'customer' | 'shop'>('customer');
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (accountType === 'shop') {
        navigate('/shop/register');
        return;
      }
      
      await userService.register({
        email,
        password,
        fullName,
        phone,
        address
      });

      // Automatically login after successful registration
      await login(email, password);
      navigate('/home');
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoRegister = async () => {
    // In demo mode, we might just try a mock login or predefined account
    try {
      await login('admin@peteye.com', '12345678');
      navigate('/home');
    } catch (error) {
      navigate('/home');
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 md:p-8 bg-slate-50 dark:bg-slate-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl w-full bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
      >
        {/* Left: Branding */}
        <div className="hidden md:flex md:w-1/2 bg-primary items-center justify-center p-12 relative overflow-hidden">
          <div className="relative z-10 text-white">
            <h1 className="text-4xl font-black leading-tight mb-6">
              Chăm sóc thú cưng cùng Peteye
            </h1>
            <p className="text-slate-300 text-lg mb-10">
              Hệ thống quản lý sức khỏe thú cưng thông minh, giúp người bạn nhỏ luôn khỏe mạnh.
            </p>
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-primary bg-slate-400" />
                ))}
              </div>
              <p className="text-sm font-medium">+10,000 người đã đăng ký</p>
            </div>
          </div>
          <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=2071&auto=format&fit=crop')] bg-cover bg-center" />
        </div>

        {/* Right: Register Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Đăng ký thành viên
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              Yêu thương thú cưng bằng sự chăm sóc chuyên nghiệp nhất
            </p>
          </div>

          {/* Account Type Selection */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setAccountType('customer')}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                accountType === 'customer'
                  ? 'border-primary bg-primary/5'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <User size={24} className={accountType === 'customer' ? 'text-primary' : 'text-slate-400'} />
              <span className={`text-sm font-bold ${accountType === 'customer' ? 'text-primary' : 'text-slate-600'}`}>
                Khách hàng
              </span>
            </button>
            <button
              type="button"
              onClick={() => setAccountType('shop')}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                accountType === 'shop'
                  ? 'border-primary bg-primary/5'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <Store size={24} className={accountType === 'shop' ? 'text-primary' : 'text-slate-400'} />
              <span className={`text-sm font-bold ${accountType === 'shop' ? 'text-primary' : 'text-slate-600'}`}>
                Cửa hàng/Phòng khám
              </span>
            </button>
          </div>

          {accountType === 'shop' && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-sm text-blue-800">
                <strong>Lưu ý:</strong> Đăng ký tài khoản cửa hàng/phòng khám cần được admin phê duyệt trước khi sử dụng.
              </p>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Họ và tên</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  className="w-full pl-12 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  placeholder="Nguyễn Văn A"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  className="w-full pl-12 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  placeholder="example@gmail.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Số điện thoại</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  className="w-full pl-12 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  placeholder="0901 234 567"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Địa chỉ</label>
              <div className="relative">
                <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  className="w-full pl-12 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  placeholder="Số 1 Võ Văn Ngân, Thủ Đức"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Mật khẩu</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    className="w-full pl-12 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="••••••••"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Nhập lại</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    className="w-full pl-12 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="••••••••"
                    type="password"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 mt-2">
              <input
                type="checkbox"
                className="mt-1 rounded border-slate-300 text-primary focus:ring-primary"
                id="terms"
              />
              <label htmlFor="terms" className="text-xs text-slate-600 dark:text-slate-400">
                Tôi đồng ý với các{' '}
                <a href="#" className="font-bold text-primary hover:underline">
                  Điều khoản dịch vụ
                </a>{' '}
                và{' '}
                <a href="#" className="font-bold text-primary hover:underline">
                  Chính sách bảo mật
                </a>{' '}
                của Peteye.
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Đang thực hiện...' : (accountType === 'shop' ? 'Tiếp tục đăng ký' : 'Đăng ký ngay')}
            </button>

            <button
              type="button"
              onClick={handleDemoRegister}
              className="w-full py-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 font-semibold rounded-lg border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/40 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">play_circle</span>
              Demo — Vào HomePage ngay
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Bạn đã có tài khoản?{' '}
              <Link to="/login" className="text-primary font-bold hover:underline ml-1">
                Đăng nhập tại đây
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

