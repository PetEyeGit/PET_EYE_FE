import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Calendar, 
  Package, 
  Video, 
  Users as UsersIcon, 
  Sparkles, 
  Star, 
  MessageCircle, 
  Store,
  ChevronRight,
  Wallet
} from 'lucide-react';
import { motion } from 'motion/react';

const navItems = [
  { label: 'Dashboard', path: '/shop/dashboard', icon: BarChart3 },
  { label: 'Lịch đặt hẹn', path: '/shop/bookings', icon: Calendar },
  { label: 'Dịch vụ', path: '/shop/services', icon: Package },
  { label: 'Ví của tôi', path: '/shop/wallet', icon: Wallet },
  { label: 'Camera', path: '/shop/camera', icon: Video },
  { label: 'Nhân viên', path: '/shop/staff', icon: UsersIcon },
  { label: 'Khách hàng', path: '/shop/customers', icon: UsersIcon },
  { label: 'Đánh giá', path: '/shop/reviews', icon: Star },
  { label: 'Tin nhắn', path: '/shop/messages', icon: MessageCircle },
  { label: 'AI Assistant', path: '/shop/ai-assistant', icon: Sparkles, highlight: true },
];

export default function ShopSidebar() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="w-72 h-screen sticky top-0 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 flex flex-col z-50">
      {/* Logo Section */}
      <div className="p-8">
        <Link to="/shop/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#1a2b4c] to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Store className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-base font-black text-slate-900 dark:text-white tracking-tight">Peteye</h1>
            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.2em]">Partner</p>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`group flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all relative ${
                active 
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl shadow-slate-900/10' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className={`transition-transform group-hover:scale-110 ${active ? 'text-white dark:text-slate-900' : 'text-slate-400'}`}>
                  <Icon size={20} />
                </div>
                <span className="text-[13.5px] font-bold tracking-tight">{item.label}</span>
              </div>
              
              {active && (
                <motion.div 
                  layoutId="active-indicator"
                  className="w-1.5 h-1.5 rounded-full bg-indigo-400" 
                />
              )}
              
              {!active && item.highlight && (
                <Sparkles size={12} className="text-indigo-500 animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Profile Preview / Settings Quick Link */}
      <div className="p-6 mt-auto border-t border-slate-50 dark:border-slate-800/50">
        <Link 
          to="/shop/profile"
          className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700">
               <UsersIcon className="text-slate-400" size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-bold text-slate-900 dark:text-white truncate">Cửa hàng của tôi</p>
              <p className="text-[10px] text-slate-400 font-medium">Xem hồ sơ công khai</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
        </Link>
      </div>
    </aside>
  );
}
