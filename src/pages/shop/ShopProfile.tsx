import React, { useState, useEffect } from 'react';
import { Store, MapPin, Phone, Mail, Clock, Camera, Save, Loader2, ShieldCheck, Image as ImageIcon } from 'lucide-react';
import { shopService } from '../../services/shop.service';
import { fileService } from '../../services/file.service';
import toast from 'react-hot-toast';

export default function ShopProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logoInputRef = React.useRef<HTMLInputElement>(null);
  const bannerInputRef = React.useRef<HTMLInputElement>(null);
  const galleryInputRef = React.useRef<HTMLInputElement>(null);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  const [shopInfo, setShopInfo] = useState({
    name: '',
    type: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    description: '',
    openTime: '08:00',
    closeTime: '20:00',
    workingDays: [] as string[],
    logoUrl: '',
    bannerUrl: '',
    galleryUrls: '',
    isVerified: false,
  });

  const VIETNAM_CITIES = [
    'Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 
    'Bình Dương', 'Đồng Nai', 'Khánh Hòa', 'Lâm Đồng', 'Quảng Ninh'
  ];

  useEffect(() => {
    fetchShopProfile();
  }, []);

  const fetchShopProfile = async () => {
    try {
      setLoading(true);
      const data = await shopService.getMyShop();
      console.log('API getMyShop returned:', data);
      setShopInfo(prev => ({
        ...prev,
        name: data.shopName || prev.name,
        type: data.shopType || prev.type,
        email: data.email || prev.email,
        phone: data.phone || prev.phone,
        address: data.address || prev.address,
        city: data.city || prev.city,
        description: data.description || prev.description,
        openTime: data.openTime || prev.openTime,
        closeTime: data.closeTime || prev.closeTime,
        workingDays: data.workingDays ? data.workingDays.split(',') : prev.workingDays,
        logoUrl: data.logoUrl || prev.logoUrl,
        bannerUrl: data.bannerUrl || prev.bannerUrl,
        galleryUrls: data.galleryUrls || prev.galleryUrls,
        isVerified: data.isVerified,
      }));
    } catch (err) {
      console.error('Failed to fetch shop profile:', err);
      toast.error('Không thể tải thông tin cửa hàng.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted. Current shopInfo:', shopInfo);
    try {
      setSaving(true);
      setError(null);
      const updateData = {
        shopName: shopInfo.name,
        shopType: shopInfo.type,
        email: shopInfo.email,
        phone: shopInfo.phone,
        address: shopInfo.address,
        city: shopInfo.city,
        description: shopInfo.description,
        openTime: shopInfo.openTime,
        closeTime: shopInfo.closeTime,
        workingDays: shopInfo.workingDays.join(','),
        logoUrl: shopInfo.logoUrl,
        bannerUrl: shopInfo.bannerUrl,
        galleryUrls: shopInfo.galleryUrls,
      };
      console.log('Sending update request with data:', updateData);
      const data = await shopService.updateMyShop(updateData);
      
      // Update state safely using prev state
      setShopInfo(prev => ({
        ...prev,
        name: data.shopName || prev.name,
        type: data.shopType || prev.type,
        email: data.email || prev.email,
        phone: data.phone || prev.phone,
        address: data.address || prev.address,
        city: data.city || prev.city,
        description: data.description || prev.description,
        openTime: data.openTime || prev.openTime,
        closeTime: data.closeTime || prev.closeTime,
        workingDays: data.workingDays ? data.workingDays.split(',') : prev.workingDays,
        logoUrl: data.logoUrl || prev.logoUrl,
        bannerUrl: data.bannerUrl || prev.bannerUrl,
        galleryUrls: data.galleryUrls || prev.galleryUrls,
        isVerified: data.isVerified,
      }));
      
      toast.success('Đã cập nhật thông tin cửa hàng!');
    } catch (err) {
      console.error('Failed to update shop profile:', err);
      toast.error('Cập nhật thông tin thất bại.');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'banner' | 'gallery') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (e.g., 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước ảnh không được vượt quá 5MB');
      return;
    }

    try {
      if (type === 'gallery') {
        const currentImages = shopInfo.galleryUrls ? shopInfo.galleryUrls.split(',').filter(Boolean) : [];
        if (currentImages.length >= 10) {
          toast.error('Đã đạt giới hạn 10 ảnh tối đa.');
          return;
        }
        setUploadingGallery(true);
      } else if (type === 'logo') {
        setUploadingLogo(true);
      } else {
        setUploadingBanner(true);
      }

      const url = await fileService.upload(file);
      
      if (type === 'gallery') {
        setShopInfo(prev => ({
          ...prev,
          galleryUrls: prev.galleryUrls ? `${prev.galleryUrls},${url}` : url
        }));
      } else {
        setShopInfo(prev => ({
          ...prev,
          [type === 'logo' ? 'logoUrl' : 'bannerUrl']: url
        }));
      }
      
      toast.success(`Đã tải ${type === 'logo' ? 'logo' : type === 'banner' ? 'ảnh bìa' : 'ảnh thư viện'} lên thành công!`);
    } catch (err) {
      console.error('Upload failed:', err);
      toast.error('Tải ảnh lên thất bại');
    } finally {
      if (type === 'logo') setUploadingLogo(false);
      else if (type === 'banner') setUploadingBanner(false);
      else setUploadingGallery(false);
    }
  };

  const removeGalleryImage = (urlToRemove: string) => {
    const currentUrls = shopInfo.galleryUrls.split(',').filter(Boolean);
    const updatedUrls = currentUrls.filter(url => url !== urlToRemove).join(',');
    setShopInfo({ ...shopInfo, galleryUrls: updatedUrls });
  };

  const weekDays = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

  const toggleWorkingDay = (day: string) => {
    setShopInfo({
      ...shopInfo,
      workingDays: shopInfo.workingDays.includes(day)
        ? shopInfo.workingDays.filter(d => d !== day)
        : [...shopInfo.workingDays, day],
    });
  };

  console.log('Rendering ShopProfile with logo:', shopInfo.logoUrl);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <Store className="w-8 h-8 text-blue-600" />
              Thông tin cửa hàng
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
              Quản lý thông tin và cài đặt cửa hàng của bạn
            </p>
          </div>
        </header>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700 mb-6">
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm">
            <Loader2 size={40} className="animate-spin text-[#1a2b4c] mb-4" />
            <p className="text-slate-500 font-medium">Đang tải thông tin cửa hàng...</p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            {/* Shop Media */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                {shopInfo.isVerified && (
                  <div className="flex items-center gap-1.5 bg-green-50 text-green-600 px-3 py-1.5 rounded-full text-xs font-bold border border-green-100">
                    <ShieldCheck size={14} />
                    Đã xác minh
                  </div>
                )}
              </div>
              
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                <Store size={20} className="text-primary" />
                Hình ảnh cửa hàng
              </h3>
              
              <div className="space-y-8">
                {/* Banner Section */}
                <div className="relative group">
                  <div className="w-full h-48 rounded-2xl bg-slate-100 overflow-hidden border border-slate-200">
                    {uploadingBanner ? (
                      <div className="w-full h-full flex items-center justify-center bg-slate-50">
                        <Loader2 className="animate-spin text-primary" size={32} />
                      </div>
                    ) : shopInfo.bannerUrl ? (
                      <img src={shopInfo.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                        <ImageIcon size={40} className="mb-2" />
                        <p className="text-xs font-medium">Chưa có ảnh bìa</p>
                      </div>
                    )}
                  </div>
                  <input 
                    type="file" 
                    ref={bannerInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'banner')}
                  />
                  <button 
                    type="button" 
                    onClick={() => bannerInputRef.current?.click()}
                    disabled={uploadingBanner}
                    className="absolute bottom-4 right-4 p-2 bg-white/90 backdrop-blur shadow-lg rounded-xl text-slate-700 hover:bg-white transition-all flex items-center gap-2 text-xs font-bold border border-slate-200 disabled:opacity-50"
                  >
                    <Camera size={14} />
                    {uploadingBanner ? 'Đang tải...' : 'Thay ảnh bìa'}
                  </button>
                </div>

                {/* Logo & Info */}
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="relative">
                    <div className="size-32 rounded-3xl bg-white p-1 shadow-xl border border-slate-100 -mt-16 md:-mt-20 ml-4 relative z-10 overflow-hidden">
                      <div className="w-full h-full rounded-[1.25rem] bg-slate-50 overflow-hidden flex items-center justify-center">
                        {uploadingLogo ? (
                          <Loader2 className="animate-spin text-primary" size={24} />
                        ) : shopInfo.logoUrl ? (
                          <img src={shopInfo.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                          <Store size={40} className="text-slate-200" />
                        )}
                      </div>
                      <input 
                        type="file" 
                        ref={logoInputRef} 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'logo')}
                      />
                      <button 
                        type="button" 
                        onClick={() => logoInputRef.current?.click()}
                        disabled={uploadingLogo}
                        className="absolute bottom-2 right-2 p-1.5 bg-primary text-white rounded-lg shadow-lg hover:scale-110 transition-transform disabled:opacity-50"
                      >
                        <Camera size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 pt-2">
                    <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                      {shopInfo.name || 'Tên cửa hàng'}
                    </h2>
                    <p className="text-sm text-slate-500 font-medium mt-1">
                      {shopInfo.type || 'Chưa cập nhật loại hình'} • {shopInfo.city || 'Chưa cập nhật địa chỉ'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Photo Gallery */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                <ImageIcon size={20} className="text-primary" />
                Thư viện ảnh
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {shopInfo.galleryUrls.split(',').filter(Boolean).map((url, index) => (
                  <div key={index} className="relative group aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                    <img src={url} alt={`Gallery ${index}`} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(url)}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                ))}
                
                {/* Upload Button */}
                {shopInfo.galleryUrls.split(',').filter(Boolean).length < 10 ? (
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    disabled={uploadingGallery}
                    className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-primary hover:text-primary transition-all group disabled:opacity-50"
                  >
                    {uploadingGallery ? (
                      <Loader2 className="animate-spin" size={24} />
                    ) : (
                      <>
                        <div className="size-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                          <span className="material-symbols-outlined">add_photo_alternate</span>
                        </div>
                        <span className="text-xs font-bold">Thêm ảnh</span>
                      </>
                    )}
                  </button>
                ) : (
                  <div className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 text-slate-400 bg-slate-50 opacity-70">
                     <span className="material-symbols-outlined text-red-400">block</span>
                     <span className="text-[10px] font-bold text-center px-2">Đã đạt tối đa 10 ảnh</span>
                  </div>
                )}
              </div>
              <input
                type="file"
                ref={galleryInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'gallery')}
              />
              <div className="mt-6 bg-blue-50/50 border border-blue-100 rounded-xl p-4">
                <h4 className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600 text-lg">info</span>
                  Hướng dẫn hiển thị thư viện ảnh
                </h4>
                <p className="text-xs text-blue-800/80 mb-3 leading-relaxed">
                  Bố cục ảnh trên trang chi tiết cửa hàng sẽ tự động điều chỉnh dựa trên số lượng ảnh bạn tải lên:
                </p>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                  {/* 1 Image */}
                  <div className="flex flex-col gap-2 items-center">
                    <div className="w-full aspect-[4/3] bg-blue-100/50 rounded-lg border border-blue-200"></div>
                    <span className="text-[10px] font-bold text-blue-900">1 ảnh</span>
                  </div>
                  {/* 2 Images */}
                  <div className="flex flex-col gap-2 items-center">
                    <div className="w-full aspect-[4/3] grid grid-cols-2 gap-1">
                      <div className="bg-blue-100/50 rounded-l-lg border border-blue-200"></div>
                      <div className="bg-blue-100/50 rounded-r-lg border border-blue-200"></div>
                    </div>
                    <span className="text-[10px] font-bold text-blue-900">2 ảnh</span>
                  </div>
                  {/* 3 Images */}
                  <div className="flex flex-col gap-2 items-center">
                    <div className="w-full aspect-[4/3] grid grid-cols-3 gap-1">
                      <div className="col-span-2 bg-blue-100/50 rounded-l-lg border border-blue-200"></div>
                      <div className="col-span-1 grid grid-rows-2 gap-1">
                        <div className="bg-blue-100/50 rounded-tr-lg border border-blue-200"></div>
                        <div className="bg-blue-100/50 rounded-br-lg border border-blue-200"></div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-blue-900">3 ảnh</span>
                  </div>
                  {/* 4 Images */}
                  <div className="flex flex-col gap-2 items-center">
                    <div className="w-full aspect-[4/3] grid grid-cols-3 grid-rows-2 gap-1">
                      <div className="col-span-2 row-span-2 bg-blue-100/50 rounded-l-lg border border-blue-200"></div>
                      <div className="col-span-1 row-span-1 bg-blue-100/50 rounded-tr-lg border border-blue-200"></div>
                      <div className="col-span-1 row-span-1 bg-blue-100/50 rounded-br-lg border border-blue-200"></div>
                    </div>
                    <span className="text-[10px] font-bold text-blue-900">4 ảnh</span>
                  </div>
                  {/* 5+ Images */}
                  <div className="flex flex-col gap-2 items-center relative">
                    <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full shadow-sm z-10">
                      Nên dùng
                    </div>
                    <div className="w-full aspect-[4/3] grid grid-cols-4 grid-rows-2 gap-1">
                      <div className="col-span-2 row-span-2 bg-blue-500/20 rounded-l-lg border border-blue-300"></div>
                      <div className="col-span-1 row-span-1 bg-blue-500/20 border border-blue-300"></div>
                      <div className="col-span-1 row-span-1 bg-blue-500/20 rounded-tr-lg border border-blue-300"></div>
                      <div className="col-span-1 row-span-1 bg-blue-500/20 border border-blue-300"></div>
                      <div className="col-span-1 row-span-1 bg-blue-500/20 rounded-br-lg border border-blue-300 flex items-center justify-center">
                        <span className="text-[8px] font-bold text-blue-700 opacity-60">+</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-blue-900">5+ ảnh</span>
                  </div>
                </div>
              </div>
            </div>

          {/* Basic Info */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-4">Thông tin cơ bản</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Tên cửa hàng *
                </label>
                <input
                  type="text"
                  value={shopInfo.name}
                  onChange={(e) => setShopInfo({ ...shopInfo, name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1a2b4c] focus:border-[#1a2b4c] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Loại hình *
                </label>
                <select
                  value={shopInfo.type}
                  onChange={(e) => setShopInfo({ ...shopInfo, type: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1a2b4c] focus:border-[#1a2b4c] outline-none"
                >
                  <option>Phòng khám thú y</option>
                  <option>Spa & Grooming</option>
                  <option>Khách sạn thú cưng</option>
                  <option>Cửa hàng thú cưng</option>
                  <option>Dịch vụ tổng hợp</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={shopInfo.email}
                  onChange={(e) => setShopInfo({ ...shopInfo, email: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1a2b4c] focus:border-[#1a2b4c] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Số điện thoại *
                </label>
                <input
                  type="tel"
                  value={shopInfo.phone}
                  onChange={(e) => setShopInfo({ ...shopInfo, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1a2b4c] focus:border-[#1a2b4c] outline-none"
                  placeholder="Ví dụ: 0912345678"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Thành phố/Tỉnh *
                </label>
                <select
                  value={shopInfo.city}
                  onChange={(e) => setShopInfo({ ...shopInfo, city: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1a2b4c] focus:border-[#1a2b4c] outline-none"
                  required
                >
                  <option value="">Chọn thành phố</option>
                  {VIETNAM_CITIES.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Địa chỉ *
                </label>
                <input
                  type="text"
                  value={shopInfo.address}
                  onChange={(e) => setShopInfo({ ...shopInfo, address: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1a2b4c] focus:border-[#1a2b4c] outline-none"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Mô tả
                </label>
                <textarea
                  value={shopInfo.description}
                  onChange={(e) => setShopInfo({ ...shopInfo, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1a2b4c] focus:border-[#1a2b4c] outline-none resize-none"
                />
              </div>
            </div>
          </div>

          {/* Working Hours */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-4">Giờ làm việc</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Giờ mở cửa
                  </label>
                  <input
                    type="time"
                    value={shopInfo.openTime}
                    onChange={(e) => setShopInfo({ ...shopInfo, openTime: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1a2b4c] focus:border-[#1a2b4c] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Giờ đóng cửa
                  </label>
                  <input
                    type="time"
                    value={shopInfo.closeTime}
                    onChange={(e) => setShopInfo({ ...shopInfo, closeTime: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1a2b4c] focus:border-[#1a2b4c] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">
                  Ngày làm việc
                </label>
                <div className="flex flex-wrap gap-2">
                  {weekDays.map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleWorkingDay(day)}
                      className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                        shopInfo.workingDays.includes(day)
                          ? 'bg-[#1a2b4c] text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

            {/* Submit */}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                className="px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 transition-all"
                disabled={saving}
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-[#1a2b4c] text-white rounded-xl font-semibold hover:opacity-90 transition-all shadow-lg disabled:opacity-70"
              >
                {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
