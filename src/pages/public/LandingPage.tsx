import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { shopService } from '../../services/shop.service';
import { 
  Search, MapPin, Video, Star, ArrowRight, ShieldCheck, Heart, Sparkles, 
  Zap, ChevronRight, Navigation, Clock, CheckCircle2, ChevronDown, Percent, Loader2, Compass
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';

// Import assets
import heroImage from '../../assets/landing/landing_hero_pet_care_1778855096349.png';
import cameraPreview from '../../assets/landing/live_camera_preview_1778855116615.png';
import spaImage from '../../assets/landing/pet_spa_grooming_1778855139420.png';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // GPS State
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [nearbyCoords, setNearbyCoords] = useState<{lat: number, lng: number} | null>(null);
  const [manualAddress, setManualAddress] = useState('');

  // Hero Search State
  const [heroCity, setHeroCity] = useState('');
  const [heroType, setHeroType] = useState('Tất cả');

  // 1. Fetch Featured Shops (API)
  const { data: featuredShops = [], isLoading: isLoadingFeatured } = useQuery({
    queryKey: ['featuredShops'],
    queryFn: () => shopService.searchPublic(),
  });

  // 2. Fetch Nearby Shops (API)
  const { data: nearbyShops = [], isLoading: isLoadingNearby } = useQuery({
    queryKey: ['nearbyShops', nearbyCoords],
    queryFn: () => shopService.searchNearby(nearbyCoords!.lat, nearbyCoords!.lng, 10),
    enabled: !!nearbyCoords,
  });

  const topFeaturedShops = featuredShops.slice(0, 4);

  const handleAction = (target: string) => {
    if (target === '/search') {
      const params = new URLSearchParams();
      if (heroCity.trim()) params.set('city', heroCity.trim());
      if (heroType !== 'Tất cả') params.set('type', heroType);
      navigate(`/search?${params.toString()}`);
      return;
    }

    const publicPaths = ['/search', '/camera'];
    if (publicPaths.includes(target) || user) {
      navigate(target);
    } else {
      navigate('/login');
    }
  };

  const handleGetLocation = () => {
    setLocationStatus('loading');
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setNearbyCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocationStatus('success');
        },
        (err) => {
          console.error(err);
          setLocationStatus('error');
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      setLocationStatus('error');
    }
  };

  // FAQ State
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  return (
    <main className="flex-1 overflow-x-hidden font-display relative pb-24 md:pb-0">
      
      {/* ─── Hero Section ────────────────────────────────────────────── */}
      <section className="relative min-h-fit md:min-h-[80vh] 2xl:min-h-[90vh] flex items-center justify-center pt-8 pb-8 2xl:pt-20 2xl:pb-16 px-6 overflow-hidden bg-slate-50 dark:bg-slate-950">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-full bg-mesh opacity-10 dark:opacity-20" />
          <motion.div 
            animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, -30, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px]"
          />
          <motion.div 
            animate={{ scale: [1, 1.3, 1], x: [0, -40, 0], y: [0, 60, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] bg-secondary/20 rounded-full blur-[120px]"
          />
          <div className="pattern-dots absolute inset-0 opacity-20 pointer-events-none" />
        </div>

        <div className="max-w-7xl mx-auto w-full relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 2xl:gap-16 items-center">
            <motion.div variants={staggerContainer} initial="initial" animate="animate" className="flex flex-col gap-8 text-center lg:text-left">
              <motion.div variants={fadeIn} className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full w-fit mx-auto lg:mx-0">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                <span className="text-[17px] font-black uppercase tracking-widest text-primary dark:text-indigo-300">
                  HỆ SINH THÁI THÚ Y TOÀN DIỆN
                </span>
              </motion.div>

              <motion.h1 variants={fadeIn} className="text-5xl lg:text-6xl 2xl:text-8xl font-black leading-[1.1] tracking-tight text-slate-900 dark:text-white">
                Chăm sóc <br />
                <span className="text-gradient">Thú cưng</span> <br />
                thời đại số.
              </motion.h1>

              <motion.p variants={fadeIn} className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                Kết nối với mạng lưới chuyên gia, đặt lịch khám nhanh chóng và theo dõi bé yêu mọi lúc qua Live Camera 24/7.
              </motion.p>

              {/* Glassmorphic Search Bar */}
              <motion.div variants={fadeIn} className="glass dark:glass-dark p-2 rounded-3xl mt-4 shadow-2xl group focus-within:ring-4 ring-primary/10 transition-all">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                  <div className="md:col-span-5 relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-primary w-5 h-5" />
                      <input 
                        value={heroCity}
                        onChange={e => setHeroCity(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAction('/search')}
                        className="w-full pl-12 pr-4 py-3 2xl:py-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-none focus:ring-0 text-sm font-bold placeholder:text-slate-400" 
                        placeholder="Tìm khu vực..." 
                      />
                  </div>
                  <div className="md:col-span-4 relative border-l border-slate-100 dark:border-slate-800 hidden md:block">
                    <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary w-5 h-5" />
                    <select 
                      value={heroType}
                      onChange={e => setHeroType(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 2xl:py-4 bg-transparent border-none focus:ring-0 text-sm font-bold appearance-none cursor-pointer">
                      <option value="Tất cả">Tất cả dịch vụ</option>
                      <option value="CLINIC">Khám thú y (Clinic)</option>
                      <option value="SPA">Spa & Grooming</option>
                      <option value="BOARDING">Lưu trú (Hotel)</option>
                    </select>
                  </div>
                  <div className="md:col-span-3">
                    <button 
                      onClick={() => handleAction('/search')}
                      className="w-full h-full bg-primary hover:bg-primary-dark text-white rounded-2xl font-black transition-all flex items-center justify-center gap-2 py-4 shadow-lg shadow-primary/20 group-hover:scale-[1.02]"
                    >
                      <Search size={18} /> TÌM KIẾM
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.8, rotate: 5 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ duration: 1, ease: "easeOut" }} className="relative hidden lg:block">
              <div className="relative z-10 w-full aspect-square lg:aspect-[4/5] max-h-[400px] lg:max-h-[480px] 2xl:max-h-[700px] rounded-[40px] 2xl:rounded-[60px] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border-4 2xl:border-8 border-white dark:border-slate-800">
                <img src={heroImage} alt="Happy pets" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 4, repeat: Infinity }} className="absolute bottom-8 left-8 right-8 glass p-6 rounded-3xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-green-500/30">
                      <ShieldCheck size={24} />
                    </div>
                    <div>
                      <p className="font-black text-slate-900 dark:text-white">Đối tác đã xác thực</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">Uy tín & Chuyên nghiệp 100%</p>
                    </div>
                  </div>
                </motion.div>
              </div>
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-yellow-400 rounded-full blur-[80px] opacity-30 animate-pulse" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Promotions (Vouchers) Banner ──────────────────────────────── */}
      <section className="py-6 xl:py-8 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 overflow-hidden flex">
        <motion.div 
          className="flex gap-6 px-3 w-max"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, ease: "linear", duration: 30 }}
        >
          {[
            { t: 'GIẢM 20% SPA', d: 'Cho lần đầu tiên trải nghiệm dịch vụ grooming.', c: 'bg-gradient-to-r from-rose-400 to-orange-400' },
            { t: 'MIỄN PHÍ KHÁM', d: 'Miễn phí khám lâm sàng tại các cơ sở liên kết.', c: 'bg-gradient-to-r from-blue-500 to-indigo-500' },
            { t: 'HOTEL 150K/NGÀY', d: 'Ưu đãi lưu trú kèm live camera 24/7.', c: 'bg-gradient-to-r from-emerald-400 to-teal-500' },
          ].concat([
            { t: 'GIẢM 20% SPA', d: 'Cho lần đầu tiên trải nghiệm dịch vụ grooming.', c: 'bg-gradient-to-r from-rose-400 to-orange-400' },
            { t: 'MIỄN PHÍ KHÁM', d: 'Miễn phí khám lâm sàng tại các cơ sở liên kết.', c: 'bg-gradient-to-r from-blue-500 to-indigo-500' },
            { t: 'HOTEL 150K/NGÀY', d: 'Ưu đãi lưu trú kèm live camera 24/7.', c: 'bg-gradient-to-r from-emerald-400 to-teal-500' },
          ], [
            { t: 'GIẢM 20% SPA', d: 'Cho lần đầu tiên trải nghiệm dịch vụ grooming.', c: 'bg-gradient-to-r from-rose-400 to-orange-400' },
            { t: 'MIỄN PHÍ KHÁM', d: 'Miễn phí khám lâm sàng tại các cơ sở liên kết.', c: 'bg-gradient-to-r from-blue-500 to-indigo-500' },
            { t: 'HOTEL 150K/NGÀY', d: 'Ưu đãi lưu trú kèm live camera 24/7.', c: 'bg-gradient-to-r from-emerald-400 to-teal-500' },
          ], [
            { t: 'GIẢM 20% SPA', d: 'Cho lần đầu tiên trải nghiệm dịch vụ grooming.', c: 'bg-gradient-to-r from-rose-400 to-orange-400' },
            { t: 'MIỄN PHÍ KHÁM', d: 'Miễn phí khám lâm sàng tại các cơ sở liên kết.', c: 'bg-gradient-to-r from-blue-500 to-indigo-500' },
            { t: 'HOTEL 150K/NGÀY', d: 'Ưu đãi lưu trú kèm live camera 24/7.', c: 'bg-gradient-to-r from-emerald-400 to-teal-500' },
          ], [
            { t: 'GIẢM 20% SPA', d: 'Cho lần đầu tiên trải nghiệm dịch vụ grooming.', c: 'bg-gradient-to-r from-rose-400 to-orange-400' },
            { t: 'MIỄN PHÍ KHÁM', d: 'Miễn phí khám lâm sàng tại các cơ sở liên kết.', c: 'bg-gradient-to-r from-blue-500 to-indigo-500' },
            { t: 'HOTEL 150K/NGÀY', d: 'Ưu đãi lưu trú kèm live camera 24/7.', c: 'bg-gradient-to-r from-emerald-400 to-teal-500' },
          ], [
            { t: 'GIẢM 20% SPA', d: 'Cho lần đầu tiên trải nghiệm dịch vụ grooming.', c: 'bg-gradient-to-r from-rose-400 to-orange-400' },
            { t: 'MIỄN PHÍ KHÁM', d: 'Miễn phí khám lâm sàng tại các cơ sở liên kết.', c: 'bg-gradient-to-r from-blue-500 to-indigo-500' },
            { t: 'HOTEL 150K/NGÀY', d: 'Ưu đãi lưu trú kèm live camera 24/7.', c: 'bg-gradient-to-r from-emerald-400 to-teal-500' },
          ], [
            { t: 'GIẢM 20% SPA', d: 'Cho lần đầu tiên trải nghiệm dịch vụ grooming.', c: 'bg-gradient-to-r from-rose-400 to-orange-400' },
            { t: 'MIỄN PHÍ KHÁM', d: 'Miễn phí khám lâm sàng tại các cơ sở liên kết.', c: 'bg-gradient-to-r from-blue-500 to-indigo-500' },
            { t: 'HOTEL 150K/NGÀY', d: 'Ưu đãi lưu trú kèm live camera 24/7.', c: 'bg-gradient-to-r from-emerald-400 to-teal-500' },
          ], [
            { t: 'GIẢM 20% SPA', d: 'Cho lần đầu tiên trải nghiệm dịch vụ grooming.', c: 'bg-gradient-to-r from-rose-400 to-orange-400' },
            { t: 'MIỄN PHÍ KHÁM', d: 'Miễn phí khám lâm sàng tại các cơ sở liên kết.', c: 'bg-gradient-to-r from-blue-500 to-indigo-500' },
            { t: 'HOTEL 150K/NGÀY', d: 'Ưu đãi lưu trú kèm live camera 24/7.', c: 'bg-gradient-to-r from-emerald-400 to-teal-500' },
          ]).map((banner, i) => (
            <div key={i} className={`shrink-0 w-80 md:w-96 rounded-3xl p-6 ${banner.c} text-white shadow-lg shadow-primary/10 cursor-pointer hover:scale-[1.02] transition-transform`}>
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-2xl font-black mb-2">{banner.t}</h4>
                  <p className="text-white/80 font-medium text-sm leading-relaxed">{banner.d}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md shrink-0">
                  <Percent size={20} className="text-white" />
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ─── Nearby Shops (Hybrid GPS) ─────────────────────────────────── */}
      <section className="py-12 md:py-16 xl:py-24 px-6 bg-slate-50 dark:bg-slate-950 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <span className="inline-flex items-center gap-2 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider">
              <Navigation size={16} /> Tiện lợi tối đa
            </span>
            <h2 className="text-3xl md:text-4xl xl:text-5xl font-black text-slate-900 dark:text-white">
              Tìm cơ sở <span className="text-blue-500">Gần bạn nhất</span>
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Cho phép truy cập vị trí hoặc nhập địa chỉ để tìm ngay các phòng khám, spa uy tín ngay sát nhà bạn.</p>
          </div>

          {!nearbyCoords && (
            <div className="flex flex-col items-center justify-center mb-16">
              <button 
                onClick={handleGetLocation}
                disabled={locationStatus === 'loading'}
                className="px-8 py-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-primary hover:text-primary rounded-[24px] font-black flex items-center justify-center gap-3 transition-all shadow-xl hover:shadow-primary/20 hover:-translate-y-1"
              >
                {locationStatus === 'loading' ? <Loader2 className="animate-spin" size={24} /> : <Compass size={24} className={locationStatus === 'success' ? 'text-green-500' : 'text-blue-500'} />}
                TÌM QUANH ĐÂY BẰNG GPS
              </button>
              <p className="text-xs text-slate-400 mt-4 italic flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">info</span> 
                Hệ thống sẽ quét các cơ sở trong bán kính tối đa 10km quanh bạn
              </p>
            </div>
          )}

          {/* Results Area */}
          {nearbyCoords && (
            <div className="mt-12">
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6">Kết quả quanh bạn:</h3>
              {isLoadingNearby ? (
                <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>
              ) : nearbyShops.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {nearbyShops.map((shop: any) => (
                    <div key={shop.id} onClick={() => navigate(`/clinic/${shop.id}`)} className="bg-white dark:bg-slate-900 rounded-[28px] overflow-hidden shadow-lg border border-slate-100 dark:border-slate-800 hover:-translate-y-2 transition-all cursor-pointer group">
                      <div className="h-40 bg-slate-200 dark:bg-slate-800 relative overflow-hidden">
                        {shop.logoUrl ? <img src={shop.logoUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={shop.shopName} /> : <div className="w-full h-full flex items-center justify-center text-slate-400"><MapPin size={32} /></div>}
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-slate-900 px-3 py-1 rounded-full text-xs font-black shadow-sm">
                          {shop.distanceKm?.toFixed(1)} km
                        </div>
                      </div>
                      <div className="p-5">
                        <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">{shop.shopType}</p>
                        <h4 className="text-lg font-black text-slate-900 dark:text-white truncate">{shop.shopName}</h4>
                        <p className="text-sm text-slate-500 mt-2 line-clamp-2">{shop.address}, {shop.city}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-slate-500 py-12 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                  Không tìm thấy cơ sở nào trong bán kính 10km.
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ─── Featured Services Showcase (API) ──────────────────────────── */}
      <section id="co-so" className="py-12 md:py-16 xl:py-24 px-6 bg-white dark:bg-slate-900 relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div className="max-w-2xl space-y-4">
              <span className="inline-flex items-center bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider w-fit">
                Đánh giá cao nhất
              </span>
              <h2 className="text-3xl md:text-4xl xl:text-5xl font-black text-slate-900 dark:text-white leading-[1.1]">
                Khám phá dịch vụ <br />
                <span className="text-gradient">Được yêu thích</span>
              </h2>
            </div>
            <button onClick={() => navigate('/search')} className="flex items-center gap-2 font-black text-sm text-slate-400 hover:text-primary transition-colors group">
              XEM TẤT CẢ CƠ SỞ <ChevronRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {isLoadingFeatured ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary w-10 h-10" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {topFeaturedShops.map((shop: any) => (
                <motion.div 
                  key={shop.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  onClick={() => navigate(`/clinic/${shop.id}`)}
                  className="bg-slate-50 dark:bg-slate-800/50 rounded-[32px] overflow-hidden shadow-soft hover:shadow-hover border border-slate-100 dark:border-slate-800 hover:-translate-y-2 transition-all cursor-pointer group flex flex-col"
                >
                  <div className="h-48 bg-slate-200 relative overflow-hidden shrink-0">
                    {shop.logoUrl ? (
                      <img src={shop.logoUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={shop.shopName} />
                    ) : (
                      <img src={spaImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Placeholder" />
                    )}
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="bg-white/90 backdrop-blur text-slate-900 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{shop.shopType}</span>
                    </div>
                    {shop.ratingAvg > 0 && (
                      <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-xl text-xs font-black flex items-center gap-1 shadow-lg">
                        <Star size={12} className="fill-current" /> {shop.ratingAvg.toFixed(1)}
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight mb-2 line-clamp-2">{shop.shopName}</h3>
                    <div className="flex items-start gap-2 text-slate-500 mb-4">
                      <MapPin size={16} className="shrink-0 mt-0.5 text-primary" />
                      <span className="text-sm font-medium line-clamp-2">{shop.address}, {shop.city}</span>
                    </div>
                    <div className="mt-auto flex flex-wrap gap-1.5 pt-4 border-t border-slate-200 dark:border-slate-700">
                      {shop.serviceNames?.slice(0,3).map((svc: string, idx: number) => (
                        <span key={idx} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] rounded-lg font-bold">{svc}</span>
                      ))}
                      {shop.serviceNames?.length > 3 && <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] rounded-lg font-bold">+{shop.serviceNames.length - 3}</span>}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── Live Camera Showcase ──────────────────────────────────────── */}
      <section id="camera" className="py-12 md:py-16 2xl:py-32 px-6 bg-slate-900 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[50%] h-full bg-primary/10 blur-[150px] -rotate-12 pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 2xl:gap-20 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-6 md:space-y-8 2xl:space-y-10">
              <div className="space-y-4 2xl:space-y-6">
                <span className="inline-flex items-center gap-2 bg-secondary/20 text-secondary px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider">
                  <Video size={16} /> Tính năng độc quyền
                </span>
                <h2 className="text-3xl md:text-4xl 2xl:text-6xl font-black text-white leading-[1.1]">
                  An tâm tuyệt đối <br /> với <span className="text-gradient">Live Camera</span>
                </h2>
                <p className="text-base md:text-lg 2xl:text-xl text-slate-400 leading-relaxed font-medium">Theo dõi trực tiếp mọi khoảnh khắc của bé yêu 24/7 từ điện thoại. Bạn sẽ luôn cảm thấy gần gũi dù đang ở bất cứ đâu.</p>
              </div>
              <div className="space-y-4 2xl:space-y-6">
                {[
                  { t: "Chất lượng HD 4K", d: "Hình ảnh sắc nét, mượt mà cả ngày lẫn đêm.", icon: <Sparkles className="text-amber-400" /> },
                  { t: "Đàm thoại 2 chiều", d: "Trò chuyện và gọi tên bé cưng từ xa dễ dàng.", icon: <Video className="text-secondary" /> },
                  { t: "Bảo mật nâng cao", d: "Mã hóa đầu cuối, đảm bảo chỉ bạn mới có quyền xem.", icon: <ShieldCheck className="text-green-500" /> }
                ].map((item, i) => (
                  <motion.div key={i} className="flex gap-4 2xl:gap-6 items-start group p-2 2xl:p-4 rounded-3xl hover:bg-white/5 transition-colors">
                    <div className="w-10 h-10 2xl:w-14 2xl:h-14 rounded-xl 2xl:rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10 group-hover:scale-110 transition-transform">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-black text-white text-base 2xl:text-lg">{item.t}</h4>
                      <p className="text-slate-500 font-medium text-xs 2xl:text-sm mt-1">{item.d}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <button onClick={() => handleAction('/search')} className="w-fit bg-primary text-white px-6 py-3 2xl:px-10 2xl:py-5 rounded-2xl 2xl:rounded-[24px] font-black flex items-center gap-2 2xl:gap-3 hover:bg-white hover:text-slate-900 transition-all shadow-xl hover:shadow-white/20 text-sm 2xl:text-base">
                KHÁM PHÁ CƠ SỞ CÓ CAMERA <ArrowRight size={20} className="w-4 h-4 2xl:w-5 2xl:h-5" />
              </button>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="relative">
              <div className="relative z-10 p-4 glass-dark rounded-[50px] shadow-3xl">
                <div className="relative aspect-video rounded-[40px] overflow-hidden bg-black">
                  <img src={cameraPreview} alt="Live feed" className="w-full h-full object-cover opacity-80" />
                  <div className="absolute top-6 left-6 flex items-center gap-3">
                    <div className="px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-black text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> LIVE FEED
                    </div>
                    <span className="px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-sm border border-white/5 text-[10px] font-bold text-white/80 tracking-widest uppercase">REC 00:42:15</span>
                  </div>
                  <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                    <div className="bg-black/60 backdrop-blur-md border border-white/10 p-3 rounded-2xl">
                      <p className="text-xs font-black text-white">Lucky - Golden Retriever</p>
                      <p className="text-[10px] font-medium text-white/70">Deluxe Room 102</p>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-10 h-10 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white cursor-pointer hover:bg-white/20 transition-colors"><Video size={16} /></div>
                      <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white cursor-pointer hover:scale-110 transition-transform"><ArrowRight size={16} /></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/20 rounded-full blur-[100px]" />
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-secondary/20 rounded-full blur-[100px]" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── How it Works (Quy trình) ──────────────────────────────────── */}
      <section className="py-16 md:py-24 2xl:py-32 px-6 bg-slate-50/50 dark:bg-slate-950/40 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16 xl:mb-24 space-y-4">
            <h2 className="text-4xl md:text-5xl xl:text-6xl font-black text-slate-900 dark:text-white tracking-tight">Sử dụng PetEye <span className="text-gradient">Chỉ với 3 bước</span></h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { t: "Tìm & So sánh", d: "Dễ dàng tìm thấy các cơ sở quanh bạn với đầy đủ thông tin.", n: "01", icon: <Search size={28} />, gradClass: "from-blue-500 to-indigo-600" },
              { t: "Đặt lịch 24/7", d: "Chọn khung giờ phù hợp và đặt lịch ngay lập tức.", n: "02", icon: <Clock size={28} />, gradClass: "from-purple-500 to-pink-600" },
              { t: "Trải nghiệm & Review", d: "Theo dõi qua Camera và chia sẻ đánh giá.", n: "03", icon: <Heart size={28} />, gradClass: "from-rose-500 to-orange-500" }
            ].map((step, i) => (
              <div key={i} className="relative flex flex-col items-start gap-6 group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[36px] p-8 md:p-10 shadow-soft hover:-translate-y-2 transition-all duration-500 overflow-hidden">
                <div className="absolute -bottom-6 -right-4 text-9xl font-black text-slate-100 dark:text-slate-800/35 select-none opacity-40 group-hover:scale-110 transition-all duration-500">{step.n}</div>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br ${step.gradClass} text-white shadow-lg`}>{step.icon}</div>
                <div className="space-y-3 relative z-10 mt-4">
                  <h4 className="text-2xl font-black text-slate-900 dark:text-white">{step.t}</h4>
                  <p className="text-slate-500 font-medium leading-relaxed text-sm">{step.d}</p>
                </div>
                <div className={`absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r ${step.gradClass} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ──────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 2xl:py-32 px-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 xl:mb-24">
            <h2 className="text-4xl md:text-5xl xl:text-6xl font-black text-slate-900 dark:text-white mb-4">Khách hàng nói gì về <span className="text-primary">PetEye</span></h2>
            <p className="text-slate-500 text-lg">Hàng ngàn chủ nuôi đã tin tưởng và giao phó thú cưng của mình.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Thu Trang", pet: "Mẹ bé Corgi", text: "Từ ngày có PetEye, việc đặt lịch tắm tả cho bé cún dễ dàng hơn hẳn. Mình đặc biệt thích tính năng xem camera trực tiếp khi gửi bé ở khách sạn.", img: "https://i.pravatar.cc/150?img=1" },
              { name: "Minh Tuấn", pet: "Chủ bé Mèo Anh", text: "Hệ thống lọc cơ sở rất thông minh. Mình tìm được một phòng khám ngay sát nhà có bác sĩ chuyên môn cao mà bình thường không hề biết tới.", img: "https://i.pravatar.cc/150?img=11" },
              { name: "Ngọc Lan", pet: "Mẹ 2 bé Poodle", text: "Các đánh giá trên nền tảng rất chân thực. Voucher giảm giá cũng nhiều. Chắc chắn sẽ sử dụng PetEye lâu dài!", img: "https://i.pravatar.cc/150?img=5" }
            ].map((review, i) => (
              <div key={i} className="p-8 rounded-[32px] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="flex gap-1 text-yellow-400 mb-6">
                  {[1,2,3,4,5].map(s => <Star key={s} size={16} className="fill-current" />)}
                </div>
                <p className="text-slate-700 dark:text-slate-300 font-medium italic mb-8 line-clamp-4">"{review.text}"</p>
                <div className="flex items-center gap-4">
                  <img src={review.img} className="w-12 h-12 rounded-full object-cover" alt={review.name} />
                  <div>
                    <h4 className="font-black text-slate-900 dark:text-white">{review.name}</h4>
                    <p className="text-xs font-bold text-slate-500">{review.pet}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ Section ───────────────────────────────────────────────── */}
      <section className="py-12 md:py-16 xl:py-24 px-6 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8 xl:mb-16">
            <h2 className="text-3xl xl:text-4xl font-black text-slate-900 dark:text-white mb-4">Câu hỏi thường gặp</h2>
            <p className="text-slate-500">Mọi thắc mắc của bạn đều được giải đáp.</p>
          </div>
          <div className="space-y-4">
            {[
              { q: "Đặt lịch trên PetEye có mất phí không?", a: "Hoàn toàn miễn phí. Bạn chỉ thanh toán đúng số tiền dịch vụ cho cơ sở thú y mà không phải chịu thêm bất kỳ khoản phí nền tảng nào." },
              { q: "Tính năng Live Camera hoạt động thế nào?", a: "Khi bạn gửi thú cưng tại các cơ sở có hỗ trợ Live Camera, bạn sẽ được cung cấp một mã truy cập tạm thời để xem trực tiếp bé yêu qua ứng dụng/web 24/7." },
              { q: "Các cơ sở thú y trên nền tảng có uy tín không?", a: "100% cơ sở trên PetEye đều phải qua khâu kiểm duyệt giấy phép kinh doanh, chứng chỉ hành nghề của bác sĩ trước khi được xuất hiện trên hệ thống." },
              { q: "Tôi có thể hủy lịch đã đặt không?", a: "Có thể. Bạn được phép hủy lịch miễn phí trước thời gian hẹn 2 tiếng. Các chính sách hoàn tiền (nếu thanh toán trước) sẽ được áp dụng tự động." }
            ].map((faq, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
                <button 
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                >
                  <span className="font-black text-slate-900 dark:text-white pr-4">{faq.q}</span>
                  <ChevronDown className={`shrink-0 text-slate-400 transition-transform ${activeFaq === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {activeFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="px-6 pb-5 text-slate-500 font-medium leading-relaxed">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Sticky Mobile CTA ─────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 z-50 md:hidden flex justify-center pb-safe">
        <button 
          onClick={() => navigate('/search')} 
          className="w-full bg-primary text-white py-4 rounded-2xl font-black shadow-xl shadow-primary/20 flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <Search size={18} /> TÌM CƠ SỞ NGAY
        </button>
      </div>

    </main>
  );
}
