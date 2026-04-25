import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Logo from '../components/Logo';
import Footer from '../components/Footer';

export default function HomePage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-body">
            {/* Top Banner
            <div className="bg-primary text-white py-2 text-sm text-center font-medium">
                <div className="container mx-auto px-4 flex justify-between items-center">
                    <span className="hidden md:inline">Chào mừng bạn đến với Peteye!</span>
                    <span>
                        Hotline hỗ trợ 24/7:{' '}
                        <a className="underline hover:text-slate-200" href="tel:19001234">
                            1900 1234
                        </a>
                    </span>
                    <div className="flex items-center space-x-3">
                        <span className="text-xs opacity-80">VN | EN</span>
                    </div>
                </div>
            </div> */}
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-sm border-b border-slate-200 dark:border-slate-700">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        {/* Logo */}
                        <Link to="/home" className="flex-shrink-0">
                            <Logo />
                        </Link>

                        {/* Search */}
                        <div className="w-full md:w-1/3 relative group">
                            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-full px-4 py-2 border border-slate-200 dark:border-slate-700 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
                                <span className="material-symbols-outlined text-slate-400">search</span>
                                <input
                                    className="bg-transparent border-none outline-none focus:ring-0 w-full text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 px-2"
                                    placeholder="Tìm dịch vụ, bác sĩ, hoặc cửa hàng..."
                                    type="text"
                                    onKeyDown={(e) => e.key === 'Enter' && navigate('/search')}
                                />
                                <span className="material-symbols-outlined text-slate-400 cursor-pointer hover:text-primary border-l border-slate-300 dark:border-slate-600 pl-2 ml-2">
                                    tune
                                </span>
                            </div>
                        </div>

                        {/* Nav + Auth */}
                        <div className="flex items-center gap-3 text-sm font-semibold">
                            {user ? (
                                <div className="flex items-center gap-3">
                                    <Link to="/profile" className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-full px-3 py-1.5 hover:bg-primary/10 transition-colors">
                                        <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 max-w-[100px] truncate">
                                            {user.name}
                                        </span>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1"
                                    >
                                        <span className="material-symbols-outlined text-lg">logout</span>
                                        <span className="hidden sm:inline">Đăng xuất</span>
                                    </button>
                                </div>
                            ) : (
                                <Link
                                    to="/login"
                                    className="px-5 py-2 bg-primary text-white rounded-full hover:bg-blue-800 shadow-md hover:shadow-lg transition-all flex items-center gap-2 text-sm"
                                >
                                    <span className="material-symbols-outlined text-lg">login</span>
                                    <span>Đăng nhập</span>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative pt-12 pb-24 overflow-hidden bg-gradient-to-b from-blue-50/70 to-transparent dark:from-slate-900 dark:to-slate-900 px-6 md:px-12 lg:px-20">
                {/* Paw pattern background */}
                <div
                    className="absolute inset-0 opacity-30 pointer-events-none"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%231E40AF' fill-opacity='0.08' fill-rule='evenodd'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E")`,
                    }}
                />
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                        {/* Text */}
                        <div className="md:w-1/2 space-y-6">
                            <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                100% Yêu thương thú cưng
                            </div>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold text-slate-800 dark:text-white leading-tight">
                                Chăm sóc thú cưng <br />
                                <span className="text-primary text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">dễ dàng hơn cùng Peteye</span> 
                            </h1>
                            <p className="text-lg text-slate-600 dark:text-slate-300 md:pr-10 leading-relaxed">
                                Kết nối ngay với hàng ngàn bác sĩ thú y, spa, và cửa hàng thú cưng uy tín. Chúng tôi
                                mang đến trải nghiệm chăm sóc toàn diện và chuyên nghiệp cho người bạn nhỏ của bạn.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 pt-2">
                                <button
                                    onClick={() => navigate('/search')}
                                    className="px-8 py-3 bg-primary text-white rounded-full font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-1 transition-all">
                                    Tìm cơ sở thú y
                                </button>
                                <Link to="/camera" className="px-8 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-full font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined">play_circle</span>
                                    Xem video
                                </Link>
                            </div>
                            <div className="pt-6 flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                                <div className="flex -space-x-2">
                                    <img
                                        alt="User"
                                        className="w-9 h-9 rounded-full border-2 border-white dark:border-slate-900 object-cover"
                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDjKBCP_NxYLqsGwuoRFsUU_Lf4nnUawfT2W1LM31zFPlSrjVyhGk8u2kq2QKe8KdGLkwpZ9MPqgALEjN0QoXxXJfYmCX4knPieDQ9QtgZ3L6Pzi9vZAUIeznm1ukbplfaVXvOI9y-kZHX0xSvZcf9CBrpf4Xry8YeQ1JK3k1QAXy_ilid0BL7cdVYmSz7W_jGnczbpIyxX6FjDChnorjAKxsV5GaPh--BbQeEs5rFgqMrnxg2xHxBYXlKR9aTvHN_GoIpJaKvN-VAG"
                                    />
                                    <img
                                        alt="User"
                                        className="w-9 h-9 rounded-full border-2 border-white dark:border-slate-900 object-cover"
                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCn_8Y4FDGOScmRTJwYv7Hk5lpnYlsp-hLv04f23O2lINhHfjUhViIakcIea9sDyvleFMOFxOgVvmIl3LQ4bWzfp20HY97NUJvBr0UcxyCDtyiwPQQN7pheVoj6v_ryNJ_8UbDcIMuSR5dKEhvt-oXhAbVHWhy-Qxzz_3w_hCAcGhUeGcwjAXkBCZrocZfMmmQ-I1DAdJX9RkCOwwFUGVMVJntO9Dd_xMptIdQHJPRYnAWYZ92oSKcy1xiztWRDiJceAU0u7TpB1-FF"
                                    />
                                    <img
                                        alt="User"
                                        className="w-9 h-9 rounded-full border-2 border-white dark:border-slate-900 object-cover"
                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuADgKf1WjXXZ4vQfXgubrQgMhF16bPssTWErTUspwje4tMix-HzEYyvnNnikDJtuNDwizLwTqY7Thdm3_gfW3RsOJ9ePoyhPaLShQ3JP4EYs31qyZSd3_mPvSfm6dyg6crdegudR7aYUABooqoFA3ioyzcP7pg4iaZQe4AqvKD3358HVnnFOfopROe5GTePF6jJcNhoPhrtwq9B7wKypoWwYxs1AC3MuKaUjiZlhJCFM_dwJvi96bRxZ3zRS1BRBu3oivIo5fwR6TTg"
                                    />
                                    <div className="w-9 h-9 rounded-full border-2 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
                                        +2k
                                    </div>
                                </div>
                                <p className="font-medium">Chủ nuôi tin dùng</p>
                            </div>
                        </div>

                        {/* Hero Image */}
                        <div className="md:w-1/2 relative">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-gradient-to-tr from-blue-200/40 to-indigo-200/40 rounded-full blur-3xl -z-10" />
                            <img
                                alt="Happy dogs and cats together"
                                className="relative z-10 w-full h-auto object-cover rounded-3xl transform hover:scale-[1.01] transition-transform duration-500 shadow-2xl"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAptrgTUsYsJPpWtO4jvkRGnRRGH4lYvpSPX3Vxs6ipoSgXsXErc4HvS9HTkLOzZNoPEv0duop8p1sOLS02xPpj0mM89HVVB4psYfHV50CdfQhN78litlo0g9usCx_PMn1Ca7oYM64mgURczpqTeTBVmSxlQ8DIdL_JbyassG-TzpzsLX---22o9err2YzYzQOdAqDghmKnY0VJvhRqSk5T0b8wKQ3ZZrBp85F7GOCMQgwNuIMllsDODMltXih9LpHT8phIZTvkErrM"
                            />
                            {/* Rating badge */}
                            <div
                                className="absolute -bottom-6 -left-6 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-xl z-20"
                                style={{ animation: 'bounce 4s infinite' }}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                                        <span className="material-symbols-outlined text-primary dark:text-blue-400">
                                            verified
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Đánh giá</p>
                                        <p className="font-bold text-slate-800 dark:text-white">4.9/5 Sao</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Wave bottom */}
                <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none rotate-180">
                    <svg
                        className="relative block w-full h-[60px] fill-slate-50 dark:fill-slate-900"
                        preserveAspectRatio="none"
                        viewBox="0 0 1200 120"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" />
                    </svg>
                </div>
            </section>

            {/* Services Section */}
            <section className="py-24 bg-slate-50 dark:bg-slate-900/50 px-6 md:px-12 lg:px-20">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="text-primary font-bold tracking-wider uppercase text-sm bg-primary/10 px-4 py-1.5 rounded-full inline-block mb-4">
                            Dịch vụ Peteye
                        </span>
                        <h3 className="text-4xl md:text-5xl font-black  leading-tight md:leading-[1.3] text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-3 ">
                            Giải pháp toàn diện
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 mt-4 max-w-2xl mx-auto">
                            Hệ sinh thái dịch vụ đa dạng, đáp ứng mọi nhu cầu chăm sóc sức khỏe và làm đẹp cho thú cưng của bạn.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            {
                                icon: 'medical_services',
                                label: 'Khám thú y',
                                desc: 'Đội ngũ bác sĩ chuyên môn cao, cơ sở vật chất hiện đại chuẩn quốc tế.',
                                bg: 'bg-blue-50 dark:bg-blue-900/20',
                                color: 'text-blue-600 dark:text-blue-400',
                                link: '/search',
                            },
                            {
                                icon: 'hotel',
                                label: 'Lưu trú (Hotel)',
                                desc: 'Không gian thoải mái, an toàn, chăm sóc tận tình 24/7 khi bạn vắng nhà.',
                                bg: 'bg-rose-50 dark:bg-rose-900/20',
                                color: 'text-rose-600 dark:text-rose-400',
                                link: '/search',
                            },
                            {
                                icon: 'content_cut',
                                label: 'Spa & Grooming',
                                desc: 'Dịch vụ tắm sấy, cắt tỉa tạo kiểu chuyên nghiệp giúp bé luôn xinh xắn.',
                                bg: 'bg-purple-50 dark:bg-purple-900/20',
                                color: 'text-purple-600 dark:text-purple-400',
                                link: '/search',
                            },
                            {
                                icon: 'shopping_bag',
                                label: 'Pet Shop',
                                desc: 'Cung cấp thức ăn, phụ kiện, đồ chơi chính hãng, chất lượng hàng đầu.',
                                bg: 'bg-amber-50 dark:bg-amber-900/20',
                                color: 'text-amber-600 dark:text-amber-400',
                                link: '/search',
                            },
                        ].map(({ icon, label, desc, bg, color, link }) => (
                            <Link key={label} to={link} className="group cursor-pointer bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-700 hover:border-primary/30 hover:-translate-y-2 relative overflow-hidden z-10 block">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
                                <div className={`w-16 h-16 rounded-2xl ${bg} ${color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                    <span className="material-symbols-outlined text-3xl">{icon}</span>
                                </div>
                                <h3 className="font-bold text-slate-900 dark:text-white text-xl mb-3 group-hover:text-primary transition-colors">
                                    {label}
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
                                    {desc}
                                </p>
                                <div className="flex items-center text-primary font-semibold text-sm group/btn">
                                    Khám phá ngay
                                    <span className="material-symbols-outlined text-sm ml-1 group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Promotional Banners */}
            <section className="py-16 bg-white dark:bg-slate-800/20 px-6 md:px-12 lg:px-20">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Live Camera Banner */}
                        <div className="md:col-span-2 relative h-[300px] rounded-2xl overflow-hidden group bg-blue-100 dark:bg-blue-900/40">
                            <div className="absolute inset-0 z-10 p-8 flex flex-col justify-center items-start w-2/3">
                                <span className="bg-primary/10 dark:bg-primary/20 text-primary dark:text-blue-300 px-3 py-1 rounded-md text-xs font-bold mb-3 uppercase border border-primary/20">
                                    Độc quyền Peteye
                                </span>
                                <h3 className="text-3xl font-display font-bold text-slate-800 dark:text-white mb-2">
                                    Live Camera 24/7
                                </h3>
                                <p className="text-slate-600 dark:text-slate-300 mb-6 font-medium">
                                    Quan sát thú cưng của bạn mọi lúc mọi nơi khi gửi tại khách sạn đối tác.
                                </p>
                                <Link to="/camera" className="inline-block px-6 py-2 bg-primary text-white rounded-full hover:bg-blue-800 transition shadow-lg border border-primary">
                                    Khám phá ngay
                                </Link>
                            </div>
                            <img
                                alt="Dog looking at camera"
                                className="absolute right-0 top-0 h-full w-3/5 object-cover object-center rounded-l-full z-0 opacity-90"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBLs9H8SCD8YEzIxUTYQZXiWMPnfYhClAG4R2fq0GwozMqFIhQ3e_F0qtUErUS3-sb53a_G3X2__nDrn8toz4HhqzdnELDCP6RVsY5rzyVHXAi0nS5LI5jB4LcDfBWZHoZ3w2kS4b0kkbXtLJlvWeqDmhSqyovvX0eNTrhzv7RtSvx1-14erWE53ABKT5_ExjazFgGEQhZvu5lY96zZgWrRRtCKNHBhysyLU36jgyDPBhTn9A70LxAGyNRhC4aMtvHZEu7h2SBq2VuZ"
                                style={{ WebkitMaskImage: 'linear-gradient(to right, transparent, black)' }}
                            />
                        </div>

                        {/* Vaccine Banner */}
                        <div className="relative h-[300px] rounded-2xl overflow-hidden bg-amber-50 dark:bg-amber-900/20 group border border-amber-100 dark:border-amber-900/30">
                            <div className="absolute inset-0 p-6 flex flex-col z-10">
                                <h4 className="text-xl font-bold text-amber-900 dark:text-amber-100 mb-1">
                                    Gói Tiêm Chủng
                                </h4>
                                <p className="text-amber-700 dark:text-amber-300 text-sm mb-4">
                                    Giảm tới 25% cho mũi đầu tiên
                                </p>
                                <div className="mt-auto">
                                    <Link to="/search" className="inline-block px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm rounded-full transition shadow-md">
                                        Đặt lịch
                                    </Link>
                                </div>
                            </div>
                            <img
                                alt="Vaccine pet"
                                className="absolute bottom-0 right-0 w-32 h-32 object-cover rounded-tl-3xl shadow-lg border-4 border-white dark:border-slate-800 transform group-hover:scale-105 transition-transform"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCyfQEqfkQ2s4e6nYybasibnjjUV1GyqRbWcK0G02UgporRHapV6LvHRgior0lnSZkgTGE-T1-IYzFPa2LfGI1ZYBDW0byUacqku2RK2lRikVU90I7HuIZRKRSLH963dNuWNp-6PaiPlo_qorkTDLBR8fpFdENk6zw1r4Re38uk12VLkE6hyldUJ98oHpuA3l8nJHBjcVnHe0smDNdLG1bM43-lqu1e2FS3ZLdwHLWwBAdJjupGyXnAzLBas2bPqDoE7mXrdFfdSNWJ"
                            />
                        </div>

                        {/* Pet Food Banner */}
                        <div className="relative h-[250px] md:h-auto rounded-2xl overflow-hidden bg-blue-50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 group">
                            <div className="p-6 flex flex-col h-full justify-center">
                                <h4 className="text-2xl font-bold text-primary dark:text-blue-300">Thức ăn hạt</h4>
                                <p className="text-slate-600 dark:text-slate-400 mt-1 mb-4">Chất lượng tốt nhất</p>
                                <img
                                    alt="Pet food"
                                    className="w-full h-40 object-cover rounded-xl shadow-sm mb-4 group-hover:-translate-y-2 transition-transform"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDv5Uxz2h5Er5dCNlpbh26cIkmmya3lEDP6A9WbckKPIt1pzr1VD6c7mY-k7rM3wnCFaD0UeyBm7wHHW718tkGbrkCwS79esNhbKhNss_8iGwwdZfBX2PcBueScuYWG0KACzKJ_70K7BG5LEpj6KB-SUkmF7_mDBgJ6M8okd09-MGYPOeKsGSMigf9BeKuMDlYhm6XwCkBAnmS6h7XHDySzYrOxYQpHLBPmz8H5ffhgPuvt3ot-ntNrNiyCAZVNfb84OMBSwFww1ar1"
                                />
                            </div>
                        </div>

                        {/* Accessories Banner */}
                        <div className="md:col-span-2 lg:col-span-1 relative h-[250px] md:h-auto rounded-2xl overflow-hidden bg-indigo-50 dark:bg-indigo-900/20 p-6 flex items-center justify-between border border-indigo-100 dark:border-indigo-900/30">
                            <div className="w-1/2">
                                <h4 className="text-xl font-bold text-indigo-900 dark:text-indigo-100">
                                    Phụ kiện xinh
                                </h4>
                                <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-2 mb-4">
                                    Bộ sưu tập mới về
                                </p>
                                <button className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition shadow-md">
                                    <span className="material-symbols-outlined">arrow_forward</span>
                                </button>
                            </div>
                            <img
                                alt="Cute dog with accessory"
                                className="w-32 h-32 object-cover rounded-full border-4 border-white dark:border-slate-800 shadow-md"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD5dkoqZZLslqA4Kj_GliOac4Q-aFx5kMBwMWfdMq8JPkXzNpLsgubf2Llnml6RTjogP65VXE6OhUwAKbGx0P6mvlCY3A_Aw1gXqJlZrwUXQ5zBIm1iJcRG6iimjU6FRA-iCUoehx5HkjeG37i9dVrNFZhJEmR_VVfnrQz8EqezKk2vE6EyFp7h35bCV4FesiP60tEjq5SdmS2IKEB-PTcGsRjKsEJr0CiJvxjcxwiP3djioYw-Wxy2FYx8WcloL3cSGm5itaiB_B2M"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-white dark:bg-slate-900 relative overflow-hidden px-6 md:px-12 lg:px-20">
                <div className="absolute top-10 right-10 opacity-5 text-primary rotate-12">
                    <span className="material-symbols-outlined text-9xl">pets</span>
                </div>
                <div className="absolute bottom-10 left-10 opacity-5 text-primary -rotate-12">
                    <span className="material-symbols-outlined text-9xl">pets</span>
                </div>
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        {/* Image */}
                        <div className="lg:w-1/2 relative">
                            <div className="relative z-10">
                                <img
                                    alt="Veterinarian with dog"
                                    className="rounded-3xl shadow-2xl w-full max-w-md mx-auto lg:mx-0 border-8 border-white dark:border-slate-800"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuA20ovEbAizqtBByCOW1NP0m9M6Aq-3GQ4L6YuHOd6HYxsNJqKtGTbv6vDjW-AN7NE_FpojNeeOfmJ-TqRbz4lq5bRG5ZscTLZ12y5ewv8UkE4Zf-qPn0sYqr2XHdfPmWaF4Kj-XzQJhPtNLFtGK7LxjCTGbisYEfxVMZX6BlXu-PBf--XkVMvJvdyWiZ6b9Xznj7wZ-8MQRzUjUAQpsUAJAkLVzazBbLOU0qBT_wi8cXa9KsM7WeFeW7zfZ4phkD-lFrHdAmKD2DhP"
                                />
                                <div className="absolute -bottom-8 -right-4 lg:right-0 bg-white dark:bg-slate-700 p-4 rounded-xl shadow-xl flex items-center gap-4 max-w-xs border border-slate-100 dark:border-slate-600">
                                    <div className="bg-primary/10 dark:bg-blue-900/50 p-3 rounded-full text-primary dark:text-blue-300">
                                        <span className="material-symbols-outlined">medical_services</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800 dark:text-white">
                                            Bác sĩ chuyên môn cao
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            Được chứng nhận quốc tế
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-blue-100/50 dark:bg-blue-900/20 rounded-full -z-0 blur-3xl" />
                        </div>

                        {/* Content */}
                        <div className="lg:w-1/2">
                            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight mb-4 ">
                               Giúp thú cưng của bạn <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">khỏe mạnh hơn</span>
                            </h2>
                            <p className="text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
                                Peteye không chỉ là nơi kết nối, mà là hệ sinh thái chăm sóc sức khỏe và đời sống
                                tinh thần cho thú cưng. Chúng tôi cam kết mang lại sự an tâm tuyệt đối cho bạn với
                                chuẩn mực chuyên nghiệp.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[
                                    {
                                        icon: 'support_agent',
                                        bg: 'bg-primary/10',
                                        color: 'text-primary',
                                        title: 'Hỗ trợ 24/7',
                                        desc: 'Đội ngũ CSKH luôn sẵn sàng giải đáp mọi thắc mắc.',
                                    },
                                    {
                                        icon: 'videocam',
                                        bg: 'bg-primary/10',
                                        color: 'text-primary',
                                        title: 'Live Camera Độc Quyền',
                                        desc: 'Theo dõi thú cưng từ xa dễ dàng qua ứng dụng.',
                                    },
                                    {
                                        icon: 'folder_shared',
                                        bg: 'bg-green-100 dark:bg-green-900/30',
                                        color: 'text-green-600',
                                        title: 'Hồ sơ bệnh án điện tử',
                                        desc: 'Lưu trữ lịch sử khám chữa bệnh trọn đời.',
                                    },
                                    {
                                        icon: 'verified_user',
                                        bg: 'bg-indigo-100 dark:bg-indigo-900/30',
                                        color: 'text-indigo-600',
                                        title: 'Thanh toán an toàn',
                                        desc: 'Bảo vệ quyền lợi khách hàng 100%.',
                                    },
                                ].map(({ icon, bg, color, title, desc }) => (
                                    <div key={title} className="flex items-start gap-4">
                                        <div className={`${bg} p-2 rounded-lg ${color}`}>
                                            <span className="material-symbols-outlined">{icon}</span>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 dark:text-white">{title}</h4>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Link to="/search" className="inline-block mt-10 px-8 py-3 bg-primary text-white font-bold rounded-full shadow-lg shadow-blue-500/30 hover:bg-blue-800 transition-colors">
                                Tìm hiểu thêm
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />

            {/* Floating Chat Button */}
            <Link
                to="/messages"
                className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-50 hover:bg-blue-800"
            >
                <span className="material-symbols-outlined text-2xl">chat</span>
            </Link>
        </div>
    );
}
