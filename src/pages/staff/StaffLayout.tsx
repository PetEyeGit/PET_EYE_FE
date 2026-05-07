import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import StaffNavbar from '../../components/StaffNavbar';
import { MessageCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ChatWindow from '../../components/chat/ChatWindow';
import { staffService } from '../../services/staff.service';
import { useAuth } from '../../contexts/AuthContext';

export default function StaffLayout() {
  const { user } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [shopId, setShopId] = useState<number | null>(null);

  useEffect(() => {
    if (user && !shopId) {
      staffService.getMyProfile()
        .then(profile => setShopId(profile.shopId))
        .catch(() => {});
    }

    const handleToggleChat = () => setIsChatOpen(prev => !prev);
    window.addEventListener('toggle-chat', handleToggleChat);
    return () => window.removeEventListener('toggle-chat', handleToggleChat);
  }, [user, shopId]);

  return (
    <div className="min-h-screen bg-slate-50">
      <StaffNavbar />
      <div className="pt-4 relative z-0">
        <Outlet />
      </div>

      {/* Floating Chat Button */}
      <div className="fixed bottom-8 right-8 z-[100]">
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={`flex items-center justify-center w-16 h-16 rounded-[2rem] shadow-2xl transition-all relative group ${
            isChatOpen ? 'bg-rose-500 text-white shadow-rose-500/20' : 'bg-primary text-white shadow-primary/30'
          }`}
        >
          {isChatOpen ? <X size={28} /> : <MessageCircle size={28} />}
          
          {/* Tooltip */}
          {!isChatOpen && (
            <span className="absolute right-full mr-4 px-4 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              Hỗ trợ nhân viên
            </span>
          )}

          {/* Notification Dot (Mock) */}
          {!isChatOpen && (
            <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-white" />
          )}
        </motion.button>
      </div>

      {/* Chat Window */}
      {shopId && (
        <ChatWindow 
          shopId={shopId} 
          isOpen={isChatOpen} 
          onClose={() => setIsChatOpen(false)}
          title="Hỗ trợ Nhân viên"
        />
      )}
    </div>
  );
}
