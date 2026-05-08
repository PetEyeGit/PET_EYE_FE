import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import ShopNavbar from '../../components/ShopNavbar';
import { MessageCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ChatWindow from '../../components/chat/ChatWindow';
import { shopService } from '../../services/shop.service';
import { useAuth } from '../../contexts/AuthContext';

export default function ShopLayout() {
  const location = useLocation();
  const { user } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [shopId, setShopId] = useState<number | null>(null);
  
  const isMessagePage = location.pathname === '/shop/messages';

  useEffect(() => {
    if (user && !shopId) {
      shopService.getMyShop()
        .then(shop => setShopId(shop.id))
        .catch(() => {});
    }
  }, [user, shopId]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <ShopNavbar />
      <div className="relative">
        <Outlet />
      </div>

      {/* Floating Chat Button */}
      {!isMessagePage && (
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
                Chat với Admin
              </span>
            )}

            {/* Notification Dot (Mock) */}
            {!isChatOpen && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-slate-950" />
            )}
          </motion.button>
        </div>
      )}

      {/* Chat Window */}
      {shopId && (
        <ChatWindow 
          shopId={shopId} 
          isOpen={isChatOpen} 
          onClose={() => setIsChatOpen(false)}
          title="Hỗ trợ Shop Owner"
        />
      )}
    </div>
  );
}
