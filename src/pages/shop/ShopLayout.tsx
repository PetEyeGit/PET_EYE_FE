import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import ShopNavbar from '../../components/ShopNavbar';
import { MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function ShopLayout() {
  const location = useLocation();
  const isMessagePage = location.pathname === '/shop/messages';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <ShopNavbar />
      <Outlet />

      {/* Floating Chat Button */}
      {!isMessagePage && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="fixed bottom-8 right-8 z-[999]"
        >
          <Link
            to="/shop/messages"
            className="flex items-center justify-center w-14 h-14 bg-[#1a2b4c] text-white rounded-2xl shadow-2xl shadow-indigo-900/30 hover:bg-slate-800 transition-colors relative group"
          >
            <MessageCircle size={24} />
            
            {/* Tooltip */}
            <span className="absolute right-full mr-4 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              Tin nhắn hỗ trợ
            </span>

            {/* Notification Dot (Mock) */}
            <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-slate-950" />
          </Link>
        </motion.div>
      )}
    </div>
  );
}
