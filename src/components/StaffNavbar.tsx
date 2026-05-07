import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Store, Bell, LogOut, Menu, X, ChevronDown, BarChart3, Calendar, MessageCircle, Award } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

function useOutsideClick(ref: React.RefObject<HTMLElement | null>, cb: () => void) {
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) cb();
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, [ref, cb]);
}

export default function StaffNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  const navItems = [
    { label: 'Workspace', path: '/staff/dashboard', icon: <BarChart3 className="w-4 h-4" /> },
    { label: 'Ca trực của tôi', path: '/staff/tasks', icon: <Calendar className="w-4 h-4" /> },
    { label: 'Hồ sơ & Bằng cấp', path: '/staff/profile', icon: <Award className="w-4 h-4" /> },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-[56px]">
          {/* Left: Logo */}
          <div className="flex items-center gap-4">
            <Link to="/staff/dashboard" className="flex items-center gap-2.5 shrink-0">
              <div className="w-9 h-9 bg-gradient-to-br from-[#1a2b4c] to-slate-700 rounded-xl flex items-center justify-center shadow-sm">
                <Store className="text-white" size={18} />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-bold text-slate-900 leading-none">Peteye Staff</p>
                <p className="text-[11px] text-slate-500">Khu vực làm việc</p>
              </div>
            </Link>
          </div>

          {/* Center: Nav */}
          <nav className="hidden lg:flex items-center gap-0.5 text-[13.5px]">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 h-8 px-3 rounded-lg font-medium transition-colors ${
                  isActive(item.path)
                    ? 'text-slate-900 bg-slate-100'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-1">
            <button 
                onClick={() => setNotifOpen(v => !v)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors relative"
            >
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full border-2 border-white" />
            </button>

            <div className="w-px h-5 bg-slate-200 mx-2 hidden md:block" />

            <div ref={userRef} className="relative">
              <button 
                onClick={() => setUserMenuOpen(v => !v)}
                className="flex items-center gap-2 h-8 pl-1 pr-2.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-[#1a2b4c] flex items-center justify-center text-white text-[11px] font-bold">
                  {user?.name?.charAt(0).toUpperCase() || 'S'}
                </div>
                <span className="hidden sm:block text-[13px] font-bold text-slate-700">
                  {user?.name || 'Nhân viên'}
                </span>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {userMenuOpen && (
                <div className="absolute top-[calc(100%+8px)] right-0 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50">
                  <div className="px-4 py-2 border-b border-slate-100 mb-1">
                    <p className="text-[13px] font-bold text-slate-900 truncate">{user?.name || 'Nhân viên'}</p>
                    <p className="text-[10px] text-slate-500">Mã NV: STAFF_01</p>
                  </div>

                  <button onClick={handleLogout} className="flex items-center gap-2.5 px-4 py-2 text-[13px] text-red-500 hover:bg-red-50 w-full text-left transition-colors font-medium">
                    <LogOut size={14} /> Đăng xuất
                  </button>
                </div>
              )}
            </div>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-100 bg-white pt-3 pb-5 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium ${
                  isActive(item.path) ? 'bg-slate-100 text-slate-900' : 'text-slate-700'
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
