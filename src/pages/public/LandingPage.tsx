import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Video, Star, ArrowRight, ShieldCheck, Heart, Sparkles, Zap, ChevronRight } from 'lucide-react';
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

  const handleAction = (target: string) => {
    if (user) {
      navigate(target);
    } else {
      navigate('/login');
    }
  };

  return (
    <main className="flex-1 overflow-x-hidden font-display">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-20 pb-32 px-6 overflow-hidden bg-slate-50 dark:bg-slate-950">
        {/* Dynamic Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-full bg-mesh opacity-10 dark:opacity-20" />
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              x: [0, 50, 0],
              y: [0, -30, 0]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px]"
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.3, 1],
              x: [0, -40, 0],
              y: [0, 60, 0]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] bg-secondary/20 rounded-full blur-[120px]"
          />
          <div className="pattern-dots absolute inset-0 opacity-20 pointer-events-none" />
        </div>

        <div className="max-w-7xl mx-auto w-full relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Hero Content */}
            <motion.div 
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="flex flex-col gap-8 text-center lg:text-left"
            >
              <motion.div variants={fadeIn} className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full w-fit mx-auto lg:mx-0">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                <span className="text-[17px] font-black uppercase tracking-widest text-primary dark:text-indigo-300">
                  HỆ SINH THÁI THÚ Y TOÀN DIỆN
                </span>
              </motion.div>

              <motion.h1 variants={fadeIn} className="text-6xl md:text-8xl font-black leading-[1] tracking-tight text-slate-900 dark:text-white">
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
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-none focus:ring-0 text-sm font-bold placeholder:text-slate-400" 
                      placeholder="Tìm theo khu vực..." 
                    />
                  </div>
                  <div className="md:col-span-4 relative border-l border-slate-100 dark:border-slate-800 hidden md:block">
                    <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary w-5 h-5" />
                    <select className="w-full pl-12 pr-4 py-4 bg-transparent border-none focus:ring-0 text-sm font-bold appearance-none cursor-pointer">
                      <option>Tất cả dịch vụ</option>
                      <option>Khám bệnh</option>
                      <option>Spa & Grooming</option>
                      <option>Hotel & Clinic</option>
                    </select>
                  </div>
                  <div className="md:col-span-3">
                    <button 
                      onClick={() => handleAction('/search')}
                      className="w-full h-full bg-primary hover:bg-primary-dark text-white rounded-2xl font-black transition-all flex items-center justify-center gap-2 py-4 shadow-lg shadow-primary/20 group-hover:scale-[1.02]"
                    >
                      <Search size={18} />
                      TÌM KIẾM
                    </button>
                  </div>
                </div>
              </motion.div>

              <motion.div variants={fadeIn} className="flex items-center gap-6 justify-center lg:justify-start mt-4">
                <div className="flex -space-x-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-12 h-12 rounded-full border-4 border-white dark:border-slate-950 bg-slate-200 overflow-hidden shadow-xl">
                      <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="user" />
                    </div>
                  ))}
                </div>
                <div className="text-left">
                  <p className="text-slate-900 dark:text-white font-black text-lg leading-none">2,500+</p>
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mt-1">Đối tác đã tin dùng</p>
                </div>
              </motion.div>
            </motion.div>

            {/* Hero Image / Visuals */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative hidden lg:block"
            >
              <div className="relative z-10 w-full aspect-[4/5] rounded-[60px] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border-8 border-white dark:border-slate-800">
                <img src={heroImage} alt="Happy pets" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                
                {/* Floating Elements */}
                <motion.div 
                  animate={{ y: [0, -15, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute bottom-8 left-8 right-8 glass p-6 rounded-3xl"
                >
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

              {/* Decorative elements */}
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-yellow-400 rounded-full blur-[80px] opacity-30 animate-pulse" />
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -top-6 -right-6 w-32 h-32 border-4 border-dashed border-primary/20 rounded-full"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust & Stats Section */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Cơ sở thú y", val: "200+", icon: <ShieldCheck className="text-primary" /> },
              { label: "Người dùng", val: "15k+", icon: <Heart className="text-rose-500" /> },
              { label: "Lịch hẹn", val: "50k+", icon: <Zap className="text-yellow-500" /> },
              { label: "Đánh giá 5*", val: "98%", icon: <Star className="text-orange-500" /> }
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center text-center gap-2"
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-2">
                  {stat.icon}
                </div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white">{stat.val}</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Services Showcase */}
      <section id="co-so" className="py-32 px-6 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
            <div className="max-w-2xl space-y-6">
              <span className="inline-flex items-center bg-primary/10 text-primary border border-primary/20 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider w-fit">
                Gợi ý tốt nhất
              </span>
              <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white leading-[1.1]">
                Khám phá dịch vụ <br />
                <span className="text-gradient">Được yêu thích</span>
              </h2>
            </div>
            <button 
              onClick={() => handleAction('/search')}
              className="flex items-center gap-2 font-black text-sm text-slate-400 hover:text-primary transition-colors group"
            >
              XEM TẤT CẢ CƠ SỞ
              <ChevronRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Featured Item Large */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="md:col-span-8 group cursor-pointer"
            >
              <div className="relative h-[600px] rounded-[50px] overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80" 
                  alt="Clinic" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute top-8 left-8 flex gap-2">
                  <span className="glass px-4 py-2 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest">Nổi bật</span>
                  <span className="bg-secondary/80 backdrop-blur-md px-4 py-2 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    LIVE CAM
                  </span>
                </div>
                <div className="absolute bottom-12 left-12 right-12 space-y-4">
                  <h3 className="text-4xl font-black text-white leading-tight">Phòng khám PetCare Center</h3>
                  <div className="flex items-center gap-6 text-white/80">
                    <div className="flex items-center gap-2">
                      <MapPin size={18} className="text-primary-light" />
                      <span className="font-bold text-sm">Quận 3, TP.HCM</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star size={18} className="text-yellow-400" />
                      <span className="font-bold text-sm">4.9 (1,200 đánh giá)</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Side items */}
            <div className="md:col-span-4 flex flex-col gap-8">
              {[
                { title: "Happy Paws Spa", img: spaImage, cat: "Grooming" },
                { title: "Saigon Vet Hospital", img: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80", cat: "Clinic" }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 }}
                  className="group relative h-[284px] rounded-[40px] overflow-hidden shadow-xl cursor-pointer"
                >
                  <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                  <div className="absolute bottom-8 left-8">
                    <span className="text-[10px] font-black text-white/70 uppercase tracking-widest">{item.cat}</span>
                    <h4 className="text-xl font-black text-white mt-1">{item.title}</h4>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Live Camera Showcase */}
      <section id="camera" className="py-32 px-6 bg-slate-900 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[50%] h-full bg-primary/10 blur-[150px] -rotate-12" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-10"
            >
              <div className="space-y-6">
                <span className="inline-flex items-center gap-2 bg-secondary/20 text-secondary px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider">
                  <Video size={16} />
                  Tính năng độc quyền
                </span>
                <h2 className="text-5xl md:text-7xl font-black text-white leading-[1.1]">
                  An tâm tuyệt đối <br />
                  với <span className="text-gradient">Live Camera</span>
                </h2>
                <p className="text-lg text-slate-400 leading-relaxed font-medium">
                  Theo dõi trực tiếp mọi khoảnh khắc của bé yêu 24/7 từ điện thoại. Bạn sẽ luôn cảm thấy gần gũi dù đang ở bất cứ đâu.
                </p>
              </div>

              <div className="space-y-6">
                {[
                  { t: "Chất lượng HD 4K", d: "Hình ảnh sắc nét, mượt mà cả ngày lẫn đêm.", icon: <Sparkles className="text-amber-400" /> },
                  { t: "Đàm thoại 2 chiều", d: "Trò chuyện và gọi tên bé cưng từ xa dễ dàng.", icon: <Video className="text-secondary" /> },
                  { t: "Bảo mật nâng cao", d: "Mã hóa đầu cuối, đảm bảo chỉ bạn mới có quyền xem.", icon: <ShieldCheck className="text-green-500" /> }
                ].map((item, i) => (
                  <motion.div 
                    key={i}
                    className="flex gap-6 items-start group p-4 rounded-3xl hover:bg-white/5 transition-colors"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10 group-hover:scale-110 transition-transform">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-black text-white text-lg">{item.t}</h4>
                      <p className="text-slate-500 font-medium text-sm mt-1">{item.d}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <button 
                onClick={() => handleAction('/camera')}
                className="w-fit bg-white text-slate-900 px-10 py-5 rounded-[20px] font-black flex items-center gap-3 hover:bg-primary hover:text-white transition-all shadow-2xl hover:shadow-primary/30"
              >
                TRẢI NGHIỆM NGAY
                <ArrowRight size={20} />
              </button>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative z-10 p-4 glass-dark rounded-[50px] shadow-3xl">
                <div className="relative aspect-video rounded-[40px] overflow-hidden bg-black">
                  <img src={cameraPreview} alt="Live feed" className="w-full h-full object-cover opacity-80" />
                  <div className="absolute top-6 left-6 flex items-center gap-3">
                    <div className="px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-black text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      LIVE FEED
                    </div>
                    <span className="px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-sm border border-white/5 text-[10px] font-bold text-white/80 tracking-widest uppercase">REC 00:42:15</span>
                  </div>
                  <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                    <div className="bg-black/60 backdrop-blur-md border border-white/10 p-3 rounded-2xl">
                      <p className="text-xs font-black text-white">Lucky - Golden Retriever</p>
                      <p className="text-[10px] font-medium text-white/70">Deluxe Room 102</p>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-10 h-10 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white cursor-pointer hover:bg-white/20 transition-colors">
                        <Video size={16} />
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white cursor-pointer hover:scale-110 transition-transform">
                        <ArrowRight size={16} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Decorative blobs */}
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/20 rounded-full blur-[100px]" />
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-secondary/20 rounded-full blur-[100px]" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it Works - Timeline */}
      <section id="quy-trinh" className="py-32 px-6 bg-slate-50/50 dark:bg-slate-950/40 relative overflow-hidden">
        {/* Background glow spots */}
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-24 space-y-6">
            <span className="inline-flex items-center bg-primary/10 text-primary border border-primary/20 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider w-fit">Quy trình thông minh</span>
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight">
              Sử dụng Peteye <br />
              <span className="text-gradient">Chỉ với 3 bước</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {[
              { 
                t: "Tìm & So sánh", 
                d: "Dễ dàng tìm thấy các cơ sở quanh bạn với đầy đủ thông tin giá cả và đánh giá.", 
                n: "01", 
                icon: <Search size={28} />,
                colorClass: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border-blue-100 dark:border-blue-900/30",
                gradClass: "from-blue-500 to-indigo-600"
              },
              { 
                t: "Đặt lịch 24/7", 
                d: "Chọn khung giờ phù hợp và đặt lịch ngay lập tức mà không cần gọi điện.", 
                n: "02", 
                icon: <Sparkles size={28} />,
                colorClass: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 border-purple-100 dark:border-purple-900/30",
                gradClass: "from-purple-500 to-pink-600"
              },
              { 
                t: "Trải nghiệm & Review", 
                d: "Theo dõi qua Camera, nhận thú cưng và chia sẻ đánh giá của bạn.", 
                n: "03", 
                icon: <Heart size={28} />,
                colorClass: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border-rose-100 dark:border-rose-900/30",
                gradClass: "from-rose-500 to-orange-500"
              }
            ].map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2, duration: 0.6, ease: "easeOut" }}
                className="relative flex flex-col items-start gap-6 group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-[36px] p-8 md:p-10 shadow-soft hover:shadow-hover transition-all duration-500 hover:-translate-y-2 overflow-hidden"
              >
                {/* Big decorative step number */}
                <div className="absolute -bottom-6 -right-4 text-9xl font-black text-slate-100 dark:text-slate-800/35 select-none opacity-40 group-hover:scale-110 group-hover:opacity-60 transition-all duration-500 pointer-events-none font-display">
                  {step.n}
                </div>

                {/* Top Row: Icon Container and Small Badge */}
                <div className="flex items-center justify-between w-full relative z-10">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-sm ${step.colorClass}`}>
                    {step.icon}
                  </div>
                  <span className="text-[11px] font-black tracking-widest text-slate-400 dark:text-slate-500 uppercase">
                    Bước {step.n}
                  </span>
                </div>

                {/* Text Content */}
                <div className="space-y-3 relative z-10 mt-4">
                  <h4 className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-primary dark:group-hover:text-indigo-400 transition-colors duration-300">
                    {step.t}
                  </h4>
                  <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed text-sm max-w-[90%]">
                    {step.d}
                  </p>
                </div>

                {/* Bottom line hover effect */}
                <div className={`absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r ${step.gradClass} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-slate-50/50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-[60px] overflow-hidden bg-gradient-to-br from-primary to-blue-500 p-12 md:p-24 lg:p-28 text-center shadow-[0_40px_80px_-20px_rgba(59,130,246,0.5)] border border-white/20"
          >
            {/* Decorative background shapes */}
            <div className="absolute top-0 left-0 w-full h-full bg-mesh opacity-30 mix-blend-overlay" />
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/20 rounded-full blur-[80px]" />
            <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-400/30 rounded-full blur-[80px]" />
            
            <motion.div 
              animate={{ y: [-10, 10, -10], rotate: [0, 5, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-12 left-12 md:top-24 md:left-24 text-white/10 hidden md:block"
            >
              <Heart size={120} className="fill-current" />
            </motion.div>
            <motion.div 
              animate={{ y: [10, -10, 10], rotate: [0, -5, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-12 right-12 md:bottom-24 md:right-24 text-white/10 hidden md:block"
            >
              <Sparkles size={100} />
            </motion.div>
            
            <div className="relative z-10 max-w-4xl mx-auto space-y-8 md:space-y-10">
              <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/10 text-white border border-white/20 font-bold text-sm mb-2 backdrop-blur-md shadow-lg">
                <Sparkles size={16} className="text-blue-200" /> Sẵn sàng bắt đầu?
              </div>
              
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight">
                Bắt đầu hành trình <br className="hidden md:block" />
                chăm sóc <span className="text-gradient">tuyệt vời nhất.</span>
              </h2>
              
              <p className="text-xl md:text-2xl text-white/90 font-medium leading-relaxed max-w-2xl mx-auto">
                Hàng ngàn chủ nuôi đã tin tưởng PetEye. Hãy để chúng tôi đồng hành cùng bạn và bé yêu ngay hôm nay.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8">
                <button 
                  onClick={() => navigate('/register')}
                  className="w-full sm:w-auto px-10 py-5 bg-white text-primary rounded-full font-black shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all text-lg flex items-center justify-center gap-3 group"
                >
                  ĐĂNG KÝ NGAY
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={() => navigate('/search')}
                  className="w-full sm:w-auto px-10 py-5 bg-white/10 text-white rounded-full font-black backdrop-blur-md border border-white/30 hover:bg-white/20 hover:border-white/50 transition-all text-lg flex items-center justify-center gap-3 group"
                >
                  <Search size={20} className="text-white/70 group-hover:text-white transition-colors" />
                  TÌM KIẾM CƠ SỞ
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
