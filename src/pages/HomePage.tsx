import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { petService } from '../services/pet.service';
import { bookingService } from '../services/booking.service';
import { shopService, ShopPublicResponse } from '../services/shop.service';
import type { Pet } from '../types';
import type { BookingResponse } from '../types/api';
import Footer from '../components/Footer';

export default function HomePage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [pets, setPets] = useState<Pet[]>([]);
    const [bookings, setBookings] = useState<BookingResponse[]>([]);
    const [shops, setShops] = useState<ShopPublicResponse[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!user?.id) return;
            try {
                const [petsData, bookingsData, shopsData] = await Promise.all([
                    petService.getByOwner(Number(user.id)),
                    bookingService.getMyBookings(),
                    shopService.searchPublic()
                ]);
                setPets(petsData || []);
                setBookings(bookingsData || []);
                setShops(shopsData || []);
            } catch (error) {
                console.error("Error fetching homepage data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Chào buổi sáng';
        if (hour < 18) return 'Chào buổi chiều';
        return 'Chào buổi tối';
    };

    // Find the closest upcoming booking
    const upcomingBooking = bookings
        .filter(b => b.status === 'PENDING' || b.status === 'CONFIRMED' || b.status === 'PAID')
        .sort((a, b) => new Date(a.appointmentDatetime).getTime() - new Date(b.appointmentDatetime).getTime())[0];

    const recentBookings = bookings
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3);

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' }) + ' - ' +
               date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    const formatStatus = (status: string) => {
        switch (status) {
            case 'PENDING': return { text: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', dot: 'bg-yellow-500' };
            case 'CONFIRMED': return { text: 'Đã xác nhận', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', dot: 'bg-blue-500' };
            case 'PAID': return { text: 'Đã thanh toán', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', dot: 'bg-blue-500' };
            case 'COMPLETED': return { text: 'Hoàn thành', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', dot: 'bg-green-500' };
            case 'CANCELLED': return { text: 'Đã hủy', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', dot: 'bg-red-500' };
            default: return { text: status, color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300', dot: 'bg-slate-500' };
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-body pb-20">
            {/* Hero Section */}
            <section className="pt-8 pb-12 px-6 md:px-12 lg:px-20 relative overflow-hidden">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 items-center relative z-10">
                    {/* Left: Greeting & Quick Actions */}
                    <div className="space-y-8">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">
                                {getGreeting()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">{user?.name?.split(' ')[0] || 'bạn'}! 👋</span>
                            </h1>
                            <p className="text-lg text-slate-500 dark:text-slate-400">Hôm nay bé cưng của bạn cần gì?</p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <button onClick={() => navigate('/search?type=CLINIC')} className="flex flex-col items-center justify-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all group">
                                <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-2xl">medical_services</span>
                                </div>
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Khám bệnh</span>
                            </button>
                            <button onClick={() => navigate('/search?type=SPA')} className="flex flex-col items-center justify-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md hover:border-pink-300 dark:hover:border-pink-600 transition-all group">
                                <div className="w-12 h-12 rounded-full bg-pink-50 dark:bg-pink-900/30 flex items-center justify-center text-pink-600 dark:text-pink-400 group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-2xl">content_cut</span>
                                </div>
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Spa & Groom</span>
                            </button>
                            <button onClick={() => navigate('/search?type=HOTEL')} className="flex flex-col items-center justify-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md hover:border-orange-300 dark:hover:border-orange-600 transition-all group">
                                <div className="w-12 h-12 rounded-full bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-2xl">hotel</span>
                                </div>
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Lưu trú</span>
                            </button>
                            <button onClick={() => navigate('/camera')} className="flex flex-col items-center justify-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md hover:border-purple-300 dark:hover:border-purple-600 transition-all group">
                                <div className="w-12 h-12 rounded-full bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-2xl">videocam</span>
                                </div>
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Camera</span>
                            </button>
                        </div>
                    </div>

                    {/* Right: Upcoming Booking */}
                    <div className="bg-gradient-to-br from-primary to-blue-600 dark:from-slate-800 dark:to-slate-900 p-1 rounded-3xl shadow-xl shadow-primary/20">
                        <div className="bg-white dark:bg-slate-800 rounded-[22px] p-6 h-full flex flex-col relative overflow-hidden">
                            <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/5 dark:bg-primary/10 rounded-full blur-2xl pointer-events-none"></div>
                            
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">event_available</span>
                                Lịch hẹn sắp tới
                            </h3>

                            {upcomingBooking ? (
                                <div className="flex flex-col flex-1 justify-between">
                                    <div>
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <p className="text-xl font-black text-slate-900 dark:text-white mb-1">{upcomingBooking.shopName}</p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[16px]">pets</span>
                                                    {upcomingBooking.petName} • {upcomingBooking.serviceName}
                                                </p>
                                            </div>
                                            <div className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-md text-[10px] font-bold uppercase flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                                Sắp diễn ra
                                            </div>
                                        </div>
                                        
                                        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 flex items-center gap-4 mb-6">
                                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex flex-col items-center justify-center text-primary">
                                                <span className="text-sm font-bold leading-none">{new Date(upcomingBooking.appointmentDatetime).getDate()}</span>
                                                <span className="text-[10px] font-semibold uppercase">Th {new Date(upcomingBooking.appointmentDatetime).getMonth() + 1}</span>
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 dark:text-white">{new Date(upcomingBooking.appointmentDatetime).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}</p>
                                                <p className="text-xs text-slate-500">Giờ hẹn</p>
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={() => navigate('/profile/bookings')} className="w-full py-3 bg-primary/10 hover:bg-primary/20 text-primary font-bold rounded-xl transition-colors text-sm">
                                        Xem chi tiết
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center flex-1 py-6 text-center space-y-4">
                                    <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-slate-300 dark:text-slate-500">
                                        <span className="material-symbols-outlined text-3xl">calendar_today</span>
                                    </div>
                                    <div>
                                        <p className="text-slate-600 dark:text-slate-300 font-medium">Bạn chưa có lịch hẹn nào sắp tới</p>
                                        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Hãy đặt lịch ngay để chăm sóc bé cưng</p>
                                    </div>
                                    <button onClick={() => navigate('/search')} className="px-6 py-2 bg-primary text-white font-bold rounded-full shadow-md hover:bg-blue-600 transition-colors text-sm">
                                        Đặt lịch ngay
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Pets Section */}
            <section className="py-8 px-6 md:px-12 lg:px-20">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">cruelty_free</span>
                            Thú cưng của bạn
                        </h2>
                        <Link to="/profile/pets" className="text-sm font-bold text-primary hover:text-blue-700 dark:hover:text-blue-400 transition-colors">
                            Quản lý
                        </Link>
                    </div>

                    <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0">
                        {pets.map(pet => (
                            <div key={pet.id} className="min-w-[200px] bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center text-center group cursor-pointer hover:border-primary/50 transition-colors" onClick={() => navigate(`/pet/${pet.id}`)}>
                                <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-700 mb-4 overflow-hidden border-2 border-transparent group-hover:border-primary transition-colors">
                                    {pet.avatar ? (
                                        <img src={pet.avatar} alt={pet.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-500 w-full h-full flex items-center justify-center">pets</span>
                                    )}
                                </div>
                                <h3 className="font-bold text-slate-900 dark:text-white">{pet.name}</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{pet.breed || pet.species || 'Chưa rõ giống'}</p>
                                <div className="mt-3 bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                    Khỏe mạnh
                                </div>
                            </div>
                        ))}
                        
                        <div onClick={() => navigate('/profile/pets')} className="min-w-[200px] border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all cursor-pointer">
                            <span className="material-symbols-outlined text-4xl mb-2">add_circle</span>
                            <span className="text-sm font-bold">Thêm thú cưng</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Promotional Banners */}
            <section className="py-8 px-6 md:px-12 lg:px-20">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-r from-blue-500 to-primary rounded-3xl p-8 relative overflow-hidden flex items-center shadow-lg">
                        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[url('https://lh3.googleusercontent.com/aida-public/AB6AXuCyfQEqfkQ2s4e6nYybasibnjjUV1GyqRbWcK0G02UgporRHapV6LvHRgior0lnSZkgTGE-T1-IYzFPa2LfGI1ZYBDW0byUacqku2RK2lRikVU90I7HuIZRKRSLH963dNuWNp-6PaiPlo_qorkTDLBR8fpFdENk6zw1r4Re38uk12VLkE6hyldUJ98oHpuA3l8nJHBjcVnHe0smDNdLG1bM43-lqu1e2FS3ZLdwHLWwBAdJjupGyXnAzLBas2bPqDoE7mXrdFfdSNWJ')] bg-cover bg-center opacity-30 mix-blend-overlay"></div>
                        <div className="relative z-10 max-w-[60%]">
                            <span className="bg-white/20 text-white px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest mb-3 inline-block">Ưu đãi</span>
                            <h3 className="text-2xl font-black text-white mb-2 leading-tight">Giảm 20% <br/>Khám tổng quát</h3>
                            <button onClick={() => navigate('/search')} className="mt-4 bg-white text-primary px-5 py-2 rounded-full font-bold text-sm hover:shadow-lg transition-all hover:scale-105">
                                Đặt ngay
                            </button>
                        </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-rose-400 to-pink-500 rounded-3xl p-8 relative overflow-hidden flex items-center shadow-lg">
                        <div className="absolute right-0 -top-10 text-white/20">
                            <span className="material-symbols-outlined text-[180px]">videocam</span>
                        </div>
                        <div className="relative z-10 max-w-[70%]">
                            <span className="bg-white/20 text-white px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest mb-3 inline-block">Tính năng</span>
                            <h3 className="text-2xl font-black text-white mb-2 leading-tight">Live Camera 24/7</h3>
                            <p className="text-white/80 text-sm">Theo dõi bé cưng mọi lúc mọi nơi</p>
                            <button onClick={() => navigate('/camera')} className="mt-4 bg-white text-pink-500 px-5 py-2 rounded-full font-bold text-sm hover:shadow-lg transition-all hover:scale-105">
                                Khám phá
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Bottom: Bookings & Clinics */}
            <section className="py-8 px-6 md:px-12 lg:px-20">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-10">
                    
                    {/* Recent Bookings */}
                    <div className="lg:col-span-1">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Lịch hẹn gần đây</h2>
                            <Link to="/profile/bookings" className="text-sm font-bold text-primary hover:underline">Tất cả</Link>
                        </div>
                        <div className="space-y-4">
                            {recentBookings.length > 0 ? recentBookings.map(booking => {
                                const statusInfo = formatStatus(booking.status);
                                return (
                                    <div key={booking.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h4 className="font-bold text-slate-800 dark:text-white line-clamp-1">{booking.shopName}</h4>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{formatDateTime(booking.appointmentDatetime)}</p>
                                            </div>
                                            <div className={`${statusInfo.dot} w-2.5 h-2.5 rounded-full mt-1.5 shrink-0`} title={statusInfo.text}></div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500">
                                                    <span className="material-symbols-outlined text-[14px]">pets</span>
                                                </div>
                                                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{booking.petName}</span>
                                            </div>
                                            <button onClick={() => navigate('/profile/bookings')} className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors">
                                                Chi tiết
                                            </button>
                                        </div>
                                    </div>
                                )
                            }) : (
                                <div className="text-center py-10 bg-slate-100 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 border-dashed">
                                    <p className="text-sm text-slate-500">Chưa có lịch hẹn nào</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Nearby Shops (Mocked logic for now) */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Cơ sở nổi bật</h2>
                            <Link to="/search" className="text-sm font-bold text-primary hover:underline">Xem thêm</Link>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {shops.slice(0, 4).map(shop => (
                                <div key={shop.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex gap-4 hover:shadow-md transition-shadow group cursor-pointer" onClick={() => navigate(`/clinic/${shop.id}`)}>
                                    <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 relative">
                                        <img src={shop.logoUrl || "https://placehold.co/150x150/e2e8f0/64748b?text=Shop"} alt={shop.shopName} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                        {/* Mock Live Cam Badge */}
                                        {shop.id % 2 === 0 && (
                                            <div className="absolute top-1 right-1 bg-rose-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase flex items-center gap-0.5 shadow-sm">
                                                <span className="w-1 h-1 bg-white rounded-full animate-pulse"></span>
                                                Live
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                        <h4 className="font-bold text-slate-900 dark:text-white truncate">{shop.shopName}</h4>
                                        <div className="flex items-center gap-1 mt-1 mb-2">
                                            <span className="material-symbols-outlined text-[14px] text-yellow-400">star</span>
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{shop.ratingAvg || 5.0}</span>
                                            <span className="text-xs text-slate-400 truncate ml-1">• {shop.address}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">{shop.shopType}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {shops.length === 0 && (
                                <div className="sm:col-span-2 text-center py-10 bg-slate-100 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 border-dashed">
                                    <p className="text-sm text-slate-500">Chưa có dữ liệu cơ sở</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </section>
        </div>
    );
}
