import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

type PayMethod = 'card' | 'wallet' | 'cash';

const ORDER = {
    clinic: 'Phòng Khám Thú Y PetCare Sài Gòn',
    service: 'Tiêm phòng trọn gói',
    date: '28/02/2026',
    time: '10:30',
    doctor: 'BSTY. Nguyễn Văn A',
    pet: 'Lucky (Chó - Golden Retriever)',
    basePrice: 500000,
    discount: 50000,
    serviceFee: 15000,
};

function formatVND(n: number) {
    return n.toLocaleString('vi-VN') + 'đ';
}

export default function Payment() {
    const navigate = useNavigate();
    const [payMethod, setPayMethod] = useState<PayMethod>('card');
    const [cardNumber, setCardNumber] = useState('');
    const [cardName, setCardName] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [voucher, setVoucher] = useState('');
    const [voucherApplied, setVoucherApplied] = useState(false);
    const [agreed, setAgreed] = useState(false);

    const total = ORDER.basePrice - ORDER.discount + ORDER.serviceFee - (voucherApplied ? 30000 : 0);

    const handleCardNumber = (v: string) => {
        const digits = v.replace(/\D/g, '').slice(0, 16);
        setCardNumber(digits.replace(/(.{4})/g, '$1 ').trim());
    };

    const handleExpiry = (v: string) => {
        const digits = v.replace(/\D/g, '').slice(0, 4);
        if (digits.length >= 3) setExpiry(digits.slice(0, 2) + '/' + digits.slice(2));
        else setExpiry(digits);
    };

    const handlePay = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setSuccess(true);
        }, 2000);
    };

    if (success) {
        return (
            <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
                <div className="max-w-md w-full text-center">
                    {/* Success animation */}
                    <div className="w-28 h-28 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce" style={{ animationDuration: '1.5s' }}>
                        <span className="material-symbols-outlined text-green-500 text-6xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                            check_circle
                        </span>
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 mb-2">Đặt lịch thành công!</h1>
                    <p className="text-slate-500 dark:text-slate-400 mb-2">
                        Mã đặt lịch: <strong className="text-[#1a2b4c] dark:text-teal-400">#CV-2026-{Math.floor(Math.random() * 90000 + 10000)}</strong>
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm">
                        Chúng tôi sẽ xác nhận lịch hẹn qua email và SMS trong vài phút.
                    </p>

                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 text-left mb-6 shadow-sm">
                        <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-teal-500 text-xl">receipt_long</span>
                            Chi tiết đặt lịch
                        </h3>
                        {[
                            { label: 'Cơ sở', value: ORDER.clinic },
                            { label: 'Dịch vụ', value: ORDER.service },
                            { label: 'Ngày hẹn', value: `${ORDER.date} lúc ${ORDER.time}` },
                            { label: 'Bác sĩ', value: ORDER.doctor },
                            { label: 'Thanh toán', value: formatVND(total) },
                        ].map(({ label, value }) => (
                            <div key={label} className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
                                <span className="text-slate-500 text-sm">{label}</span>
                                <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm text-right max-w-[60%]">{value}</span>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col gap-3">
                        <Link
                            to="/profile/bookings"
                            className="w-full py-3 bg-[#1a2b4c] text-white font-bold rounded-xl hover:bg-[#243d6b] transition-colors shadow-lg flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-base">calendar_month</span>
                            Xem lịch hẹn của tôi
                        </Link>
                        <Link
                            to="/home"
                            className="w-full py-3 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            Về trang chủ
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 bg-slate-50 dark:bg-slate-900">
            {/* Breadcrumb */}
            <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-3">
                <div className="max-w-5xl mx-auto flex items-center gap-2 text-xs text-slate-400">
                    <Link to="/home" className="hover:text-[#1a2b4c] flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">home</span>Trang chủ
                    </Link>
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                    <Link to="/clinic/1" className="hover:text-[#1a2b4c]">PetCare Sài Gòn</Link>
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                    <span className="text-slate-700 dark:text-slate-300 font-medium">Thanh toán</span>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-8">
                <div className="mb-6">
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-slate-100">Xác nhận & Thanh toán</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Kiểm tra thông tin và hoàn tất đặt lịch của bạn</p>
                </div>

                {/* Steps indicator */}
                <div className="flex items-center gap-2 mb-8">
                    {['Chọn dịch vụ', 'Chọn lịch', 'Thanh toán'].map((step, i) => (
                        <React.Fragment key={step}>
                            <div className={`flex items-center gap-2 ${i === 2 ? '' : 'opacity-60'}`}>
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${i < 2 ? 'bg-green-500 text-white' : 'bg-[#1a2b4c] text-white'}`}>
                                    {i < 2 ? <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check</span> : i + 1}
                                </div>
                                <span className={`text-xs font-semibold hidden sm:inline ${i === 2 ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400'}`}>{step}</span>
                            </div>
                            {i < 2 && <div className="flex-1 h-0.5 bg-slate-200 dark:bg-slate-700" />}
                        </React.Fragment>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
                    {/* Left: Payment form */}
                    <div className="flex flex-col gap-5">
                        {/* Order Summary Card */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
                            <h2 className="font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-teal-500">event_note</span>
                                Thông tin lịch hẹn
                            </h2>
                            <div className="flex gap-4">
                                <div
                                    className="w-20 h-20 rounded-xl bg-cover bg-center shrink-0"
                                    style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=300&auto=format&fit=crop)' }}
                                />
                                <div className="flex-1 space-y-1">
                                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{ORDER.clinic}</h3>
                                    <p className="text-xs text-slate-500 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-xs text-teal-500">location_on</span>
                                        123 Nguyễn Thị Thập, Quận 7, TP.HCM
                                    </p>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        <span className="px-2 py-1 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 text-xs font-semibold rounded-lg">{ORDER.service}</span>
                                        <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-lg">
                                            {ORDER.date} • {ORDER.time}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">👨‍⚕️ {ORDER.doctor} &nbsp;|&nbsp; 🐕 {ORDER.pet}</p>
                                </div>
                            </div>
                        </div>

                        {/* Voucher */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
                            <h2 className="font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2 text-sm">
                                <span className="material-symbols-outlined text-amber-500">local_offer</span>
                                Mã ưu đãi
                            </h2>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Nhập mã voucher (vd: CARE30)"
                                    className="flex-1 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-1 focus:ring-[#1a2b4c]"
                                    value={voucher}
                                    onChange={e => setVoucher(e.target.value)}
                                />
                                <button
                                    onClick={() => { if (voucher.trim()) setVoucherApplied(true); }}
                                    className="px-5 py-2.5 bg-[#1a2b4c] text-white font-bold rounded-xl text-sm hover:bg-[#243d6b] transition-colors"
                                >
                                    Áp dụng
                                </button>
                            </div>
                            {voucherApplied && (
                                <div className="mt-2 flex items-center gap-2 text-green-600 text-xs font-semibold">
                                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                    Áp dụng thành công! Giảm thêm 30.000đ
                                </div>
                            )}
                        </div>

                        {/* Payment Method */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
                            <h2 className="font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#1a2b4c] dark:text-teal-400">payments</span>
                                Phương thức thanh toán
                            </h2>
                            <div className="grid grid-cols-3 gap-3 mb-5">
                                {([
                                    { id: 'card', icon: 'credit_card', label: 'Thẻ ngân hàng' },
                                    { id: 'wallet', icon: 'account_balance_wallet', label: 'Ví điện tử' },
                                    { id: 'cash', icon: 'payments', label: 'Tiền mặt' },
                                ] as { id: PayMethod; icon: string; label: string }[]).map(m => (
                                    <button
                                        key={m.id}
                                        onClick={() => setPayMethod(m.id)}
                                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${payMethod === m.id
                                            ? 'border-[#1a2b4c] bg-[#1a2b4c]/5 dark:border-teal-400 dark:bg-teal-900/10'
                                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                                            }`}
                                    >
                                        <span className={`material-symbols-outlined text-2xl ${payMethod === m.id ? 'text-[#1a2b4c] dark:text-teal-400' : 'text-slate-400'}`}>
                                            {m.icon}
                                        </span>
                                        <span className={`text-xs font-semibold text-center ${payMethod === m.id ? 'text-[#1a2b4c] dark:text-teal-400' : 'text-slate-500'}`}>
                                            {m.label}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            {payMethod === 'card' && (
                                <div className="space-y-4">
                                    {/* Card visual */}
                                    <div className="relative h-44 bg-gradient-to-br from-[#1a2b4c] to-[#2d4a8a] rounded-2xl p-6 text-white overflow-hidden shadow-xl">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
                                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
                                        <div className="relative z-10">
                                            <div className="flex justify-between items-start mb-6">
                                                <span className="font-bold text-xl tracking-widest">Peteye</span>
                                                <span className="material-symbols-outlined text-3xl text-white/70">credit_card</span>
                                            </div>
                                            <p className="font-mono text-lg tracking-[0.3em] mb-4 text-white/90">
                                                {cardNumber || '•••• •••• •••• ••••'}
                                            </p>
                                            <div className="flex justify-between items-end">
                                                <div>
                                                    <p className="text-white/60 text-xs uppercase tracking-wider">Chủ thẻ</p>
                                                    <p className="font-semibold text-sm">{cardName || 'TÊN CHỦ THẺ'}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-white/60 text-xs uppercase tracking-wider">Hết hạn</p>
                                                    <p className="font-semibold text-sm">{expiry || 'MM/YY'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card inputs */}
                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1 block">Số thẻ</label>
                                            <input
                                                type="text"
                                                placeholder="1234 5678 9012 3456"
                                                className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-xl px-4 py-3 text-sm font-mono text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-[#1a2b4c]"
                                                value={cardNumber}
                                                onChange={e => handleCardNumber(e.target.value)}
                                                maxLength={19}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1 block">Tên chủ thẻ</label>
                                            <input
                                                type="text"
                                                placeholder="NGUYEN VAN A"
                                                className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-[#1a2b4c] uppercase"
                                                value={cardName}
                                                onChange={e => setCardName(e.target.value.toUpperCase())}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1 block">Ngày hết hạn</label>
                                                <input
                                                    type="text"
                                                    placeholder="MM/YY"
                                                    className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-xl px-4 py-3 text-sm font-mono text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-[#1a2b4c]"
                                                    value={expiry}
                                                    onChange={e => handleExpiry(e.target.value)}
                                                    maxLength={5}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1 block">CVV</label>
                                                <input
                                                    type="password"
                                                    placeholder="•••"
                                                    className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-xl px-4 py-3 text-sm font-mono text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-[#1a2b4c]"
                                                    value={cvv}
                                                    onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                                                    maxLength={3}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {payMethod === 'wallet' && (
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { name: 'MoMo', color: 'bg-pink-500', icon: 'account_balance_wallet' },
                                        { name: 'ZaloPay', color: 'bg-blue-500', icon: 'account_balance_wallet' },
                                        { name: 'VNPay', color: 'bg-red-500', icon: 'account_balance_wallet' },
                                    ].map(w => (
                                        <button key={w.name} className={`${w.color} text-white p-4 rounded-xl flex flex-col items-center gap-2 hover:opacity-90 transition-opacity`}>
                                            <span className="material-symbols-outlined">{w.icon}</span>
                                            <span className="text-xs font-bold">{w.name}</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {payMethod === 'cash' && (
                                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
                                    <div className="flex items-start gap-3">
                                        <span className="material-symbols-outlined text-amber-500 mt-0.5">info</span>
                                        <div>
                                            <p className="font-semibold text-amber-800 dark:text-amber-200 text-sm">Thanh toán tại quầy</p>
                                            <p className="text-amber-700 dark:text-amber-300 text-xs mt-1">
                                                Bạn sẽ thanh toán trực tiếp tại cơ sở vào ngày hẹn. Vui lòng đến đúng giờ để không mất lịch.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Agreement */}
                        <label className="flex items-start gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={agreed}
                                onChange={e => setAgreed(e.target.checked)}
                                className="mt-1 rounded border-slate-300 text-[#1a2b4c] focus:ring-[#1a2b4c]"
                            />
                            <span className="text-sm text-slate-500 dark:text-slate-400">
                                Tôi đồng ý với{' '}
                                <a href="#" className="text-[#1a2b4c] dark:text-teal-400 font-semibold hover:underline">Điều khoản dịch vụ</a>
                                {' '}và{' '}
                                <a href="#" className="text-[#1a2b4c] dark:text-teal-400 font-semibold hover:underline">Chính sách hoàn tiền</a>
                                {' '}của Peteye.
                            </span>
                        </label>
                    </div>

                    {/* Right: Summary */}
                    <div>
                        <div className="sticky top-24 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-4">
                            <h2 className="font-bold text-slate-800 dark:text-slate-100 text-base">Tổng đơn hàng</h2>

                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                    <span>{ORDER.service}</span>
                                    <span>{formatVND(ORDER.basePrice)}</span>
                                </div>
                                <div className="flex justify-between text-green-600 dark:text-green-400">
                                    <span>Giảm giá thành viên</span>
                                    <span>-{formatVND(ORDER.discount)}</span>
                                </div>
                                {voucherApplied && (
                                    <div className="flex justify-between text-amber-600 dark:text-amber-400">
                                        <span>Voucher CARE30</span>
                                        <span>-30.000đ</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                    <span>Phí dịch vụ nền tảng</span>
                                    <span>{formatVND(ORDER.serviceFee)}</span>
                                </div>
                            </div>

                            <div className="border-t border-dashed border-slate-200 dark:border-slate-700 pt-4 flex justify-between items-center">
                                <span className="font-bold text-slate-900 dark:text-slate-100">Tổng cộng</span>
                                <span className="text-xl font-black text-[#1a2b4c] dark:text-teal-400">{formatVND(total)}</span>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-3 space-y-2 text-xs text-slate-500 dark:text-slate-400">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm text-green-500">verified_user</span>
                                    Đặt lịch được bảo đảm bởi Peteye
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm text-blue-500">undo</span>
                                    Hủy miễn phí trước 24 giờ
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm text-amber-500">lock</span>
                                    Thanh toán mã hóa SSL 256-bit
                                </div>
                            </div>

                            <button
                                onClick={handlePay}
                                disabled={!agreed || loading}
                                className="w-full py-4 bg-[#1a2b4c] text-white font-black rounded-xl hover:bg-[#243d6b] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#1a2b4c]/25 text-base flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Đang xử lý...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined">lock</span>
                                        Xác nhận thanh toán
                                    </>
                                )}
                            </button>

                            <button
                                onClick={() => navigate(-1)}
                                className="w-full py-2.5 text-slate-500 dark:text-slate-400 text-sm font-semibold hover:text-slate-700 transition-colors"
                            >
                                ← Quay lại
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

