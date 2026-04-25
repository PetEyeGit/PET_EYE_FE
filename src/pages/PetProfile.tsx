import React, { useState, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getPetById } from '../lib/petData';
import {
  Camera, Edit2, Save, X, ChevronRight, Download, Plus,
  Calendar, Clock, MapPin, Syringe, FileText, Heart,
  Activity, Utensils, Droplets, Check, AlertCircle,
  ShieldCheck, Star, Image, Upload, Trash2, Video
} from 'lucide-react';

/* ────────────────────────────────────────────────────────────
   TYPES
──────────────────────────────────────────────────────────── */
export interface PetData {
  name: string;
  breed: string;
  gender: 'Đực' | 'Cái';
  birthYear: number;
  weight: number;
  chipId: string;
  color: string;
  sterilized: boolean;
  notes: string;
  avatar: string;
}

/* ────────────────────────────────────────────────────────────
   MOCK DATA
──────────────────────────────────────────────────────────── */
// when no pet found, fallback to an empty object
const EMPTY_PET: PetData = {
  name: '',
  breed: '',
  gender: 'Cái',
  birthYear: new Date().getFullYear(),
  weight: 0,
  chipId: '',
  color: '',
  sterilized: false,
  notes: '',
  avatar: '',
};

const VACCINES = [
  { name: 'Tiêm phòng 4 bệnh (Mũi 3)', drug: 'PureVax RCPCh', clinic: 'PetCare Center', date: '15/05/2023', status: 'done' as const },
  { name: 'Tẩy giun định kỳ', drug: 'Drontal', clinic: 'Happy Paws', date: '10/02/2023', status: 'done' as const },
  { name: 'Tiêm phòng dại (Nhắc lại)', drug: 'Dự kiến', clinic: '—', date: '15/03/2026', status: 'upcoming' as const },
];

const DOCUMENTS = [
  { name: 'Ket_qua_xet_nghiem_mau_200823.pdf', size: '1.2 MB', date: '20/08/2023', type: 'pdf' },
  { name: 'Don_thuoc_viem_da.pdf', size: '850 KB', date: '12/06/2023', type: 'pdf' },
  { name: 'Giay_chung_nhan_giong.docx', size: '2.4 MB', date: '15/05/2021', type: 'doc' },
];

const PHOTOS = [
  'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=2043&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1573865526739-10659fec78a5?q=80&w=2030&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?q=80&w=1936&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1513245538257-075e7071f154?q=80&w=1935&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?q=80&w=1974&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1587300003388-59208cc962cb?q=80&w=2070&auto=format&fit=crop',
];

const APPOINTMENTS = [
  { date: '15/03/2026', time: '09:00', title: 'Tiêm phòng dại', clinic: 'PetCare Center', urgent: true },
  { date: '01/04/2026', time: '14:30', title: 'Spa & Tỉa lông', clinic: 'Miu House Grooming', urgent: false },
];

const NUTRITION = [
  { meal: 'Sáng (08:00)', food: 'Hạt Royal Canin British Shorthair', amount: '50g' },
  { meal: 'Tối (18:00)', food: 'Pate cá hồi King\'s Pet', amount: '½ lon' },
];

/* ────────────────────────────────────────────────────────────
   EDIT MODAL
──────────────────────────────────────────────────────────── */
function EditModal({ pet, onSave, onClose }: { pet: PetData; onSave: (p: PetData) => void; onClose: () => void }) {
  const [form, setForm] = useState(pet);
  const set = (key: keyof PetData, val: string | number | boolean) =>
    setForm(prev => ({ ...prev, [key]: val }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-slate-800 rounded-t-3xl px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between z-10">
          <h2 className="text-xl font-black flex items-center gap-2 text-slate-900 dark:text-white">
            <Edit2 className="w-5 h-5 text-secondary" /> Chỉnh sửa hồ sơ
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Avatar change hint */}
          <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-4">
            <img src={form.avatar} className="w-16 h-16 rounded-2xl object-cover" alt="pet" />
            <div>
              <p className="text-sm font-bold text-slate-700 dark:text-white">Ảnh đại diện</p>
              <button className="text-xs text-secondary font-bold mt-1 flex items-center gap-1">
                <Upload className="w-3.5 h-3.5" /> Thay đổi ảnh
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Tên thú cưng *</label>
              <input value={form.name} onChange={e => set('name', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-secondary/50" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Giống loài</label>
              <input value={form.breed} onChange={e => set('breed', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Giới tính</label>
              <select value={form.gender} onChange={e => set('gender', e.target.value as 'Đực' | 'Cái')}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50">
                <option value="Cái">Cái</option>
                <option value="Đực">Đực</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Năm sinh</label>
              <input type="number" value={form.birthYear} onChange={e => set('birthYear', +e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Cân nặng (kg)</label>
              <input type="number" step="0.1" value={form.weight} onChange={e => set('weight', +e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">ID Chip</label>
              <input value={form.chipId} onChange={e => set('chipId', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Màu lông</label>
              <input value={form.color} onChange={e => set('color', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50" />
            </div>
            <div className="col-span-2 flex items-center gap-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl px-4 py-3">
              <button
                type="button"
                onClick={() => set('sterilized', !form.sterilized)}
                className={`w-5 h-5 rounded-md flex items-center justify-center border-2 transition-colors ${form.sterilized ? 'bg-secondary border-secondary' : 'border-slate-300 dark:border-slate-500'}`}
              >
                {form.sterilized && <Check className="w-3 h-3 text-white" />}
              </button>
              <span className="text-sm font-bold text-slate-700 dark:text-white">Đã triệt sản</span>
            </div>
            <div className="col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Ghi chú</label>
              <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50 resize-none" />
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white dark:bg-slate-800 rounded-b-3xl px-6 pt-4 pb-6 border-t border-slate-100 dark:border-slate-700 flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            Hủy
          </button>
          <button onClick={() => { onSave(form); onClose(); }}
            className="flex-1 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
            <Save className="w-4 h-4" /> Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   MAIN PAGE
──────────────────────────────────────────────────────────── */
export default function PetProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const initial: PetData = (() => {
    if (id) {
      const rec = getPetById(+id);
      if (rec) return rec;
      // missing pet - redirect to pet listing
      setTimeout(() => navigate('/profile/pets'), 0);
    }
    return EMPTY_PET;
  })();

  const [pet, setPet] = useState<PetData>(initial);
  const [editing, setEditing] = useState(false);

  // update if route parameter changes
  React.useEffect(() => {
    if (id) {
      const rec = getPetById(+id);
      if (rec) setPet(rec);
      else navigate('/profile/pets');
    }
  }, [id, navigate]);
  const [tab, setTab] = useState<'vaccines' | 'docs'>('vaccines');
  const [lightbox, setLightbox] = useState<string | null>(null);

  const age = new Date().getFullYear() - pet.birthYear;

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 py-8">
      {/* Edit Modal */}
      {editing && (
        <EditModal pet={pet} onSave={setPet} onClose={() => setEditing(false)} />
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <img src={lightbox} className="max-w-3xl w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl" alt="Photo" />
          <button className="absolute top-4 right-4 p-2 bg-white/10 text-white rounded-full hover:bg-white/20">
            <X className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <Link to="/home" className="hover:text-primary transition-colors">Trang chủ</Link>
        <ChevronRight className="w-4 h-4" />
         <Link to="/home" className="hover:text-primary transition-colors">Profile</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-slate-700 dark:text-slate-200 font-medium">Hồ sơ thú cưng</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ── LEFT COLUMN ─────────────────────────────────── */}
        <aside className="lg:col-span-4 xl:col-span-3 flex flex-col gap-6">
          {/* Identity Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
            {/* Banner gradient */}
            <div className="h-20 bg-gradient-to-br from-secondary/20 via-primary/10 to-accent/30" />

            <div className="px-6 pb-6 -mt-10 flex flex-col items-center text-center">
              {/* Avatar */}
              <div className="relative mb-3">
                <img
                  src={pet.avatar}
                  alt={pet.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-slate-800 shadow-lg"
                />
                <button
                  onClick={() => setEditing(true)}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-secondary text-white rounded-full flex items-center justify-center shadow-md hover:bg-cyan-400 transition-colors"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-1">{pet.name}</h1>
              <span className="text-xs font-bold text-secondary bg-secondary/10 px-3 py-1 rounded-full mb-4">
                {pet.breed}
              </span>

              {/* Quick stats grid */}
              <div className="w-full grid grid-cols-2 gap-3 border-t border-slate-100 dark:border-slate-700 pt-4 text-left">
                {[
                  { label: 'Tuổi', value: `${age} tuổi` },
                  { label: 'Giới tính', value: pet.gender },
                  { label: 'Cân nặng', value: `${pet.weight} kg` },
                  { label: 'Màu lông', value: pet.color },
                  { label: 'ID Chip', value: pet.chipId, full: true },
                  { label: 'Triệt sản', value: pet.sterilized ? 'Đã triệt sản ✓' : 'Chưa triệt sản', full: true },
                ].map(item => (
                  <div key={item.label} className={item.full ? 'col-span-2' : ''}>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">{item.label}</p>
                    <p className="text-sm font-bold text-slate-800 dark:text-white mt-0.5">{item.value}</p>
                  </div>
                ))}
              </div>

              {pet.notes && (
                <div className="w-full mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 text-left">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">Ghi chú</p>
                  <p className="text-xs text-slate-500 leading-relaxed">{pet.notes}</p>
                </div>
              )}

              <button
                onClick={() => setEditing(true)}
                className="w-full mt-5 py-2.5 rounded-full bg-primary text-white font-bold text-sm hover:bg-primary-dark transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
              >
                <Edit2 className="w-4 h-4" /> Chỉnh sửa hồ sơ
              </button>
            </div>
          </div>

          {/* Health summary */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Sức khoẻ', value: 'Tốt', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', icon: <Heart className="w-5 h-5" /> },
              { label: 'Khám cuối', value: '20/08', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', icon: <Activity className="w-5 h-5" /> },
              { label: 'Thuốc', value: 'Không', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20', icon: <ShieldCheck className="w-5 h-5" /> },
            ].map(s => (
              <div key={s.label} className="bg-white dark:bg-slate-800 rounded-2xl p-3 border border-slate-100 dark:border-slate-700 shadow-sm text-center">
                <div className={`w-9 h-9 rounded-xl ${s.bg} ${s.color} flex items-center justify-center mx-auto mb-2`}>{s.icon}</div>
                <p className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">{s.label}</p>
                <p className={`text-xs font-black ${s.color} mt-0.5`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Upcoming appointments */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700">
            <h3 className="font-black text-base flex items-center gap-2 text-slate-900 dark:text-white mb-4">
              <Calendar className="w-4 h-4 text-secondary" /> Lịch hẹn sắp tới
            </h3>
            <div className="space-y-3">
              {APPOINTMENTS.map((a, i) => (
                <div key={i} className={`p-3 rounded-xl border-l-4 ${a.urgent ? 'bg-secondary/5 border-secondary' : 'bg-slate-50 dark:bg-slate-700/40 border-slate-300 dark:border-slate-600'}`}>
                  <p className={`text-[10px] font-black uppercase tracking-wider mb-0.5 ${a.urgent ? 'text-secondary' : 'text-slate-400'}`}>
                    {a.date} · {a.time}
                  </p>
                  <p className="text-sm font-bold text-slate-800 dark:text-white">{a.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />{a.clinic}
                  </p>
                </div>
              ))}
            </div>
            <Link to="/bookings" className="mt-4 block text-center text-xs font-bold text-secondary hover:underline">
              Xem tất cả lịch hẹn →
            </Link>
          </div>

          {/* Camera shortcut */}
          <Link to="/camera"
            className="flex items-center gap-3 bg-gradient-to-r from-primary to-slate-700 text-white p-4 rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-white/70">Camera lưu trú</p>
              <p className="text-sm font-bold">Xem Miu Miu trực tiếp</p>
            </div>
            <ChevronRight className="w-4 h-4 ml-auto text-white/50" />
          </Link>
        </aside>

        {/* ── RIGHT COLUMN ─────────────────────────────────── */}
        <main className="lg:col-span-8 xl:col-span-9 flex flex-col gap-8">
          {/* Nutrition */}
          <section className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-black flex items-center gap-2 text-slate-900 dark:text-white">
                <Utensils className="w-5 h-5 text-orange-500" /> Dinh dưỡng
              </h2>
              <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-400 hover:text-primary">
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 mb-5">
              {NUTRITION.map((n, i) => (
                <div key={i} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-100 dark:border-slate-700">
                  <p className="text-[10px] font-black text-secondary uppercase tracking-widest mb-1">{n.meal}</p>
                  <p className="font-bold text-sm text-slate-800 dark:text-white">{n.food}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Lượng: {n.amount}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: <Check className="w-4 h-4 text-emerald-600" />, bg: 'bg-emerald-50 dark:bg-emerald-900/20', label: 'Thức ăn ưa thích', desc: 'Pate cá hồi, Hạt Royal Canin' },
                { icon: <AlertCircle className="w-4 h-4 text-red-500" />, bg: 'bg-red-50 dark:bg-red-900/20', label: 'Dị ứng / Tránh', desc: 'Sữa bò tươi, Thịt mỡ' },
                { icon: <Droplets className="w-4 h-4 text-blue-500" />, bg: 'bg-blue-50 dark:bg-blue-900/20', label: 'Uống nước', desc: '~200ml / ngày' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-9 h-9 shrink-0 rounded-xl ${item.bg} flex items-center justify-center`}>{item.icon}</div>
                  <div>
                    <p className="text-xs font-bold text-slate-700 dark:text-white">{item.label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Vaccination + Documents (tabbed) */}
          <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex border-b border-slate-100 dark:border-slate-700">
              {([
                { key: 'vaccines', label: 'Lịch sử tiêm chủng', icon: <Syringe className="w-4 h-4" /> },
                { key: 'docs', label: 'Hồ sơ y tế', icon: <FileText className="w-4 h-4" /> },
              ] as const).map(t => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`flex items-center gap-2 flex-1 px-6 py-4 text-sm font-bold border-b-2 transition-all ${tab === t.key ? 'border-secondary text-secondary' : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                    }`}
                >
                  {t.icon}{t.label}
                </button>
              ))}
            </div>

            {tab === 'vaccines' && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <p className="text-sm text-slate-500">{VACCINES.filter(v => v.status === 'done').length}/{VACCINES.length} mũi tiêm hoàn thành</p>
                  <button className="text-sm font-bold text-secondary flex items-center gap-1 hover:underline">
                    <Plus className="w-4 h-4" /> Thêm mũi tiêm
                  </button>
                </div>

                <div className="relative pl-5">
                  {/* vertical line */}
                  <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-slate-200 dark:bg-slate-700" />
                  {VACCINES.map((v, i) => (
                    <div key={i} className="relative pl-8 pb-7 last:pb-0">
                      {/* dot */}
                      <div className={`absolute left-3 top-0 w-4 h-4 rounded-full border-4 border-white dark:border-slate-800 shadow -translate-x-1/2
                        ${v.status === 'done' ? 'bg-secondary' : 'bg-white dark:bg-slate-800 border-2 border-primary dark:border-white'}`} />

                      <div className={`p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3
                        ${v.status === 'upcoming'
                          ? 'border border-dashed border-secondary/40 bg-secondary/5'
                          : 'bg-slate-50 dark:bg-slate-700/40'}`}>
                        <div>
                          <p className={`font-bold text-sm ${v.status === 'upcoming' ? 'text-primary dark:text-secondary' : 'text-slate-800 dark:text-white'}`}>
                            {v.name}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">{v.drug} · {v.clinic}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{v.date}</p>
                          {v.status === 'done' ? (
                            <span className="inline-block mt-1 text-[10px] font-black text-secondary bg-secondary/10 px-2 py-0.5 rounded-full">Đã tiêm ✓</span>
                          ) : (
                            <Link to="/bookings" className="inline-block mt-1 text-[10px] font-black text-white bg-secondary px-3 py-1.5 rounded-full hover:bg-cyan-400 transition-colors">
                              Đặt lịch ngay →
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'docs' && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-5">
                  <p className="text-sm text-slate-500">{DOCUMENTS.length} tài liệu</p>
                  <button className="text-sm font-bold text-secondary flex items-center gap-1 hover:underline">
                    <Upload className="w-4 h-4" /> Tải lên
                  </button>
                </div>
                <div className="space-y-3">
                  {DOCUMENTS.map((doc, i) => (
                    <div key={i} className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors group">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${doc.type === 'pdf' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{doc.name}</p>
                          <p className="text-xs text-slate-400">{doc.size} · {doc.date}</p>
                        </div>
                      </div>
                      <button className="p-2 text-slate-300 group-hover:text-secondary transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Photo Album */}
          <section className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-black flex items-center gap-2 text-slate-900 dark:text-white">
                <Image className="w-5 h-5 text-purple-500" /> Album ảnh
                <span className="text-sm font-bold text-slate-400 ml-1">({PHOTOS.length} ảnh)</span>
              </h2>
              <button className="flex items-center gap-1.5 bg-primary text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-primary-dark transition-colors shadow-md shadow-primary/20">
                <Plus className="w-3.5 h-3.5" /> Thêm ảnh
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-4 gap-3">
              {PHOTOS.map((src, i) => (
                <div
                  key={i}
                  onClick={() => setLightbox(src)}
                  className="aspect-square rounded-xl overflow-hidden border border-slate-100 dark:border-slate-700 cursor-pointer relative group"
                >
                  <img src={src} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={`Photo ${i + 1}`} />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <span className="text-white text-xs">Xem</span>
                  </div>
                </div>
              ))}
              {/* Add photo tile */}
              <div className="aspect-square rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-600 flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-secondary hover:bg-secondary/5 transition-all">
                <Upload className="w-5 h-5 text-slate-300 dark:text-slate-500" />
                <span className="text-[10px] font-bold text-slate-300 dark:text-slate-500">Thêm ảnh</span>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
