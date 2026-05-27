import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { petService } from '../../services/pet.service';
import { useAuth } from '../../contexts/AuthContext';
import { Pet } from '../../types';
import {
  Camera, Edit2, Save, X, ChevronRight, Download, Plus,
  Calendar, Clock, MapPin, Syringe, FileText, Heart,
  Activity, Utensils, Droplets, Check, AlertCircle,
  ShieldCheck, Star, Image, Upload, Trash2, Video, ClipboardList,
  Loader2
} from 'lucide-react';

/* ────────────────────────────────────────────────────────────
   TYPES
   (Harmonizing with the global Pet type)
──────────────────────────────────────────────────────────── */
export interface PetData extends Pet {}

/* ────────────────────────────────────────────────────────────
   MOCK DATA (Fallback for related info not yet in BE)
──────────────────────────────────────────────────────────── */
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


/* ────────────────────────────────────────────────────────────
   EDIT MODAL
──────────────────────────────────────────────────────────── */
function EditModal({ pet, onSave, onClose }: { pet: PetData; onSave: (p: PetData) => void; onClose: () => void }) {
  const [form, setForm] = useState(pet);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const set = (key: keyof PetData, val: any) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const url = await petService.uploadAvatar(file);
      set('avatar', url);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Lỗi khi tải ảnh lên.');
    } finally {
      setIsUploading(false);
    }
  };

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
            <div className="relative">
              <img src={form.avatar} className={`w-16 h-16 rounded-2xl object-cover ${isUploading ? 'opacity-50' : ''}`} alt="pet" />
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="animate-spin text-secondary" size={20} />
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-700 dark:text-white">Ảnh đại diện</p>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
              <button 
                type="button"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-secondary font-bold mt-1 flex items-center gap-1 hover:underline disabled:opacity-50"
              >
                <Upload className="w-3.5 h-3.5" /> {isUploading ? 'Đang tải...' : 'Tải ảnh từ máy'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Giới tính</label>
              <select value={form.gender} onChange={e => set('gender', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50">
                <option value="Cái">Cái</option>
                <option value="Đực">Đực</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Ngày sinh</label>
              <input type="date" value={form.dob} onChange={e => set('dob', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Cân nặng (kg)</label>
              <input type="number" step="0.1" value={form.weight} onChange={e => set('weight', +e.target.value)}
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
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Ghi chú sức khỏe</label>
              <textarea value={form.healthNote} onChange={e => set('healthNote', e.target.value)}
                rows={3} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50 resize-none" />
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white dark:bg-slate-800 rounded-b-3xl px-6 pt-4 pb-6 border-t border-slate-100 dark:border-slate-700 flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            Hủy
          </button>
          <button onClick={() => { onSave(form); onClose(); }}
            className="flex-1 py-3 rounded-xl bg-[#1a2b4c] text-white font-bold text-sm hover:opacity-90 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#1a2b4c]/20">
            <Save className="w-4 h-4" /> Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
}

function NutritionModal({ pet, onSave, onClose }: { pet: PetData; onSave: (p: PetData) => void; onClose: () => void }) {
  const [form, setForm] = useState<PetData>({
    ...pet,
    nutritionPlan: (pet.nutritionPlan && pet.nutritionPlan.length > 0) ? pet.nutritionPlan : [
      { mealName: 'Sáng', foodType: '', amount: '' },
      { mealName: 'Trưa', foodType: '', amount: '' },
      { mealName: 'Tối', foodType: '', amount: '' }
    ]
  });
  const set = (key: keyof PetData, val: any) =>
    setForm(prev => ({ ...prev, [key]: val }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-slate-800 rounded-t-3xl px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between z-10">
          <h2 className="text-xl font-black flex items-center gap-2 text-slate-900 dark:text-white">
            <Utensils className="w-5 h-5 text-orange-500" /> Cập nhật dinh dưỡng
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2">
              <h3 className="text-sm font-black text-slate-800 dark:text-white">Chế độ dinh dưỡng</h3>
              <button 
                type="button"
                onClick={() => {
                  const meals = [...(form.nutritionPlan || [])];
                  meals.push({ mealName: 'Bữa phụ', foodType: '', amount: '' });
                  set('nutritionPlan', meals);
                }}
                className="text-xs font-bold text-secondary flex items-center gap-1 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" /> Thêm bữa
              </button>
            </div>
            
            <div className="space-y-3">
                {form.nutritionPlan?.map((meal, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-slate-50 dark:bg-slate-700/30 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                    <div className="col-span-3">
                      <input 
                        value={meal.mealName} 
                        onChange={e => {
                          const meals = [...(form.nutritionPlan || [])];
                          meals[idx] = { ...meals[idx], mealName: e.target.value };
                          set('nutritionPlan', meals);
                        }}
                        className="w-full bg-transparent text-xs font-black text-secondary uppercase outline-none"
                      />
                    </div>
                    <div className="col-span-5">
                      <input 
                        placeholder="Thức ăn..."
                        value={meal.foodType} 
                        onChange={e => {
                          const meals = [...(form.nutritionPlan || [])];
                          meals[idx] = { ...meals[idx], foodType: e.target.value };
                          set('nutritionPlan', meals);
                        }}
                        className="w-full bg-transparent text-xs text-slate-700 dark:text-white font-bold outline-none border-b border-transparent focus:border-slate-300"
                      />
                    </div>
                    <div className="col-span-3">
                      <input 
                        placeholder="Lượng..."
                        value={meal.amount} 
                        onChange={e => {
                          const meals = [...(form.nutritionPlan || [])];
                          meals[idx] = { ...meals[idx], amount: e.target.value };
                          set('nutritionPlan', meals);
                        }}
                        className="w-full bg-transparent text-xs text-slate-500 outline-none border-b border-transparent focus:border-slate-300"
                      />
                    </div>
                  <div className="col-span-1 text-right">
                    <button 
                      type="button"
                      onClick={() => {
                        const meals = [...(form.nutritionPlan || [])].filter((_, i) => i !== idx);
                        set('nutritionPlan', meals);
                      }}
                      className="text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-black text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-2">Thông tin bổ sung</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Thức ăn ưa thích</label>
                <input value={form.favoriteFood || ''} onChange={e => set('favoriteFood', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Dị ứng / Tránh</label>
                <input value={form.allergies || ''} onChange={e => set('allergies', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Sở thích</label>
                <input value={form.hobbies || ''} onChange={e => set('hobbies', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Thời gian đi dạo (phút)</label>
                <input value={form.walkTime || ''} onChange={e => set('walkTime', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50" />
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white dark:bg-slate-800 rounded-b-3xl px-6 pt-4 pb-6 border-t border-slate-100 dark:border-slate-700 flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            Hủy
          </button>
          <button onClick={() => { onSave(form); onClose(); }}
            className="flex-1 py-3 rounded-xl bg-[#1a2b4c] text-white font-bold text-sm hover:opacity-90 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#1a2b4c]/20">
            <Save className="w-4 h-4" /> Lưu cập nhật
          </button>
        </div>
      </div>
    </div>
  );
}

function MedicalModal({ pet, onSave, onClose }: { pet: PetData; onSave: (p: PetData) => void; onClose: () => void }) {
  const [form, setForm] = useState<PetData>({
    ...pet,
    medicalRecords: pet.medicalRecords || []
  });
  const set = (key: keyof PetData, val: any) =>
    setForm(prev => ({ ...prev, [key]: val }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-slate-800 rounded-t-3xl px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between z-10">
          <h2 className="text-xl font-black flex items-center gap-2 text-slate-900 dark:text-white">
            <ClipboardList className="w-5 h-5 text-cyan-500" /> Hồ sơ y tế
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2">
              <h3 className="text-sm font-black text-slate-800 dark:text-white">Bệnh án</h3>
              <button 
                type="button"
                onClick={() => {
                  const records = [...(form.medicalRecords || [])];
                  records.push({ diagnosis: '', treatment: '', prescription: '', veterinarianNote: '', visitDate: new Date().toISOString() });
                  set('medicalRecords', records);
                }}
                className="text-xs font-bold text-secondary flex items-center gap-1 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" /> Thêm bệnh án
              </button>
            </div>
            
            <div className="space-y-4">
              {form.medicalRecords?.map((record, idx) => (
                <div key={idx} className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-xl border border-slate-100 dark:border-slate-700 relative">
                  <button 
                    type="button"
                    onClick={() => {
                      const records = form.medicalRecords?.filter((_, i) => i !== idx);
                      set('medicalRecords', records);
                    }}
                    className="absolute top-2 right-2 text-slate-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Chẩn đoán</label>
                      <input 
                        value={record.diagnosis} 
                        onChange={e => {
                          const records = [...(form.medicalRecords || [])];
                          records[idx] = { ...records[idx], diagnosis: e.target.value };
                          set('medicalRecords', records);
                        }}
                        placeholder="Vd: Viêm phổi, Nhiễm trùng..."
                        className="w-full bg-transparent text-sm font-bold text-slate-800 dark:text-white outline-none border-b border-slate-200 dark:border-slate-600 focus:border-secondary pb-1"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Điều trị</label>
                        <input 
                          value={record.treatment} 
                          onChange={e => {
                            const records = [...(form.medicalRecords || [])];
                            records[idx] = { ...records[idx], treatment: e.target.value };
                            set('medicalRecords', records);
                          }}
                          placeholder="..."
                          className="w-full bg-transparent text-xs text-slate-700 dark:text-slate-300 outline-none border-b border-slate-200 dark:border-slate-600 focus:border-secondary pb-1"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Đơn thuốc</label>
                        <input 
                          value={record.prescription} 
                          onChange={e => {
                            const records = [...(form.medicalRecords || [])];
                            records[idx] = { ...records[idx], prescription: e.target.value };
                            set('medicalRecords', records);
                          }}
                          placeholder="..."
                          className="w-full bg-transparent text-xs text-slate-700 dark:text-slate-300 outline-none border-b border-slate-200 dark:border-slate-600 focus:border-secondary pb-1"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Ghi chú bác sĩ</label>
                      <textarea 
                        value={record.veterinarianNote} 
                        onChange={e => {
                          const records = [...(form.medicalRecords || [])];
                          records[idx] = { ...records[idx], veterinarianNote: e.target.value };
                          set('medicalRecords', records);
                        }}
                        rows={2}
                        className="w-full bg-transparent text-xs text-slate-600 dark:text-slate-400 outline-none border border-slate-200 dark:border-slate-600 rounded-lg p-2 mt-1"
                      />
                    </div>
                  </div>
                </div>
              ))}
              {(!form.medicalRecords || form.medicalRecords.length === 0) && (
                <p className="text-center py-8 text-xs text-slate-400 italic">Chưa có thông tin bệnh án</p>
              )}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white dark:bg-slate-800 rounded-b-3xl px-6 pt-4 pb-6 border-t border-slate-100 dark:border-slate-700 flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            Hủy
          </button>
          <button onClick={() => { onSave(form); onClose(); }}
            className="flex-1 py-3 rounded-xl bg-[#1a2b4c] text-white font-bold text-sm hover:opacity-90 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#1a2b4c]/20">
            <Save className="w-4 h-4" /> Lưu hồ sơ
          </button>
        </div>
      </div>
    </div>
  );
}

function VaccinationModal({ pet, onSave, onClose }: { pet: PetData; onSave: (p: PetData) => void; onClose: () => void }) {
  const [form, setForm] = useState(pet);
  const set = (key: keyof PetData, val: any) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-slate-800 rounded-t-3xl px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between z-10">
          <h2 className="text-xl font-black flex items-center gap-2 text-slate-900 dark:text-white">
            <Syringe className="w-5 h-5 text-secondary" /> Lịch sử tiêm chủng
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2">
              <h3 className="text-sm font-black text-slate-800 dark:text-white">Tiêm chủng</h3>
              <button 
                type="button"
                onClick={() => {
                  const vaccinations = [...(form.vaccinations || [])];
                  vaccinations.push({ name: '', drug: '', clinic: '', date: new Date().toISOString(), status: 'upcoming' });
                  set('vaccinations', vaccinations);
                }}
                className="text-xs font-bold text-secondary flex items-center gap-1 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" /> Thêm mũi tiêm
              </button>
            </div>
            
            <div className="space-y-4">
              {form.vaccinations?.map((v, idx) => (
                <div key={idx} className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-xl border border-slate-100 dark:border-slate-700 relative">
                  <button 
                    type="button"
                    onClick={() => {
                      const vaccinations = form.vaccinations?.filter((_, i) => i !== idx);
                      set('vaccinations', vaccinations);
                    }}
                    className="absolute top-2 right-2 text-slate-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Tên loại bệnh phòng ngừa</label>
                      <input 
                        value={v.name} 
                        onChange={e => {
                          const list = [...(form.vaccinations || [])];
                          list[idx] = { ...list[idx], name: e.target.value };
                          set('vaccinations', list);
                        }}
                        placeholder="Vd: Dại, 4 bệnh..."
                        className="w-full bg-transparent text-sm font-bold text-slate-800 dark:text-white outline-none border-b border-slate-200 dark:border-slate-600 focus:border-secondary pb-1"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Tên thuốc/Vaccine</label>
                        <input 
                          value={v.drug} 
                          onChange={e => {
                            const list = [...(form.vaccinations || [])];
                            list[idx] = { ...list[idx], drug: e.target.value };
                            set('vaccinations', list);
                          }}
                          placeholder="..."
                          className="w-full bg-transparent text-xs text-slate-700 dark:text-slate-300 outline-none border-b border-slate-200 dark:border-slate-600 focus:border-secondary pb-1"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Phòng khám</label>
                        <input 
                          value={v.clinic} 
                          onChange={e => {
                            const list = [...(form.vaccinations || [])];
                            list[idx] = { ...list[idx], clinic: e.target.value };
                            set('vaccinations', list);
                          }}
                          placeholder="..."
                          className="w-full bg-transparent text-xs text-slate-700 dark:text-slate-300 outline-none border-b border-slate-200 dark:border-slate-600 focus:border-secondary pb-1"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Ngày tiêm</label>
                        <input 
                          type="date"
                          value={v.date ? v.date.split('T')[0] : ''} 
                          onChange={e => {
                            const list = [...(form.vaccinations || [])];
                            list[idx] = { ...list[idx], date: e.target.value };
                            set('vaccinations', list);
                          }}
                          className="w-full bg-transparent text-xs text-slate-700 dark:text-slate-300 outline-none border-b border-slate-200 dark:border-slate-600 focus:border-secondary pb-1"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Trạng thái</label>
                        <select
                          value={v.status}
                          onChange={e => {
                            const list = [...(form.vaccinations || [])];
                            list[idx] = { ...list[idx], status: e.target.value as any };
                            set('vaccinations', list);
                          }}
                          className="w-full bg-transparent text-xs font-bold text-slate-700 dark:text-slate-300 outline-none border-b border-slate-200 dark:border-slate-600 focus:border-secondary pb-1"
                        >
                          <option value="done">Đã hoàn thành</option>
                          <option value="upcoming">Sắp tới</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {(!form.vaccinations || form.vaccinations.length === 0) && (
                <p className="text-center py-8 text-xs text-slate-400 italic">Chưa có thông tin tiêm chủng</p>
              )}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white dark:bg-slate-800 rounded-b-3xl px-6 pt-4 pb-6 border-t border-slate-100 dark:border-slate-700 flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            Hủy
          </button>
          <button onClick={() => { onSave(form); onClose(); }}
            className="flex-1 py-3 rounded-xl bg-[#1a2b4c] text-white font-bold text-sm hover:opacity-90 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#1a2b4c]/20">
            <Save className="w-4 h-4" /> Lưu thông tin
          </button>
        </div>
      </div>
    </div>
  );
}

function ReminderModal({ pet, onSave, onClose }: { pet: PetData; onSave: (p: PetData) => void; onClose: () => void }) {
  const [form, setForm] = useState(pet);
  const set = (key: keyof PetData, val: any) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-slate-800 rounded-t-3xl px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between z-10">
          <h2 className="text-xl font-black flex items-center gap-2 text-slate-900 dark:text-white">
            <Clock className="w-5 h-5 text-secondary" /> Quản lý lịch nhắc
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2">
              <h3 className="text-sm font-black text-slate-800 dark:text-white">Lịch nhắc</h3>
              <button 
                type="button"
                onClick={() => {
                  const reminders = [...(form.reminders || [])];
                  reminders.push({ title: '', description: '', type: 'medicine', date: new Date().toISOString(), status: 'active' });
                  set('reminders', reminders);
                }}
                className="text-xs font-bold text-secondary flex items-center gap-1 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" /> Thêm lịch nhắc
              </button>
            </div>
            
            <div className="space-y-4">
              {form.reminders?.map((r, idx) => (
                <div key={idx} className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-xl border border-slate-100 dark:border-slate-700 relative">
                  <button 
                    type="button"
                    onClick={() => {
                      const list = form.reminders?.filter((_, i) => i !== idx);
                      set('reminders', list);
                    }}
                    className="absolute top-2 right-2 text-slate-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Tiêu đề lịch nhắc</label>
                      <input 
                        value={r.title} 
                        onChange={e => {
                          const list = [...(form.reminders || [])];
                          list[idx] = { ...list[idx], title: e.target.value };
                          set('reminders', list);
                        }}
                        placeholder="Vd: Uống thuốc giun, Spa..."
                        className="w-full bg-transparent text-sm font-bold text-slate-800 dark:text-white outline-none border-b border-slate-200 dark:border-slate-600 focus:border-secondary pb-1"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Mô tả chi tiết</label>
                      <input 
                        value={r.description} 
                        onChange={e => {
                          const list = [...(form.reminders || [])];
                          list[idx] = { ...list[idx], description: e.target.value };
                          set('reminders', list);
                        }}
                        placeholder="..."
                        className="w-full bg-transparent text-xs text-slate-700 dark:text-slate-300 outline-none border-b border-slate-200 dark:border-slate-600 focus:border-secondary pb-1"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Loại</label>
                        <select
                          value={r.type}
                          onChange={e => {
                            const list = [...(form.reminders || [])];
                            list[idx] = { ...list[idx], type: e.target.value as any };
                            set('reminders', list);
                          }}
                          className="w-full bg-transparent text-xs font-bold text-slate-700 dark:text-slate-300 outline-none border-b border-slate-200 dark:border-slate-600 focus:border-secondary pb-1"
                        >
                          <option value="medicine">Thuốc</option>
                          <option value="spa">Spa</option>
                          <option value="checkup">Khám bệnh</option>
                          <option value="other">Khác</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Ngày thực hiện</label>
                        <input 
                          type="date"
                          value={r.date ? r.date.split('T')[0] : ''} 
                          onChange={e => {
                            const list = [...(form.reminders || [])];
                            list[idx] = { ...list[idx], date: e.target.value };
                            set('reminders', list);
                          }}
                          className="w-full bg-transparent text-xs text-slate-700 dark:text-slate-300 outline-none border-b border-slate-200 dark:border-slate-600 focus:border-secondary pb-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {(!form.reminders || form.reminders.length === 0) && (
                <p className="text-center py-8 text-xs text-slate-400 italic">Chưa có lịch nhắc</p>
              )}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white dark:bg-slate-800 rounded-b-3xl px-6 pt-4 pb-6 border-t border-slate-100 dark:border-slate-700 flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            Hủy
          </button>
          <button onClick={() => { onSave(form); onClose(); }}
            className="flex-1 py-3 rounded-xl bg-[#1a2b4c] text-white font-bold text-sm hover:opacity-90 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#1a2b4c]/20">
            <Save className="w-4 h-4" /> Lưu lịch nhắc
          </button>
        </div>
      </div>
    </div>
  );
}

function AlbumModal({ pet, onSave, onClose }: { pet: PetData; onSave: (p: PetData) => void; onClose: () => void }) {
  const [form, setForm] = useState(pet);
  const [uploading, setUploading] = useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);
  const set = (key: keyof PetData, val: any) => setForm(prev => ({ ...prev, [key]: val }));

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const url = await petService.uploadAvatar(file);
      const album = [...(form.album || [])];
      album.push({ imageUrl: url, uploadDate: new Date().toISOString() });
      set('album', album);
    } catch (err) {
      alert('Lỗi khi tải ảnh lên');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-slate-800 rounded-t-3xl px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between z-10">
          <h2 className="text-xl font-black flex items-center gap-2 text-slate-900 dark:text-white">
            <Image className="w-5 h-5 text-purple-500" /> Quản lý Album ảnh
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {form.album?.map((img, idx) => (
              <div key={idx} className="aspect-square rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700 relative group">
                <img src={img.imageUrl} className="w-full h-full object-cover" alt="" />
                <button 
                  onClick={() => {
                    const album = form.album?.filter((_, i) => i !== idx);
                    set('album', album);
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            
            <button 
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-2 hover:border-secondary hover:bg-secondary/5 transition-all group"
            >
              {uploading ? (
                <Loader2 className="animate-spin text-secondary" size={24} />
              ) : (
                <>
                  <Upload className="text-slate-300 group-hover:text-secondary transition-colors" size={24} />
                  <span className="text-[10px] font-black text-slate-400 group-hover:text-secondary transition-colors uppercase">Tải ảnh mới</span>
                </>
              )}
            </button>
          </div>
          <input type="file" hidden ref={fileRef} accept="image/*" onChange={handleUpload} />
        </div>

        <div className="sticky bottom-0 bg-white dark:bg-slate-800 rounded-b-3xl px-6 pt-4 pb-6 border-t border-slate-100 dark:border-slate-700 flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            Đóng
          </button>
          <button onClick={() => { onSave(form); onClose(); }}
            className="flex-1 py-3 rounded-xl bg-[#1a2b4c] text-white font-bold text-sm hover:opacity-90 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#1a2b4c]/20">
            <Save className="w-4 h-4" /> Lưu Album
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
  const [pet, setPet] = useState<PetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNutritionModal, setShowNutritionModal] = useState(false);
  const [showMedicalModal, setShowMedicalModal] = useState(false);
  const [showVaccinationModal, setShowVaccinationModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showAlbumModal, setShowAlbumModal] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<'vaccines' | 'docs' | 'reminders'>('vaccines');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPetDetails();
    }
  }, [id]);

  const fetchPetDetails = async () => {
    try {
      setLoading(true);
      const data = await petService.getById(Number(id));
      setPet(data as PetData);
    } catch (error) {
      console.error('Failed to fetch pet details:', error);
      navigate('/profile/pets');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (updatedPet: PetData) => {
    try {
      const saved = await petService.update(pet!.id, updatedPet);
      setPet(saved as PetData);
    } catch (error) {
      console.error('Failed to update pet:', error);
      alert('Có lỗi xảy ra khi cập nhật thông tin.');
    }
  };

  const handleDeletePet = async () => {
    if (!pet || !deleteReason) return;
    try {
      setSubmitting(true);
      await petService.delete(pet.id, deleteReason);
      setShowDeleteModal(false);
      setDeleteReason('');
      fetchPetDetails();
    } catch (error) {
      console.error('Failed to delete pet:', error);
      alert('Có lỗi xảy ra khi xóa thú cưng.');
    } finally {
      setSubmitting(false);
    }
  };

  const calculateAge = (dob: string) => {
    if (!dob) return 'Chưa rõ';
    const birthDate = new Date(dob);
    const today = new Date();
    
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    
    if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
      years--;
      months += 12;
    }
    
    if (years > 0) {
      return `${years} năm tuổi`;
    } else {
      const displayMonths = months <= 0 ? 1 : months;
      return `${displayMonths} tháng tuổi`;
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!pet) return null;

  const age = calculateAge(pet.dob);

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 py-8">
      {showEditModal && <EditModal pet={pet} onClose={() => setShowEditModal(false)} onSave={handleUpdate} />}
      {showNutritionModal && <NutritionModal pet={pet} onClose={() => setShowNutritionModal(false)} onSave={handleUpdate} />}
      {showMedicalModal && <MedicalModal pet={pet} onClose={() => setShowMedicalModal(false)} onSave={handleUpdate} />}
      {showVaccinationModal && <VaccinationModal pet={pet} onClose={() => setShowVaccinationModal(false)} onSave={handleUpdate} />}
      {showReminderModal && <ReminderModal pet={pet} onClose={() => setShowReminderModal(false)} onSave={handleUpdate} />}
      {showAlbumModal && <AlbumModal pet={pet} onClose={() => setShowAlbumModal(false)} onSave={handleUpdate} />}

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
        <Link to="/home" className="hover:text-[#1a2b4c] transition-colors">Trang chủ</Link>
        <ChevronRight className="w-4 h-4" />
        <Link to="/profile/pets" className="hover:text-[#1a2b4c] transition-colors">Thú cưng của tôi</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-slate-700 dark:text-slate-200 font-medium">Hồ sơ sức khỏe</span>
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
                <div className="relative">
                  <img
                    src={pet.avatar}
                    alt={pet.name}
                    className={`w-24 h-24 rounded-full object-cover border-4 border-white dark:border-slate-800 shadow-lg cursor-pointer hover:opacity-90 transition-opacity ${isUploading ? 'opacity-50' : ''}`}
                    onClick={() => fileInputRef.current?.click()}
                  />
                  {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="animate-spin text-secondary" size={24} />
                    </div>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      setIsUploading(true);
                      const url = await petService.uploadAvatar(file);
                      const saved = await petService.update(pet.id, { ...pet, avatar: url });
                      setPet(saved as PetData);
                    } catch (error) {
                      alert('Lỗi khi tải ảnh.');
                    } finally {
                      setIsUploading(false);
                    }
                  }} 
                />
                <button
                  onClick={() => setShowEditModal(true)}
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
                  { label: 'Tuổi', value: age },
                  { label: 'Giới tính', value: pet.gender },
                  { label: 'Cân nặng', value: `${pet.weight} kg` },
                  { label: 'Màu lông', value: pet.color },
                  { label: 'ID Chip', value: `#${pet.id}`, full: true },
                  { label: 'Triệt sản', value: pet.sterilized ? 'Đã triệt sản ✓' : 'Chưa triệt sản', full: true },
                ].map(item => (
                  <div key={item.label} className={item.full ? 'col-span-2' : ''}>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">{item.label}</p>
                    <p className="text-sm font-bold text-slate-800 dark:text-white mt-0.5">{item.value}</p>
                  </div>
                ))}
              </div>

              {pet.healthNote && (
                <div className="w-full mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 text-left">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">Ghi chú</p>
                  <p className="text-xs text-slate-500 leading-relaxed">{pet.healthNote}</p>
                </div>
              )}

              <button
                onClick={() => setShowEditModal(true)}
                className="w-full mt-5 py-2.5 rounded-full bg-primary text-white font-bold text-sm hover:bg-primary-dark transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
              >
                <Edit2 className="w-4 h-4" /> Chỉnh sửa hồ sơ
              </button>
            </div>
          </div>

          {/* Health summary */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Sức khoẻ', value: pet.active ? 'Tốt' : 'Ngưng hoạt động', color: pet.active ? 'text-emerald-600' : 'text-red-600', bg: pet.active ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20', icon: <Heart className="w-5 h-5" /> },
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

          {!pet.active && pet.unactiveReason && (
            <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-2xl p-5 shadow-sm">
              <h3 className="font-black text-sm flex items-center gap-2 text-red-600 dark:text-red-400 mb-2">
                <AlertCircle className="w-4 h-4" /> Lý do ngưng hoạt động
              </h3>
              <p className="text-xs text-red-500 dark:text-red-400 font-medium italic">
                "{pet.unactiveReason}"
              </p>
            </div>
          )}

          {pet.active && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="w-full py-4 rounded-2xl bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 font-bold text-sm border border-red-100 dark:border-red-900/20 hover:bg-red-100 transition-all flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> Ngừng hoạt động hồ sơ
            </button>
          )}

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
              <button 
                onClick={() => setShowNutritionModal(true)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-400 hover:text-primary">
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 mb-5">
              {(() => {
                const activeMeals = (pet.nutritionPlan || []).filter(n => n.foodType || n.amount);
                if (activeMeals.length === 0) {
                  return <p className="col-span-2 text-center py-8 text-xs text-slate-400 italic">Chưa có thông tin dinh dưỡng</p>;
                }
                return activeMeals.map((n, i) => (
                  <div key={i} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] font-black text-secondary uppercase tracking-widest mb-1">{n.mealName}</p>
                    <p className="font-bold text-sm text-slate-800 dark:text-white">{n.foodType || '—'}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Lượng: {n.amount || '—'}</p>
                  </div>
                ));
              })()}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: <Utensils className="w-4 h-4 text-emerald-600" />, bg: 'bg-emerald-50 dark:bg-emerald-900/20', label: 'Thức ăn ưa thích', value: pet.favoriteFood },
                { icon: <AlertCircle className="w-4 h-4 text-red-500" />, bg: 'bg-red-50 dark:bg-red-900/20', label: 'Dị ứng / Tránh', value: pet.allergies },
                { icon: <Heart className="w-4 h-4 text-pink-500" />, bg: 'bg-pink-50 dark:bg-pink-900/20', label: 'Sở thích', value: pet.hobbies },
                { icon: <Activity className="w-4 h-4 text-blue-500" />, bg: 'bg-blue-50 dark:bg-blue-900/20', label: 'Đi dạo', value: pet.walkTime ? `${pet.walkTime} phút / ngày` : null },
              ].filter(item => item.value).map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50/50 dark:bg-slate-700/20 border border-slate-100 dark:border-slate-700">
                  <div className={`w-9 h-9 shrink-0 rounded-xl ${item.bg} flex items-center justify-center`}>{item.icon}</div>
                  <div>
                    <p className="text-xs font-bold text-slate-700 dark:text-white">{item.label}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>


          {/* Vaccination + Documents (tabbed) */}
          <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex border-b border-slate-100 dark:border-slate-700">
              {([
                { key: 'vaccines', label: 'Tiêm chủng', icon: <Syringe className="w-4 h-4" /> },
                { key: 'docs', label: 'Hồ sơ bệnh án', icon: <FileText className="w-4 h-4" /> },
                { key: 'reminders', label: 'Lịch nhắc', icon: <Clock className="w-4 h-4" /> },
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
                  <p className="text-sm text-slate-500">{(pet.vaccinations || []).filter(v => v.status === 'done').length}/{(pet.vaccinations || []).length} mũi tiêm hoàn thành</p>
                  <button 
                    onClick={() => setShowVaccinationModal(true)}
                    className="text-sm font-bold text-secondary flex items-center gap-1 hover:underline">
                    <Plus className="w-4 h-4" /> Thêm mũi tiêm
                  </button>
                </div>

                <div className="relative pl-5">
                  {/* vertical line */}
                  <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-slate-200 dark:bg-slate-700" />
                  {pet.vaccinations && pet.vaccinations.length > 0 ? (
                    pet.vaccinations.map((v, i) => (
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
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{v.date ? new Date(v.date).toLocaleDateString('vi-VN') : '—'}</p>
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
                    ))
                  ) : (
                    <div className="text-center py-12 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                      <Syringe className="mx-auto text-slate-300 mb-2" size={32} />
                      <p className="text-xs text-slate-400 font-bold">Chưa có lịch sử tiêm chủng</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {tab === 'docs' && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-5">
                  <p className="text-sm text-slate-500">{(pet.medicalRecords || []).length} hồ sơ bệnh án</p>
                  <button 
                    onClick={() => setShowMedicalModal(true)}
                    className="text-sm font-bold text-secondary flex items-center gap-1 hover:underline">
                    <Plus className="w-4 h-4" /> Thêm bệnh án
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pet.medicalRecords && pet.medicalRecords.length > 0 ? (
                    pet.medicalRecords.map((record, i) => (
                      <div key={i} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-[10px] font-black text-secondary uppercase tracking-widest">{record.visitDate ? new Date(record.visitDate).toLocaleDateString('vi-VN') : '—'}</p>
                          <span className="px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase">Khám bệnh</span>
                        </div>
                        <p className="font-bold text-sm text-slate-800 dark:text-white mb-1">{record.diagnosis}</p>
                        <div className="space-y-1">
                          <p className="text-xs text-slate-600 dark:text-slate-300"><span className="font-bold">Điều trị:</span> {record.treatment || '—'}</p>
                          <p className="text-xs text-slate-600 dark:text-slate-300"><span className="font-bold">Thuốc:</span> {record.prescription || '—'}</p>
                        </div>
                        {record.veterinarianNote && (
                          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                            <p className="text-[10px] text-slate-400 italic">"{record.veterinarianNote}"</p>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                      <ClipboardList className="mx-auto text-slate-300 mb-2" size={32} />
                      <p className="text-xs text-slate-400 font-bold">Chưa có hồ sơ bệnh án nào</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {tab === 'reminders' && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <p className="text-sm text-slate-500">{(pet.reminders || []).filter(r => r.status === 'active').length} lịch nhắc sắp tới</p>
                  <button 
                    onClick={() => setShowReminderModal(true)}
                    className="text-sm font-bold text-secondary flex items-center gap-1 hover:underline">
                    <Plus className="w-4 h-4" /> Thêm lịch nhắc
                  </button>
                </div>

                <div className="relative pl-5">
                  <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-slate-200 dark:bg-slate-700" />
                  
                  {pet.reminders && pet.reminders.length > 0 ? (
                    pet.reminders.map((r, i) => (
                      <div key={i} className="relative pl-8 pb-7">
                        <div className={`absolute left-3 top-0 w-4 h-4 rounded-full border-4 border-white dark:border-slate-800 shadow -translate-x-1/2 
                          ${r.type === 'medicine' ? 'bg-orange-400' : r.type === 'spa' ? 'bg-blue-400' : r.type === 'checkup' ? 'bg-emerald-400' : 'bg-slate-400'}`} />
                        <div className={`p-4 rounded-xl border ${
                          r.type === 'medicine' ? 'bg-orange-50/50 dark:bg-orange-900/10 border-orange-100 dark:border-orange-900/20' :
                          r.type === 'spa' ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/20' :
                          'bg-slate-50/50 dark:bg-slate-700/20 border-slate-100 dark:border-slate-700'
                        }`}>
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-bold text-sm text-slate-800 dark:text-white">{r.title}</p>
                              <p className="text-xs text-slate-400 mt-0.5">{r.description}</p>
                            </div>
                            <div className="text-right">
                              <p className={`text-xs font-bold ${
                                r.type === 'medicine' ? 'text-orange-600' : r.type === 'spa' ? 'text-blue-600' : 'text-slate-600'
                              }`}>{r.date ? new Date(r.date).toLocaleDateString('vi-VN') : '—'}</p>
                              <span className={`text-[10px] font-bold uppercase mt-1 inline-block ${r.status === 'active' ? 'text-emerald-500' : 'text-slate-400'}`}>
                                {r.status === 'active' ? 'Đang nhắc' : 'Hoàn thành'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                      <Clock className="mx-auto text-slate-300 mb-2" size={32} />
                      <p className="text-xs text-slate-400 font-bold">Chưa có lịch nhắc nào</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* Photo Album */}
          <section className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-black flex items-center gap-2 text-slate-900 dark:text-white">
                <Image className="w-5 h-5 text-purple-500" /> Album ảnh
                <span className="text-sm font-bold text-slate-400 ml-1">({(pet.album || []).length} ảnh)</span>
              </h2>
              <button 
                onClick={() => setShowAlbumModal(true)}
                className="flex items-center gap-1.5 bg-primary text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-primary-dark transition-colors shadow-md shadow-primary/20">
                <Plus className="w-3.5 h-3.5" /> Quản lý Album
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-4 gap-3">
              {pet.album && pet.album.length > 0 ? (
                pet.album.map((img, i) => (
                  <div
                    key={i}
                    onClick={() => setLightbox(img.imageUrl)}
                    className="aspect-square rounded-xl overflow-hidden border border-slate-100 dark:border-slate-700 cursor-pointer relative group"
                  >
                    <img src={img.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={`Photo ${i + 1}`} />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <span className="text-white text-xs">Xem</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-12 text-center bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                  <Image className="mx-auto text-slate-300 mb-2" size={32} />
                  <p className="text-xs text-slate-400 font-bold uppercase">Chưa có ảnh nào trong album</p>
                </div>
              )}
              {/* Add photo tile */}
              <div 
                onClick={() => setShowAlbumModal(true)}
                className="aspect-square rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-600 flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-secondary hover:bg-secondary/5 transition-all">
                <Upload className="w-5 h-5 text-slate-300 dark:text-slate-500" />
                <span className="text-[10px] font-bold text-slate-300 dark:text-slate-500">Thêm ảnh</span>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* Delete Pet Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl overflow-hidden p-8">
            <div className="text-center mb-6">
              <div className="size-16 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trash2 size={32} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Ngừng hoạt động?</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                Bạn đang thực hiện ngừng hoạt động hồ sơ của <span className="font-bold text-slate-900 dark:text-white">{pet.name}</span>. Hành động này có thể hoàn tác sau.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 block">Lý do ngưng hoạt động *</label>
                <textarea
                  required
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-red-500 rounded-2xl text-slate-900 dark:text-white outline-none transition-all font-medium resize-none text-sm"
                  placeholder="Vd: Bé đã qua đời, đã cho người khác..."
                  value={deleteReason}
                  onChange={e => setDeleteReason(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-2xl transition-all active:scale-95"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  disabled={!deleteReason || submitting}
                  onClick={handleDeletePet}
                  className="flex-[2] py-3 bg-red-500 text-white font-bold rounded-2xl shadow-lg hover:bg-red-600 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
