import React, { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Heart, Zap, Users, ArrowRight, Briefcase, Handshake, Newspaper } from 'lucide-react';

export default function About() {
  const location = useLocation();

  // Scroll to section based on hash
  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.replace('#', ''));
      if (element) {
        // Adding a slight delay to ensure layout is ready
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);

  const fadeIn = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pt-24">
      
      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-6 md:px-12 lg:px-20 mb-24">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="relative rounded-3xl overflow-hidden bg-primary/5 border border-primary/10 p-10 md:p-16 lg:p-24 flex flex-col items-center text-center"
        >
          {/* Background decorative elements */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-secondary/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

          <h1 className="relative z-10 text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight mb-6">
            Nền tảng kết nối <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">yêu thương</span>
          </h1>
          <p className="relative z-10 text-lg md:text-xl text-slate-600 max-w-3xl leading-relaxed">
            PetEye ra đời với sứ mệnh mang lại cuộc sống tốt đẹp nhất cho thú cưng thông qua hệ sinh thái dịch vụ toàn diện, minh bạch và an toàn.
          </p>
        </motion.div>
      </section>

      {/* Brand Story Section */}
      <section id="story" className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 mb-32 scroll-mt-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm">
              <Heart size={16} /> Câu chuyện thương hiệu
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
              Khởi nguồn từ tình yêu với những người bạn nhỏ
            </h2>
            <div className="space-y-4 text-slate-600 leading-relaxed text-lg">
              <p>
                PetEye được hình thành từ một trăn trở đơn giản của những người nuôi thú cưng: Làm thế nào để tìm được các cơ sở thú y, spa uy tín một cách nhanh chóng và theo dõi thú cưng của mình mọi lúc mọi nơi?
              </p>
              <p>
                Chúng tôi hiểu rằng, thú cưng không chỉ là vật nuôi, mà là một thành viên quan trọng trong gia đình. Vì vậy, PetEye tiên phong ứng dụng công nghệ để tạo ra một môi trường minh bạch, nơi bạn có thể yên tâm gửi gắm tình yêu thương.
              </p>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=1000" 
                alt="Chó và người chủ" 
                className="w-full h-full object-cover"
              />
            </div>
            {/* Glassmorphism card floating */}
            <div className="absolute -bottom-8 -left-8 bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/40 max-w-xs hidden md:block">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0">
                  <Shield size={24} />
                </div>
                <div>
                  <p className="font-bold text-slate-900">An toàn tuyệt đối</p>
                  <p className="text-sm text-slate-500">Giám sát 24/7 với camera</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Core Values */}
      <section className="bg-white py-24 border-y border-slate-100 mb-32">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Giá trị cốt lõi</h2>
            <p className="text-slate-600">Những tiêu chuẩn chúng tôi không bao giờ thỏa hiệp trong quá trình phục vụ bạn và thú cưng.</p>
          </div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              { icon: Shield, title: "Minh bạch & Uy tín", desc: "Mọi đối tác trên PetEye đều được kiểm định chặt chẽ về chất lượng và giấy phép hoạt động." },
              { icon: Heart, title: "Tận tâm", desc: "Đặt sức khỏe và sự thoải mái của thú cưng lên hàng đầu trong mọi dịch vụ." },
              { icon: Zap, title: "Nhanh chóng & Tiện lợi", desc: "Đặt lịch, thanh toán và theo dõi dễ dàng chỉ qua vài thao tác trên điện thoại." }
            ].map((item, index) => (
              <motion.div key={index} variants={fadeIn} className="bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:shadow-lg transition-shadow duration-300">
                <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6">
                  <item.icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Careers Section */}
      <section id="careers" className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 mb-32 scroll-mt-32">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="bg-slate-900 rounded-3xl p-10 md:p-16 lg:p-20 text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/30 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3"></div>
          
          <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-slate-200 font-semibold text-sm mb-6 border border-white/10">
                <Briefcase size={16} /> Tuyển dụng
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Gia nhập đội ngũ PetEye</h2>
              <p className="text-slate-300 text-lg leading-relaxed mb-8 max-w-lg">
                Chúng tôi luôn tìm kiếm những con người đam mê công nghệ và yêu thương động vật để cùng nhau xây dựng hệ sinh thái thú cưng tốt nhất Việt Nam.
              </p>
              <Link to="/about" className="inline-flex items-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-full font-semibold hover:bg-slate-100 transition-colors">
                Xem vị trí đang tuyển <ArrowRight size={18} />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=600" alt="Team" className="rounded-2xl h-48 w-full object-cover" />
                <img src="https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=600" alt="Office" className="rounded-2xl h-32 w-full object-cover" />
              </div>
              <div className="space-y-4 pt-8">
                <img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=600" alt="Team work" className="rounded-2xl h-32 w-full object-cover" />
                <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=600" alt="Meeting" className="rounded-2xl h-48 w-full object-cover" />
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Partner Section */}
      <section id="partner" className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 mb-32 scroll-mt-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="order-2 lg:order-1"
          >
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-orange-50 rounded-3xl p-6 border border-orange-100 flex flex-col justify-center items-center text-center">
                <span className="text-4xl font-bold text-orange-600 mb-2">200+</span>
                <span className="text-slate-700 font-medium">Đối tác tin cậy</span>
              </div>
              <div className="bg-blue-50 rounded-3xl p-6 border border-blue-100 flex flex-col justify-center items-center text-center mt-10">
                <span className="text-4xl font-bold text-blue-600 mb-2">50k+</span>
                <span className="text-slate-700 font-medium">Khách hàng</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="order-1 lg:order-2 space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-700 font-semibold text-sm">
              <Handshake size={16} /> Dành cho Doanh nghiệp
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
              Trở thành đối tác chiến lược
            </h2>
            <p className="text-slate-600 leading-relaxed text-lg pb-4">
              Bạn là chủ phòng khám thú y, spa hay dịch vụ lưu trú? Tham gia mạng lưới PetEye để tiếp cận hàng ngàn khách hàng tiềm năng, tối ưu quy trình quản lý và nâng tầm thương hiệu.
            </p>
            <Link to="/shop/register" className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3.5 rounded-full font-semibold hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/30">
              Đăng ký đối tác ngay
            </Link>
          </motion.div>
        </div>
      </section>

      {/* News Section */}
      <section id="news" className="bg-slate-900 text-white py-24 scroll-mt-0">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 text-center">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="max-w-2xl mx-auto"
          >
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
              <Newspaper size={32} />
            </div>
            <h2 className="text-3xl font-bold mb-6">Tin tức & Sự kiện</h2>
            <p className="text-slate-400 text-lg mb-10 leading-relaxed">
              Cập nhật những kiến thức chăm sóc thú cưng mới nhất và các sự kiện hấp dẫn từ PetEye. Tính năng đang trong quá trình hoàn thiện và sẽ sớm ra mắt.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="px-8 py-3 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 font-semibold transition-colors">
                Theo dõi Facebook
              </a>
              <a href="https://tiktok.com" target="_blank" rel="noreferrer" className="px-8 py-3 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 font-semibold transition-colors">
                Theo dõi TikTok
              </a>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
