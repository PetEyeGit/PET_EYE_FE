import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useClinics } from '../hooks/useClinics';
import { ShopPublicResponse } from '../services/shop.service';
import { 
  Search, MapPin, Star, Filter, ArrowRight, Grid, List as ListIcon, 
  Map as MapIcon, ChevronRight, SlidersHorizontal, CheckCircle2, 
  X, Phone, Navigation, Info, Sparkles, Stethoscope, Scissors, Home, ShoppingBag
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const SHOP_TYPE_TABS = [
  { value: 'Tất cả', label: 'Tất cả', icon: <Grid size={16} /> },
  { value: 'CLINIC', label: 'Khám thú y', icon: <Stethoscope size={16} /> },
  { value: 'SPA', label: 'Spa & Grooming', icon: <Scissors size={16} /> },
  { value: 'BOARDING', label: 'Lưu trú', icon: <Home size={16} /> },
  { value: 'PET_SHOP', label: 'Pet Shop', icon: <ShoppingBag size={16} /> },
];

const SORT_OPTIONS = ['Đánh giá cao nhất', 'Mới nhất'];

const RATING_OPTIONS = [
  { value: 0,   label: 'Tất cả' },
  { value: 3,   label: '3★ trở lên' },
  { value: 4,   label: '4★ trở lên' },
  { value: 4.5, label: '4.5★ trở lên' },
];

function StarRow({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={12}
          className={`${s <= Math.floor(rating) ? 'text-amber-400 fill-amber-400' : s - rating <= 0.5 ? 'text-amber-300 fill-amber-300' : 'text-slate-300'}`}
        />
      ))}
    </span>
  );
}

export default function VetSearch() {
  const {
    clinics,
    isLoading,
    searchQuery,
    setSearchQuery,
    cityQuery,
    setCityQuery,
    activeService,
    setActiveService,
    minRating,
    setMinRating,
  } = useClinics();

  const [sortBy, setSortBy] = useState('Đánh giá cao nhất');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [distanceKm, setDistanceKm] = useState(10);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const sortedClinics = [...clinics].sort((a: ShopPublicResponse, b: ShopPublicResponse) => {
    if (sortBy === 'Đánh giá cao nhất') return b.ratingAvg - a.ratingAvg;
    return b.id - a.id;
  });
  const springTransition = {
    type: "spring",
    stiffness: 100,
    damping: 15
  };

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { ...springTransition }
  };

  const staggerContainer = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { ...springTransition } },
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-display">
      {/* ── Hero Banner ── */}
      <div className="relative bg-slate-900 text-white pt-24 pb-32 px-6 overflow-hidden">
        {/* Dynamic Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-full bg-mesh opacity-30" />
          <div className="pattern-dots absolute inset-0 opacity-10 pointer-events-none" />
        </div>

        <div className="max-w-5xl mx-auto relative z-10 text-center space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 backdrop-blur-md shadow-lg shadow-emerald-500/10">
              <CheckCircle2 size={12} />
              Dịch vụ đã được xác thực
            </span>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight drop-shadow-sm">
              Tìm cơ sở <span className="text-gradient">Thú y</span> <br />
              &amp; Dịch vụ quanh bạn
            </h1>
          </motion.div>

          {/* Premium Search Bar */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass dark:glass-dark p-2 rounded-[32px] shadow-3xl max-w-4xl mx-auto group focus-within:ring-8 ring-primary/10 transition-all"
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
              <div className="md:col-span-5 relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-primary w-5 h-5" />
                <input
                  type="text"
                  placeholder="Tên cơ sở, dịch vụ..."
                  className="w-full pl-14 pr-4 py-5 bg-white/50 dark:bg-slate-900/50 rounded-2xl border-none focus:ring-0 text-slate-900 dark:text-white font-bold placeholder:text-slate-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="md:col-span-4 relative border-l border-slate-100 dark:border-slate-800 hidden md:block">
                <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-secondary w-5 h-5" />
                <input
                  type="text"
                  placeholder="Khu vực..."
                  className="w-full pl-14 pr-4 py-5 bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white font-bold placeholder:text-slate-400"
                  value={cityQuery}
                  onChange={(e) => setCityQuery(e.target.value)}
                />
              </div>
              <div className="md:col-span-3">
                <button className="w-full h-full bg-primary hover:bg-primary-dark text-white rounded-2xl font-black transition-all flex items-center justify-center gap-2 py-5 shadow-xl shadow-primary/20">
                  <Search size={18} />
                  TÌM KIẾM
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-12 relative z-20 pb-24">
        {/* ── Category Tabs ── */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative inline-flex bg-slate-200/50 dark:bg-slate-800/50 p-1.5 rounded-[24px] mb-10 overflow-hidden"
        >
          {SHOP_TYPE_TABS.map((tab) => {
            const isActive = activeService === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveService(tab.value)}
                className={`relative flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-black whitespace-nowrap transition-all z-10 ${
                  isActive
                    ? 'text-white'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute inset-0 bg-primary rounded-2xl shadow-lg shadow-primary/25"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  {tab.icon}
                  {tab.label}
                </span>
              </button>
            );
          })}
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* ── Sidebar ── */}
          <aside className="hidden lg:block w-72 shrink-0 space-y-6">
            <div className="glass p-6 rounded-[32px] space-y-8 sticky top-28">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <SlidersHorizontal size={18} className="text-primary" />
                  Bộ lọc
                </h3>
                {(minRating > 0 || distanceKm !== 10) && (
                  <button 
                    onClick={() => { setMinRating(0); setDistanceKm(10); }}
                    className="text-[10px] font-black text-primary uppercase tracking-wider hover:underline"
                  >
                    Đặt lại
                  </button>
                )}
              </div>

              {/* Rating filter */}
              <div className="space-y-4">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Đánh giá sao</p>
                <div className="space-y-2">
                  {RATING_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setMinRating(opt.value)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl transition-all border-2 ${
                        minRating === opt.value
                          ? 'bg-primary/5 border-primary text-primary'
                          : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <span className="text-sm font-bold">{opt.label}</span>
                      {opt.value > 0 && <StarRow rating={opt.value} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Distance slider */}
              <div className="space-y-6">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Khoảng cách</p>
                <div className="px-2">
                  <div className="flex justify-between items-end mb-4">
                    <span className="text-2xl font-black text-primary">{distanceKm}</span>
                    <span className="text-xs font-bold text-slate-400 pb-1">km</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={50}
                    value={distanceKm}
                    onChange={(e) => setDistanceKm(Number(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer accent-primary bg-slate-100 dark:bg-slate-800"
                  />
                  <div className="flex justify-between text-[10px] font-black text-slate-300 mt-2">
                    <span>1 KM</span>
                    <span>50 KM</span>
                  </div>
                </div>
              </div>

              <button className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl bg-slate-900 text-white font-black text-xs hover:bg-primary transition-all shadow-xl hover:shadow-primary/20 uppercase tracking-widest">
                <MapIcon size={16} />
                Xem trên bản đồ
              </button>
            </div>
          </aside>

          {/* ── Results ── */}
          <div className="flex-1 min-w-0">
            {/* Results header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                  {isLoading ? 'Đang tìm kiếm...' : `${sortedClinics.length} kết quả phù hợp`}
                </h2>
                <p className="text-sm font-medium text-slate-500">Dựa trên tiêu chí lựa chọn của bạn</p>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="relative glass rounded-2xl p-1 flex">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <ListIcon size={18} />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <Grid size={18} />
                  </button>
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="glass border-none rounded-2xl text-xs font-black px-4 py-3 text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
                >
                  {SORT_OPTIONS.map((opt) => <option key={opt}>{opt}</option>)}
                </select>
              </div>
            </div>

            {/* Cards Grid/List */}
            <motion.div 
              key={`${isLoading}-${activeService}-${minRating}`}
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className={viewMode === 'grid' ? 'grid sm:grid-cols-2 gap-6' : 'flex flex-col gap-6'}
            >
              {isLoading ? (
                <>
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`glass rounded-[32px] overflow-hidden ${viewMode === 'list' ? 'flex h-56' : 'h-[400px]'}`}>
                      <div className="bg-slate-100 dark:bg-slate-800 animate-pulse shrink-0 w-full h-full" />
                    </div>
                  ))}
                </>
              ) : (
                sortedClinics.map((shop: ShopPublicResponse) => (
                  <motion.div key={shop.id} variants={itemVariants}>
                    <Link
                      to={`/clinic/${shop.id}`}
                      className={`group glass dark:glass-dark rounded-[32px] overflow-hidden hover:shadow-3xl hover:translate-y-[-4px] transition-all duration-500 border-2 border-transparent hover:border-primary/10 h-full ${viewMode === 'list' ? 'flex flex-col sm:flex-row sm:h-64' : 'flex flex-col'}`}
                    >
                      {/* Image */}
                      <div className={`relative overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800 ${viewMode === 'list' ? 'sm:w-72 w-full h-48 sm:h-auto' : 'h-52'}`}>
                        <img
                          src={shop.licenseImageUrl || 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=800&auto=format&fit=crop'}
                          alt={shop.shopName}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                        
                        {/* Badges */}
                        <div className="absolute top-4 left-4 flex flex-col gap-2">
                          <span className="bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-1.5 rounded-xl text-[9px] font-black text-white uppercase tracking-widest flex items-center gap-1.5 shadow-lg shadow-emerald-500/20">
                            <CheckCircle2 size={10} className="text-white" />
                            ĐỐI TÁC
                          </span>
                        </div>
                        
                        {shop.shopType && (
                          <span className="absolute bottom-4 left-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-primary text-[9px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest">
                            {SHOP_TYPE_TABS.find(t => t.value === shop.shopType)?.label ?? shop.shopType}
                          </span>
                        )}
                      </div>

                      {/* Info Content */}
                      <div className="flex-1 p-6 flex flex-col justify-between">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-4">
                            <h3 className="font-black text-slate-900 dark:text-white text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2">
                              {shop.shopName}
                            </h3>
                            <div className="flex items-center gap-1.5 shrink-0 bg-amber-50 dark:bg-amber-400/10 px-2.5 py-1.5 rounded-xl border border-amber-100 dark:border-amber-400/20">
                              <Star size={14} className="text-amber-500 fill-amber-500" />
                              <span className="font-black text-amber-700 dark:text-amber-400 text-xs">
                                {shop.ratingAvg > 0 ? shop.ratingAvg.toFixed(1) : 'Mới'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-medium">
                            <MapPin size={14} className="text-primary/60" />
                            <span className="truncate">{shop.address}{shop.city ? `, ${shop.city}` : ''}</span>
                          </div>

                          {shop.description && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-medium">
                              {shop.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                              <Phone size={14} />
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{shop.phone}</span>
                          </div>
                          <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest group-hover:gap-3 transition-all">
                            Xem chi tiết
                            <ChevronRight size={14} />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))
              )}
            </motion.div>

            {/* Empty state */}
            {!isLoading && sortedClinics.length === 0 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-32 glass rounded-[40px] space-y-6"
              >
                <div className="w-24 h-24 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto text-slate-300">
                  <Search size={48} />
                </div>
                <div className="space-y-2">
                  <h3 className="font-black text-2xl text-slate-900 dark:text-white">
                    Không tìm thấy kết quả
                  </h3>
                  <p className="text-slate-400 font-medium">Hãy thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm</p>
                </div>
                <button
                  onClick={() => { setSearchQuery(''); setCityQuery(''); setActiveService('Tất cả'); setMinRating(0); }}
                  className="px-8 py-4 bg-primary text-white text-xs font-black rounded-2xl hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 uppercase tracking-widest"
                >
                  Xóa tất cả bộ lọc
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
