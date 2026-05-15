import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { petService } from '../services/pet.service';
import { bookingService } from '../services/booking.service';
import { shopService, ShopPublicResponse } from '../services/shop.service';
import type { Pet } from '../types';
import type { ServiceResponse, BookingResponse } from '../types/api';
import { reviewService, ReviewResponse } from '../services/review.service';

// Mock reviews for homepage
const MOCK_REVIEWS = [
    {
        id: 1,
        userName: "Thanh Hằng",
        userAvatar: "https://i.pravatar.cc/150?u=1",
        petName: "Bé Lu",
        rating: 5,
        comment: "Dịch vụ spa ở Pet Eye Test Shop cực kỳ chuyên nghiệp. Bé Lu về nhà thơm tho và rất vui vẻ!",
        date: "2 ngày trước"
    },
    {
        id: 2,
        userName: "Minh Quân",
        userAvatar: "https://i.pravatar.cc/150?u=2",
        petName: "Mimi",
        rating: 5,
        comment: "Phòng khám sạch sẽ, bác sĩ tư vấn rất tận tâm. Tôi rất yên tâm khi gửi Mimi ở đây.",
        date: "1 tuần trước"
    },
    {
        id: 3,
        userName: "Ngọc Lan",
        userAvatar: "https://i.pravatar.cc/150?u=3",
        petName: "Gấu",
        rating: 4,
        comment: "Hệ thống Live Camera rất nét, xem được bé Gấu mọi lúc nên tôi đi du lịch rất thoải mái.",
        date: "3 ngày trước"
    }
];

export default function HomePage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [pets, setPets] = useState<Pet[]>([]);
    const [bookings, setBookings] = useState<BookingResponse[]>([]);
    const [shops, setShops] = useState<ShopPublicResponse[]>([]);
    const [featuredServices, setFeaturedServices] = useState<ServiceResponse[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('Tất cả');
    const [searchTerm, setSearchTerm] = useState('');
    const [visibleCount, setVisibleCount] = useState(4);
    const [reviews, setReviews] = useState<ReviewResponse[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!user?.id) return;
            try {
                const [petsData, bookingsData, shopsData, reviewsData] = await Promise.all([
                    petService.getByOwner(Number(user.id)),
                    bookingService.getMyBookings(),
                    shopService.searchPublic(),
                    reviewService.getLatestReviews(3)
                ]);
                setPets(petsData || []);
                setBookings(bookingsData || []);
                setShops(shopsData || []);
                setReviews(reviewsData || []);

                // Fetch services for more shops to ensure category diversity
                if (shopsData && shopsData.length > 0) {
                    const topShops = shopsData.slice(0, 12);
                    const servicesPromises = topShops.map(s => shopService.getShopServices(s.id));
                    const allServicesResults = await Promise.all(servicesPromises);
                    
                    // Flatten and ensure each service has the shopName from the shop object if missing
                    const flattenedServices = allServicesResults.flatMap((services, index) => 
                        (services || []).map(service => ({
                            ...service,
                            shopName: service.shopName || topShops[index].shopName
                        }))
                    );
                    
                    setFeaturedServices(flattenedServices);
                }
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

    const formatRelativeTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
        
        if (diffInSeconds < 60) return 'Vừa xong';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
        if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
        return date.toLocaleDateString('vi-VN');
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

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-body pb-20 overflow-x-hidden">
            {/* Hero Section */}
            <section className="pt-8 pb-12 px-6 md:px-12 lg:px-20 relative overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute top-1/2 -right-24 w-64 h-64 bg-secondary/5 rounded-full blur-3xl pointer-events-none"></div>

                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 items-center relative z-10">
                    {/* Left: Greeting & Quick Actions */}
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="space-y-8"
                    >
                        <div>
                            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">
                                {getGreeting()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">{user?.name?.split(' ')[0] || 'bạn'}! 👋</span>
                            </h1>
                            <p className="text-lg text-slate-500 dark:text-slate-400">Hôm nay bé cưng của bạn cần gì?</p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <motion.button 
                                whileHover={{ scale: 1.05, y: -5 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/search?type=CLINIC')} 
                                className="flex flex-col items-center justify-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-300 dark:hover:border-blue-600 transition-all group"
                            >
                                <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                                    <span className="material-symbols-outlined text-2xl">medical_services</span>
                                </div>
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Khám bệnh</span>
                            </motion.button>

                            <motion.button 
                                whileHover={{ scale: 1.05, y: -5 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/search?type=SPA')} 
                                className="flex flex-col items-center justify-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl hover:shadow-pink-500/10 hover:border-pink-300 dark:hover:border-pink-600 transition-all group"
                            >
                                <div className="w-12 h-12 rounded-full bg-pink-50 dark:bg-pink-900/30 flex items-center justify-center text-pink-600 dark:text-pink-400 group-hover:bg-pink-600 group-hover:text-white transition-all duration-300">
                                    <span className="material-symbols-outlined text-2xl">content_cut</span>
                                </div>
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Spa & Groom</span>
                            </motion.button>

                            <motion.button 
                                whileHover={{ scale: 1.05, y: -5 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/search?type=HOTEL')} 
                                className="flex flex-col items-center justify-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl hover:shadow-orange-500/10 hover:border-orange-300 dark:hover:border-orange-600 transition-all group"
                            >
                                <div className="w-12 h-12 rounded-full bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 group-hover:bg-orange-600 group-hover:text-white transition-all duration-300">
                                    <span className="material-symbols-outlined text-2xl">hotel</span>
                                </div>
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Lưu trú</span>
                            </motion.button>

                            <motion.button 
                                whileHover={{ scale: 1.05, y: -5 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/camera')} 
                                className="flex flex-col items-center justify-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl hover:shadow-purple-500/10 hover:border-purple-300 dark:hover:border-purple-600 transition-all group"
                            >
                                <div className="w-12 h-12 rounded-full bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
                                    <span className="material-symbols-outlined text-2xl">videocam</span>
                                </div>
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Camera</span>
                            </motion.button>
                        </div>
                    </motion.div>

                    {/* Right: Upcoming Booking */}
                    <motion.div 
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="bg-gradient-to-br from-primary via-blue-500 to-secondary p-1 rounded-[32px] shadow-2xl shadow-primary/30"
                    >
                        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-[28px] p-8 h-full flex flex-col relative overflow-hidden border border-white/20">
                            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
                            
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-primary">event_available</span>
                                </div>
                                Lịch hẹn sắp tới
                            </h3>

                            {upcomingBooking ? (
                                <div className="flex flex-col flex-1 justify-between">
                                    <div className="space-y-6">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <p className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{upcomingBooking.shopName}</p>
                                                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                                    <span className="material-symbols-outlined text-[18px]">pets</span>
                                                    <span className="font-semibold">{upcomingBooking.petName}</span>
                                                    <span className="text-slate-300">•</span>
                                                    <span>{upcomingBooking.serviceName}</span>
                                                </div>
                                            </div>
                                            <div className="bg-green-500/10 text-green-600 dark:text-green-400 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center gap-2 border border-green-500/20">
                                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                                Sắp diễn ra
                                            </div>
                                        </div>
                                        
                                        <div className="bg-slate-100/50 dark:bg-slate-900/50 rounded-2xl p-5 flex items-center gap-5">
                                            <div className="w-14 h-14 bg-primary text-white rounded-2xl flex flex-col items-center justify-center shadow-lg shadow-primary/30">
                                                <span className="text-xl font-bold leading-none">{new Date(upcomingBooking.appointmentDatetime).getDate()}</span>
                                                <span className="text-[10px] font-black uppercase mt-1">TH {new Date(upcomingBooking.appointmentDatetime).getMonth() + 1}</span>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-2xl font-black text-slate-900 dark:text-white">
                                                    {new Date(upcomingBooking.appointmentDatetime).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                                                </p>
                                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Thời gian đặt lịch</p>
                                            </div>
                                        </div>
                                    </div>
                                    <motion.button 
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => navigate('/profile/bookings')} 
                                        className="w-full mt-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-2xl transition-all shadow-xl hover:shadow-2xl text-base"
                                    >
                                        Xem chi tiết lịch hẹn
                                    </motion.button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center flex-1 py-10 text-center space-y-6">
                                    <div className="relative">
                                        <div className="w-24 h-24 rounded-full bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center text-slate-200 dark:text-slate-600">
                                            <span className="material-symbols-outlined text-5xl">calendar_today</span>
                                        </div>
                                        <motion.div 
                                            animate={{ y: [0, -10, 0] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            className="absolute -top-2 -right-2 w-10 h-10 bg-white dark:bg-slate-800 rounded-full shadow-lg flex items-center justify-center text-secondary"
                                        >
                                            <span className="material-symbols-outlined text-2xl">pets</span>
                                        </motion.div>
                                    </div>
                                    <div className="max-w-[240px] mx-auto">
                                        <p className="text-slate-800 dark:text-slate-200 font-bold text-lg">Bạn chưa có lịch hẹn nào</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Hãy để PetEye giúp bạn chăm sóc bé cưng tốt nhất ngay hôm nay!</p>
                                    </div>
                                    <motion.button 
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => navigate('/search')} 
                                        className="px-8 py-3 bg-primary text-white font-black rounded-full shadow-lg shadow-primary/20 hover:bg-blue-600 transition-all text-sm"
                                    >
                                        Đặt lịch khám ngay
                                    </motion.button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Pets Section */}
            <motion.section 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="py-12 px-6 md:px-12 lg:px-20"
            >
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined text-2xl">cruelty_free</span>
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Thú cưng của bạn</h2>
                        </div>
                        <Link to="/profile/pets" className="text-sm font-bold text-primary bg-primary/5 px-4 py-2 rounded-full hover:bg-primary/10 transition-colors">
                            Quản lý hồ sơ
                        </Link>
                    </div>

                    <div className="flex overflow-x-auto gap-6 pb-6 scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0">
                        {pets.map((pet, idx) => (
                            <motion.div 
                                key={pet.id} 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                whileHover={{ y: -8 }}
                                className="min-w-[240px] bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center text-center group cursor-pointer hover:shadow-xl hover:border-primary/30 transition-all" 
                                onClick={() => navigate(`/pet/${pet.id}`)}
                            >
                                <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-700 mb-5 overflow-hidden border-4 border-white dark:border-slate-800 shadow-inner group-hover:border-primary/50 transition-all duration-500">
                                    {pet.avatar ? (
                                        <img src={pet.avatar} alt={pet.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-600">
                                            <span className="material-symbols-outlined text-5xl">pets</span>
                                        </div>
                                    )}
                                </div>
                                <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors">{pet.name}</h3>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">{pet.breed || pet.species || 'Chưa rõ giống'}</p>
                                <div className="mt-4 flex items-center gap-1.5 bg-green-500/10 text-green-600 dark:text-green-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-500/10">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                    Khỏe mạnh
                                </div>
                            </motion.div>
                        ))}
                        
                        <motion.div 
                            whileHover={{ scale: 1.02 }}
                            onClick={() => navigate('/profile/pets')} 
                            className="min-w-[240px] border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-all cursor-pointer group"
                        >
                            <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-4xl">add</span>
                            </div>
                            <span className="text-sm font-black">Thêm thú cưng</span>
                        </motion.div>
                    </div>
                </div>
            </motion.section>

            {/* Category Discovery & Featured Services Showcase */}
            <motion.section 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="py-16 px-6 md:px-12 lg:px-20 bg-white dark:bg-slate-800/30"
            >
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
                                <span className="material-symbols-outlined text-sm">auto_awesome</span>
                                Dành riêng cho bé cưng
                            </div>
                            <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">Dịch vụ nổi bật</h2>
                            <p className="text-slate-500 dark:text-slate-400 max-w-xl text-lg">Khám phá những dịch vụ được tin dùng nhất từ các đối tác uy tín của PetEye.</p>
                        </div>
                        
                        {/* Redesigned Filter & Search Section */}
                        <div className="flex flex-col gap-4 w-full lg:w-auto lg:items-end">
                            {/* Modern Search Bar */}
                            <div className="relative w-full lg:w-[450px] group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors">search</span>
                                </div>
                                <input 
                                    type="text"
                                    placeholder="Tìm nhanh dịch vụ hoặc tên Shop..."
                                    value={searchTerm || ''}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setVisibleCount(4);
                                    }}
                                    className="block w-full pl-14 pr-12 py-4 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-2xl outline-none text-sm font-bold transition-all shadow-sm group-hover:border-slate-200 dark:group-hover:border-slate-600"
                                />
                                {searchTerm && (
                                    <button 
                                        onClick={() => setSearchTerm('')}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-primary transition-all active:scale-90"
                                    >
                                        <span className="material-symbols-outlined text-lg">cancel</span>
                                    </button>
                                )}
                            </div>

                            {/* Category Filter Pills */}
                            <div className="flex overflow-x-auto gap-2 pt-2 pb-4 lg:pb-0 scrollbar-hide -mx-6 px-6 lg:mx-0 lg:px-0 scroll-smooth">
                                {['Tất cả', 'CLINIC', 'GROOMING', 'HOTEL'].map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => {
                                            setSelectedCategory(cat);
                                            setVisibleCount(4);
                                        }}
                                        className={`px-6 py-2.5 rounded-xl text-[13px] font-black transition-all duration-300 whitespace-nowrap flex items-center gap-2 border-2 flex-shrink-0 ${
                                            selectedCategory === cat
                                                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/25 translate-y-[-4px]'
                                                : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-700 hover:border-primary/30 hover:text-primary hover:translate-y-[-2px]'
                                        }`}
                                    >
                                        {cat === 'CLINIC' && <span className="material-symbols-outlined text-lg">medical_services</span>}
                                        {cat === 'GROOMING' && <span className="material-symbols-outlined text-lg">content_cut</span>}
                                        {cat === 'HOTEL' && <span className="material-symbols-outlined text-lg">hotel</span>}
                                        {cat === 'Tất cả' ? 'Tất cả' : 
                                         cat === 'CLINIC' ? 'Phòng khám' : 
                                         cat === 'GROOMING' ? 'Spa & Grooming' : 'Lưu trú'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 min-h-[400px]">
                        {featuredServices
                            .filter(s => {
                                const sCat = (s.category || '').toUpperCase();
                                const selCat = selectedCategory.toUpperCase();
                                const matchesCat = selectedCategory === 'Tất cả' || 
                                                 (selCat === 'GROOMING' && (sCat === 'GROOMING' || sCat === 'SPA')) ||
                                                 sCat === selCat;
                                const matchesSearch = (s.serviceName || '').toLowerCase().includes((searchTerm || '').toLowerCase()) || 
                                                     (s.shopName || '').toLowerCase().includes((searchTerm || '').toLowerCase());
                                return matchesCat && matchesSearch;
                            })
                            .length > 0 ? (
                            featuredServices
                                .filter(s => {
                                    const sCat = (s.category || '').toUpperCase();
                                    const selCat = selectedCategory.toUpperCase();
                                    const matchesCat = selectedCategory === 'Tất cả' || 
                                                     (selCat === 'GROOMING' && (sCat === 'GROOMING' || sCat === 'SPA')) ||
                                                     sCat === selCat;
                                    const matchesSearch = (s.serviceName || '').toLowerCase().includes((searchTerm || '').toLowerCase()) || 
                                                         (s.shopName || '').toLowerCase().includes((searchTerm || '').toLowerCase());
                                    return matchesCat && matchesSearch;
                                })
                                .slice(0, visibleCount)
                                .map((service, idx) => (
                                    <motion.div
                                        key={service.id}
                                        initial={{ opacity: 0, y: 30 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: idx * 0.1 }}
                                        whileHover={{ y: -10 }}
                                        className="bg-white dark:bg-slate-800 rounded-[40px] overflow-hidden border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-2xl hover:border-primary/20 transition-all group flex flex-col h-full"
                                    >
                                        <div className="relative aspect-[4/3] overflow-hidden">
                                            <img 
                                                src={service.imageUrl || "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80"} 
                                                alt={service.serviceName}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                            />
                                            <div className="absolute top-6 left-6">
                                                <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest backdrop-blur-md shadow-lg border border-white/20 ${
                                                    service.category?.toUpperCase() === 'CLINIC' ? 'bg-blue-500/80 text-white' :
                                                    (service.category?.toUpperCase() === 'SPA' || service.category?.toUpperCase() === 'GROOMING') ? 'bg-pink-500/80 text-white' :
                                                    'bg-orange-500/80 text-white'
                                                }`}>
                                                    {service.category}
                                                </span>
                                            </div>
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-8 backdrop-blur-[2px]">
                                                <button 
                                                    onClick={() => navigate(`/clinic/${service.shopId}`)}
                                                    className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black text-xs shadow-2xl active:scale-95 transition-all transform translate-y-4 group-hover:translate-y-0 duration-300"
                                                >
                                                    ĐẶT LỊCH NGAY
                                                </button>
                                            </div>
                                        </div>
                                        <div className="p-8 flex flex-col flex-1">
                                            <div className="flex-1 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="font-black text-slate-900 dark:text-white text-lg line-clamp-1 group-hover:text-primary transition-colors">
                                                        {service.serviceName}
                                                    </h3>
                                                </div>
                                                <div 
                                                    className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-primary cursor-pointer transition-colors"
                                                    onClick={() => navigate(`/clinic/${service.shopId}`)}
                                                >
                                                    <span className="material-symbols-outlined text-sm">storefront</span>
                                                    {service.shopName}
                                                </div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-medium">
                                                    {service.description || "Dịch vụ chăm sóc thú cưng chuyên nghiệp với đội ngũ bác sĩ tận tâm."}
                                                </p>
                                            </div>
                                            <div className="mt-6 pt-6 border-t border-slate-50 dark:border-slate-700 flex items-center justify-between">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Giá dịch vụ</span>
                                                    <span className="text-xl font-black text-slate-900 dark:text-white">
                                                        {formatCurrency(service.price)}
                                                    </span>
                                                </div>
                                                <div className="bg-yellow-400/10 text-yellow-500 p-2 rounded-xl flex items-center gap-1.5">
                                                    <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                                    <span className="text-sm font-black">5.0</span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                        ) : (
                            <div className="col-span-full py-20 bg-slate-50 dark:bg-slate-800/20 rounded-[40px] border-2 border-dashed border-slate-200 dark:border-slate-700 text-center">
                                <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                    <span className="material-symbols-outlined text-3xl text-slate-300">search_off</span>
                                </div>
                                <p className="text-slate-500 font-bold">Không tìm thấy dịch vụ nào trong danh mục này</p>
                                <button 
                                    onClick={() => setSelectedCategory('Tất cả')}
                                    className="mt-4 text-primary font-black text-sm hover:underline"
                                >
                                    Xem tất cả dịch vụ
                                </button>
                            </div>
                        )}
                    </div>

                    {/* See More Button */}
                    {featuredServices.filter(s => {
                        const sCat = (s.category || '').toUpperCase();
                        const selCat = selectedCategory.toUpperCase();
                        const matchesCat = selectedCategory === 'Tất cả' || 
                                         (selCat === 'GROOMING' && (sCat === 'GROOMING' || sCat === 'SPA')) ||
                                         sCat === selCat;
                        const matchesSearch = (s.serviceName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                                             (s.shopName || '').toLowerCase().includes(searchTerm.toLowerCase());
                        return matchesCat && matchesSearch;
                    }).length > visibleCount && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="mt-12 text-center"
                        >
                            <button 
                                onClick={() => setVisibleCount(prev => prev + 4)}
                                className="inline-flex items-center gap-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-2 border-slate-100 dark:border-slate-700 px-12 py-4 rounded-[20px] font-black hover:border-primary hover:shadow-2xl hover:shadow-primary/10 transition-all group relative overflow-hidden"
                            >
                                <span className="relative z-10">Xem thêm dịch vụ</span>
                                <span className="material-symbols-outlined relative z-10 group-hover:translate-y-1 transition-transform">expand_more</span>
                                <div className="absolute inset-0 bg-primary/5 translate-y-full group-hover:translate-y-0 transition-transform"></div>
                            </button>
                            <p className="mt-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                Đang hiển thị {Math.min(visibleCount, featuredServices.filter(s => {
                                    const sCat = (s.category || '').toUpperCase();
                                    const selCat = selectedCategory.toUpperCase();
                                    const matchesCat = selectedCategory === 'Tất cả' || 
                                                     (selCat === 'GROOMING' && (sCat === 'GROOMING' || sCat === 'SPA')) ||
                                                     sCat === selCat;
                                    const matchesSearch = (s.serviceName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                                                         (s.shopName || '').toLowerCase().includes(searchTerm.toLowerCase());
                                    return matchesCat && matchesSearch;
                                }).length)} / {featuredServices.filter(s => {
                                    const sCat = (s.category || '').toUpperCase();
                                    const selCat = selectedCategory.toUpperCase();
                                    const matchesCat = selectedCategory === 'Tất cả' || 
                                                     (selCat === 'GROOMING' && (sCat === 'GROOMING' || sCat === 'SPA')) ||
                                                     sCat === selCat;
                                    const matchesSearch = (s.serviceName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                                                         (s.shopName || '').toLowerCase().includes(searchTerm.toLowerCase());
                                    return matchesCat && matchesSearch;
                                }).length} dịch vụ
                            </p>
                        </motion.div>
                    )}
                </div>
            </motion.section>


            {/* Promotional Banners */}
            <section className="py-12 px-6 md:px-12 lg:px-20">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        whileHover={{ y: -5 }}
                        viewport={{ once: true }}
                        className="bg-gradient-to-r from-blue-600 to-primary rounded-[32px] p-10 relative overflow-hidden flex items-center shadow-2xl shadow-blue-500/20 group cursor-pointer"
                    >
                        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[url('https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-20 mix-blend-overlay group-hover:scale-110 transition-transform duration-1000"></div>
                        <div className="relative z-10 max-w-[65%] space-y-4">
                            <span className="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-widest inline-block">Ưu đãi độc quyền</span>
                            <h3 className="text-3xl font-black text-white mb-2 leading-tight">Giảm 20% Khám tổng quát</h3>
                            <p className="text-white/80 text-sm font-medium">Bảo vệ sức khỏe bé cưng với chi phí tiết kiệm nhất.</p>
                            <button onClick={(e) => { e.stopPropagation(); navigate('/search'); }} className="mt-4 bg-white text-primary px-8 py-3 rounded-full font-black text-sm shadow-xl hover:shadow-white/20 transition-all active:scale-95">
                                Đặt lịch ngay
                            </button>
                        </div>
                    </motion.div>
                    
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        whileHover={{ y: -5 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="bg-gradient-to-r from-rose-500 to-pink-500 rounded-[32px] p-10 relative overflow-hidden flex items-center shadow-2xl shadow-pink-500/20 group cursor-pointer"
                    >
                        <div className="absolute -right-10 -bottom-10 text-white/10 group-hover:rotate-12 group-hover:scale-110 transition-all duration-1000">
                            <span className="material-symbols-outlined text-[200px]">videocam</span>
                        </div>
                        <div className="relative z-10 max-w-[70%] space-y-4">
                            <span className="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-widest inline-block">Tính năng mới</span>
                            <h3 className="text-3xl font-black text-white mb-2 leading-tight">Live Camera 24/7</h3>
                            <p className="text-white/80 text-sm font-medium">Xua tan nỗi lo mỗi khi xa bé cưng. Theo dõi mọi khoảnh khắc thời gian thực.</p>
                            <button onClick={(e) => { e.stopPropagation(); navigate('/camera'); }} className="mt-4 bg-white text-pink-600 px-8 py-3 rounded-full font-black text-sm shadow-xl hover:shadow-white/20 transition-all active:scale-95">
                                Trải nghiệm ngay
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Recent Bookings Section - Full Width */}
            <motion.section 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="py-16 px-6 md:px-12 lg:px-20"
            >
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div className="space-y-1">
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white">Lịch hẹn gần đây</h2>
                            <p className="text-slate-500 text-sm">Theo dõi các hoạt động chăm sóc thú cưng của bạn</p>
                        </div>
                        <Link to="/profile/bookings" className="text-sm font-black text-primary hover:underline bg-primary/5 px-4 py-2 rounded-full">Xem tất cả lịch hẹn</Link>
                    </div>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {recentBookings.length > 0 ? recentBookings.map(booking => {
                            const statusInfo = formatStatus(booking.status);
                            return (
                                <motion.div 
                                    whileHover={{ y: -5 }}
                                    key={booking.id} 
                                    className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all group"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h4 className="font-black text-lg text-slate-900 dark:text-white line-clamp-1 group-hover:text-primary transition-colors">{booking.shopName}</h4>
                                            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">{formatDateTime(booking.appointmentDatetime)}</p>
                                        </div>
                                        <div className={`${statusInfo.dot} w-3 h-3 rounded-full mt-1.5 shadow-lg shadow-${statusInfo.dot.split('-')[1]}-500/20`} title={statusInfo.text}></div>
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-700">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                                                <span className="material-symbols-outlined text-[16px]">pets</span>
                                            </div>
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{booking.petName}</span>
                                        </div>
                                        <button onClick={() => navigate('/profile/bookings')} className="text-[10px] font-black uppercase text-primary bg-primary/10 px-4 py-2 rounded-xl hover:bg-primary hover:text-white transition-all">
                                            Chi tiết
                                        </button>
                                    </div>
                                </motion.div>
                            )
                        }) : (
                            <div className="col-span-full text-center py-16 bg-slate-50 dark:bg-slate-800/50 rounded-[32px] border-2 border-dashed border-slate-200 dark:border-slate-700">
                                <p className="text-sm font-bold text-slate-400">Bạn chưa có lịch hẹn nào gần đây</p>
                            </div>
                        )}
                    </div>
                </div>
            </motion.section>

            {/* Featured Clinics Section - Full Width */}
            <motion.section 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="py-16 px-6 md:px-12 lg:px-20 bg-slate-50 dark:bg-slate-900/20"
            >
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div className="space-y-1">
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white">Cơ sở nổi bật dành cho bạn</h2>
                            <p className="text-slate-500 text-sm">Những địa điểm chăm sóc thú cưng uy tín được đề xuất</p>
                        </div>
                        <Link to="/search" className="text-sm font-black text-primary hover:underline bg-primary/5 px-4 py-2 rounded-full">Khám phá thêm</Link>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {shops.slice(0, 4).map(shop => (
                            <motion.div 
                                key={shop.id} 
                                whileHover={{ y: -8 }}
                                className="bg-white dark:bg-slate-800 p-5 rounded-[32px] border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col hover:shadow-2xl hover:border-primary/20 transition-all group cursor-pointer" 
                                onClick={() => navigate(`/clinic/${shop.id}`)}
                            >
                                <div className="w-full aspect-square rounded-2xl overflow-hidden relative shadow-lg mb-4">
                                    <img src={shop.logoUrl || "https://placehold.co/300x300/e2e8f0/64748b?text=Shop"} alt={shop.shopName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    {shop.id % 2 === 0 && (
                                        <div className="absolute top-3 left-3 bg-rose-500 text-white text-[10px] font-black px-2.5 py-1.5 rounded-xl uppercase flex items-center gap-1.5 shadow-lg backdrop-blur-sm">
                                            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                                            LIVE
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col space-y-3 px-1">
                                    <h4 className="font-black text-slate-900 dark:text-white truncate group-hover:text-primary transition-colors text-lg">{shop.shopName}</h4>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center bg-yellow-400/10 text-yellow-500 px-2 py-1 rounded-lg text-[11px] font-black">
                                            <span className="material-symbols-outlined text-[16px] mr-1">star</span>
                                            {shop.ratingAvg || 5.0}
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-3 py-1 rounded-lg">{shop.shopType}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-slate-400">
                                        <span className="material-symbols-outlined text-[14px]">location_on</span>
                                        <span className="text-xs font-bold truncate">{shop.address}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                        {shops.length === 0 && (
                            <div className="col-span-full text-center py-20 bg-slate-50 dark:bg-slate-800/50 rounded-[40px] border-2 border-dashed border-slate-200 dark:border-slate-700">
                                <p className="text-sm font-bold text-slate-400">Đang tìm kiếm cơ sở phù hợp...</p>
                            </div>
                        )}
                    </div>
                </div>
            </motion.section>

            <motion.section 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="py-20 px-6 md:px-12 lg:px-20 bg-slate-100/50 dark:bg-slate-900/30"
            >
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">Lời yêu thương từ chủ nuôi</h2>
                        <div className="w-20 h-1.5 bg-primary mx-auto rounded-full"></div>
                        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg pt-2">Hàng ngàn bé cưng đã được chăm sóc tận tình tại hệ thống PetEye.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* 
                          ✅ API ĐÃ ĐƯỢC KẾT NỐI:
                          Dữ liệu được lấy từ reviewService.getLatestReviews()
                        */}
                        {(reviews.length > 0 ? reviews : MOCK_REVIEWS).map((review, idx) => (
                            <motion.div 
                                key={review.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-white dark:bg-slate-800 p-8 rounded-[40px] shadow-sm border border-slate-100 dark:border-slate-700 relative group hover:shadow-2xl transition-all"
                            >
                                <div className="absolute top-8 right-8 text-slate-100 dark:text-slate-700 group-hover:text-primary/10 transition-colors">
                                    <span className="material-symbols-outlined text-6xl">format_quote</span>
                                </div>
                                <div className="flex items-center gap-1 mb-6">
                                    {[...Array(5)].map((_, i) => (
                                        <span key={i} className={`material-symbols-outlined text-sm ${i < review.rating ? 'text-yellow-400' : 'text-slate-200'}`}>star</span>
                                    ))}
                                </div>
                                <p className="text-slate-600 dark:text-slate-300 italic mb-8 relative z-10 leading-relaxed font-medium">"{review.comment}"</p>
                                <div className="flex items-center gap-4">
                                    <img src={review.userAvatar || "https://i.pravatar.cc/150?u=" + review.id} alt={review.userName} className="w-12 h-12 rounded-full ring-2 ring-slate-100 dark:ring-slate-700" />
                                    <div className="min-w-0 flex-1">
                                        <h4 className="font-bold text-slate-900 dark:text-white truncate">{review.userName}</h4>
                                        <p className="text-[10px] font-black uppercase text-primary tracking-widest truncate">
                                            {review.shopName || "Khách hàng PetEye"}
                                        </p>
                                    </div>
                                    <div className="text-[10px] font-bold text-slate-400 shrink-0">
                                        {'createdAt' in review ? formatRelativeTime(review.createdAt) : (review as any).date}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.section>
        </div>
    );
}
