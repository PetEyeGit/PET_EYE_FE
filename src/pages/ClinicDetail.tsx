import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { shopService } from '../services/shop.service';
import { petService } from '../services/pet.service';
import { useAuth } from '../contexts/AuthContext';
import type { ServiceResponse } from '../types/api';
import type { Pet } from '../types';

const SERVICES = [
  {
    icon: 'vaccines',
    title: 'Tiêm phòng trọn gói',
    desc: 'Bao gồm 7 bệnh phổ biến, sổ giun và khám tổng quát.',
    details: [
      'Tiêm phòng phòng 7 bệnh truyền nhiễm: parvo, distemper, ho cũi, leptospirosis, parainfluenza, coronavirus, và viêm gan.',
      'Kèm theo sổ giun định kỳ và hướng dẫn chăm sóc sau tiêm.',
      'Tư vấn lịch tiêm tiếp theo và theo dõi phản ứng sau tiêm trong 30 phút.',
    ],
    price: '500.000đ',
    unit: '/lần',
    image: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=400&q=80',
  },
  {
    icon: 'content_cut',
    title: 'Spa & Cắt tỉa lông',
    desc: 'Tắm, sấy, cắt tỉa theo yêu cầu, vệ sinh tai móng.',
    details: [
      'Gói cơ bản gồm: tắm, sấy, cắt móng, vệ sinh tai, và xịt dưỡng lông.',
      'Tùy chọn gói cao cấp: massage thư giãn, cắt tỉa tạo kiểu và thải lông.',
      'Sử dụng sản phẩm an toàn cho da và lông thú cưng, phù hợp với thú cưng nhạy cảm.',
    ],
    price: '350.000đ',
    unit: '/từ',
    image: 'https://images.unsplash.com/photo-1560807707-8cc77767d783?w=400&q=80',
  },
  {
    icon: 'medical_services',
    title: 'Khám tổng quát',
    desc: 'Khám sức khỏe định kỳ, tư vấn dinh dưỡng.',
    details: [
      'Kiểm tra tổng quát: tai, mắt, răng, da, tim mạch và hô hấp.',
      'Tư vấn chế độ dinh dưỡng phù hợp theo độ tuổi và giống loài.',
      'Đề xuất các xét nghiệm cần thiết nếu phát hiện dấu hiệu bất thường.',
    ],
    price: '150.000đ',
    unit: '/lần',
    image: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=400&q=80',
  },
  {
    icon: 'biotech',
    title: 'Xét nghiệm máu',
    desc: 'Phân tích công thức máu, sinh hóa toàn diện.',
    details: [
      'Xét nghiệm công thức máu (CBC) và sinh hóa máu cơ bản.',
      'Phát hiện sớm các bệnh về gan, thận và rối loạn chuyển hóa.',
      'Tư vấn kết quả cùng bác sĩ chuyên khoa ngay trong ngày.',
    ],
    price: '300.000đ',
    unit: '/lần',
    image: 'https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?w=400&q=80',
  },
];

const DOCTORS = [
  {
    name: 'BSTY. Nguyễn Văn A',
    role: 'Chuyên khoa Ngoại & Chỉnh hình',
    rating: 4.9,
    reviews: 85,
    img: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=200&auto=format&fit=crop',
  },
  {
    name: 'BSTY. Lê Thị B',
    role: 'Chuyên khoa Nội & Da liễu',
    rating: 4.8,
    reviews: 62,
    img: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=200&auto=format&fit=crop',
  },
  {
    name: 'BSTY. Trần Minh C',
    role: 'Chuyên khoa Mắt & Tai',
    rating: 4.7,
    reviews: 38,
    img: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=200&auto=format&fit=crop',
  },
  {
    name: 'BSTY. Phạm Thu D',
    role: 'Chuyên khoa Dinh dưỡng',
    rating: 4.9,
    reviews: 50,
    img: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&auto=format&fit=crop',
  },
];

const REVIEWS = [
  {
    name: 'Trần Thu Hà',
    date: 'Tháng 10, 2023',
    rating: 5,
    text: 'Bác sĩ A rất nhiệt tình, bé Corgi nhà mình bị viêm da chữa nhiều nơi không khỏi mà qua đây 1 liệu trình là đỡ hẳn. Giá cả cũng hợp lý so với chất lượng.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop',
    reviewImgs: ['https://images.unsplash.com/photo-1587300003388-59208cc962cb?q=80&w=200&auto=format&fit=crop'],
  },
  {
    name: 'Phạm Minh Tuấn',
    date: 'Tháng 9, 2023',
    rating: 4,
    text: 'Cơ sở vật chất mới, sạch sẽ không có mùi hôi. Tuy nhiên giờ cao điểm hơi đông, nên đặt lịch trước qua app để đỡ phải chờ lâu.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop',
    reviewImgs: [],
  },
  {
    name: 'Nguyễn Lan Anh',
    date: 'Tháng 8, 2023',
    rating: 5,
    text: 'Dịch vụ lưu trú tuyệt vời! Có camera xem bé mọi lúc, nhân viên chăm sóc tận tình. Sẽ quay lại lần sau.',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&auto=format&fit=crop',
    reviewImgs: [],
  },
];

const TIME_SLOTS = ['09:00', '10:30', '14:00', '15:30', '16:00'];

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1587300003388-59208cc962cb?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1200&q=80',
];

// Camera tier metadata — default fallbacks (shop can override via cameraTierLabels/cameraTierPrices)
const CAMERA_TIER_META: Record<string, { label: string; desc: string; icon: string; defaultPrice: number }> = {
  BASIC:     { label: 'Cơ bản (720p)',     desc: 'Giám sát tiêu chuẩn, đã bao gồm trong gói', icon: 'visibility',          defaultPrice: 0      },
  HD:        { label: 'Sắc nét (1080p HD)', desc: 'Hình ảnh sắc nét, màu sắc trung thực',       icon: 'hd',                  defaultPrice: 50000  },
  PANORAMIC: { label: 'Toàn cảnh (360°)',   desc: 'Xoay 360 độ, không góc chết',                icon: 'flip_camera_android', defaultPrice: 100000 },
  AI:        { label: 'AI Giám sát',         desc: 'Cảnh báo tự động hành vi bất thường',        icon: 'psychology',          defaultPrice: 150000 },
};

/** Resolve effective price for a tier: use shop's custom price if set, else default */
function tierPrice(tierId: string, tierPrices?: Record<string, number>): number {
  if (tierPrices && tierId in tierPrices) return tierPrices[tierId];
  return CAMERA_TIER_META[tierId]?.defaultPrice ?? 0;
}

/** Resolve effective label for a tier: use shop's custom label if set, else default */
function tierLabel(tierId: string, tierLabels?: Record<string, string>): string {
  if (tierLabels && tierLabels[tierId]) return tierLabels[tierId];
  return CAMERA_TIER_META[tierId]?.label ?? tierId;
}

const today = new Date();

function StarRating({ rating, size = 'text-base' }: { rating: number; size?: string }) {
  return (
    <div className={`flex items-center gap-0.5 text-amber-400 ${size}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
          {star <= Math.floor(rating) ? 'star' : star - rating <= 0.5 ? 'star_half' : 'star_border'}
        </span>
      ))}
    </div>
  );
}

export default function ClinicDetail() {
  const { id } = useParams<{ id: string }>();
  const shopId = Number(id);
  const navigate = useNavigate();
  const { user } = useAuth();

  // ── Real data from API ──────────────────────────────────────────────────────
  const { data: shop, isLoading: shopLoading } = useQuery({
    queryKey: ['shop-public', shopId],
    queryFn: () => shopService.getPublicById(shopId),
    enabled: !!shopId,
  });

  const { data: apiServices = [], isLoading: servicesLoading } = useQuery({
    queryKey: ['shop-services', shopId],
    queryFn: () => shopService.getShopServices(shopId),
    enabled: !!shopId,
  });

  const { data: myPets = [] } = useQuery({
    queryKey: ['my-pets', user?.id],
    queryFn: () => petService.getByOwner(Number(user?.id)),
    enabled: !!user?.id && !isNaN(Number(user.id)),
  });

  // ── Booking state ───────────────────────────────────────────────────────────
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(today.toISOString().split('T')[0]);
  // BOARDING: check-in / check-out dates
  const [checkInDate, setCheckInDate] = useState(today.toISOString().split('T')[0]);
  const [checkOutDate, setCheckOutDate] = useState(() => {
    const d = new Date(today); d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [isFavorited, setIsFavorited] = useState(false);
  const [reviewFilter, setReviewFilter] = useState('Tất cả');
  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([]);
  const [isHotelSelected, setIsHotelSelected] = useState(false);
  const [selectedCameraTier, setSelectedCameraTier] = useState<string>('BASIC');

  // Derive the boarding service from API data
  const boardingService = apiServices.find((s: ServiceResponse) => s.category === 'BOARDING' && s.active);
  // Camera tiers supported by this shop's boarding service
  const supportedCameraTiers = boardingService?.cameraTiers ?? [];
  // Non-boarding services for "Dịch vụ nổi bật"
  const nonBoardingServices = apiServices.filter((s: ServiceResponse) => s.category !== 'BOARDING');

  // Number of boarding days
  const boardingDays = isHotelSelected
    ? Math.max(1, Math.round((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / 86400000))
    : 0;

  // ── Pet selection modal ─────────────────────────────────────────────────────
  const [showPetModal, setShowPetModal] = useState(false);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [petNote, setPetNote] = useState('');

  const toggleService = (serviceId: number) => {
    setSelectedServiceIds(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const cameraTierExtraPrice = isHotelSelected
    ? tierPrice(selectedCameraTier, boardingService?.cameraTierPrices)
    : 0;

  const totalPrice = selectedServiceIds.reduce((sum, id) => {
    const svc = apiServices.find((s: ServiceResponse) => s.id === id);
    return sum + (svc ? svc.price : 0);
  }, 0) + (isHotelSelected
    ? ((boardingService?.price ?? 0) + cameraTierExtraPrice) * boardingDays
    : 0);

  // ── Can book ────────────────────────────────────────────────────────────────
  // - Boarding only: cần checkIn + checkOut
  // - Dịch vụ thường only: cần ít nhất 1 service + date + time
  // - Cả 2: cần đủ cả boarding dates VÀ date+time cho dịch vụ thường
  const hasNormalServices = selectedServiceIds.length > 0;
  const boardingReady = isHotelSelected ? (!!checkInDate && !!checkOutDate && checkInDate < checkOutDate) : true;
  const normalReady = hasNormalServices ? (!!selectedDate && !!selectedTime) : true;
  const canBook = (isHotelSelected || hasNormalServices) && boardingReady && normalReady;

  // ── Open pet modal ──────────────────────────────────────────────────────────
  function handleBookClick() {
    if (!canBook) return;
    setShowPetModal(true);
  }

  // ── After pet selected → go to payment page with state ──────────────────────
  function handleConfirmPet() {
    if (!selectedPet) return;
    setShowPetModal(false);

    // Tập hợp tất cả services đã chọn (thường + boarding)
    const selectedServices = selectedServiceIds.map((id) => {
      const svc = apiServices.find((s: ServiceResponse) => s.id === id)!;
      return { id: svc.id, name: svc.serviceName, price: svc.price };
    });

    if (isHotelSelected && boardingService) {
      const boardingPrice = ((boardingService.price ?? 0) + cameraTierExtraPrice) * boardingDays;
      selectedServices.unshift({
        id: boardingService.id,
        name: `${boardingService.serviceName} · Camera ${tierLabel(selectedCameraTier, boardingService.cameraTierLabels)} · ${boardingDays} ngày`,
        price: boardingPrice,
      });
    }

    // serviceId chính để gửi lên BE:
    // - Nếu có dịch vụ thường → dùng service thường đầu tiên (có datetime cụ thể)
    // - Nếu chỉ có boarding → dùng boardingService
    const primaryServiceId = hasNormalServices
      ? selectedServiceIds[0]
      : boardingService?.id;

    // appointmentDatetime:
    // - Nếu có dịch vụ thường → dùng date+time của dịch vụ thường (BE validate @Future)
    // - Nếu chỉ có boarding → dùng check-in date lúc 12:00
    const appointmentDatetime = hasNormalServices
      ? `${selectedDate}T${selectedTime}:00`
      : `${checkInDate}T12:00:00`;

    const totalServicePrice = selectedServices.reduce((sum, s) => sum + s.price, 0);

    navigate('/payment', {
      state: {
        shopId,
        shopName: shop?.shopName,
        shopAddress: shop ? `${shop.address}${shop.city ? `, ${shop.city}` : ''}` : '',
        shopImage: shop?.licenseImageUrl,
        serviceId: primaryServiceId,
        // Danh sách đầy đủ để hiển thị trên Payment
        services: selectedServices,
        // Giữ lại để tương thích ngược
        serviceName: selectedServices.map(s => s.name).join(', '),
        servicePrice: totalServicePrice,
        petId: selectedPet.id,
        petName: `${selectedPet.name} (${selectedPet.species})`,
        petNote: petNote || undefined,
        appointmentDatetime,
        date: (() => {
          const parts: string[] = [];
          if (hasNormalServices && selectedDate && selectedTime) {
            // Format: "Thứ Ba, 19/05/2026"
            parts.push(new Date(`${selectedDate}T${selectedTime}:00`).toLocaleDateString('vi-VN', {
              weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric'
            }));
          }
          if (isHotelSelected) {
            // Format: "Lưu trú: 04/05/2026 → 05/05/2026"
            parts.push(`Lưu trú: ${new Date(checkInDate + 'T00:00:00').toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })} → ${new Date(checkOutDate + 'T00:00:00').toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}`);
          }
          return parts.join(' | ');
        })(),
        // time: giờ hẹn dịch vụ thường, hoặc "X ngày" nếu chỉ có boarding
        time: hasNormalServices ? selectedTime! : `${boardingDays} ngày`,
        // Truyền thêm để BookingSuccess hiển thị đúng
        normalServiceNames: hasNormalServices
          ? selectedServiceIds.map(id => apiServices.find((s: ServiceResponse) => s.id === id)?.serviceName).filter(Boolean).join(', ')
          : undefined,
      }
    });
  }

  const dayName = today.toLocaleDateString('vi-VN', { weekday: 'long' });
  const dateStr = today.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });

  if (shopLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a2b4c]" />
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-900">
      {/* Breadcrumb */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs text-slate-400 overflow-x-auto whitespace-nowrap">
          <Link to="/home" className="hover:text-[#1a2b4c] transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">home</span>
            Trang chủ
          </Link>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <Link to="/search" className="hover:text-[#1a2b4c] transition-colors">
            Cơ sở thú y
          </Link>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-slate-700 dark:text-slate-300 font-medium">PetCare Sài Gòn</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Clinic Header */}
        <div className="flex flex-wrap justify-between items-start gap-4 pb-5">
          <div className="flex flex-col gap-2">
            <h1 className="text-slate-900 dark:text-slate-100 text-2xl md:text-4xl font-black leading-tight tracking-tight">
              {shop?.shopName ?? 'Đang tải...'}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-slate-500 dark:text-slate-400 text-sm font-medium">
              <span className="flex items-center text-amber-500 gap-1">
                <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                  star
                </span>
                {shop?.ratingAvg ? shop.ratingAvg.toFixed(1) : 'Mới'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-teal-500">location_on</span>
                {shop ? `${shop.address}${shop.city ? `, ${shop.city}` : ''}` : '---'}
              </span>
              {shop?.isVerified && (
                <span className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-bold text-xs">
                  <span className="material-symbols-outlined text-sm">verified</span>
                  Đối tác xác minh
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Link to="/messages" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white hover:bg-primary/90 transition-all text-sm font-bold shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-base">chat</span>
              Nhắn tin
            </Link>
            <button className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm font-semibold">
              <span className="material-symbols-outlined text-base">ios_share</span>
              Chia sẻ
            </button>
            <button
              onClick={() => setIsFavorited(!isFavorited)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-colors text-sm font-semibold ${isFavorited
                ? 'bg-red-50 border-red-200 text-red-500 dark:bg-red-900/20 dark:border-red-800'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
            >
              <span
                className="material-symbols-outlined text-base"
                style={{ fontVariationSettings: isFavorited ? "'FILL' 1" : "'FILL' 0" }}
              >
                favorite
              </span>
              Yêu thích
            </button>
          </div>
        </div>

        {/* Hero Image Grid */}
        <div className="w-full h-[280px] md:h-[380px] lg:h-[460px] gap-2 overflow-hidden rounded-2xl grid grid-cols-4 grid-rows-2 mb-8">
          <div
            className="col-span-2 row-span-2 bg-center bg-no-repeat bg-cover hover:brightness-95 transition-all cursor-pointer relative rounded-tl-2xl rounded-bl-2xl overflow-hidden"
            style={{ backgroundImage: `url(${HERO_IMAGES[0]})` }}
          >
            <div className="absolute inset-0 bg-black/10 hover:bg-transparent transition-colors" />
          </div>
          {HERO_IMAGES.slice(1, 4).map((img, i) => (
            <div
              key={i}
              className={`col-span-1 row-span-1 bg-center bg-no-repeat bg-cover hover:brightness-95 transition-all cursor-pointer relative overflow-hidden ${i === 1 ? 'rounded-tr-2xl' : ''
                }`}
              style={{ backgroundImage: `url(${img})` }}
            >
              <div className="absolute inset-0 bg-black/10 hover:bg-transparent transition-colors" />
            </div>
          ))}
          <div
            className="col-span-1 row-span-1 bg-center bg-no-repeat bg-cover hover:brightness-95 transition-all cursor-pointer relative rounded-br-2xl overflow-hidden"
            style={{ backgroundImage: `url(${HERO_IMAGES[4]})` }}
          >
            <div className="absolute inset-0 bg-black/10 hover:bg-transparent transition-colors" />
            <button className="absolute bottom-3 right-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg flex items-center gap-1.5 hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-sm">grid_view</span>
              Xem tất cả ảnh
            </button>
          </div>
        </div>

        {/* Main 2-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-10">
          {/* Left Column */}
          <div className="flex flex-col gap-10">

            {/* Intro */}
            <section className="border-b border-slate-200 dark:border-slate-800 pb-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">Giới thiệu</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-base">
                {shop?.description ?? 'Đang tải thông tin...'}
              </p>
              {shop?.shopType && (
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full text-xs font-semibold">
                    {shop.shopType}
                  </span>
                </div>
              )}
            </section>

            {/* Doctors */}
            <section className="border-b border-slate-200 dark:border-slate-800 pb-8">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Đội ngũ Bác sĩ</h2>
                <button className="text-[#1a2b4c] dark:text-teal-400 font-semibold text-sm hover:underline">
                  Xem tất cả
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {DOCTORS.map((doc) => (
                  <div
                    key={doc.name}
                    className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                  >
                    <img
                      src={doc.img}
                      alt={doc.name}
                      className="size-16 rounded-full object-cover shrink-0 border-2 border-slate-100 dark:border-slate-700 group-hover:border-teal-400 transition-colors"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-[#1a2b4c] dark:group-hover:text-teal-400 transition-colors">
                        {doc.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{doc.role}</p>
                      <div className="flex items-center gap-1 mt-1.5">
                        <span className="material-symbols-outlined text-amber-400 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                          star
                        </span>
                        <span className="font-bold text-slate-700 dark:text-slate-300 text-xs">{doc.rating}</span>
                        <span className="text-slate-400 text-xs">({doc.reviews} đánh giá)</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
  
            {/* Pet Hotel & Camera Options — chỉ hiển thị nếu shop có dịch vụ BOARDING */}
            {boardingService && (
            <section className="border-b border-slate-200 dark:border-slate-800 pb-8">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm border border-indigo-100 dark:border-indigo-800">
                    <span className="material-symbols-outlined text-2xl">hotel</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{boardingService.serviceName}</h2>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">{boardingService.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{boardingService.price.toLocaleString('vi-VN')}đ</span>
                  <span className="text-xs text-slate-400">/ngày</span>
                  <div
                    onClick={() => setIsHotelSelected(!isHotelSelected)}
                    className={`relative w-12 h-6 rounded-full cursor-pointer transition-all duration-300 ml-2 ${isHotelSelected ? 'bg-indigo-600 shadow-inner' : 'bg-slate-200 dark:bg-slate-700'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${isHotelSelected ? 'left-7 shadow-sm' : 'left-1'}`} />
                  </div>
                </div>
              </div>

                <div className={`transition-all duration-500 overflow-hidden ${isHotelSelected ? 'max-h-[900px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-indigo-100 dark:border-indigo-800 shadow-sm overflow-hidden mb-6">
                  {/* Service image + description */}
                  <div className="p-5 flex flex-col sm:flex-row gap-5">
                    {/* Image */}
                    <div className="w-full sm:w-48 h-40 rounded-xl overflow-hidden shadow-md shrink-0 bg-slate-100 dark:bg-slate-700">
                      <img
                        src={boardingService.imageUrl || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=600&q=80'}
                        className="w-full h-full object-cover"
                        alt={boardingService.serviceName}
                      />
                    </div>

                    {/* Description as feature list — dùng cameraDescription nếu có, fallback sang description chung */}
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base mb-2">{boardingService.serviceName}</h4>
                      {(() => {
                        const descText = boardingService.cameraEnabled && boardingService.cameraDescription
                          ? boardingService.cameraDescription
                          : boardingService.description;
                        return descText ? (
                          <div className="flex flex-col gap-1.5">
                            {descText.split(/[,;.\n]/).filter((s: string) => s.trim().length > 5).map((feature: string, i: number) => (
                              <div key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                                <span className="material-symbols-outlined text-indigo-500 text-base mt-0.5 shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                <span>{feature.trim()}</span>
                              </div>
                            ))}
                          </div>
                        ) : null;
                      })()}
                    </div>
                  </div>

                  {/* Camera tiers — only if shop configured camera */}
                  {boardingService.cameraEnabled && supportedCameraTiers.length > 0 && (
                    <div className="bg-indigo-50/50 dark:bg-indigo-950/20 p-5 border-t border-indigo-100 dark:border-indigo-900 mt-5">
                      <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-400 uppercase tracking-wider mb-4">
                        Nâng cấp Camera Giám sát
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {supportedCameraTiers.map((tierId: string) => {
                          const meta = CAMERA_TIER_META[tierId];
                          if (!meta) return null;
                          const isSelected = selectedCameraTier === tierId;
                          const effectiveLabel = tierLabel(tierId, boardingService?.cameraTierLabels);
                          const effectivePrice = tierPrice(tierId, boardingService?.cameraTierPrices);
                          return (
                            <div
                              key={tierId}
                              onClick={() => setSelectedCameraTier(tierId)}
                              className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between group ${
                                isSelected
                                  ? 'bg-white dark:bg-indigo-900/40 border-indigo-500 shadow-md'
                                  : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-indigo-200'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-500'}`}>
                                  <span className="material-symbols-outlined text-xl">{meta.icon}</span>
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-slate-900 dark:text-white">{effectiveLabel}</p>
                                  <p className="text-[10px] text-slate-500 dark:text-slate-400">{meta.desc}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className={`text-xs font-bold ${effectivePrice === 0 ? 'text-teal-600' : 'text-slate-900 dark:text-white'}`}>
                                  {effectivePrice === 0 ? 'MIỄN PHÍ' : `+${effectivePrice.toLocaleString()}đ`}
                                </p>
                                {effectivePrice > 0 && <p className="text-[8px] text-slate-400">/ngày</p>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>
            )} {/* end BOARDING conditional */}

            {/* Featured Services */}
            <section className="border-b border-slate-200 dark:border-slate-800 pb-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-5">Dịch vụ nổi bật</h2>

              {servicesLoading && (
                <div className="flex flex-col gap-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-20 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl" />
                  ))}
                </div>
              )}

              {!servicesLoading && nonBoardingServices.length === 0 && (
                <p className="text-slate-400 text-sm py-4">Cơ sở này chưa có dịch vụ nào.</p>
              )}

              {!servicesLoading && apiServices.length > 0 && (
                <div className="flex flex-col gap-3">
                  {nonBoardingServices.map((svc: ServiceResponse) => {
                    const isSelected = selectedServiceIds.includes(svc.id);
                    return (
                      <div key={svc.id}>
                        <div
                          onClick={() => toggleService(svc.id)}
                          className={`flex items-center gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-[#1a2b4c]/5 dark:hover:bg-teal-900/10 transition-colors group cursor-pointer border ${
                            isSelected
                              ? 'border-[#1a2b4c]/40 bg-[#1a2b4c]/10 dark:bg-teal-900/40'
                              : 'border-transparent hover:border-[#1a2b4c]/20'
                          }`}
                        >
                          {/* Service Image */}
                          <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 shadow-sm bg-slate-200 dark:bg-slate-700">
                            {svc.imageUrl ? (
                              <img
                                src={svc.imageUrl}
                                alt={svc.serviceName}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="material-symbols-outlined text-slate-400 text-2xl">pets</span>
                              </div>
                            )}
                          </div>

                          {/* Service Info */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm group-hover:text-[#1a2b4c] dark:group-hover:text-teal-400 transition-colors">
                              {svc.serviceName}
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                              {svc.description}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">⏱ {svc.durationMinutes} phút</p>
                          </div>

                          {/* Price */}
                          <div className="text-right shrink-0">
                            <span className="block font-bold text-slate-900 dark:text-slate-100 text-sm">
                              {svc.price.toLocaleString('vi-VN')}đ
                            </span>
                            <span className="text-xs text-slate-400">/lần</span>
                          </div>
                        </div>

                        {isSelected && svc.description && (
                          <div className="mt-2 px-4 pb-4 text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center justify-between mb-2 pt-3">
                              <span className="font-semibold text-slate-900 dark:text-slate-100">Chi tiết dịch vụ</span>
                              <span className="text-xs text-slate-500 dark:text-slate-400">Nhấn để ẩn</span>
                            </div>
                            <p>{svc.description}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Live Camera Promo */}
            {/* <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white p-8">
              <div
                className="absolute top-0 right-0 w-1/2 h-full opacity-20 bg-cover bg-no-repeat bg-center rounded-2xl"
                style={{
                  backgroundImage:
                    'url(https://images.unsplash.com/photo-1601758174184-07ba1e5b0a7a?q=80&w=600&auto=format&fit=crop)',
                }}
              />
              <div className="relative z-10 flex flex-col gap-4 max-w-[60%]">
                <div className="flex items-center gap-2 text-teal-400 font-bold tracking-wider text-xs uppercase">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500" />
                  </span>
                  Live Camera Experience
                </div>
                <h3 className="text-2xl font-bold leading-tight">Quan sát thú cưng từ xa</h3>
                <p className="text-slate-300 text-sm">
                  Đặt lịch dịch vụ lưu trú và theo dõi bé yêu mọi lúc mọi nơi thông qua ứng dụng Peteye.
                </p>
                <button className="w-fit mt-2 px-5 py-2.5 bg-white text-slate-900 rounded-lg font-bold text-sm hover:bg-slate-100 transition-colors shadow-lg">
                  Tải App Ngay
                </button>
              </div>
            </section> */}

            {/* Reviews */}
            <section>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  Đánh giá từ cộng đồng
                  <span className="text-slate-400 font-normal text-base">(120)</span>
                </h2>
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <span className="text-3xl font-black text-slate-900 dark:text-slate-100">4.8</span>
                    <div className="flex text-amber-400 justify-center mt-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <span key={s} className="material-symbols-outlined text-sm" style={{ fontVariationSettings: s <= 4 ? "'FILL' 1" : "'FILL' 0" }}>
                          star
                        </span>
                      ))}
                    </div>
                  </div>
                  <select className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 py-2 text-slate-700 dark:text-slate-300 outline-none focus:ring-1 focus:ring-[#1a2b4c]">
                    <option>Mới nhất</option>
                    <option>Cao nhất</option>
                    <option>Thấp nhất</option>
                  </select>
                </div>
              </div>

              {/* Filter tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {['Tất cả', '5 sao (98)', 'Có hình ảnh (45)', 'Bác sĩ tận tâm', 'Giá hợp lý'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setReviewFilter(f)}
                    className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${reviewFilter === f
                      ? 'bg-[#1a2b4c] text-white border-[#1a2b4c]'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-[#1a2b4c] hover:text-[#1a2b4c]'
                      }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {/* Review list */}
              <div className="flex flex-col gap-6">
                {REVIEWS.map((review) => (
                  <div
                    key={review.name}
                    className="flex gap-4 pb-6 border-b border-slate-100 dark:border-slate-800 last:border-0"
                  >
                    <img
                      src={review.avatar}
                      alt={review.name}
                      className="size-10 rounded-full object-cover shrink-0"
                    />
                    <div className="flex flex-col gap-2 flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{review.name}</h4>
                          <span className="text-xs text-slate-400">{review.date}</span>
                        </div>
                        <div className="flex text-amber-400">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <span
                              key={s}
                              className="material-symbols-outlined text-sm"
                              style={{ fontVariationSettings: s <= review.rating ? "'FILL' 1" : "'FILL' 0" }}
                            >
                              star
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{review.text}</p>
                      {review.reviewImgs.length > 0 && (
                        <div className="flex gap-2 mt-1">
                          {review.reviewImgs.map((img, i) => (
                            <img
                              key={i}
                              src={img}
                              alt="Review"
                              className="w-20 h-20 rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity"
                            />
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-4 mt-1">
                        <button className="flex items-center gap-1 text-xs text-slate-400 hover:text-[#1a2b4c] transition-colors">
                          <span className="material-symbols-outlined text-sm">thumb_up</span>
                          Hữu ích
                        </button>
                        <button className="flex items-center gap-1 text-xs text-slate-400 hover:text-[#1a2b4c] transition-colors">
                          <span className="material-symbols-outlined text-sm">chat_bubble</span>
                          Phản hồi
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center mt-6">
                <button className="px-6 py-2.5 rounded-full border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  Xem thêm 117 đánh giá
                </button>
              </div>
            </section>
          </div>

          {/* Right Column - Sticky Sidebar */}
          <div className="hidden lg:block">
            <div className="sticky top-24 flex flex-col gap-5">
              {/* Booking Card */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-none p-6 flex flex-col gap-5">

                {/* Service Select */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">
                    Chọn dịch vụ
                  </label>
                  <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 max-h-[240px] overflow-y-auto">

                    {/* Hotel — chỉ hiển thị nếu shop có service BOARDING */}
                    {boardingService && (
                      <label className="flex items-start gap-3 p-2 rounded-lg hover:bg-white dark:hover:bg-slate-700 cursor-pointer transition-colors group mb-1 border-b border-slate-100 dark:border-slate-700/50 pb-3">
                        <input
                          type="checkbox"
                          checked={isHotelSelected}
                          onChange={() => setIsHotelSelected(!isHotelSelected)}
                          className="mt-1 w-4 h-4 rounded border-slate-300 text-[#1a2b4c] focus:ring-[#1a2b4c] cursor-pointer"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform inline-block">
                              {boardingService.serviceName}
                            </span>
                            <span className="text-xs font-black text-slate-900 dark:text-slate-100 shrink-0">
                              {(boardingService.price + cameraTierExtraPrice).toLocaleString('vi-VN')}đ/ng
                            </span>
                          </div>
                          {boardingService.cameraEnabled && (
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                              Camera: {tierLabel(selectedCameraTier, boardingService.cameraTierLabels)}
                            </p>
                          )}
                        </div>
                      </label>
                    )}

                    {/* Regular services */}
                    {apiServices
                      .filter((s: ServiceResponse) => s.category !== 'BOARDING')
                      .map((svc: ServiceResponse) => (
                        <label
                          key={svc.id}
                          className="flex items-start gap-3 p-2 rounded-lg hover:bg-white dark:hover:bg-slate-700 cursor-pointer transition-colors group"
                        >
                          <input
                            type="checkbox"
                            checked={selectedServiceIds.includes(svc.id)}
                            onChange={() => toggleService(svc.id)}
                            className="mt-1 w-4 h-4 rounded border-slate-300 text-[#1a2b4c] focus:ring-[#1a2b4c] cursor-pointer"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 group-hover:text-[#1a2b4c] dark:group-hover:text-teal-400 transition-colors">
                                {svc.serviceName}
                              </span>
                              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 shrink-0">
                                {svc.price.toLocaleString('vi-VN')}đ
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                              {svc.description}
                            </p>
                          </div>
                        </label>
                      ))}
                  </div>

                  {/* Summary row */}
                  {(selectedServiceIds.length > 0 || isHotelSelected) && (
                    <div className="mt-3 p-3 bg-slate-900 dark:bg-slate-800 rounded-xl text-white">
                      <div className="flex justify-between items-center text-xs opacity-80 mb-1">
                        <span>Dịch vụ đã chọn:</span>
                        <span>{selectedServiceIds.length + (isHotelSelected ? 1 : 0)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold">Tổng cộng:</span>
                        <span className="text-base font-black text-teal-400">
                          {totalPrice.toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Date / Check-in-out — hiển thị theo loại dịch vụ đã chọn */}

                {/* Boarding: check-in / check-out */}
                {isHotelSelected && (
                  <div className="flex flex-col gap-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-indigo-500 mb-0 block">
                      Lưu trú — Ngày nhận & trả phòng
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-semibold text-slate-400 mb-1 block">Nhận phòng</label>
                        <input
                          type="date"
                          min={today.toISOString().split('T')[0]}
                          value={checkInDate}
                          onChange={e => {
                            setCheckInDate(e.target.value);
                            if (e.target.value >= checkOutDate) {
                              const d = new Date(e.target.value + 'T00:00:00');
                              d.setDate(d.getDate() + 1);
                              setCheckOutDate(d.toISOString().split('T')[0]);
                            }
                          }}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-indigo-200 dark:border-indigo-700 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-700 dark:text-slate-300 outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-400 mb-1 block">Trả phòng</label>
                        <input
                          type="date"
                          min={(() => { const d = new Date(checkInDate + 'T00:00:00'); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0]; })()}
                          value={checkOutDate}
                          onChange={e => setCheckOutDate(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-indigo-200 dark:border-indigo-700 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-700 dark:text-slate-300 outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                    {boardingDays > 0 && (
                      <div className="flex items-center justify-between px-3 py-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-sm">
                        <span className="text-indigo-700 dark:text-indigo-300 font-semibold">Tổng thời gian:</span>
                        <span className="font-black text-indigo-900 dark:text-indigo-200">{boardingDays} ngày</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Dịch vụ thường: date + time slots */}
                {hasNormalServices && (
                  <>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">
                        {isHotelSelected ? 'Dịch vụ thường — Ngày hẹn' : 'Ngày hẹn'}
                      </label>
                      <input
                        type="date"
                        min={today.toISOString().split('T')[0]}
                        value={selectedDate}
                        onChange={e => { setSelectedDate(e.target.value); setSelectedTime(null); }}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 outline-none focus:ring-1 focus:ring-[#1a2b4c]"
                      />
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 border border-slate-100 dark:border-slate-700">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                          Khung giờ trống
                        </span>
                        <span className="text-xs text-[#1a2b4c] dark:text-teal-400 font-semibold">
                          {selectedDate
                            ? new Date(selectedDate + "T00:00:00").toLocaleDateString("vi-VN", { weekday: "short", day: "2-digit", month: "2-digit" })
                            : `${dayName}, ${dateStr}`}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {TIME_SLOTS.map((time) => (
                          <button
                            key={time}
                            onClick={() => setSelectedTime(time)}
                            className={`py-2 text-xs font-semibold rounded border transition-all ${
                              selectedTime === time
                                ? "bg-[#1a2b4c] text-white border-[#1a2b4c] shadow-md"
                                : "bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-[#1a2b4c] hover:text-[#1a2b4c]"
                            }`}
                          >
                            {time}
                          </button>
                        ))}
                        <button className="py-2 text-xs font-semibold rounded border bg-slate-100 dark:bg-slate-800 text-slate-300 cursor-not-allowed border-slate-200 dark:border-slate-700">
                          17:00
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* Nếu chưa chọn gì */}
                {!isHotelSelected && !hasNormalServices && (
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700 text-center text-xs text-slate-400">
                    Chọn dịch vụ để đặt lịch
                  </div>
                )}
            {/* CTA */}
<button
  onClick={handleBookClick}
  disabled={!canBook}
  className={`w-full h-12 flex items-center justify-center gap-2 rounded-xl font-bold transition-all text-base ${
    canBook
      ? "bg-[#1a2b4c] text-white hover:bg-[#243d6b] hover:scale-[1.02] shadow-lg shadow-[#1a2b4c]/25 cursor-pointer"
      : "bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed"
  }`}
>
  <span className="material-symbols-outlined">calendar_month</span>
  {canBook
    ? "Đặt lịch ngay"
    : !isHotelSelected && !hasNormalServices
      ? "Chọn dịch vụ trước"
      : isHotelSelected && !boardingReady
        ? "Chọn ngày nhận & trả phòng"
        : hasNormalServices && !normalReady
          ? "Chọn ngày & giờ hẹn"
          : "Đặt lịch ngay"}
</button>

<div className="flex gap-3">
  <button className="flex-1 h-10 flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm transition-colors">
    <span className="material-symbols-outlined text-lg">call</span>
    Gọi điện
  </button>

  <Link
    to="/messages"
    className="flex-1 h-10 flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm transition-colors"
  >
    <span className="material-symbols-outlined text-lg">chat</span>
    Nhắn tin
  </Link>
</div>

<div className="flex items-center justify-center gap-1 text-xs text-slate-400 font-medium">
  <span className="material-symbols-outlined text-sm text-teal-500">
    verified_user
  </span>
  Đặt lịch miễn phí · Hủy dễ dàng
</div>
              {/* Map Card */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 flex flex-col gap-3">
                <div
                  className="w-full h-44 rounded-xl overflow-hidden relative bg-cover bg-center"
                  style={{
                    backgroundImage:
                      'url(https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=600&auto=format&fit=crop)',
                  }}
                >
                  <div className="absolute inset-0 bg-[#1a2b4c]/20" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="material-symbols-outlined text-red-500 text-5xl drop-shadow-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                      location_on
                    </span>
                  </div>
                  <button className="absolute bottom-3 right-3 bg-white text-[#1a2b4c] px-3 py-1.5 rounded-lg text-xs font-bold shadow-md hover:bg-slate-100 transition-colors flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                    Mở bản đồ
                  </button>
                </div>
                <div className="flex items-start gap-3 px-1">
                  <span className="material-symbols-outlined text-slate-400 mt-0.5 text-xl">map</span>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {shop ? `${shop.address}${shop.city ? `, ${shop.city}` : ''}` : '---'}
                  </p>
                </div>
                <div className="flex items-start gap-3 px-1">
                  <span className="material-symbols-outlined text-slate-400 mt-0.5 text-xl">schedule</span>
                  <div className="flex flex-col text-sm">
                    <span className="text-green-600 dark:text-green-400 font-semibold">Đang mở cửa</span>
                    <span className="text-slate-500 dark:text-slate-400">08:00 - 20:00 (T2 - CN)</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-1">
                  <span className="material-symbols-outlined text-slate-400 text-xl">phone</span>
                  <a href={`tel:${shop?.phone}`} className="text-sm text-[#1a2b4c] dark:text-teal-400 font-semibold hover:underline">
                    {shop?.phone ?? '---'}
                  </a>
                </div>
              </div>

              {/* Nearby Clinics */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-teal-500 text-base">near_me</span>
                  Cơ sở gần đây
                </h3>
                <div className="flex flex-col gap-3">
                  {[
                    { name: 'Bệnh Viện Thú Y Quận 1', dist: '2.8 km', rating: 4.6 },
                    { name: 'PetCare Bình Thạnh', dist: '4.5 km', rating: 4.5 },
                  ].map((c) => (
                    <Link
                      key={c.name}
                      to="/clinic/2"
                      className="flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg p-2 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 text-xs leading-tight">
                          {c.name}
                        </p>
                        <p className="text-xs text-slate-400">{c.dist}</p>
                      </div>
                      <div className="flex items-center gap-1 text-amber-400">
                        <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>
                          star
                        </span>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{c.rating}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile bottom bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 z-50 shadow-2xl">
        <div className="flex flex-col">
          <span className="text-xs text-slate-500">Giá khám từ</span>
          <span className="font-black text-xl text-slate-900 dark:text-slate-100">150.000đ</span>
        </div>
        <div className="flex gap-2 flex-1">
          <button className="flex items-center justify-center gap-2 h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm">
            <span className="material-symbols-outlined text-base">call</span>
          </button>
          <Link
            to="/bookings"
            className="flex-1 h-12 flex items-center justify-center gap-2 rounded-xl bg-[#1a2b4c] text-white font-bold text-sm shadow-lg shadow-[#1a2b4c]/25"
          >
            <span className="material-symbols-outlined text-base">calendar_month</span>
            Đặt lịch ngay
          </Link>
        </div>
      </div>

      {/* Space for mobile bottom bar */}
      <div className="lg:hidden h-24" />

      {/* ── Pet Selection Modal ─────────────────────────────────────────────── */}
      {showPetModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-700">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Chọn thú cưng</h2>
                <p className="text-xs text-slate-500 mt-0.5">Bé nào sẽ sử dụng dịch vụ hôm nay?</p>
              </div>
              <button
                onClick={() => setShowPetModal(false)}
                className="w-9 h-9 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined text-slate-500">close</span>
              </button>
            </div>

            {/* Pet list */}
            <div className="p-5 space-y-3 max-h-72 overflow-y-auto">
              {myPets.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <span className="material-symbols-outlined text-4xl block mb-2">pets</span>
                  <p className="text-sm font-semibold">Bạn chưa có thú cưng nào</p>
                  <Link
                    to="/profile/pets"
                    className="mt-2 inline-block text-sm text-[#1a2b4c] dark:text-teal-400 font-bold hover:underline"
                    onClick={() => setShowPetModal(false)}
                  >
                    + Thêm thú cưng
                  </Link>
                </div>
              ) : (
                myPets.filter((p: any) => p.active).map((pet: any) => (
                  <button
                    key={pet.id}
                    onClick={() => setSelectedPet(pet)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                      selectedPet?.id === pet.id
                        ? 'border-[#1a2b4c] bg-[#1a2b4c]/5 dark:border-teal-400 dark:bg-teal-900/10'
                        : 'border-slate-200 dark:border-slate-700 hover:border-[#1a2b4c]/40'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-700 border-2 border-white dark:border-slate-600 shadow">
                      {pet.avatar
                        ? <img src={pet.avatar} alt={pet.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-slate-400">pets</span>
                          </div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 dark:text-white">{pet.name}</p>
                      <p className="text-xs text-slate-500">{pet.species} · {pet.breed} · {pet.weight}kg</p>
                    </div>
                    {selectedPet?.id === pet.id && (
                      <span className="material-symbols-outlined text-[#1a2b4c] dark:text-teal-400 shrink-0" style={{fontVariationSettings:"'FILL' 1"}}>check_circle</span>
                    )}
                  </button>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-slate-100 dark:border-slate-700 flex gap-3">
              <button
                onClick={() => setShowPetModal(false)}
                className="flex-1 py-3 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmPet}
                disabled={!selectedPet}
                className="flex-1 py-3 bg-[#1a2b4c] text-white font-bold rounded-xl hover:bg-[#243d6b] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Tiếp tục thanh toán →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
