import React, { useState, useRef, useEffect } from 'react';
import { Bell, ChevronDown, LogOut, Search, Settings, User, Store, MessageCircle, BarChart3 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';

function useOutsideClick(ref: React.RefObject<HTMLElement | null>, cb: () => void) {
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) cb();
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, [ref, cb]);
}

export default function ShopHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  
  const userRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  useOutsideClick(userRef, () => setUserMenuOpen(false));
  useOutsideClick(notifRef, () => setNotifOpen(false));

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const { notifications, unreadCount, markRead } = useNotifications(!!user);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="h-20 sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 px-8 flex items-center justify-between">
      {/* Search Bar */}
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Tìm kiếm nhanh..." 
            className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl py-2.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
          />
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button 
            onClick={() => setNotifOpen(!notifOpen)}
            className={`w-11 h-11 flex items-center justify-center rounded-2xl transition-all relative ${
              notifOpen ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-50 dark:bg-slate-900 text-slate-500 hover:bg-slate-100'
            }`}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-slate-950" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute top-full right-0 mt-4 w-80 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
              <div className="p-5 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                <h3 className="font-bold text-sm">Thông báo</h3>
                <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full">{unreadCount} mới</span>
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs italic">Không có thông báo mới</div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer border-b border-slate-50 dark:border-slate-800 last:border-0 transition-colors">
                      <p className="text-[13px] font-bold text-slate-900 dark:text-white">{n.title}</p>
                      <p className="text-[12px] text-slate-500 mt-1 line-clamp-2">{n.content}</p>
                      <p className="text-[10px] text-slate-400 mt-2 font-medium">{new Date(n.createdAt).toLocaleDateString('vi-VN')}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div ref={userRef} className="relative">
          <button 
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-3 pl-1 pr-3 py-1 bg-slate-50 dark:bg-slate-900 rounded-2xl hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-primary/20">
              {user?.name?.charAt(0).toUpperCase() || 'S'}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-[12px] font-black text-slate-900 dark:text-white leading-tight">{user?.name || 'Shop Owner'}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Đối tác</p>
            </div>
            <ChevronDown size={14} className={`text-slate-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {userMenuOpen && (
            <div className="absolute top-full right-0 mt-4 w-60 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 py-3 overflow-hidden">
               {[
                { to: '/shop/profile', icon: Store, label: 'Thông tin cửa hàng' },
                { to: '/shop/messages', icon: MessageCircle, label: 'Tin nhắn' },
                { to: '/shop/dashboard', icon: BarChart3, label: 'Dashboard' },
                { to: '/shop/settings', icon: Settings, label: 'Cài đặt' },
              ].map(item => (
                <Link 
                  key={item.to} 
                  to={item.to}
                  onClick={() => setUserMenuOpen(false)}
                  className={`flex items-center gap-3 px-5 py-2.5 text-[13px] font-bold transition-colors ${
                    isActive(item.to) ? 'text-primary bg-primary/5' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <item.icon size={16} className={isActive(item.to) ? 'text-primary' : 'text-slate-400'} />
                  {item.label}
                </Link>
              ))}
              <div className="h-px bg-slate-50 dark:bg-slate-800 my-2" />
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-5 py-2.5 text-[13px] font-bold text-rose-500 hover:bg-rose-50 transition-colors"
              >
                <LogOut size={16} />
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
