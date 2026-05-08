import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  sendChatMessage,
  type ChatMessage,
  type ToolResult,
  type ShopWithServices,
  type PetSummary,
  type PetDetail,
} from '../services/chatbot.service';
import { bookingService } from '../services/booking.service';
import { chatHistoryService, recordToMessage } from '../services/chatHistory.service';

function uid() { return Math.random().toString(36).slice(2); }
function formatPrice(n: number) { return n.toLocaleString('vi-VN') + 'đ'; }
function formatDatetime(iso: string) {
  try { return new Date(iso).toLocaleString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
  catch { return iso; }
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(s => (
        <span key={s} className={`material-symbols-outlined text-xs ${s <= Math.round(rating) ? 'text-amber-400' : 'text-slate-300'}`} style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
      ))}
      <span className="text-xs font-bold text-slate-700 ml-0.5">{rating?.toFixed(1) ?? '—'}</span>
    </span>
  );
}

// ── Markdown-like text renderer ──────────────────────────────────────────────
function RichText({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        if (line.startsWith('## ')) return <p key={i} className="font-bold text-sm text-slate-900">{line.slice(3)}</p>;
        if (line.startsWith('# ')) return <p key={i} className="font-black text-sm text-slate-900">{line.slice(2)}</p>;
        if (line.startsWith('• ') || line.startsWith('- ')) return (
          <div key={i} className="flex items-start gap-1.5">
            <span className="text-indigo-500 mt-0.5 shrink-0">•</span>
            <span className="text-sm leading-relaxed">{line.slice(2)}</span>
          </div>
        );
        if (line.startsWith('**') && line.endsWith('**')) return <p key={i} className="font-bold text-sm">{line.slice(2,-2)}</p>;
        if (line === '') return <div key={i} className="h-1" />;
        // inline bold
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        return (
          <p key={i} className="text-sm leading-relaxed">
            {parts.map((p, j) => p.startsWith('**') && p.endsWith('**')
              ? <strong key={j}>{p.slice(2,-2)}</strong>
              : p
            )}
          </p>
        );
      })}
    </div>
  );
}

// ── Pet Cards ────────────────────────────────────────────────────────────────
function PetListCard({ pets }: { pets: PetSummary[] }) {
  const navigate = useNavigate();
  if (!pets.length) return <p className="text-xs text-slate-400 italic">Bạn chưa có thú cưng nào.</p>;
  return (
    <div className="flex flex-col gap-2 mt-2">
      {pets.map(pet => (
        <div key={pet.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 p-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 shrink-0 overflow-hidden border-2 border-amber-200">
              {pet.avatar
                ? <img src={pet.avatar} className="w-full h-full object-cover" alt={pet.name} />
                : <div className="w-full h-full flex items-center justify-center text-xl">{pet.species?.toLowerCase().includes('mèo') ? '🐱' : '🐶'}</div>
              }
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-bold text-slate-900 text-sm">{pet.name}</p>
                {pet.sterilized && <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[9px] font-bold rounded-full">Đã triệt sản</span>}
              </div>
              <p className="text-xs text-slate-500">{pet.species} · {pet.breed} · {pet.gender}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[10px] text-slate-400">⚖️ {pet.weight}kg</span>
                <span className="text-[10px] text-slate-400">🎂 {pet.age}</span>
              </div>
            </div>
          </div>
          {(pet.healthNote || pet.allergies) && (
            <div className="px-3 pb-2 flex flex-col gap-1">
              {pet.healthNote && <div className="flex items-start gap-1.5 text-[10px] text-slate-600 bg-slate-50 rounded-lg px-2 py-1"><span>💊</span><span className="line-clamp-1">{pet.healthNote}</span></div>}
              {pet.allergies && <div className="flex items-start gap-1.5 text-[10px] text-red-600 bg-red-50 rounded-lg px-2 py-1"><span>⚠️</span><span className="line-clamp-1">Dị ứng: {pet.allergies}</span></div>}
            </div>
          )}
          <div className="px-3 pb-3">
            <button onClick={() => navigate(`/pet/${pet.id}`)} className="w-full py-1.5 border border-slate-200 text-slate-600 text-xs font-semibold rounded-xl hover:bg-slate-50 transition-colors">
              Xem hồ sơ đầy đủ
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function PetDetailCard({ pet }: { pet: PetDetail }) {
  const navigate = useNavigate();
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mt-2">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 flex items-center gap-3 border-b border-amber-100">
        <div className="w-16 h-16 rounded-full bg-white shrink-0 overflow-hidden border-2 border-amber-200 shadow-sm">
          {pet.avatar
            ? <img src={pet.avatar} className="w-full h-full object-cover" alt={pet.name} />
            : <div className="w-full h-full flex items-center justify-center text-3xl">{pet.species?.toLowerCase().includes('mèo') ? '🐱' : '🐶'}</div>
          }
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-black text-slate-900 text-base">{pet.name}</p>
            {pet.sterilized && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full">Đã triệt sản</span>}
          </div>
          <p className="text-xs text-slate-600 mt-0.5">{pet.species} · {pet.breed} · {pet.gender}</p>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-slate-500">⚖️ {pet.weight}kg</span>
            <span className="text-xs text-slate-500">🎂 {pet.age}</span>
            {pet.color && <span className="text-xs text-slate-500">🎨 {pet.color}</span>}
          </div>
        </div>
      </div>
      {/* Info grid */}
      <div className="p-3 grid grid-cols-2 gap-2">
        {pet.favoriteFood && <div className="bg-green-50 rounded-xl p-2"><p className="text-[9px] font-bold text-green-600 uppercase mb-0.5">Thức ăn yêu thích</p><p className="text-xs text-slate-700">{pet.favoriteFood}</p></div>}
        {pet.hobbies && <div className="bg-purple-50 rounded-xl p-2"><p className="text-[9px] font-bold text-purple-600 uppercase mb-0.5">Sở thích</p><p className="text-xs text-slate-700">{pet.hobbies}</p></div>}
        {pet.walkTime && <div className="bg-blue-50 rounded-xl p-2"><p className="text-[9px] font-bold text-blue-600 uppercase mb-0.5">Giờ đi dạo</p><p className="text-xs text-slate-700">{pet.walkTime}</p></div>}
        {pet.allergies && <div className="bg-red-50 rounded-xl p-2"><p className="text-[9px] font-bold text-red-600 uppercase mb-0.5">⚠️ Dị ứng</p><p className="text-xs text-red-700">{pet.allergies}</p></div>}
      </div>
      {pet.healthNote && (
        <div className="mx-3 mb-3 bg-amber-50 rounded-xl p-2 border border-amber-100">
          <p className="text-[9px] font-bold text-amber-700 uppercase mb-0.5">💊 Ghi chú sức khỏe</p>
          <p className="text-xs text-slate-700">{pet.healthNote}</p>
        </div>
      )}
      {pet.vaccinations && pet.vaccinations.length > 0 && (
        <div className="mx-3 mb-3">
          <p className="text-[9px] font-bold text-slate-500 uppercase mb-1.5">💉 Lịch tiêm phòng</p>
          <div className="flex flex-col gap-1">
            {pet.vaccinations.slice(0,3).map((v,i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-slate-700">{v.name}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${v.status === 'done' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{v.status === 'done' ? 'Đã tiêm' : 'Sắp tới'}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="px-3 pb-3">
        <button onClick={() => navigate(`/pet/${pet.id}`)} className="w-full py-2 bg-[#1a2b4c] text-white text-xs font-bold rounded-xl hover:bg-[#243d6b] transition-colors">
          Xem hồ sơ đầy đủ
        </button>
      </div>
    </div>
  );
}

// ── Shop Cards ───────────────────────────────────────────────────────────────
function ShopListCard({ shops }: { shops: ShopWithServices[] }) {
  const navigate = useNavigate();
  if (!shops.length) return <p className="text-xs text-slate-400 italic">Không tìm thấy shop nào phù hợp.</p>;
  return (
    <div className="flex flex-col gap-2 mt-2">
      {shops.map(({ shop, services }, index) => (
        <div key={shop.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 p-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${index===0?'bg-amber-400 text-white':index===1?'bg-slate-400 text-white':index===2?'bg-orange-400 text-white':'bg-slate-100 text-slate-500'}`}>{index+1}</div>
            <div className="w-11 h-11 rounded-xl bg-slate-100 shrink-0 overflow-hidden">
              {shop.licenseImageUrl ? <img src={shop.licenseImageUrl} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center"><span className="material-symbols-outlined text-slate-300 text-xl">storefront</span></div>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-900 text-sm truncate">{shop.shopName}</p>
              <p className="text-xs text-slate-500 truncate">{shop.address}{shop.city?`, ${shop.city}`:''}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <Stars rating={shop.ratingAvg} />
                {shop.isVerified && <span className="flex items-center gap-0.5 text-[10px] font-bold text-blue-600"><span className="material-symbols-outlined text-xs" style={{fontVariationSettings:"'FILL' 1"}}>verified</span>Xác minh</span>}
              </div>
            </div>
          </div>
          {services.length > 0 && (
            <div className="px-3 pb-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Dịch vụ phù hợp</p>
              <div className="flex flex-wrap gap-1">
                {services.slice(0,4).map(svc => <span key={svc.id} className="px-2 py-0.5 bg-teal-50 text-teal-700 border border-teal-100 text-[10px] font-semibold rounded-full">{svc.serviceName} · {formatPrice(svc.price)}</span>)}
                {services.length>4 && <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-semibold rounded-full">+{services.length-4}</span>}
              </div>
            </div>
          )}
          <div className="px-3 pb-3">
            <button onClick={() => navigate(`/clinic/${shop.id}`)} className="w-full py-2 bg-[#1a2b4c] text-white text-xs font-bold rounded-xl hover:bg-[#243d6b] transition-colors">Xem chi tiết & Đặt lịch</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function ShopDetailCard({ shop, services }: { shop: ShopWithServices['shop']; services: ShopWithServices['services'] }) {
  const navigate = useNavigate();
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mt-2">
      <div className="flex items-center gap-3 p-3 border-b border-slate-100">
        <div className="w-14 h-14 rounded-xl bg-slate-100 shrink-0 overflow-hidden">
          {shop.licenseImageUrl ? <img src={shop.licenseImageUrl} className="w-full h-full object-cover" alt={shop.shopName} /> : <div className="w-full h-full flex items-center justify-center"><span className="material-symbols-outlined text-slate-300 text-2xl">storefront</span></div>}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-900 text-sm">{shop.shopName}</p>
          <Stars rating={shop.ratingAvg} />
          <p className="text-xs text-slate-500 mt-0.5">{shop.address}{shop.city?`, ${shop.city}`:''}</p>
        </div>
      </div>
      <div className="p-3">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Dịch vụ</p>
        <div className="flex flex-col gap-1.5">
          {services.map(svc => <div key={svc.id} className="flex items-center justify-between"><span className="text-xs text-slate-700">{svc.serviceName}</span><span className="text-xs font-bold text-slate-900">{formatPrice(svc.price)}</span></div>)}
        </div>
      </div>
      <div className="px-3 pb-3">
        <button onClick={() => navigate(`/clinic/${shop.id}`)} className="w-full py-2 bg-[#1a2b4c] text-white text-xs font-bold rounded-xl hover:bg-[#243d6b] transition-colors">Đặt lịch ngay</button>
      </div>
    </div>
  );
}

// ── Booking Picker ───────────────────────────────────────────────────────────
const TIME_SLOTS = ['08:00','09:00','10:00','11:00','13:00','14:00','15:00','16:00','17:00'];
type PayMethod = 'CASH' | 'PAYOS';

function BookingPickerCard({ data, onConfirm }: {
  data: Extract<ToolResult, { type: 'booking_picker' }>;
  onConfirm: (datetime: string, payMethod: PayMethod) => void;
}) {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [time, setTime] = useState('');
  const [payMethod, setPayMethod] = useState<PayMethod>('CASH');
  const [confirming, setConfirming] = useState(false);

  const canConfirm = !!date && !!time && !confirming;

  const handleConfirm = () => {
    if (!canConfirm) return;
    setConfirming(true);
    onConfirm(`${date}T${time}:00`, payMethod);
  };

  return (
    <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm overflow-hidden mt-2">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-3 border-b border-indigo-100">
        <p className="font-bold text-indigo-900 text-sm">📅 Đặt lịch hẹn</p>
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-indigo-700 font-semibold">{data.shopName}</p>
          <span className="text-xs font-black text-indigo-900">{formatPrice(data.servicePrice)}</span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">✂️ {data.serviceName} · 🐾 {data.petName}</p>
      </div>

      <div className="p-3 space-y-3">
        {/* Date picker */}
        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">📆 Ngày hẹn</label>
          <input
            type="date"
            min={today}
            value={date}
            onChange={e => { setDate(e.target.value); setTime(''); }}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none"
          />
        </div>

        {/* Time slots */}
        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">⏰ Khung giờ</label>
          <div className="grid grid-cols-3 gap-1.5">
            {TIME_SLOTS.map(t => (
              <button key={t} onClick={() => setTime(t)}
                className={`py-1.5 text-xs font-semibold rounded-lg border transition-all ${time===t ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600'}`}
              >{t}</button>
            ))}
          </div>
        </div>

        {/* Payment method */}
        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">💳 Phương thức thanh toán</label>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setPayMethod('CASH')}
              className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all ${payMethod==='CASH' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
            >
              <span className="text-lg">💵</span>
              <span className={`text-[11px] font-bold ${payMethod==='CASH' ? 'text-emerald-700' : 'text-slate-600'}`}>Tiền mặt</span>
              <span className={`text-[9px] ${payMethod==='CASH' ? 'text-emerald-500' : 'text-slate-400'}`}>Thanh toán tại quầy</span>
            </button>
            <button onClick={() => setPayMethod('PAYOS')}
              className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all ${payMethod==='PAYOS' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
            >
              <span className="text-lg">📱</span>
              <span className={`text-[11px] font-bold ${payMethod==='PAYOS' ? 'text-blue-700' : 'text-slate-600'}`}>PayOS</span>
              <span className={`text-[9px] ${payMethod==='PAYOS' ? 'text-blue-500' : 'text-slate-400'}`}>QR chuyển khoản</span>
            </button>
          </div>
        </div>

        {/* Summary */}
        {date && time && (
          <div className="bg-slate-50 rounded-xl px-3 py-2 space-y-1 border border-slate-100">
            <div className="flex justify-between text-xs text-slate-600">
              <span>📅 Ngày giờ</span>
              <span className="font-semibold">{new Date(`${date}T${time}:00`).toLocaleString('vi-VN', { weekday:'short', day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' })}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-600">
              <span>💳 Thanh toán</span>
              <span className="font-semibold">{payMethod === 'CASH' ? 'Tiền mặt tại quầy' : 'PayOS (QR)'}</span>
            </div>
            <div className="flex justify-between text-xs border-t border-slate-200 pt-1 mt-1">
              <span className="font-bold text-slate-800">Tổng cộng</span>
              <span className="font-black text-indigo-700">{formatPrice(data.servicePrice)}</span>
            </div>
          </div>
        )}

        <button
          onClick={handleConfirm}
          disabled={!canConfirm}
          className={`w-full py-2.5 text-white text-xs font-bold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 ${payMethod==='PAYOS' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
        >
          {confirming
            ? <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />Đang xử lý...</>
            : payMethod === 'PAYOS'
              ? '📱 Thanh toán qua PayOS'
              : '✅ Xác nhận đặt lịch (Tiền mặt)'
          }
        </button>
      </div>
    </div>
  );
}

function BookingSuccessCard({ data }: { data: Extract<ToolResult, { type: 'booking_success' }> }) {
  return (
    <div className="bg-green-50 border border-green-200 rounded-2xl p-3 mt-2">
      <div className="flex items-center gap-2 mb-2">
        <span className="material-symbols-outlined text-green-600 text-xl" style={{fontVariationSettings:"'FILL' 1"}}>check_circle</span>
        <span className="font-bold text-green-800 text-sm">Đặt lịch thành công!</span>
      </div>
      <div className="space-y-1 text-xs text-green-700">
        <p>🏪 <strong>{data.shopName}</strong></p>
        <p>✂️ {data.serviceName}</p>
        <p>📅 {formatDatetime(data.datetime)}</p>
        <p>🎫 Mã đặt lịch: <strong>#{data.bookingId}</strong></p>
      </div>
      <Link to="/profile/bookings" className="mt-2 block text-center py-1.5 bg-green-600 text-white text-xs font-bold rounded-xl hover:bg-green-700 transition-colors">Xem lịch của tôi</Link>
    </div>
  );
}

// ── Tool Result Renderer ─────────────────────────────────────────────────────
function ToolResultRenderer({ result, onBookingConfirm }: { result: ToolResult; onBookingConfirm?: (datetime: string, payMethod: PayMethod, data: Extract<ToolResult, {type:'booking_picker'}>) => void }) {
  if (result.type === 'shop_list') return <ShopListCard shops={result.shops} />;
  if (result.type === 'shop_detail') return <ShopDetailCard shop={result.shop} services={result.services} />;
  if (result.type === 'pet_list') return <PetListCard pets={result.pets} />;
  if (result.type === 'pet_detail') return <PetDetailCard pet={result.pet} />;
  if (result.type === 'booking_picker') return <BookingPickerCard data={result} onConfirm={(dt, pm) => onBookingConfirm?.(dt, pm, result)} />;
  if (result.type === 'booking_success') return <BookingSuccessCard data={result} />;
  if (result.type === 'error') return <div className="bg-red-50 border border-red-200 rounded-xl p-2 mt-1 text-xs text-red-700">⚠️ {result.message}</div>;
  return null;
}

// ── Message Bubble ───────────────────────────────────────────────────────────
function MessageBubble({ msg, onBookingConfirm }: { msg: ChatMessage; onBookingConfirm?: (datetime: string, payMethod: PayMethod, data: Extract<ToolResult, {type:'booking_picker'}>) => void }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#1a2b4c] to-indigo-500 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
          <span className="text-white text-xs font-black">P</span>
        </div>
      )}
      <div className={`max-w-[85%] flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`px-3 py-2.5 rounded-2xl leading-relaxed ${isUser ? 'bg-[#1a2b4c] text-white rounded-tr-sm text-sm' : 'bg-white border border-slate-100 text-slate-800 rounded-tl-sm shadow-sm'}`}>
          {isUser ? <span className="text-sm">{msg.content}</span> : <RichText text={msg.content} />}
        </div>
        {msg.toolResult && <ToolResultRenderer result={msg.toolResult} onBookingConfirm={onBookingConfirm} />}
        <span className="text-[10px] text-slate-400">{msg.timestamp.toLocaleTimeString('vi-VN', { hour:'2-digit', minute:'2-digit' })}</span>
      </div>
    </div>
  );
}

// ── Quick Suggestions ────────────────────────────────────────────────────────
const QUICK_SUGGESTIONS = [
  { icon: '⭐', text: 'Shop đánh giá cao nhất' },
  { icon: '✂️', text: 'Tìm dịch vụ grooming' },
  { icon: '🐾', text: 'Thú cưng của tôi' },
  { icon: '🏨', text: 'Dịch vụ lưu trú' },
  { icon: '💉', text: 'Tiêm phòng cho thú cưng' },
  { icon: '🏥', text: 'Phòng khám thú y' },
];

function makeWelcome(name?: string): ChatMessage {
  return {
    id: 'welcome', role: 'assistant',
    content: `Xin chào${name ? ` **${name}**` : ''}! 👋 Tôi là **PetEye Assistant**.\n\nTôi có thể giúp bạn:\n• Tìm shop chăm sóc thú cưng phù hợp\n• Xem thông tin thú cưng của bạn\n• Gợi ý dịch vụ theo nhu cầu\n• Đặt lịch hẹn trực tiếp\n\nBạn cần tìm gì hôm nay?`,
    timestamp: new Date(),
  };
}

// ── Main Chatbot Component ───────────────────────────────────────────────────
export default function Chatbot() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([makeWelcome(user?.name)]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load history from BE
  useEffect(() => {
    if (!user || historyLoaded) return;
    chatHistoryService.getHistory()
      .then(records => {
        if (records.length > 0) setMessages([makeWelcome(user.name), ...records.map(recordToMessage)]);
        setHistoryLoaded(true);
      })
      .catch(() => setHistoryLoaded(true));
  }, [user, historyLoaded]);

  useEffect(() => { setHistoryLoaded(false); setMessages([makeWelcome(user?.name)]); }, [user?.email]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => { if (open) { setTimeout(() => inputRef.current?.focus(), 100); setHasUnread(false); } }, [open]);

  const handleSend = useCallback(async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    setInput('');
    const userMsg: ChatMessage = { id: uid(), role: 'user', content, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    if (user) chatHistoryService.saveMessage(userMsg).catch(() => {});

    try {
      const response = await sendChatMessage(content, messages, {
        userId: user?.id ? Number(user.id) : undefined,
        userEmail: user?.email,
        userName: user?.name,
      });
      const assistantMsg: ChatMessage = { id: uid(), role: 'assistant', content: response.text, timestamp: new Date(), toolResult: response.toolResult };
      setMessages(prev => [...prev, assistantMsg]);
      if (user) chatHistoryService.saveMessage(assistantMsg).catch(() => {});
      if (!open) setHasUnread(true);
    } catch (err) {
      setMessages(prev => [...prev, { id: uid(), role: 'assistant', content: err instanceof Error ? `Lỗi: ${err.message.slice(0,200)}` : 'Xin lỗi, có lỗi xảy ra.', timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, user, open]);

  // Handle booking confirm from picker — supports CASH and PAYOS
  const handleBookingConfirm = useCallback(async (datetime: string, payMethod: PayMethod, pickerData: Extract<ToolResult, {type:'booking_picker'}>) => {
    setLoading(true);
    try {
      if (payMethod === 'PAYOS') {
        // PayOS: initiate payment → redirect to checkout URL
        const result = await bookingService.initiatePayment({
          shopId: pickerData.shopId,
          serviceId: pickerData.serviceId,
          petId: pickerData.petId,
          appointmentDatetime: datetime,
        });
        if (result.checkoutUrl) {
          // Thêm message thông báo trước khi redirect
          const redirectMsg: ChatMessage = {
            id: uid(), role: 'assistant',
            content: `🔄 Đang chuyển đến trang thanh toán PayOS cho **${pickerData.petName}**...\n\nSau khi thanh toán thành công, lịch hẹn sẽ được xác nhận tự động.`,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, redirectMsg]);
          if (user) chatHistoryService.saveMessage(redirectMsg).catch(() => {});
          // Redirect sau 1.5s để user đọc message
          setTimeout(() => { window.location.href = result.checkoutUrl; }, 1500);
        } else {
          throw new Error('Không lấy được link thanh toán');
        }
      } else {
        // CASH: tạo booking ngay
        const booking = await bookingService.createCashBooking({
          shopId: pickerData.shopId,
          serviceId: pickerData.serviceId,
          petId: pickerData.petId,
          appointmentDatetime: datetime,
          paymentMethod: 'CASH',
        });
        const successMsg: ChatMessage = {
          id: uid(), role: 'assistant',
          content: `✅ Đã đặt lịch thành công cho **${pickerData.petName}**!\n\nVui lòng thanh toán **tiền mặt tại quầy** vào ngày hẹn.`,
          timestamp: new Date(),
          toolResult: { type: 'booking_success', bookingId: booking.id, shopName: pickerData.shopName, serviceName: pickerData.serviceName, datetime },
        };
        setMessages(prev => [...prev, successMsg]);
        if (user) chatHistoryService.saveMessage(successMsg).catch(() => {});
      }
    } catch (err) {
      setMessages(prev => [...prev, { id: uid(), role: 'assistant', content: `Đặt lịch thất bại: ${err instanceof Error ? err.message : 'Lỗi không xác định'}`, timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const handleClearHistory = useCallback(async () => {
    if (!window.confirm('Xoá toàn bộ lịch sử chat?')) return;
    if (user) await chatHistoryService.clearHistory().catch(() => {});
    setMessages([makeWelcome(user?.name)]);
    setShowHistory(false);
  }, [user]);

  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };
  const realMessages = messages.filter(m => m.id !== 'welcome');

  return (
    <>
      {/* Floating button */}
    <button
  onClick={() => setOpen(v => !v)}
  className="fixed bottom-5 right-5 z-50 group"
  aria-label="Mở chatbot"
>
  <div className="relative">
    
    {/* Glow background */}
    <div className="absolute inset-0 rounded-full bg-indigo-500 blur-lg opacity-40 group-hover:opacity-70 transition duration-300"></div>

    {/* Main Button */}
    <div className="relative w-15 h-15 rounded-full bg-gradient-to-br from-[#1a2b4c] via-indigo-600 to-purple-600 text-white shadow-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110">
      
      {open ? (
        <span className="material-symbols-outlined text-2xl">
          close
        </span>
      ) : (
        <>
          {/* Animated ring */}
          <div className="absolute inset-0 rounded-full border border-white/20 animate-ping"></div>

          {/* Chatbot icon */}
          <span className="material-symbols-outlined text-[26px] drop-shadow-lg">
            support_agent
          </span>

          {/* Notification dot */}
          {hasUnread && (
            <span className="absolute top-0.5 right-0.5 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border border-white"></span>
            </span>
          )}
        </>
      )}
    </div>
  </div>
</button>
      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[370px] max-w-[calc(100vw-24px)] flex flex-col rounded-3xl shadow-2xl shadow-slate-900/20 overflow-hidden border border-slate-200 bg-white" style={{ height: 'min(640px, calc(100vh - 120px))' }}>

          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-[#1a2b4c] to-indigo-600 shrink-0">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-xl">smart_toy</span>
            </div>
            <div className="flex-1">
              <p className="font-bold text-white text-sm">PetEye Assistant</p>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                <span className="text-indigo-200 text-xs">Luôn sẵn sàng hỗ trợ</span>
              </div>
            </div>
            <button onClick={() => setShowHistory(v => !v)} className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${showHistory?'bg-white/30':'hover:bg-white/20'}`} title="Lịch sử">
              <span className="material-symbols-outlined text-white text-lg">history</span>
            </button>
            <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors">
              <span className="material-symbols-outlined text-white text-lg">close</span>
            </button>
          </div>

          {showHistory ? (
            /* History panel */
            <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white">
                <p className="font-bold text-slate-800 text-sm">Lịch sử ({realMessages.length} tin)</p>
                <button onClick={handleClearHistory} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-semibold">
                  <span className="material-symbols-outlined text-sm">delete</span>Xoá tất cả
                </button>
              </div>
              {realMessages.length === 0
                ? <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">Chưa có lịch sử chat</div>
                : <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2">
                    {realMessages.map(msg => (
                      <div key={msg.id} className={`flex gap-2 ${msg.role==='user'?'flex-row-reverse':'flex-row'}`}>
                        <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${msg.role==='user'?'bg-[#1a2b4c] text-white rounded-tr-sm':'bg-white border border-slate-100 text-slate-700 rounded-tl-sm'}`}>
                          <p className="line-clamp-3">{msg.content}</p>
                          <p className={`text-[10px] mt-1 ${msg.role==='user'?'text-indigo-200':'text-slate-400'}`}>{msg.timestamp.toLocaleString('vi-VN',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}</p>
                        </div>
                      </div>
                    ))}
                  </div>
              }
              <div className="p-3 border-t border-slate-200 bg-white">
                <button onClick={() => setShowHistory(false)} className="w-full py-2 bg-[#1a2b4c] text-white text-xs font-bold rounded-xl hover:bg-[#243d6b] transition-colors">Quay lại chat</button>
              </div>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-3 bg-slate-50/80">
                {messages.map(msg => <MessageBubble key={msg.id} msg={msg} onBookingConfirm={handleBookingConfirm} />)}
                {loading && (
                  <div className="flex gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#1a2b4c] to-indigo-500 flex items-center justify-center shrink-0 shadow-sm">
                      <span className="text-white text-xs font-black">P</span>
                    </div>
                    <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                      <div className="flex gap-1 items-center">
                        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay:'0ms'}} />
                        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay:'150ms'}} />
                        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay:'300ms'}} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Quick suggestions — ALWAYS visible */}
              <div className="px-3 py-2 bg-white border-t border-slate-100 shrink-0">
                <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide">
                  {QUICK_SUGGESTIONS.map(s => (
                    <button key={s.text} onClick={() => handleSend(s.text)} disabled={loading}
                      className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 hover:border-indigo-200 rounded-full text-[11px] font-semibold text-slate-600 transition-colors whitespace-nowrap disabled:opacity-40">
                      <span>{s.icon}</span>{s.text}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input */}
              <div className="px-3 py-3 bg-white border-t border-slate-100 shrink-0">
                {!user && (
                  <div className="mb-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">info</span>
                    <span><Link to="/login" className="font-bold underline">Đăng nhập</Link> để lưu lịch sử & đặt lịch</span>
                  </div>
                )}
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                  <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Nhập câu hỏi..." disabled={loading} className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none" />
                  <button onClick={() => handleSend()} disabled={!input.trim() || loading} className="w-8 h-8 rounded-xl bg-[#1a2b4c] text-white flex items-center justify-center disabled:opacity-40 hover:bg-[#243d6b] transition-colors shrink-0">
                    <span className="material-symbols-outlined text-base">send</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}



