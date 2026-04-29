import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useClinics } from '../hooks/useClinics';
import { ShopPublicResponse } from '../services/shop.service';

const SHOP_TYPE_TABS = [
  { value: 'Tất cả', label: 'Tất cả' },
  { value: 'CLINIC', label: 'Khám thú y' },
  { value: 'SPA', label: 'Spa & Grooming' },
  { value: 'BOARDING', label: 'Lưu trú' },
  { value: 'PET_SHOP', label: 'Pet Shop' },
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
        <span
          key={s}
          className={`material-symbols-outlined text-sm ${s <= Math.floor(rating) ? 'text-amber-400' : s - rating <= 0.5 ? 'text-amber-300' : 'text-slate-300'}`}
          style={{ fontVariationSettings: s <= Math.floor(rating) ? "'FILL' 1" : "'FILL' 0" }}
        >
          star
        </span>
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

  const sortedClinics = [...clinics].sort((a: ShopPublicResponse, b: ShopPublicResponse) => {
    if (sortBy === 'Đánh giá cao nhất') return b.ratingAvg - a.ratingAvg;
    return b.id - a.id;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* ── Hero Banner ── */}
      <div className="bg-gradient-to-br from-[#1a2b4c] via-[#1e3a6e] to-[#1a2b4c] text-white py-14 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-teal-300 text-xs font-bold uppercase tracking-widest mb-3">
            Tất cả cơ sở đã được xác minh
          </p>
          <h1 className="text-3xl md:text-4xl font-black mb-2">
            Tìm cơ sở thú y &amp; dịch vụ gần bạn
          </h1>
          <p className="text-slate-300 mb-8 text-sm">
            Đặt lịch dễ dàng · Đọc đánh giá thực tế · Chăm sóc thú cưng chu đáo
          </p>

          {/* Search Bar */}
          <div className="bg-white rounded-2xl p-2 flex flex-col md:flex-row gap-2 max-w-3xl mx-auto shadow-2xl">
            <div className="flex items-center gap-3 flex-1 px-4 py-2 border-b md:border-b-0 md:border-r border-slate-200">
              <span className="material-symbols-outlined text-xl" style={{ color: '#1a2b4c' }}>search</span>
              <input
                type="text"
                placeholder="Tên cơ sở, dịch vụ..."
                className="w-full border-none outline-none bg-transparent text-slate-800 placeholder-slate-400 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600">
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              )}
            </div>
            <div className="flex items-center gap-3 flex-1 px-4 py-2">
              <span className="material-symbols-outlined text-teal-500 text-xl">location_on</span>
              <input
                type="text"
                placeholder="Thành phố / Quận..."
                className="w-full border-none outline-none bg-transparent text-slate-800 placeholder-slate-400 text-sm"
                value={cityQuery}
                onChange={(e) => setCityQuery(e.target.value)}
              />
              {cityQuery && (
                <button onClick={() => setCityQuery('')} className="text-slate-400 hover:text-slate-600">
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              )}
            </div>
            <button className="bg-[#1a2b4c] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#243d6b] transition-colors flex items-center gap-2 justify-center shrink-0">
              <span className="material-symbols-outlined text-base">search</span>
              Tìm kiếm
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* ── Category Tabs ── */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {SHOP_TYPE_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveService(tab.value)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all border ${
                activeService === tab.value
                  ? 'bg-[#1a2b4c] text-white border-[#1a2b4c] shadow-md'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-[#1a2b4c] hover:text-[#1a2b4c]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* ── Sidebar ── */}
          <aside className="w-full lg:w-64 shrink-0 space-y-4">

            {/* Rating filter */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-400 text-base" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                Đánh giá sao
              </h3>
              <div className="space-y-2">
                {RATING_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setMinRating(opt.value)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                      minRating === opt.value
                        ? 'bg-amber-50 border-amber-400 text-amber-800 dark:bg-amber-900/30 dark:border-amber-500 dark:text-amber-300'
                        : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-amber-300 hover:bg-amber-50/50'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {opt.value > 0 && <StarRow rating={opt.value} />}
                    {minRating === opt.value && (
                      <span className="material-symbols-outlined text-amber-500 text-base ml-1" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Distance filter (UI only — no geo API yet) */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-teal-500 text-base">near_me</span>
                Khoảng cách
              </h3>

              {/* Current location button */}
              <button className="w-full flex items-center gap-2 px-3 py-2.5 mb-4 rounded-xl border border-dashed border-teal-300 text-teal-600 dark:text-teal-400 text-sm font-medium hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors">
                <span className="material-symbols-outlined text-base">my_location</span>
                Dùng vị trí hiện tại
              </button>

              {/* Slider */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Bán kính tìm kiếm</span>
                  <span className="text-sm font-bold text-[#1a2b4c] dark:text-teal-400">{distanceKm} km</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={50}
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer accent-[#1a2b4c]"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>1 km</span>
                  <span>50 km</span>
                </div>
              </div>

              {/* Distance quick picks */}
              <div className="flex gap-2 mt-3">
                {[5, 10, 20].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDistanceKm(d)}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                      distanceKm === d
                        ? 'bg-[#1a2b4c] text-white border-[#1a2b4c]'
                        : 'border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-[#1a2b4c] hover:text-[#1a2b4c]'
                    }`}
                  >
                    {d} km
                  </button>
                ))}
              </div>
            </div>

            {/* Reset filters */}
            {(minRating > 0 || distanceKm !== 10) && (
              <button
                onClick={() => { setMinRating(0); setDistanceKm(10); }}
                className="w-full py-2.5 text-sm font-semibold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-base">filter_alt_off</span>
                Xóa bộ lọc
              </button>
            )}
          </aside>

          {/* ── Results ── */}
          <div className="flex-1 min-w-0">
            {/* Results header */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                {isLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-[#1a2b4c] border-t-transparent rounded-full animate-spin" />
                    Đang tìm kiếm...
                  </span>
                ) : (
                  <>
                    Tìm thấy <strong className="text-slate-900 dark:text-slate-100">{sortedClinics.length}</strong> cơ sở
                    {cityQuery && <span> tại <strong className="text-teal-600">{cityQuery}</strong></span>}
                    {activeService !== 'Tất cả' && (
                      <span> · <span className="text-[#1a2b4c] font-semibold">{SHOP_TYPE_TABS.find(t => t.value === activeService)?.label}</span></span>
                    )}
                    {minRating > 0 && <span> · <span className="text-amber-600 font-semibold">{minRating}★ trở lên</span></span>}
                  </>
                )}
              </p>
              <div className="flex items-center gap-3">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm px-3 py-2 text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-[#1a2b4c] outline-none"
                >
                  {SORT_OPTIONS.map((opt) => <option key={opt}>{opt}</option>)}
                </select>
                <div className="flex gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-[#1a2b4c] text-white' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <span className="material-symbols-outlined text-base">view_list</span>
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-[#1a2b4c] text-white' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <span className="material-symbols-outlined text-base">grid_view</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Cards */}
            <div className={viewMode === 'grid' ? 'grid sm:grid-cols-2 gap-4' : 'flex flex-col gap-4'}>
              {isLoading ? (
                <>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className={`bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700 ${viewMode === 'list' ? 'flex h-44' : ''}`}>
                      <div className={`bg-slate-200 dark:bg-slate-700 animate-pulse ${viewMode === 'list' ? 'w-56 shrink-0' : 'h-48'}`} />
                      <div className="flex-1 p-5 space-y-3">
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-3/4" />
                        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-1/2" />
                        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-2/3" />
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                sortedClinics.map((shop: ShopPublicResponse) => (
                  <Link
                    key={shop.id}
                    to={`/clinic/${shop.id}`}
                    className={`group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-xl hover:border-[#1a2b4c]/30 transition-all duration-300 ${viewMode === 'list' ? 'flex flex-col sm:flex-row' : 'flex flex-col'}`}
                  >
                    {/* Image */}
                    <div className={`relative overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-700 ${viewMode === 'list' ? 'sm:w-52 h-48 sm:h-auto' : 'h-48'}`}>
                      <img
                        src={shop.licenseImageUrl || 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=800&auto=format&fit=crop'}
                        alt={shop.shopName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                      {/* Verified badge */}
                      <span className="absolute top-3 right-3 bg-teal-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                        Đối tác
                      </span>
                      {/* Shop type badge */}
                      {shop.shopType && (
                        <span className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-[#1a2b4c] text-xs font-bold px-2.5 py-1 rounded-full">
                          {SHOP_TYPE_TABS.find(t => t.value === shop.shopType)?.label ?? shop.shopType}
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 p-5 flex flex-col gap-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base leading-tight group-hover:text-[#1a2b4c] dark:group-hover:text-teal-400 transition-colors line-clamp-2">
                          {shop.shopName}
                        </h3>
                        {/* Rating */}
                        <div className="flex items-center gap-1 shrink-0 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-lg">
                          <span className="material-symbols-outlined text-amber-400 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                          <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                            {shop.ratingAvg > 0 ? shop.ratingAvg.toFixed(1) : 'Mới'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-sm">
                        <span className="material-symbols-outlined text-teal-500 text-sm">location_on</span>
                        <span className="truncate">{shop.address}{shop.city ? `, ${shop.city}` : ''}</span>
                      </div>

                      {shop.description && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {shop.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100 dark:border-slate-700">
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">call</span>
                          {shop.phone}
                        </span>
                        <span className="px-4 py-2 bg-[#1a2b4c] text-white text-xs font-bold rounded-xl group-hover:bg-[#243d6b] transition-colors shadow">
                          Xem chi tiết →
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>

            {/* Empty state */}
            {!isLoading && sortedClinics.length === 0 && (
              <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                <span className="material-symbols-outlined text-6xl text-slate-300 mb-4 block">search_off</span>
                <p className="font-bold text-lg text-slate-600 dark:text-slate-300">
                  Không tìm thấy kết quả phù hợp
                </p>
                <p className="text-sm text-slate-400 mt-1">Hãy thử thay đổi từ khóa, thành phố hoặc danh mục</p>
                <button
                  onClick={() => { setSearchQuery(''); setCityQuery(''); setActiveService('Tất cả'); setMinRating(0); }}
                  className="mt-4 px-5 py-2.5 bg-[#1a2b4c] text-white text-sm font-semibold rounded-xl hover:bg-[#243d6b] transition-colors"
                >
                  Xóa tất cả bộ lọc
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
