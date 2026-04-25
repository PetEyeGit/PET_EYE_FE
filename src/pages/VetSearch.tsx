import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useClinics } from '../hooks/useClinics';

const SERVICE_TYPES = ['Tất cả', 'Khám thú y', 'Spa & Grooming', 'Lưu trú', 'Tiêm phòng', 'Phẫu thuật', 'Pet Shop'];
const SORT_OPTIONS = ['Gần nhất', 'Đánh giá cao nhất', 'Giá thấp nhất', 'Mới nhất'];

export default function VetSearch() {
    const {
        clinics,
        isLoading,
        searchQuery,
        setSearchQuery,
        activeService,
        setActiveService,
        showOpenOnly,
        setShowOpenOnly,
        showVerifiedOnly,
        setShowVerifiedOnly,
        minRating,
        setMinRating,
    } = useClinics();

    const [location, setLocation] = useState('Quận 7, TP. Hồ Chí Minh');
    const [sortBy, setSortBy] = useState('Gần nhất');
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            {/* Hero Search Banner */}
            <div className="bg-gradient-to-br from-[#1a2b4c] via-[#1e3a6e] to-[#1a2b4c] text-white py-12 px-4">
                <div className="max-w-5xl mx-auto text-center">
                    <p className="text-teal-300 text-sm font-bold uppercase tracking-widest mb-2">
                        Hơn 500+ cơ sở uy tín
                    </p>
                    <h1 className="text-3xl md:text-4xl font-black mb-2">
                        Tìm cơ sở thú y &amp; dịch vụ gần bạn
                    </h1>
                    <p className="text-slate-300 mb-8 text-base">
                        Đặt lịch dễ dàng, đọc đánh giá thực tế, chăm sóc thú cưng thật chu đáo
                    </p>

                    {/* Search Bar */}
                    <div className="bg-white rounded-2xl p-2 flex flex-col md:flex-row gap-2 max-w-3xl mx-auto shadow-2xl">
                        <div className="flex items-center gap-3 flex-1 px-4 py-2 border-b md:border-b-0 md:border-r border-slate-200">
                            <span className="material-symbols-outlined text-primary text-2xl" style={{ color: '#1a2b4c' }}>
                                search
                            </span>
                            <input
                                type="text"
                                placeholder="Tên cơ sở, dịch vụ (vd: tiêm phòng, spa...)"
                                className="w-full border-none outline-none bg-transparent text-slate-800 placeholder-slate-400 text-sm font-medium"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-3 flex-1 px-4 py-2">
                            <span className="material-symbols-outlined text-teal-500 text-2xl">location_on</span>
                            <input
                                type="text"
                                placeholder="Khu vực của bạn..."
                                className="w-full border-none outline-none bg-transparent text-slate-800 placeholder-slate-400 text-sm font-medium"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                            />
                        </div>
                        <button className="bg-[#1a2b4c] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#243d6b] transition-colors flex items-center gap-2 justify-center shrink-0">
                            <span className="material-symbols-outlined">search</span>
                            Tìm kiếm
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Service Type Filter Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
                    {SERVICE_TYPES.map((type) => (
                        <button
                            key={type}
                            onClick={() => setActiveService(type)}
                            className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all border ${activeService === type
                                ? 'bg-[#1a2b4c] text-white border-[#1a2b4c] shadow-md'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-[#1a2b4c] hover:text-[#1a2b4c]'
                                }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Sidebar Filters */}
                    <aside className="w-full lg:w-72 shrink-0">
                        {/* Map Placeholder */}
                        <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 mb-4 relative shadow-sm">
                            <div
                                className="w-full h-52 bg-cover bg-center relative"
                                style={{
                                    backgroundImage:
                                        'url(https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=800&auto=format&fit=crop)',
                                }}
                            >
                                <div className="absolute inset-0 bg-[#1a2b4c]/30 flex flex-col items-center justify-center gap-3">
                                    <span className="material-symbols-outlined text-red-500 text-5xl drop-shadow-lg">
                                        location_on
                                    </span>
                                    <button className="bg-white text-[#1a2b4c] font-bold px-4 py-2 rounded-xl text-sm hover:bg-slate-100 transition-colors shadow-lg flex items-center gap-2">
                                        <span className="material-symbols-outlined text-base">my_location</span>
                                        Dùng vị trí hiện tại
                                    </button>
                                </div>
                                {/* Map Pins */}
                                <div
                                    className="absolute top-8 left-12 w-6 h-6 bg-[#1a2b4c] rounded-full border-2 border-white flex items-center justify-center shadow-md cursor-pointer hover:scale-125 transition-transform"
                                    title="PetCare Sài Gòn"
                                >
                                    <span className="material-symbols-outlined text-white text-xs">pets</span>
                                </div>
                                <div
                                    className="absolute top-16 right-16 w-6 h-6 bg-teal-500 rounded-full border-2 border-white flex items-center justify-center shadow-md cursor-pointer hover:scale-125 transition-transform"
                                    title="Bệnh Viện Q1"
                                >
                                    <span className="material-symbols-outlined text-white text-xs">pets</span>
                                </div>
                                <div
                                    className="absolute bottom-12 left-1/2 w-6 h-6 bg-amber-500 rounded-full border-2 border-white flex items-center justify-center shadow-md cursor-pointer hover:scale-125 transition-transform"
                                    title="Pet Spa"
                                >
                                    <span className="material-symbols-outlined text-white text-xs">pets</span>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-slate-800 px-4 py-3 flex items-center gap-2 text-xs text-slate-500">
                                <span className="material-symbols-outlined text-sm text-teal-500">near_me</span>
                                Hiển thị trong bán kính <strong className="text-slate-700 dark:text-slate-200 mx-1">5 km</strong> từ bạn
                            </div>
                        </div>

                        {/* Filter Card */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm space-y-5">
                            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#1a2b4c] dark:text-teal-400">tune</span>
                                Bộ lọc
                            </h3>

                            {/* Quick Toggles */}
                            <div className="space-y-3">
                                <label className="flex items-center justify-between cursor-pointer">
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sm text-green-500">store</span>
                                        Đang mở cửa
                                    </span>
                                    <button
                                        onClick={() => setShowOpenOnly(!showOpenOnly)}
                                        className={`w-10 h-5 rounded-full transition-colors relative ${showOpenOnly ? 'bg-teal-500' : 'bg-slate-200 dark:bg-slate-600'
                                            }`}
                                    >
                                        <span
                                            className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${showOpenOnly ? 'left-5' : 'left-0.5'
                                                }`}
                                        />
                                    </button>
                                </label>
                                <label className="flex items-center justify-between cursor-pointer">
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sm text-blue-500">verified</span>
                                        Đã xác minh
                                    </span>
                                    <button
                                        onClick={() => setShowVerifiedOnly(!showVerifiedOnly)}
                                        className={`w-10 h-5 rounded-full transition-colors relative ${showVerifiedOnly ? 'bg-teal-500' : 'bg-slate-200 dark:bg-slate-600'
                                            }`}
                                    >
                                        <span
                                            className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${showVerifiedOnly ? 'left-5' : 'left-0.5'
                                                }`}
                                        />
                                    </button>
                                </label>
                            </div>

                            {/* Rating Filter */}
                            <div>
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    Đánh giá tối thiểu
                                </p>
                                <div className="flex gap-2">
                                    {[0, 3, 4, 4.5].map((r) => (
                                        <button
                                            key={r}
                                            onClick={() => setMinRating(r)}
                                            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${minRating === r
                                                ? 'bg-amber-50 border-amber-400 text-amber-700'
                                                : 'border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-amber-300'
                                                }`}
                                        >
                                            {r === 0 ? 'Tất cả' : `${r}★`}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Distance */}
                            <div>
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Bán kính</p>
                                <input
                                    type="range"
                                    min="1"
                                    max="20"
                                    defaultValue="5"
                                    className="w-full accent-teal-500"
                                />
                                <div className="flex justify-between text-xs text-slate-400 mt-1">
                                    <span>1 km</span>
                                    <span className="font-bold text-teal-600">5 km</span>
                                    <span>20 km</span>
                                </div>
                            </div>

                            {/* Tags */}
                            <div>
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Dịch vụ</p>
                                <div className="flex flex-wrap gap-2">
                                    {['Tiêm phòng', 'Phẫu thuật', 'Spa', 'Lưu trú', 'Siêu âm', 'Cấp cứu'].map((tag) => (
                                        <span
                                            key={tag}
                                            className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full text-xs font-medium hover:bg-[#1a2b4c] hover:text-white cursor-pointer transition-colors"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <button className="w-full py-2.5 bg-[#1a2b4c] text-white rounded-xl font-bold text-sm hover:bg-[#243d6b] transition-colors">
                                Áp dụng bộ lọc
                            </button>
                        </div>
                    </aside>

                    {/* Results Column */}
                    <div className="flex-1 min-w-0">
                        {/* Results header */}
                        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                            <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                                Tìm thấy <strong className="text-slate-900 dark:text-slate-100">{clinics.length}</strong> kết quả
                                {location && (
                                    <span>
                                        {' '}
                                        gần <strong className="text-teal-600">{location}</strong>
                                    </span>
                                )}
                            </p>
                            <div className="flex items-center gap-3">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm px-3 py-2 text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-[#1a2b4c] outline-none"
                                >
                                    {SORT_OPTIONS.map((opt) => (
                                        <option key={opt}>{opt}</option>
                                    ))}
                                </select>
                                <div className="flex gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1">
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list'
                                            ? 'bg-[#1a2b4c] text-white'
                                            : 'text-slate-400 hover:text-slate-600'
                                            }`}
                                    >
                                        <span className="material-symbols-outlined text-base">view_list</span>
                                    </button>
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid'
                                            ? 'bg-[#1a2b4c] text-white'
                                            : 'text-slate-400 hover:text-slate-600'
                                            }`}
                                    >
                                        <span className="material-symbols-outlined text-base">grid_view</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Clinic Cards */}
                        <div className={viewMode === 'grid' ? 'grid sm:grid-cols-2 gap-4' : 'flex flex-col gap-4'}>
                            {isLoading ? (
                                <div className="flex flex-col gap-4">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="h-48 bg-slate-200 animate-pulse rounded-2xl" />
                                    ))}
                                </div>
                            ) : (
                                clinics.map((clinic) => (
                                    <Link
                                        key={clinic.id}
                                        to={`/clinic/${clinic.id}`}
                                        className={`group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-xl hover:border-[#1a2b4c]/30 transition-all duration-300 ${viewMode === 'list' ? 'flex flex-col sm:flex-row' : 'flex flex-col'
                                            }`}
                                    >
                                        {/* Image */}
                                        <div
                                            className={`relative overflow-hidden shrink-0 ${viewMode === 'list' ? 'sm:w-56 h-48 sm:h-auto' : 'h-48'
                                                }`}
                                        >
                                            <img
                                                src={clinic.image}
                                                alt={clinic.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            {clinic.badge && (
                                                <span className="absolute top-3 left-3 bg-[#1a2b4c] text-white text-xs font-bold px-2.5 py-1 rounded-full">
                                                    {clinic.badge}
                                                </span>
                                            )}
                                            {clinic.verified && (
                                                <span className="absolute top-3 right-3 bg-teal-500 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-xs">verified</span>
                                                    Đối tác
                                                </span>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 p-5 flex flex-col gap-3">
                                            <div>
                                                <div className="flex items-start justify-between gap-2 mb-1">
                                                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base leading-tight group-hover:text-[#1a2b4c] dark:group-hover:text-teal-400 transition-colors">
                                                        {clinic.name}
                                                    </h3>
                                                    <div className="flex items-center gap-1 shrink-0 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-lg">
                                                        <span className="material-symbols-outlined text-amber-500 text-base">star</span>
                                                        <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                                                            {clinic.rating}
                                                        </span>
                                                        <span className="text-slate-400 text-xs">({clinic.reviewCount})</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-sm">
                                                    <span className="material-symbols-outlined text-teal-500 text-sm">location_on</span>
                                                    <span className="truncate">{clinic.address}</span>
                                                </div>
                                            </div>

                                            {/* Hours & Distance */}
                                            <div className="flex items-center gap-4 text-sm">
                                                <span
                                                    className={`flex items-center gap-1 font-semibold text-xs px-2 py-1 rounded-full ${clinic.isOpen
                                                        ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                                                        : 'bg-slate-100 text-slate-500 dark:bg-slate-700'
                                                        }`}
                                                >
                                                    <span className={`w-1.5 h-1.5 rounded-full ${clinic.isOpen ? 'bg-green-500' : 'bg-slate-400'}`} />
                                                    {clinic.isOpen ? 'Đang mở cửa' : 'Đã đóng cửa'}
                                                </span>
                                                <span className="text-slate-400 text-xs">{clinic.hours}</span>
                                                <span className="flex items-center gap-1 text-slate-400 text-xs ml-auto">
                                                    <span className="material-symbols-outlined text-xs">near_me</span>
                                                    {clinic.distance}
                                                </span>
                                            </div>

                                            {/* Tags */}
                                            <div className="flex flex-wrap gap-1.5">
                                                {clinic.tags.map((tag) => (
                                                    <span
                                                        key={tag}
                                                        className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full text-xs font-medium"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>

                                            {/* Footer */}
                                            <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100 dark:border-slate-700">
                                                <span className="text-[#1a2b4c] dark:text-teal-400 font-bold text-sm">{clinic.price}</span>
                                                <button className="px-4 py-2 bg-[#1a2b4c] text-white text-xs font-bold rounded-xl hover:bg-[#243d6b] transition-colors shadow">
                                                    Đặt lịch ngay
                                                </button>
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>

                        {/* No results */}
                        {!isLoading && clinics.length === 0 && (
                            <div className="text-center py-20 text-slate-400">
                                <span className="material-symbols-outlined text-6xl mb-4 block">search_off</span>
                                <p className="font-bold text-lg text-slate-600 dark:text-slate-300">
                                    Không tìm thấy kết quả phù hợp
                                </p>
                                <p className="text-sm mt-1">Hãy thử thay đổi từ khóa hoặc bộ lọc</p>
                            </div>
                        )}

                        {/* Load More */}
                        {!isLoading && clinics.length > 0 && (
                            <div className="text-center mt-8">
                                <button className="px-8 py-3 border-2 border-[#1a2b4c] text-[#1a2b4c] dark:text-teal-400 dark:border-teal-500 font-bold rounded-xl hover:bg-[#1a2b4c] hover:text-white transition-colors">
                                    Tải thêm kết quả
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
