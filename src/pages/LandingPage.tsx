import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Video, Star, ArrowRight, CheckCircle2, PawPrint } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';

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
    <main className="flex-1">
      <section id="hero" className="px-6 md:px-12 lg:px-20 py-16 md:py-24 relative overflow-hidden">
        <div className="pattern-dots absolute inset-0 opacity-40 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10">
          <div className="flex flex-col gap-8 order-2 lg:order-1">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-white dark:bg-slate-800 border border-primary/20 text-primary px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm w-fit">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                Nền tảng B2B2C Thú y số 1
              </div>
              <h1 className="text-slate-900 dark:text-white text-5xl md:text-6xl font-black leading-[1.1] tracking-tight">
                Tìm kiếm &amp; Đặt lịch <br />
                {/* <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary pr-2">cơ sở thú y <br/> </span> */}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary pr-2">  cơ sở thú y uy tín<br />
                  gần bạn
                  <br /> </span>
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed max-w-xl">
                Kết nối ngay với hàng ngàn phòng khám, spa và dịch vụ lưu trú chất lượng cao. So sánh giá, xem đánh giá thực tế và đặt lịch chỉ trong vài giây.
              </p>
            </div>
            <div className="bg-white dark:bg-card-dark p-2 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 mt-2">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                <div className="md:col-span-4 relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-slate-400">location_on</span>
                  </div>
                  <input className="block w-full pl-10 pr-3 py-3 border-none rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary sm:text-sm" placeholder="Địa điểm (Quận, TP)" type="text" />
                </div>
                <div className="md:col-span-3 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-slate-400">category</span>
                  </div>
                  <select className="block w-full pl-10 pr-8 py-3 border-none rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary sm:text-sm appearance-none">
                    <option>Loại dịch vụ</option>
                    <option>Khám chữa bệnh</option>
                    <option>Lưu trú</option>
                    <option>Spa &amp; Grooming</option>
                    <option>Tiêm chủng</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <span className="material-symbols-outlined text-slate-400 text-sm">expand_more</span>
                  </div>
                </div>
                <div className="md:col-span-3 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-slate-400">pets</span>
                  </div>
                  <select className="block w-full pl-10 pr-8 py-3 border-none rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary sm:text-sm appearance-none">
                    <option>Loại thú cưng</option>
                    <option>Chó</option>
                    <option>Mèo</option>
                    <option>Khác</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <span className="material-symbols-outlined text-slate-400 text-sm">expand_more</span>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <button
                    onClick={() => handleAction('/search')}
                    className="w-full h-full bg-primary hover:bg-primary-dark text-white rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2 py-3 md:py-0">
                    <span className="material-symbols-outlined">search</span>
                    Tìm
                  </button>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6 pt-4 mt-4">
              <div className="flex -space-x-4">
                <div className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-900 bg-slate-300 shadow-sm"></div>
                <div className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-900 bg-slate-400 shadow-sm"></div>
                <div className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-900 bg-slate-500 shadow-sm"></div>
                <div className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-900 bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shadow-sm backdrop-blur-sm">+2k</div>
              </div>
              <div>
                <p className="text-slate-900 dark:text-white font-bold text-sm"><span className="text-primary">2,000+</span> Cơ sở thú y đã tham gia</p>
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2 relative">
            <span className="material-symbols-outlined absolute -top-8 -right-8 text-6xl text-primary/20 rotate-12 animate-bounce" style={{ animationDuration: "3s" }}>pets</span>
            <span className="material-symbols-outlined absolute bottom-10 -left-10 text-5xl text-secondary/20 -rotate-12 animate-pulse">cruelty_free</span>
            <div className="relative z-10 mx-auto w-full max-w-lg aspect-[4/5] md:aspect-square lg:aspect-[4/5]">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary to-secondary rounded-[3rem] rotate-6 opacity-20 transform translate-x-4 translate-y-4"></div>
              <div className="absolute inset-0 bg-white dark:bg-slate-800 rounded-[3rem] -rotate-3 shadow-2xl opacity-80 border border-slate-100 dark:border-slate-700"></div>
              <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-transform duration-500 bg-slate-200">
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuB3gE7pymHHNoJ8Eenc8IeK8BG_yCIednl0G3KL6VAv3-N9WBdyY2mWJktpO0M1-QP6fDMWBhbs6AdV3PKG7H2hYbqE7iPVy9Cz5KKwbTL-A7tvX7i51PfC5o0Kkpl2P7cfy1hPZoW6gSv1ovEXyniXWKLpffQtESWWqeNk_B6x1GZNbC4qKZaGzXsvEu5DxI4tJ-sxcmLV9saz6gO6bCRVRluMjYmd9bJQVY2rw7L02jx3vTqOSFtE8F3l4NcA8eYLH-J-knoworrm")` }}>
                </div>
                <div className="absolute bottom-6 left-6 right-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/50 flex items-center gap-4 animate-fade-in-up">
                  <div className="bg-green-100 text-green-600 p-2 rounded-xl">
                    <span className="material-symbols-outlined">verified_user</span>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">Đối tác đã xác thực</p>
                    <p className="text-xs text-slate-500">Thông tin minh bạch 100%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section id="co-so" className="bg-slate-50 dark:bg-slate-900/50 px-6 md:px-12 lg:px-20 py-24 relative">
        <div className="absolute top-20 left-10 text-slate-200 dark:text-slate-800 opacity-50 rotate-[-15deg]">
          <span className="material-symbols-outlined text-9xl">pets</span>
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16 space-y-4 max-w-2xl mx-auto">
            <h2 className="text-primary font-bold tracking-widest uppercase text-sm bg-primary/10 w-fit mx-auto px-3 py-1 rounded-full">Gợi ý hàng đầu</h2>
            <h3 className="text-slate-900 dark:text-white text-4xl md:text-5xl font-black tracking-tight leading-tight ">Cơ sở thú y &amp; Dịch vụ <br /><span className="text-transparent 
                 bg-clip-text 
                 bg-gradient-to-r 
                 from-primary 
                 to-secondary">
              được yêu thích nhất
            </span></h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8"><div className="md:col-span-2 group cursor-pointer relative overflow-hidden rounded-3xl h-[500px]"><img alt="Clinic Main" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6oXx_u1YVkdtHjYoh6Uu-kfGetga5JcROKee0xBg0hPSb0nHqmv9q1JJu8YROnoKvG5Rd_bysvhxgJTHT8gH8C1Llbpf5--FuheT1Dc9hv4rtG8lTcWHtEGUjbj2MpdlQP2hpldAuE40DUdWZ5Z7eM4tObng5CiSzz7ne0hg8w9405R8Wc2x5clkCvRirQBvDr-ensgay-LOftIuu8I5VwOc7-thTZBLPKZN7Bm_3uz0oHqruBNy2vs0BxZyVnMQweUikfcPmoio6" /><div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div><div className="absolute bottom-8 left-8 text-white"><h4 className="text-2xl font-bold mb-2">Phòng khám PetCare Center</h4><p className="flex items-center gap-2 text-sm opacity-90"><span className="material-symbols-outlined text-sm">location_on</span> Quận 3, TP.HCM</p></div><div className="absolute top-6 left-6 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-primary text-xs font-bold">Nổi bật</div><div className="absolute top-6 right-6 bg-secondary text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg"><span className="material-symbols-outlined text-sm">videocam</span> LIVE CAM</div></div><div className="flex flex-col gap-8"><div className="group cursor-pointer relative overflow-hidden rounded-3xl h-[234px]"><img alt="Spa" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCvn1YtjFBMSi4BphgW3hjCSM6BCxf1oce1KeKpXttIwyWe48GkVnDpaLzr_bNQaMzsvLy5p2nPC9HmtWou4i3TVlf_Nelmpv5cNPy104dfmz7Rl95wzFUKvCtsoUl1DpmVw5daIRIyBCWWTUR0uGC1J_e6BZxYxOYJpXgBLI88T7WZ9-2H6HRISfkBhXXtPLueH3-WefnxIcv9glH9oUKN8KkpTYnRgRhevVVNoHGtPeaU6uk6xH4Lv3anZqKWG7UIks1wxxFzj8PR" /><div className="absolute inset-0 bg-black/20"></div><div className="absolute bottom-6 left-6 text-white"><h4 className="text-lg font-bold">Happy Paws Spa</h4></div></div><div className="group cursor-pointer relative overflow-hidden rounded-3xl h-[234px]"><img alt="Saigon Vet" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAsGAK-5F_vJwGvWXgRo6_kZwaYacit8LWb4QQfRBlZGt_wA_cq9gJFqPZdsR9mlQuErE2dFpjpOMLfBvr1BNomlaCYcq4Tw9HEfWScR2Vrx6C8qOfhNv69Ase7UkBfozjR-LpeW-k6RCQfzqP90asSMtvCppGS7_nktV4ODNBXx12BlIb3NrwIgAVMWGPgQ5-bDty1cGAbHN4Nhc3gdQVbyPo2U9Hw6aJNN80N-7TEqIvc8U_dv7QAK3L7yCYDWz6_RhmhFzeL0Vhn" /><div className="absolute inset-0 bg-black/20"></div><div className="absolute bottom-6 left-6 text-white"><h4 className="text-lg font-bold">Saigon Vet Hospital</h4></div></div></div></div>
          <div className="mt-12 text-center">
            <button onClick={() => handleAction('/search')} className="inline-flex items-center gap-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-8 py-3 rounded-full font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
              Xem tất cả cơ sở
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
      </section>
      <section id="camera" className="relative overflow-hidden bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-900 dark:to-slate-800 px-6 md:px-12 lg:px-20 py-24">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl opacity-20 blur-xl group-hover:opacity-30 transition duration-500"></div>
              <div className="relative bg-white dark:bg-slate-800 border-[8px] border-slate-200 dark:border-slate-700 rounded-3xl shadow-2xl overflow-hidden aspect-video">
                <div className="absolute top-0 left-0 right-0 h-10 bg-slate-100 dark:bg-slate-900 flex items-center px-4 gap-2 border-b border-slate-200 dark:border-slate-700">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  <div className="mx-auto text-xs font-mono text-slate-400">Live Camera - Peteye</div>
                </div>
                <div className="w-full h-full pt-10 relative bg-slate-900">
                  <img alt="Live Camera Interface with happy dog playing" className="w-full h-full object-cover opacity-90" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB9-35MViKaTiKljoxOmZsNMQsboCLHaLrz2PUbxxOI80nLHSGmxaJKNAn8X_0gGNjQEcBvSfGr4_e_mJZySSPXSbNUVQapgf9fCy_2R-inc7_nRiBJFVRuhVPO0nlXZaaRWq-H6Cu2UgqjqAL0L30F8l1U1EaZOqnDed3AdG17Ry_vWTMGgSrKdG6L4uYXOs2BKFVjimLyV9_9UuVVlBgnVADeX6s03BDtyEy-R6P8imZf_DNIRUDCYhPHK2pZZkQesoQZJTT_NWn3" />
                  <div className="absolute top-14 right-4 bg-secondary text-white text-[10px] font-bold px-3 py-1.5 rounded-full animate-pulse flex items-center gap-1 shadow-lg"><span className="w-2 h-2 rounded-full bg-white"></span> LIVE CAM</div>
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                    <div className="bg-black/50 backdrop-blur-sm p-2 rounded-lg text-white text-xs">
                      <p className="font-bold">Lucky - Golden Retriever</p>
                      <p className="opacity-70">Phòng Deluxe 102 • Happy Paws Spa</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-sm transition">
                        <span className="material-symbols-outlined text-sm">mic</span>
                      </button>
                      <button className="p-2 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-sm transition">
                        <span className="material-symbols-outlined text-sm">videocam</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2 space-y-8">
              <div>
                <span className="inline-flex items-center gap-2 bg-secondary/20 text-secondary px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                  <span className="material-symbols-outlined text-sm">videocam</span>
                  Tính năng mới
                </span>
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight mb-4">
                  An tâm tuyệt đối với <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Live Camera 24/7</span>
                </h2>
                <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                  Độc quyền tại Peteye - Kết nối trực tiếp với thú cưng của bạn mọi lúc, mọi nơi khi gửi tại các đối tác có hỗ trợ camera của chúng tôi.
                </p>
              </div>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="flex gap-4 items-start">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined">hd</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-1">Hình ảnh HD sắc nét</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Chất lượng hình ảnh cao, rõ nét cả ngày lẫn đêm.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined">record_voice_over</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-1">Đàm thoại 2 chiều</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Trò chuyện và gọi tên bé cưng từ xa dễ dàng.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-12 h-12 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined">gpp_good</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-1">Bảo mật tuyệt đối</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Kết nối riêng tư, chỉ bạn mới có quyền truy cập.</p>
                  </div>
                </div>
              </div>
              <div className="pt-4">
                <button onClick={() => handleAction('/home')} className="bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-primary/30 text-white px-8 py-4 rounded-full font-bold transition-all hover:-translate-y-1 flex items-center gap-2 group w-fit">
                  Tìm cơ sở có Camera
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="px-6 md:px-12 lg:px-20 py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24 space-y-4">
            <h3 className="text-4xl md:text-5xl font-black  leading-tight md:leading-[1.3] text-transparent bg-clip-text bg-gradient-to-r from-black to-secondary ">
              Quy trình kết nối
            </h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto text-lg">Cách Peteye kết nối bạn với dịch vụ tốt nhất</p>
          </div>
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 z-0">
              <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
                <path d="M0,0 Q150,50 300,0 T600,0" fill="none" stroke="url(#gradient-line)" strokeDasharray="8 8" strokeWidth="2"></path>
                <defs>
                  <linearGradient id="gradient-line" x1="0%" x2="100%" y1="0%" y2="0%">
                    <stop offset="0%" stopColor="#0ea5e9"></stop>
                    <stop offset="100%" stopColor="#f472b6"></stop>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="relative flex flex-col items-center text-center gap-6 z-10 group">
              <div className="w-24 h-24 rounded-full bg-white dark:bg-slate-800 border-4 border-primary/20 group-hover:border-primary flex items-center justify-center shadow-lg transition-all duration-300 group-hover:-translate-y-2">
                <span className="text-4xl material-symbols-outlined text-primary">travel_explore</span>
                <div className="absolute -right-2 -top-2 bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 border-white dark:border-slate-800">1</div>
              </div>
              <div className="space-y-3 px-4">
                <h4 className="text-xl font-bold text-slate-900 dark:text-white">Tìm &amp; So sánh</h4>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">Tìm kiếm theo vị trí, xem giá cả và đánh giá từ cộng đồng.</p>
              </div>
            </div>
            <div className="relative flex flex-col items-center text-center gap-6 z-10 group">
              <div className="w-24 h-24 rounded-full bg-white dark:bg-slate-800 border-4 border-secondary/20 group-hover:border-secondary flex items-center justify-center shadow-lg transition-all duration-300 group-hover:-translate-y-2">
                <span className="text-4xl material-symbols-outlined text-secondary">event_available</span>
                <div className="absolute -right-2 -top-2 bg-secondary text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 border-white dark:border-slate-800">2</div>
              </div>
              <div className="space-y-3 px-4">
                <h4 className="text-xl font-bold text-slate-900 dark:text-white">Đặt lịch trực tuyến</h4>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">Chọn khung giờ phù hợp và đặt lịch hẹn ngay lập tức.</p>
              </div>
            </div>
            <div className="relative flex flex-col items-center text-center gap-6 z-10 group">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center shadow-lg shadow-primary/40 transition-all duration-300 group-hover:-translate-y-2 group-hover:scale-110">
                <span className="material-symbols-outlined text-4xl animate-pulse">reviews</span>
                <div className="absolute -right-2 -top-2 bg-slate-900 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 border-white dark:border-slate-800">3</div>
              </div>
              <div className="space-y-3 px-4">
                <h4 className="text-xl font-bold text-slate-900 dark:text-white">Trải nghiệm &amp; Đánh giá</h4>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">Sử dụng dịch vụ và chia sẻ trải nghiệm thực tế của bạn.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section id="ly-do" className="bg-primary/5 dark:bg-slate-900/80 px-6 md:px-12 lg:px-20 py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h3 className="text-4xl md:text-5xl font-black  leading-tight md:leading-[1.3] text-transparent bg-clip-text bg-gradient-to-r from-black to-secondary mb-3 ">
              Tại sao chọn Peteye?
            </h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto text-lg">Giá trị mang lại cho cả hai phía</p>
          </div>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-white dark:bg-card-dark p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-accent/30 dark:bg-slate-800 rounded-full opacity-50"></div>
              <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className="w-12 h-12 bg-accent/50 text-primary rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined">person</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Dành cho Chủ nuôi</h3>
              </div>
              <ul className="space-y-4 relative z-10">
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-green-500 mt-1">check_circle</span>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Minh bạch giá cả</h4>
                    <p className="text-sm text-slate-500">So sánh bảng giá dịch vụ công khai từ các cơ sở.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-green-500 mt-1">check_circle</span>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Review thật 100%</h4>
                    <p className="text-sm text-slate-500">Xem đánh giá từ những người dùng đã trải nghiệm thực tế.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-green-500 mt-1">check_circle</span>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Đặt lịch nhanh chóng</h4>
                    <p className="text-sm text-slate-500">Không cần gọi điện, đặt lịch 24/7 qua nền tảng.</p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="bg-white dark:bg-card-dark p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-secondary/10 dark:bg-slate-800 rounded-full opacity-50"></div>
              <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className="w-12 h-12 bg-secondary/20 text-secondary rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined">storefront</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Dành cho Cơ sở thú y</h3>
              </div>
              <ul className="space-y-4 relative z-10">
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-green-500 mt-1">check_circle</span>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Tiếp cận khách hàng mới</h4>
                    <p className="text-sm text-slate-500">Mở rộng phạm vi tiếp cận tới hàng ngàn chủ nuôi tiềm năng.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-green-500 mt-1">check_circle</span>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Quản lý dễ dàng</h4>
                    <p className="text-sm text-slate-500">Hệ thống quản lý lịch hẹn, hồ sơ khách hàng chuyên nghiệp.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-green-500 mt-1">check_circle</span>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Tăng uy tín thương hiệu</h4>
                    <p className="text-sm text-slate-500">Được chứng thực và đề xuất trên nền tảng uy tín.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      <section id="cong-dong" className="bg-white dark:bg-slate-900 px-6 md:px-12 lg:px-20 py-24 overflow-hidden relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight text-slate-900 dark:text-white italic ">Cộng đồng yêu thú cưng  <br /><span className="text-primary text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">tin tưởng chúng tôi</span></h2>
              <div className="space-y-6">
                <div className="bg-slate-50 dark:bg-card-dark p-8 rounded-3xl shadow-soft hover:shadow-hover transition-all duration-300 relative group">
                  <span className="absolute top-8 left-6 text-6xl text-primary/10 font-serif leading-none">"</span>
                  <div className="relative z-10 pl-6">
                    <p className="text-slate-600 dark:text-slate-300 mb-6 text-lg italic leading-relaxed">"Tìm được phòng khám 24/7 ngay gần nhà lúc nửa đêm nhờ Peteye. Ứng dụng cứu cánh thực sự cho những người nuôi mèo như mình."</p>
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-primary shadow-md">
                        <img
                          src="https://i.pravatar.cc/150?img=5"
                          alt="Minh Anh"
                          className="w-full h-full object-cover"
                        />
                      </div>                      <div>
                        <h5 className="font-bold text-slate-900 dark:text-white">Minh Anh</h5>
                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Chủ nuôi Mèo</p>
                      </div>
                      <div className="ml-auto flex text-yellow-400">
                        <span className="material-symbols-outlined text-sm">star</span>
                        <span className="material-symbols-outlined text-sm">star</span>
                        <span className="material-symbols-outlined text-sm">star</span>
                        <span className="material-symbols-outlined text-sm">star</span>
                        <span className="material-symbols-outlined text-sm">star</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-card-dark p-8 rounded-3xl shadow-soft hover:shadow-hover transition-all duration-300 relative group ml-8 opacity-90 hover:opacity-100">
                  <span className="absolute top-8 left-6 text-6xl text-primary/10 font-serif leading-none">"</span>
                  <div className="relative z-10 pl-6">
                    <p className="text-slate-600 dark:text-slate-300 mb-6 text-lg italic leading-relaxed">"Hệ thống quản lý lịch hẹn của Peteye giúp phòng khám của tôi giảm thiểu tình trạng khách quên lịch và tối ưu hóa thời gian làm việc."</p>
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-secondary shadow-md">
                        <img
                          src="https://randomuser.me/api/portraits/men/32.jpg"
                          alt="Doctor Hoàng Nam"
                          className="w-full h-full object-cover"
                        />
                      </div>                      <div>
                        <h5 className="font-bold text-slate-900 dark:text-white">Dr. Hoàng Nam</h5>
                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Phòng khám PetHealth</p>
                      </div>
                      <div className="ml-auto flex text-yellow-400">
                        <span className="material-symbols-outlined text-sm">star</span>
                        <span className="material-symbols-outlined text-sm">star</span>
                        <span className="material-symbols-outlined text-sm">star</span>
                        <span className="material-symbols-outlined text-sm">star</span>
                        <span className="material-symbols-outlined text-sm">star</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-12">
              <div className="text-center lg:text-left">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Đối tác chiến lược</h4>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Mạng lưới phòng khám hàng đầu</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                <div className="h-24 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center font-bold text-slate-400 hover:text-primary hover:shadow-lg transition-all duration-300 cursor-pointer group">
                  <span className="group-hover:scale-110 transition-transform">VetCity</span>
                </div>
                <div className="h-24 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center font-bold text-slate-400 hover:text-primary hover:shadow-lg transition-all duration-300 cursor-pointer group">
                  <span className="group-hover:scale-110 transition-transform">PawCare</span>
                </div>
                <div className="h-24 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center font-bold text-slate-400 hover:text-primary hover:shadow-lg transition-all duration-300 cursor-pointer group">
                  <span className="group-hover:scale-110 transition-transform">HappyTail</span>
                </div>
                <div className="h-24 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center font-bold text-slate-400 hover:text-primary hover:shadow-lg transition-all duration-300 cursor-pointer group">
                  <span className="group-hover:scale-110 transition-transform">PetHealth</span>
                </div>
                <div className="h-24 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center font-bold text-slate-400 hover:text-primary hover:shadow-lg transition-all duration-300 cursor-pointer group">
                  <span className="group-hover:scale-110 transition-transform">ZooVet</span>
                </div>
                <div className="h-24 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center font-bold text-slate-400 hover:text-primary hover:shadow-lg transition-all duration-300 cursor-pointer group">
                  <span className="group-hover:scale-110 transition-transform">LittleHome</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
