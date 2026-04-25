import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo';
import {
  Bell, ChevronDown, LogOut, User, Settings,
  PawPrint, Menu, X, Video, Calendar, MessageCircle
} from 'lucide-react';

/* ─── helpers ─────────────────────────────────────────────── */
function useOutsideClick(ref: React.RefObject<HTMLElement | null>, cb: () => void) {
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) cb();
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, [ref, cb]);
}

function scrollTo(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ─── mock data ───────────────────────────────────────────── */
const NOTIFICATIONS = [
  { id: 1, icon: '💉', text: 'Miu Miu cần tiêm phòng trong 5 ngày nữa', time: '1 giờ trước', unread: true },
  { id: 2, icon: '📅', text: 'Lịch hẹn khám ngày 05/03/2026 lúc 09:30', time: '3 giờ trước', unread: true },
  { id: 3, icon: '📦', text: 'Đơn hàng thức ăn đã giao thành công', time: 'Hôm qua', unread: false },
];

/* ─────────────────────────────────────────────────────────────
   GUEST NAVBAR
   Design ref: Airbnb / Linear — logo · search bar · nav · CTA
──────────────────────────────────────────────────────────────*/
function GuestNavbar() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const goto = (id: string) => {
    setMobileOpen(false);
    if (window.location.pathname === '/') scrollTo(id);
    else { navigate('/'); setTimeout(() => scrollTo(id), 350); }
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300
        ${scrolled
          ? 'bg-white/96 backdrop-blur-xl shadow-[0_1px_0_0_#e2e8f0] dark:bg-slate-900/96 dark:shadow-[0_1px_0_0_#1e293b]'
          : 'bg-white/80 backdrop-blur-sm dark:bg-slate-900/80'}`}
    >
      <div className="max-w-screen-xl mx-auto px-5 md:px-10 h-[60px] flex items-center gap-5">

        {/* ── Logo ──────────────────────────────── */}
        <Link to="/" className="shrink-0 mr-2">
          <Logo />
        </Link>

        {/* ── Nav links (desktop) ───────────────── */}
        <nav className="hidden lg:flex items-center gap-0.5 text-[13.5px] font-medium">
          <button onClick={() => goto('co-so')}
            className="h-9 px-3.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/70 transition-colors">
            Cơ sở thú y
          </button>
          <button onClick={() => goto('camera')}
            className="h-9 px-3.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/70 transition-colors">
            Camera 24/7
          </button>
        </nav>

        {/* ── Spacer ────────────────────────────── */}
        <div className="flex-1" />

        {/* ── Right actions ─────────────────────── */}
        <div className="hidden sm:flex items-center gap-2">
          <Link to="/login"
            className="h-9 px-4 rounded-lg text-[13.5px] font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/70 transition-colors flex items-center">
            Đăng nhập
          </Link>
          <Link to="/register"
            className="h-9 px-5 bg-primary hover:bg-primary-dark text-white rounded-full text-[13.5px] font-semibold transition-all shadow-md shadow-primary/20 hover:-translate-y-px hover:shadow-primary/30 flex items-center">
            Đăng ký
          </Link>
        </div>

        {/* ── Mobile hamburger ──────────────────── */}
        <button onClick={() => setMobileOpen(v => !v)}
          className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* ── Mobile menu ───────────────────────────── */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 pt-3 pb-5 space-y-1">
          {[
            { label: 'Cơ sở thú y', id: 'co-so' },
            { label: 'Camera 24/7', id: 'camera' },
          ].map(item => (
            <button key={item.label} onClick={() => goto(item.id)}
              className="w-full text-left px-3 py-2.5 rounded-lg text-[14px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              {item.label}
            </button>
          ))}
          <div className="flex gap-2 pt-3">
            <Link to="/login" onClick={() => setMobileOpen(false)}
              className="flex-1 text-center py-2.5 rounded-full border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300">
              Đăng nhập
            </Link>
            <Link to="/register" onClick={() => setMobileOpen(false)}
              className="flex-1 text-center py-2.5 bg-primary text-white rounded-full text-sm font-semibold">
              Đăng ký
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

/* ─────────────────────────────────────────────────────────────
   AUTH NAVBAR
   Design ref: Linear / Vercel / Figma — minimal, purposeful
──────────────────────────────────────────────────────────────*/
function AuthNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [userOpen, setUserOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const userRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  useOutsideClick(userRef, () => setUserOpen(false));
  useOutsideClick(notifRef, () => setNotifOpen(false));

  const unread = NOTIFICATIONS.filter(n => n.unread).length;
  const active = (p: string) => location.pathname === p;

  const NAV = [
    { to: '/home', label: 'Trang chủ' },
    { to: '/search', label: 'Tìm cơ sở' },
    { to: '/profile/bookings', label: 'Lịch hẹn' },
  ];

  const QUICK = [
    { to: '/camera', icon: <Video className="w-4 h-4" />, label: 'Camera', pulse: true },
    { to: '/messages', icon: <MessageCircle className="w-4 h-4" />, label: 'Tin nhắn' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800">
      <div className="max-w-screen-xl mx-auto px-5 md:px-10 h-[56px] flex items-center gap-4">

        {/* ── Logo ──────────────────────────────── */}
        <Link to="/home" className="shrink-0 mr-1">
          <Logo />
        </Link>

        {/* ── Primary nav ───────────────────────── */}
        <nav className="hidden md:flex items-center gap-0.5 text-[13.5px]">
          {NAV.map(item => (
            <Link key={item.to} to={item.to}
              className={`h-8 px-3 rounded-lg font-medium transition-colors flex items-center
                ${active(item.to)
                  ? 'text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/70'}`}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex-1" />

        {/* ── Right cluster ─────────────────────── */}
        <div className="flex items-center gap-1">

          {/* Quick icon links */}
          {QUICK.map(q => (
            <Link key={q.to} to={q.to}
              className={`relative flex items-center gap-1.5 h-8 px-3 rounded-lg text-[13px] font-medium transition-colors
                ${active(q.to)
                  ? 'text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/70'}`}>
              {q.icon}
              <span className="hidden lg:inline">{q.label}</span>
              {q.pulse && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              )}
            </Link>
          ))}

          {/* Divider */}
          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />

          {/* Notifications */}
          <div ref={notifRef} className="relative">
            <button onClick={() => { setNotifOpen(v => !v); setUserOpen(false); }}
              className={`relative w-8 h-8 flex items-center justify-center rounded-lg transition-colors
                ${notifOpen ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/70'}`}>
              <Bell className="w-[17px] h-[17px]" />
              {unread > 0 && (
                <span className="absolute top-1 right-1 w-[7px] h-[7px] bg-red-500 rounded-full border-[1.5px] border-white dark:border-slate-900" />
              )}
            </button>

            {notifOpen && (
              <div className="absolute top-[calc(100%+8px)] right-0 w-[340px] bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-200/60 dark:shadow-slate-900/80 border border-slate-100 dark:border-slate-700 z-50 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 dark:border-slate-700">
                  <p className="text-[13px] font-semibold text-slate-900 dark:text-white">Thông báo</p>
                  <button className="text-[11px] font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                    Đọc tất cả
                  </button>
                </div>
                <div className="py-1">
                  {NOTIFICATIONS.map(n => (
                    <div key={n.id}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors group">
                      <span className="text-[18px] mt-0.5 shrink-0">{n.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12.5px] text-slate-700 dark:text-slate-200 leading-snug">{n.text}</p>
                        <p className="text-[11px] text-slate-400 mt-1">{n.time}</p>
                      </div>
                      {n.unread && <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User avatar / menu */}
          <div ref={userRef} className="relative">
            <button onClick={() => { setUserOpen(v => !v); setNotifOpen(false); }}
              className={`flex items-center gap-2 h-8 pl-1 pr-2.5 rounded-lg transition-colors
                ${userOpen ? 'bg-slate-100 dark:bg-slate-800' : 'hover:bg-slate-100/70 dark:hover:bg-slate-800/70'}`}>
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                {user!.name.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:block text-[13px] font-medium text-slate-700 dark:text-slate-200 max-w-[80px] truncate">
                {user!.name}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 hidden sm:block ${userOpen ? 'rotate-180' : ''}`} />
            </button>

            {userOpen && (
              <div className="absolute top-[calc(100%+8px)] right-0 w-52 bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-200/60 dark:shadow-slate-900/80 border border-slate-100 dark:border-slate-700 py-1.5 z-50">
                <div className="px-3.5 py-2.5 border-b border-slate-100 dark:border-slate-700 mb-1">
                  <p className="text-[13px] font-semibold text-slate-900 dark:text-white truncate">{user!.name}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Khách hàng Peteye</p>
                </div>

                {[
                  { to: '/profile', icon: <User className="w-3.5 h-3.5" />, label: 'Tài khoản của tôi' },
                  { to: '/profile/pets', icon: <PawPrint className="w-3.5 h-3.5" />, label: 'Hồ sơ thú cưng' },
                  { to: '/profile/bookings', icon: <Calendar className="w-3.5 h-3.5" />, label: 'Lịch đặt dịch vụ' },
                  { to: '/camera', icon: <Video className="w-3.5 h-3.5" />, label: 'Camera lưu trú', badge: 'LIVE' },
                  { to: '/profile/security', icon: <Settings className="w-3.5 h-3.5" />, label: 'Cài đặt' },
                ].map(item => (
                  <Link key={item.to} to={item.to}
                    onClick={() => setUserOpen(false)}
                    className={`flex items-center gap-2.5 px-3.5 py-2 text-[13px] transition-colors
                      ${active(item.to) ? 'text-primary bg-primary/5' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 hover:text-slate-900 dark:hover:text-white'}`}>
                    <span className="text-slate-400 dark:text-slate-500">{item.icon}</span>
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="text-[9px] font-bold text-white bg-red-500 px-1.5 py-0.5 rounded-full">{item.badge}</span>
                    )}
                  </Link>
                ))}

                <div className="border-t border-slate-100 dark:border-slate-700 mt-1 pt-1">
                  <button onClick={() => { logout(); navigate('/'); }}
                    className="flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 w-full transition-colors">
                    <LogOut className="w-3.5 h-3.5" /> Đăng xuất
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setMobileOpen(v => !v)}
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu (auth) */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 pt-3 pb-5 space-y-1">
          {[...NAV, { to: '/camera', label: 'Camera lưu trú' }, { to: '/messages', label: 'Tin nhắn' }].map(item => (
            <Link key={item.to} to={item.to} onClick={() => setMobileOpen(false)}
              className={`flex items-center px-3 py-2.5 rounded-lg text-[14px] font-medium transition-colors
                ${active(item.to) ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}

/* ─── Export ──────────────────────────────────────────────── */
export default function Navbar() {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? <AuthNavbar /> : <GuestNavbar />;
}
