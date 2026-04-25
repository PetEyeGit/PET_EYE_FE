import React, { useState } from 'react';
import { Link } from 'react-router-dom';

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

const CAMERA_OPTIONS = [
  { id: 'basic', label: 'Cơ bản (720p)', price: 0, desc: 'Giám sát tiêu chuẩn, đã bao gồm trong gói', icon: 'visibility' },
  { id: 'hd', label: 'Sắc nét (1080p HD)', price: 50000, desc: 'Hình ảnh sắc nét, màu sắc trung thực', icon: 'hd' },
  { id: '360', label: 'Toàn cảnh (360°)', price: 100000, desc: 'Xoay 360 độ, không góc chết', icon: 'flip_camera_android' },
  { id: 'ai', label: 'AI Giám sát', price: 150000, desc: 'Cảnh báo tự động hành vi bất thường', icon: 'psychology' },
];

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
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [reviewFilter, setReviewFilter] = useState('Tất cả');
  const [selectedServices, setSelectedServices] = useState<string[]>(['Khám tổng quát']);
  const [isHotelSelected, setIsHotelSelected] = useState(false);
  const [selectedCameraOption, setSelectedCameraOption] = useState(CAMERA_OPTIONS[0]);

  const toggleService = (serviceTitle: string) => {
    setSelectedServices(prev =>
      prev.includes(serviceTitle)
        ? prev.filter(s => s !== serviceTitle)
        : [...prev, serviceTitle]
    );
  };

  const today = new Date();
  const dayName = today.toLocaleDateString('vi-VN', { weekday: 'long' });
  const dateStr = today.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });

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
              Phòng Khám Thú Y PetCare Sài Gòn
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-slate-500 dark:text-slate-400 text-sm font-medium">
              <span className="flex items-center text-amber-500 gap-1">
                <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                  star
                </span>
                4.8
              </span>
              <span>•</span>
              <span className="underline decoration-slate-300 cursor-pointer hover:text-[#1a2b4c]">
                120 đánh giá
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-teal-500">location_on</span>
                Quận 7, TP. Hồ Chí Minh
              </span>
              <span className="flex items-center gap-1 text-teal-600 dark:text-teal-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                Đang mở cửa
              </span>
              <span className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-bold text-xs">
                <span className="material-symbols-outlined text-sm">verified</span>
                Đối tác xác minh
              </span>
            </div>
          </div>
          <div className="flex gap-2">
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
                Phòng khám thú y PetCare Sài Gòn cam kết mang lại dịch vụ chăm sóc sức khỏe tốt nhất cho thú cưng
                của bạn. Với hơn 10 năm kinh nghiệm, đội ngũ bác sĩ của chúng tôi không chỉ giỏi chuyên môn mà
                còn yêu thương động vật như chính người nhà. Cơ sở vật chất đạt chuẩn quốc tế, trang thiết bị
                chẩn đoán hình ảnh hiện đại và khu vực lưu trú sạch sẽ, thoáng mát.
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                {['Siêu âm màu', 'Phẫu thuật', 'Spa & Grooming', 'Cấp cứu 24/7', 'X-quang', 'Chứng nhận ISO'].map(
                  (tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full text-xs font-semibold"
                    >
                      {tag}
                    </span>
                  )
                )}
              </div>
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                {[
                  { label: 'Năm hoạt động', value: '10+', icon: 'work_history' },
                  { label: 'Bệnh nhân/tháng', value: '500+', icon: 'pets' },
                  { label: 'Bác sĩ chuyên môn', value: '8', icon: 'stethoscope' },
                ].map(({ label, value, icon }) => (
                  <div
                    key={label}
                    className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 text-center border border-slate-100 dark:border-slate-700"
                  >
                    <span className="material-symbols-outlined text-2xl text-[#1a2b4c] dark:text-teal-400 block mb-1">
                      {icon}
                    </span>
                    <span className="block text-2xl font-black text-slate-900 dark:text-slate-100">{value}</span>
                    <span className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5">{label}</span>
                  </div>
                ))}
              </div>
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
  
            {/* Pet Hotel & Camera Options */}
            <section className="border-b border-slate-200 dark:border-slate-800 pb-8">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm border border-indigo-100 dark:border-indigo-800">
                    <span className="material-symbols-outlined text-2xl">hotel</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Dịch vụ Lưu trú Khách sạn</h2>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">Tiêu chuẩn quốc tế, giám sát 24/7</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">200.000đ</span>
                  <span className="text-xs text-slate-400">/ngày</span>
                  <div 
                    onClick={() => setIsHotelSelected(!isHotelSelected)}
                    className={`relative w-12 h-6 rounded-full cursor-pointer transition-all duration-300 ml-2 ${isHotelSelected ? 'bg-indigo-600 shadow-inner' : 'bg-slate-200 dark:bg-slate-700'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${isHotelSelected ? 'left-7 shadow-sm' : 'left-1'}`} />
                  </div>
                </div>
              </div>

              <div className={`transition-all duration-500 overflow-hidden ${isHotelSelected ? 'max-h-[800px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-indigo-100 dark:border-indigo-800 shadow-sm overflow-hidden mb-6">
                  <div className="p-5 flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-1/3 h-48 rounded-xl overflow-hidden shadow-md">
                      <img 
                        src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800&q=80" 
                        className="w-full h-full object-cover"
                        alt="Pet Hotel"
                      />
                    </div>
                    <div className="flex-1 space-y-4">
                      <h4 className="font-bold text-slate-900 dark:text-white text-lg">Gói lưu trú Premium</h4>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                        {[
                          'Phòng riêng điều hòa 24/7',
                          '2 bữa ăn/ngày theo yêu cầu',
                          'Vệ sinh khay cát/chuồng sạch sẽ',
                          'Theo dõi sức khỏe hàng ngày',
                          'Thời gian vui chơi tập thể',
                          'Camera giám sát trực tiếp'
                        ].map(item => (
                          <li key={item} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                            <span className="material-symbols-outlined text-indigo-500 text-sm">check_circle</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="bg-indigo-50/50 dark:bg-indigo-950/20 p-5 border-t border-indigo-100 dark:border-indigo-900">
                    <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-400 uppercase tracking-wider mb-4">Nâng cấp Camera Giám sát</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {CAMERA_OPTIONS.map((opt) => (
                        <div 
                          key={opt.id}
                          onClick={() => setSelectedCameraOption(opt)}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between group ${
                            selectedCameraOption.id === opt.id 
                              ? 'bg-white dark:bg-indigo-900/40 border-indigo-500 shadow-md' 
                              : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-indigo-200'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${selectedCameraOption.id === opt.id ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-500'}`}>
                              <span className="material-symbols-outlined text-xl">{opt.icon}</span>
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900 dark:text-white">{opt.label}</p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400">{opt.desc}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-xs font-bold ${opt.price === 0 ? 'text-teal-600' : 'text-slate-900 dark:text-white'}`}>
                              {opt.price === 0 ? 'MIỄN PHÍ' : `+${opt.price.toLocaleString()}đ`}
                            </p>
                            {opt.price > 0 && <p className="text-[8px] text-slate-400">/ngày</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Featured Services */}
            <section className="border-b border-slate-200 dark:border-slate-800 pb-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-5">Dịch vụ nổi bật</h2>
              <div className="flex flex-col gap-3">
                {SERVICES.map((svc) => {
                  const isSelected = selectedServices.includes(svc.title);

                  return (
                    <div key={svc.title}>
                      <div
                        onClick={() => toggleService(svc.title)}
                        className={`flex items-center gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-[#1a2b4c]/5 dark:hover:bg-teal-900/10 transition-colors group cursor-pointer border ${
                          isSelected
                            ? 'border-[#1a2b4c]/40 bg-[#1a2b4c]/10 dark:bg-teal-900/40'
                            : 'border-transparent hover:border-[#1a2b4c]/20'
                        }`}
                      >
                        {/* Service Image */}
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 shadow-sm">
                          <img
                            src={svc.image}
                            alt={svc.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                          <div className="absolute bottom-1 right-1 p-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-md">
                            <span className="material-symbols-outlined text-teal-600 dark:text-teal-400 text-sm">
                              {svc.icon}
                            </span>
                          </div>
                        </div>

                        {/* Service Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm group-hover:text-[#1a2b4c] dark:group-hover:text-teal-400 transition-colors">
                            {svc.title}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">{svc.desc}</p>
                        </div>

                        {/* Price */}
                        <div className="text-right shrink-0">
                          <span className="block font-bold text-slate-900 dark:text-slate-100 text-sm">{svc.price}</span>
                          <span className="text-xs text-slate-400">{svc.unit}</span>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="mt-2 px-4 pb-4 text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-slate-900 dark:text-slate-100">Chi tiết dịch vụ</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">Nhấn để ẩn</span>
                          </div>
                          <ul className="list-disc pl-5 space-y-1">
                            {svc.details.map((detail) => (
                              <li key={detail}>{detail}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <button className="w-full mt-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm">
                Xem toàn bộ bảng giá
              </button>
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
                <div className="flex justify-between items-center pb-4 border-b border-dashed border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400 font-medium text-sm">Giá khám tư vấn</span>
                  <span className="text-xl font-bold text-slate-900 dark:text-slate-100">150.000đ</span>
                </div>

                {/* Service Select */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">
                    Chọn dịch vụ
                  </label>
                    <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 max-h-[240px] overflow-y-auto">
                      {/* Hotel Service Special Case in Sidebar */}
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
                              Lưu trú Khách sạn
                            </span>
                            <span className="text-xs font-black text-slate-900 dark:text-slate-100 shrink-0">
                              {(200000 + selectedCameraOption.price).toLocaleString()}đ/ng
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                            Camera: {selectedCameraOption.label}
                          </p>
                        </div>
                      </label>

                      {SERVICES.map((svc) => (
                        <label
                          key={svc.title}
                          className="flex items-start gap-3 p-2 rounded-lg hover:bg-white dark:hover:bg-slate-700 cursor-pointer transition-colors group"
                        >
                          <input
                            type="checkbox"
                            checked={selectedServices.includes(svc.title)}
                            onChange={() => toggleService(svc.title)}
                            className="mt-1 w-4 h-4 rounded border-slate-300 text-[#1a2b4c] focus:ring-[#1a2b4c] cursor-pointer"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 group-hover:text-[#1a2b4c] dark:group-hover:text-teal-400 transition-colors">
                                {svc.title}
                              </span>
                              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 shrink-0">
                                {svc.price}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                              {svc.desc}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                    {/* Summary row */}
                    {(selectedServices.length > 0 || isHotelSelected) && (
                      <div className="mt-3 p-3 bg-slate-900 dark:bg-slate-800 rounded-xl text-white">
                        <div className="flex justify-between items-center text-xs opacity-80 mb-1">
                          <span>Dịch vụ đã chọn:</span>
                          <span>{selectedServices.length + (isHotelSelected ? 1 : 0)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-bold">Tổng cộng:</span>
                          <span className="text-base font-black text-teal-400">
                            {(
                              selectedServices.reduce((sum, title) => {
                                const svc = SERVICES.find(s => s.title === title);
                                return sum + (svc ? parseInt(svc.price.replace(/\D/g, '')) : 0);
                              }, 0) + 
                              (isHotelSelected ? (200000 + selectedCameraOption.price) : 0)
                            ).toLocaleString()}đ
                          </span>
                        </div>
                      </div>
                    )}
                </div>

                {/* Date */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">
                    Ngày hẹn
                  </label>
                  <input
                    type="date"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 outline-none focus:ring-1 focus:ring-[#1a2b4c]"
                    defaultValue={today.toISOString().split('T')[0]}
                  />
                </div>

                {/* Time Slots */}
                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                      Khung giờ trống
                    </span>
                    <span className="text-xs text-[#1a2b4c] dark:text-teal-400 font-semibold">
                      {dayName}, {dateStr}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {TIME_SLOTS.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`py-2 text-xs font-semibold rounded border transition-all ${selectedTime === time
                          ? 'bg-[#1a2b4c] text-white border-[#1a2b4c] shadow-md'
                          : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-[#1a2b4c] hover:text-[#1a2b4c]'
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

                {/* CTA */}
                <Link
                  to="/payment"
                  className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-[#1a2b4c] text-white font-bold hover:bg-[#243d6b] hover:scale-[1.02] transition-all shadow-lg shadow-[#1a2b4c]/25 text-base"
                >
                  <span className="material-symbols-outlined">calendar_month</span>
                  Đặt lịch ngay
                </Link>

                <div className="flex gap-3">
                  <button className="flex-1 h-10 flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm transition-colors">
                    <span className="material-symbols-outlined text-lg">call</span> Gọi điện
                  </button>
                  <Link
                    to="/messages"
                    className="flex-1 h-10 flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">chat</span> Nhắn tin
                  </Link>
                </div>

                <div className="flex items-center justify-center gap-1 text-xs text-slate-400 font-medium">
                  <span className="material-symbols-outlined text-sm text-teal-500">verified_user</span>
                  Đặt lịch miễn phí · Hủy dễ dàng
                </div>
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
                    123 Nguyễn Thị Thập, Phường Tân Phú, Quận 7, TP. Hồ Chí Minh
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
                  <a href="tel:+84909123456" className="text-sm text-[#1a2b4c] dark:text-teal-400 font-semibold hover:underline">
                    0909 123 456
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
    </div>
  );
}
