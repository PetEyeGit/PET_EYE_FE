import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Plus, X, Dog, Cat, Calendar, Weight, ClipboardList, Info, AlertCircle, CheckCircle2, Camera, Loader2, ChevronRight, Utensils, Heart, Trash2, Activity, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { petService } from '../services/pet.service';
import { useAuth } from '../contexts/AuthContext';
import { Pet } from '../types';

export default function ProfilePets() {
    const { user } = useAuth();
    const [pets, setPets] = useState<Pet[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Form state
    const [formData, setFormData] = useState({
        name: '',
        species: 'Chó',
        breed: '',
        gender: 'Đực',
        color: '',
        sterilized: false,
        weight: '',
        dob: '',
        healthNote: '',
        favoriteFood: '',
        allergies: '',
        hobbies: '',
        walkTime: '',
        avatar: '',
        nutritionPlan: [
            { mealName: 'Sáng', foodType: '', amount: '' },
            { mealName: 'Trưa', foodType: '', amount: '' },
            { mealName: 'Tối', foodType: '', amount: '' }
        ],
        medicalRecords: [] as any[],
        vaccinations: [] as any[],
        reminders: [] as any[]
    });
    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedPetForDelete, setSelectedPetForDelete] = useState<Pet | null>(null);
    const [deleteReason, setDeleteReason] = useState('');

    useEffect(() => {
        if (user?.id && !isNaN(Number(user.id))) {
            fetchPets();
        }
    }, [user]);

    useEffect(() => {
        if (step === 3 && formData.medicalRecords.length === 0) {
            setFormData(prev => ({
                ...prev,
                medicalRecords: [{ diagnosis: '', treatment: '', prescription: '', veterinarianNote: '', visitDate: new Date().toISOString() }]
            }));
        }
    }, [step, formData.medicalRecords.length]);

    const fetchPets = async () => {
        const userId = Number(user?.id);
        if (isNaN(userId)) {
            console.warn('[ProfilePets] fetchPets skipped: userId is NaN');
            return;
        }
        try {
            setLoading(true);
            const data = await petService.getByOwner(userId);
            setPets(data);
        } catch (error) {
            console.error('Failed to fetch pets:', error);
        } finally {
            setLoading(false);
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

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsUploading(true);
            const url = await petService.uploadAvatar(file);
            setFormData(prev => ({ ...prev, avatar: url }));
        } catch (error) {
            console.error('Failed to upload avatar:', error);
            alert('Lỗi khi tải ảnh lên. Vui lòng thử lại.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleAddPet = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        
        // Final guard: only submit if on Step 3
        if (step !== 3) {
            console.warn("Attempted to submit pet on step", step);
            return;
        }

        try {
            setSubmitting(true);
            await petService.create({
                ...formData,
                weight: Number(formData.weight) || 0,
                ownerId: Number(user?.id),
                avatar: formData.avatar || (formData.species === 'Mèo' ? 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=2043&auto=format&fit=crop' : 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=2069&auto=format&fit=crop')
            });
            setShowAddModal(false);
            setStep(1);
            setFormData({
                name: '',
                species: 'Chó',
                breed: '',
                gender: 'Đực',
                color: '',
                sterilized: false,
                weight: '',
                dob: '',
                healthNote: '',
                favoriteFood: '',
                allergies: '',
                hobbies: '',
                walkTime: '',
                avatar: '',
                nutritionPlan: [
                    { mealName: 'Sáng', foodType: '', amount: '' },
                    { mealName: 'Trưa', foodType: '', amount: '' },
                    { mealName: 'Tối', foodType: '', amount: '' }
                ],
                medicalRecords: [],
                vaccinations: [],
                reminders: []
            });
            fetchPets();
        } catch (error: any) {
            console.error('Failed to add pet:', error);
            alert(error.message || 'Có lỗi xảy ra khi thêm thú cưng. Vui lòng thử lại.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeletePet = async () => {
        if (!selectedPetForDelete || !deleteReason) return;
        try {
            setSubmitting(true);
            await petService.delete(selectedPetForDelete.id, deleteReason);
            setShowDeleteModal(false);
            setDeleteReason('');
            setSelectedPetForDelete(null);
            fetchPets();
        } catch (error) {
            console.error('Failed to delete pet:', error);
            alert('Có lỗi xảy ra khi xóa thú cưng.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main className="flex-1 flex flex-col gap-6 p-4 md:p-0">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[#1a2b4c] dark:text-white tracking-tight">Thú cưng của tôi</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Quản lý hồ sơ và sức khỏe cho những người bạn nhỏ của bạn.</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-[#1a2b4c] text-white font-bold rounded-2xl hover:bg-[#243d6b] transition-all shadow-lg hover:shadow-xl active:scale-95 group"
                >
                    <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                    Thêm thú cưng mới
                </button>
            </div>

            {/* Pet Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {loading ? (
                    Array(4).fill(0).map((_, i) => (
                        <div key={i} className="h-48 bg-white dark:bg-slate-900 rounded-3xl animate-pulse border border-slate-100 dark:border-slate-800" />
                    ))
                ) : pets.length === 0 ? (
                    <div className="col-span-full py-24 text-center bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                        <div className="size-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                            <Dog size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Chưa có thú cưng nào</h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-8">
                            Hãy thêm bé cưng của bạn để bắt đầu theo dõi sức khỏe và đặt lịch khám.
                        </p>
                        <button 
                            onClick={() => setShowAddModal(true)}
                            className="text-[#1a2b4c] font-bold hover:underline"
                        >
                            Thêm thú cưng ngay →
                        </button>
                    </div>
                ) : (
                    pets.map(pet => (
                        <motion.div 
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={pet.id} 
                            className="group bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-xl hover:border-[#1a2b4c]/20 transition-all duration-300"
                        >
                            <div className="p-6">
                                <div className="flex gap-5">
                                    <div className="relative shrink-0">
                                        <img
                                            src={pet.avatar || (pet.species === 'Mèo' ? 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=2043&auto=format&fit=crop' : 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=2069&auto=format&fit=crop')}
                                            alt={pet.name}
                                            className="size-24 rounded-2xl object-cover ring-4 ring-slate-50 dark:ring-slate-800 group-hover:ring-[#1a2b4c]/10 transition-all"
                                        />
                                        <div className="absolute -bottom-2 -right-2 size-8 bg-white dark:bg-slate-800 rounded-xl shadow-lg flex items-center justify-center border border-slate-100 dark:border-slate-700">
                                            {pet.species === 'Mèo' ? '🐱' : '🐶'}
                                        </div>
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <h3 className="font-black text-slate-900 dark:text-white text-xl group-hover:text-[#1a2b4c] transition-colors">{pet.name}</h3>
                                                <p className="text-slate-500 text-sm font-medium">{pet.breed || 'Chưa rõ giống'} • {pet.species}</p>
                                            </div>
                                            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${pet.active ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                                                {pet.active ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                                                {pet.active ? 'Khỏe mạnh' : 'Ngưng hoạt động'}
                                            </div>
                                        </div>
                                        
                                        <div className="flex flex-wrap gap-3 mt-4">
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl">
                                                <Weight size={14} className="text-slate-400" />
                                                {pet.weight} kg
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl">
                                                <Calendar size={14} className="text-slate-400" />
                                                {calculateAge(pet.dob)}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {pet.healthNote && (
                                    <div className="mt-4 p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl text-xs text-blue-600 dark:text-blue-400 border border-blue-100/50 dark:border-blue-900/20 flex gap-2">
                                        <Info size={14} className="shrink-0" />
                                        <span className="line-clamp-2">{pet.healthNote}</span>
                                    </div>
                                )}
                            </div>
                            
                            <div className="p-4 bg-slate-50/50 dark:bg-slate-800/30 flex gap-3 border-t border-slate-100 dark:border-slate-800">
                                <Link
                                    to={`/clinic/1`}
                                    className="flex-1 py-3 text-center bg-[#1a2b4c] text-white font-bold rounded-2xl text-xs hover:shadow-lg transition-all active:scale-95"
                                >
                                    Đặt lịch khám
                                </Link>
                                <Link
                                    to={`/pet/${pet.id}`}
                                    className="flex-1 py-3 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-2xl text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95"
                                >
                                    Hồ sơ sức khỏe
                                </Link>
                                <button
                                    onClick={() => {
                                        setSelectedPetForDelete(pet);
                                        setShowDeleteModal(true);
                                    }}
                                    className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all"
                                    title="Xóa thú cưng"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Add Pet Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowAddModal(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden"
                        >
                            <div className="absolute top-6 right-6 z-10">
                                <button 
                                    onClick={() => setShowAddModal(false)}
                                    className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-full transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex flex-col md:flex-row h-full">
                                {/* Modal Sidebar/Illustration */}
                                <div className="hidden md:flex md:w-1/3 bg-slate-50 dark:bg-slate-800/50 p-8 flex-col justify-center border-r border-slate-100 dark:border-slate-800">
                                    <div className="size-16 bg-[#1a2b4c] rounded-[1.5rem] flex items-center justify-center mb-6 shadow-lg">
                                        <Dog size={32} className="text-white" />
                                    </div>
                                    <h2 className="text-2xl font-black text-[#1a2b4c] dark:text-white mb-6 leading-tight">Thêm thành viên mới</h2>
                                    
                                    {/* Vertical Stepper UI */}
                                    <div className="space-y-6 relative">
                                        {/* Vertical Progress Line Background */}
                                        <div className="absolute top-4 left-4 w-0.5 h-[calc(100%-32px)] bg-slate-200 dark:bg-slate-700 z-0" />
                                        
                                        {/* Vertical Progress Line Active */}
                                        <div 
                                            className="absolute top-4 left-4 w-0.5 bg-[#1a2b4c] transition-all duration-500 z-0" 
                                            style={{ height: `${step === 1 ? '0' : step === 2 ? '50%' : '100%'}` }}
                                        />

                                        {[
                                            { s: 1, label: 'Thông tin Pet', desc: 'Tên, loài, giống...', icon: <Dog size={16} /> },
                                            { s: 2, label: 'Dinh dưỡng', desc: 'Chế độ ăn uống', icon: <Activity size={16} /> },
                                            { s: 3, label: 'Hồ sơ y tế', desc: 'Bệnh án & tiêm chủng', icon: <ShieldCheck size={16} /> }
                                        ].map((item) => (
                                            <div key={item.s} className="relative z-10 flex items-start gap-4">
                                                <div className={`size-8 rounded-full flex items-center justify-center transition-all duration-500 shrink-0 ${
                                                    step >= item.s 
                                                        ? 'bg-[#1a2b4c] text-white shadow-lg' 
                                                        : 'bg-white dark:bg-slate-900 text-slate-400 border-2 border-slate-100 dark:border-slate-800'
                                                }`}>
                                                    {step > item.s ? <CheckCircle2 size={16} /> : item.icon}
                                                </div>
                                                <div className="pt-0.5">
                                                    <h3 className={`text-xs font-black uppercase tracking-widest transition-all duration-500 ${
                                                        step >= item.s ? 'text-[#1a2b4c] dark:text-white' : 'text-slate-400'
                                                    }`}>
                                                        {item.label}
                                                    </h3>
                                                    <p className={`text-[10px] font-medium transition-all duration-500 ${
                                                        step >= item.s ? 'text-slate-500 dark:text-slate-400' : 'text-slate-300'
                                                    }`}>
                                                        {item.desc}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex-1 flex flex-col max-h-[90vh]">

                                    <div className="flex-1 p-8 md:p-10 overflow-y-auto">
                                        <div 
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && step < 3) {
                                                    e.preventDefault();
                                                }
                                            }}
                                            className="space-y-6"
                                        >
                                        {step === 1 ? (
                                            <>
                                                {/* Avatar Selection */}
                                                <div className="flex flex-col items-center gap-4 py-2">
                                                    <div 
                                                        className="relative group cursor-pointer"
                                                        onClick={() => fileInputRef.current?.click()}
                                                    >
                                                        <img 
                                                            src={formData.avatar || (formData.species === 'Mèo' ? 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=2043&auto=format&fit=crop' : 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=2069&auto=format&fit=crop')} 
                                                            className={`size-32 rounded-3xl object-cover ring-4 ring-slate-100 dark:ring-slate-800 transition-all shadow-xl group-hover:ring-primary/20 ${isUploading ? 'opacity-50' : ''}`}
                                                            alt="Avatar Preview"
                                                        />
                                                        {isUploading ? (
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <Loader2 className="animate-spin text-primary" size={32} />
                                                            </div>
                                                        ) : (
                                                            <div className="absolute inset-0 bg-black/40 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                <Camera className="text-white" size={24} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <input
                                                        type="file"
                                                        ref={fileInputRef}
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={handleAvatarChange}
                                                    />
                                                    <div className="w-full text-center">
                                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                                            {isUploading ? 'Đang tải ảnh...' : 'Nhấp vào ảnh để chọn avatar'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="col-span-2">
                                                        <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 block">Tên bé cưng *</label>
                                                        <div className="relative">
                                                            <Dog className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                            <input
                                                                required
                                                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-[#1a2b4c] rounded-2xl text-slate-900 dark:text-white outline-none transition-all font-bold"
                                                                placeholder="Vd: Bông, Milu..."
                                                                value={formData.name}
                                                                onChange={e => setFormData({...formData, name: e.target.value})}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 block">Loài</label>
                                                        <select
                                                            className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-[#1a2b4c] rounded-2xl text-slate-900 dark:text-white outline-none transition-all font-bold appearance-none"
                                                            value={formData.species}
                                                            onChange={e => setFormData({...formData, species: e.target.value})}
                                                        >
                                                            <option value="Chó">Chó</option>
                                                            <option value="Mèo">Mèo</option>
                                                            <option value="Thỏ">Thỏ</option>
                                                            <option value="Chim">Chim</option>
                                                            <option value="Khác">Khác</option>
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 block">Giống *</label>
                                                        <input
                                                            className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-[#1a2b4c] rounded-2xl text-slate-900 dark:text-white outline-none transition-all font-bold"
                                                            placeholder="Vd: Poodle, Golden..."
                                                            value={formData.breed}
                                                            onChange={e => setFormData({...formData, breed: e.target.value})}
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 block">Ngày sinh *</label>
                                                        <div className="relative">
                                                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                            <input
                                                                type="date"
                                                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-[#1a2b4c] rounded-2xl text-slate-900 dark:text-white outline-none transition-all font-bold"
                                                                value={formData.dob}
                                                                onChange={e => setFormData({...formData, dob: e.target.value})}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 block">Cân nặng (kg) *</label>
                                                        <div className="relative">
                                                            <Weight className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                            <input
                                                                type="number"
                                                                step="0.1"
                                                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-[#1a2b4c] rounded-2xl text-slate-900 dark:text-white outline-none transition-all font-bold"
                                                                placeholder="0.0"
                                                                value={formData.weight}
                                                                onChange={e => setFormData({...formData, weight: e.target.value})}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 block">Giới tính</label>
                                                        <select
                                                            className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-[#1a2b4c] rounded-2xl text-slate-900 dark:text-white outline-none transition-all font-bold appearance-none"
                                                            value={formData.gender}
                                                            onChange={e => setFormData({...formData, gender: e.target.value})}
                                                        >
                                                            <option value="Đực">Đực</option>
                                                            <option value="Cái">Cái</option>
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 block">Màu sắc *</label>
                                                        <input
                                                            className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-[#1a2b4c] rounded-2xl text-slate-900 dark:text-white outline-none transition-all font-bold"
                                                            placeholder="Vd: Vàng, Trắng..."
                                                            value={formData.color}
                                                            onChange={e => setFormData({...formData, color: e.target.value})}
                                                        />
                                                    </div>

                                                    <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 rounded-2xl px-4 py-3.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => setFormData({...formData, sterilized: !formData.sterilized})}
                                                            className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-colors ${formData.sterilized ? 'bg-[#1a2b4c] border-[#1a2b4c]' : 'border-slate-300'}`}
                                                        >
                                                            {formData.sterilized && <X size={14} className="text-white rotate-45" />}
                                                        </button>
                                                        <span className="text-sm font-bold text-slate-700 dark:text-white text-nowrap">Đã triệt sản</span>
                                                    </div>

                                                    <div className="col-span-2">
                                                        <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 block">Ghi chú sức khỏe</label>
                                                        <div className="relative">
                                                            <ClipboardList className="absolute left-4 top-4 text-slate-400" size={18} />
                                                            <textarea
                                                                rows={2}
                                                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-[#1a2b4c] rounded-2xl text-slate-900 dark:text-white outline-none transition-all font-medium resize-none text-sm"
                                                                placeholder="Bé có tình trạng sức khỏe đặc biệt gì không?"
                                                                value={formData.healthNote}
                                                                onChange={e => setFormData({...formData, healthNote: e.target.value})}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex gap-4 pt-4">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (!formData.name || !formData.breed || !formData.dob || !formData.weight || !formData.color) {
                                                                alert('Vui lòng điền đầy đủ các trường thông tin cơ bản trước khi tiếp tục!');
                                                                 return;
                                                            }
                                                            setStep(2);
                                                        }}
                                                        className="flex-1 py-4 bg-[#1a2b4c] text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                                                    >
                                                        Tiếp theo <ChevronRight size={18} />
                                                    </button>
                                                </div>
                                            </>
                                        ) : step === 2 ? (
                                            <>
                                                <div className="space-y-6">
                                                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                                                        <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Dinh dưỡng & Sở thích</h3>
                                                        <button 
                                                            type="button"
                                                            onClick={() => {
                                                                const meals = [...formData.nutritionPlan];
                                                                meals.push({ mealName: 'Bữa phụ', foodType: '', amount: '' });
                                                                setFormData({...formData, nutritionPlan: meals});
                                                            }}
                                                            className="text-xs font-bold text-secondary flex items-center gap-1 hover:underline"
                                                        >
                                                            <Plus size={14} /> Thêm bữa ăn
                                                        </button>
                                                    </div>

                                                    <div className="space-y-3">
                                                        {formData.nutritionPlan.map((meal, idx) => (
                                                            <div key={idx} className="grid grid-cols-12 gap-3 items-center bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                                                                <div className="col-span-3">
                                                                    <input 
                                                                        className="w-full bg-transparent text-xs font-black text-secondary uppercase outline-none"
                                                                        value={meal.mealName}
                                                                        onChange={e => {
                                                                            const meals = [...formData.nutritionPlan];
                                                                            meals[idx].mealName = e.target.value;
                                                                            setFormData({...formData, nutritionPlan: meals});
                                                                        }}
                                                                    />
                                                                </div>
                                                                <div className="col-span-5">
                                                                    <input 
                                                                        className="w-full bg-transparent text-xs text-slate-700 dark:text-white font-bold outline-none"
                                                                        placeholder="Thức ăn..."
                                                                        value={meal.foodType}
                                                                        onChange={e => {
                                                                            const meals = [...formData.nutritionPlan];
                                                                            meals[idx].foodType = e.target.value;
                                                                            setFormData({...formData, nutritionPlan: meals});
                                                                        }}
                                                                    />
                                                                </div>
                                                                <div className="col-span-3">
                                                                    <input 
                                                                        className="w-full bg-transparent text-xs text-slate-400 outline-none"
                                                                        placeholder="Lượng..."
                                                                        value={meal.amount}
                                                                        onChange={e => {
                                                                            const meals = [...formData.nutritionPlan];
                                                                            meals[idx].amount = e.target.value;
                                                                            setFormData({...formData, nutritionPlan: meals});
                                                                        }}
                                                                    />
                                                                </div>
                                                                <div className="col-span-1 text-right">
                                                                    <button 
                                                                        type="button"
                                                                        onClick={() => {
                                                                            const meals = formData.nutritionPlan.filter((_, i) => i !== idx);
                                                                            setFormData({...formData, nutritionPlan: meals});
                                                                        }}
                                                                        className="text-slate-300 hover:text-red-500 transition-colors"
                                                                    >
                                                                        <X size={14} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="col-span-1">
                                                            <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 block">Thức ăn ưa thích</label>
                                                            <div className="relative">
                                                                <Utensils className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                                                <input
                                                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-[#1a2b4c] rounded-xl text-slate-900 dark:text-white outline-none transition-all font-bold text-sm"
                                                                    placeholder="Pate, hạt..."
                                                                    value={formData.favoriteFood}
                                                                    onChange={e => setFormData({...formData, favoriteFood: e.target.value})}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="col-span-1">
                                                            <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 block">Dị ứng / Tránh</label>
                                                            <div className="relative">
                                                                <AlertCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                                                <input
                                                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-[#1a2b4c] rounded-xl text-slate-900 dark:text-white outline-none transition-all font-bold text-sm"
                                                                    placeholder="Sữa, socola..."
                                                                    value={formData.allergies}
                                                                    onChange={e => setFormData({...formData, allergies: e.target.value})}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="col-span-1">
                                                            <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 block">Sở thích</label>
                                                            <div className="relative">
                                                                <Heart className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                                                <input
                                                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-[#1a2b4c] rounded-xl text-slate-900 dark:text-white outline-none transition-all font-bold text-sm"
                                                                    placeholder="Đồ chơi, gãi bụng..."
                                                                    value={formData.hobbies}
                                                                    onChange={e => setFormData({...formData, hobbies: e.target.value})}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="col-span-1">
                                                            <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 block">Đi dạo (phút)</label>
                                                            <div className="relative">
                                                                <Camera className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                                                <input
                                                                    type="number"
                                                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-[#1a2b4c] rounded-xl text-slate-900 dark:text-white outline-none transition-all font-bold text-sm"
                                                                    placeholder="30"
                                                                    value={formData.walkTime}
                                                                    onChange={e => setFormData({...formData, walkTime: e.target.value})}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex gap-4 pt-6">
                                                    <button
                                                        type="button"
                                                        onClick={() => setStep(1)}
                                                        className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-2xl transition-all active:scale-95"
                                                    >
                                                        Quay lại
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setStep(3)}
                                                        className="flex-[2] py-4 bg-[#1a2b4c] text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                                                    >
                                                        Tiếp theo <ChevronRight size={18} />
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="space-y-6">
                                                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                                                        <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Hồ sơ y tế</h3>
                                                        <button 
                                                            type="button"
                                                            onClick={() => {
                                                                const records = [...formData.medicalRecords];
                                                                records.push({ diagnosis: '', treatment: '', prescription: '', veterinarianNote: '', visitDate: new Date().toISOString() });
                                                                setFormData({...formData, medicalRecords: records});
                                                            }}
                                                            className="text-xs font-bold text-secondary flex items-center gap-1 hover:underline"
                                                        >
                                                            <Plus size={14} /> Thêm bệnh án
                                                        </button>
                                                    </div>

                                                    <div className="space-y-4">
                                                        {formData.medicalRecords.map((record, idx) => (
                                                            <div key={idx} className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3 relative">
                                                                <button 
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const records = formData.medicalRecords.filter((_, i) => i !== idx);
                                                                        setFormData({...formData, medicalRecords: records});
                                                                    }}
                                                                    className="absolute top-2 right-2 text-slate-400 hover:text-red-500"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                                
                                                                <div>
                                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Chẩn đoán</label>
                                                                    <input 
                                                                        className="w-full bg-transparent text-sm font-bold text-slate-800 dark:text-white outline-none border-b border-slate-200 dark:border-slate-700 focus:border-secondary pb-1"
                                                                        placeholder="Vd: Viêm da, Tiêu chảy..."
                                                                        value={record.diagnosis}
                                                                        onChange={e => {
                                                                            const records = [...formData.medicalRecords];
                                                                            records[idx].diagnosis = e.target.value;
                                                                            setFormData({...formData, medicalRecords: records});
                                                                        }}
                                                                    />
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-3">
                                                                    <div>
                                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Điều trị</label>
                                                                        <input 
                                                                            className="w-full bg-transparent text-xs font-bold text-slate-700 dark:text-slate-300 outline-none border-b border-slate-200 dark:border-slate-700 focus:border-secondary pb-1"
                                                                            placeholder="Cách điều trị..."
                                                                            value={record.treatment}
                                                                            onChange={e => {
                                                                                const records = [...formData.medicalRecords];
                                                                                records[idx].treatment = e.target.value;
                                                                                setFormData({...formData, medicalRecords: records});
                                                                            }}
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Đơn thuốc</label>
                                                                        <input 
                                                                            className="w-full bg-transparent text-xs font-bold text-slate-700 dark:text-slate-300 outline-none border-b border-slate-200 dark:border-slate-700 focus:border-secondary pb-1"
                                                                            placeholder="Thuốc sử dụng..."
                                                                            value={record.prescription}
                                                                            onChange={e => {
                                                                                const records = [...formData.medicalRecords];
                                                                                records[idx].prescription = e.target.value;
                                                                                setFormData({...formData, medicalRecords: records});
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        {formData.medicalRecords.length === 0 && (
                                                            <div className="text-center py-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Không có bệnh án</p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Vaccinations */}
                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                                                            <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Tiêm chủng</h3>
                                                            <button 
                                                                type="button"
                                                                onClick={() => {
                                                                    const list = [...formData.vaccinations];
                                                                    list.push({ name: '', drug: '', clinic: '', date: new Date().toISOString(), status: 'done' });
                                                                    setFormData({...formData, vaccinations: list});
                                                                }}
                                                                className="text-xs font-bold text-secondary flex items-center gap-1 hover:underline"
                                                            >
                                                                <Plus size={14} /> Thêm mũi tiêm
                                                            </button>
                                                        </div>
                                                        <div className="space-y-3">
                                                            {formData.vaccinations.map((v, idx) => (
                                                                <div key={idx} className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 relative">
                                                                    <button type="button" onClick={() => setFormData({...formData, vaccinations: formData.vaccinations.filter((_, i) => i !== idx)})} className="absolute top-2 right-2 text-slate-400 hover:text-red-500">
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                    <input className="w-full bg-transparent text-sm font-bold text-slate-800 dark:text-white outline-none border-b border-slate-200 dark:border-slate-700 focus:border-secondary mb-2 pb-1" placeholder="Tên vaccine (Vd: Dại...)" value={v.name} onChange={e => {
                                                                        const list = [...formData.vaccinations];
                                                                        list[idx].name = e.target.value;
                                                                        setFormData({...formData, vaccinations: list});
                                                                    }} />
                                                                    <div className="grid grid-cols-2 gap-2">
                                                                        <input className="bg-transparent text-xs text-slate-500 outline-none border-b border-slate-200 dark:border-slate-700" placeholder="Ngày tiêm..." type="date" value={v.date?.split('T')[0]} onChange={e => {
                                                                            const list = [...formData.vaccinations];
                                                                            list[idx].date = e.target.value;
                                                                            setFormData({...formData, vaccinations: list});
                                                                        }} />
                                                                        <select className="bg-transparent text-xs font-bold text-secondary outline-none border-b border-slate-200 dark:border-slate-700" value={v.status} onChange={e => {
                                                                            const list = [...formData.vaccinations];
                                                                            list[idx].status = e.target.value;
                                                                            setFormData({...formData, vaccinations: list});
                                                                        }}>
                                                                            <option value="done">Đã tiêm</option>
                                                                            <option value="upcoming">Sắp tới</option>
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                            {formData.vaccinations.length === 0 && (
                                                                <div className="text-center py-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Không có lịch sử tiêm</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Reminders */}
                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                                                            <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Lịch nhắc</h3>
                                                            <button 
                                                                type="button"
                                                                onClick={() => {
                                                                    const list = [...formData.reminders];
                                                                    list.push({ title: '', description: '', type: 'medicine', date: new Date().toISOString(), status: 'active' });
                                                                    setFormData({...formData, reminders: list});
                                                                }}
                                                                className="text-xs font-bold text-secondary flex items-center gap-1 hover:underline"
                                                            >
                                                                <Plus size={14} /> Thêm nhắc nhở
                                                            </button>
                                                        </div>
                                                        <div className="space-y-3">
                                                            {formData.reminders.map((r, idx) => (
                                                                <div key={idx} className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 relative">
                                                                    <button type="button" onClick={() => setFormData({...formData, reminders: formData.reminders.filter((_, i) => i !== idx)})} className="absolute top-2 right-2 text-slate-400 hover:text-red-500">
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                    <input className="w-full bg-transparent text-sm font-bold text-slate-800 dark:text-white outline-none border-b border-slate-200 dark:border-slate-700 focus:border-secondary mb-2 pb-1" placeholder="Tiêu đề (Vd: Uống thuốc...)" value={r.title} onChange={e => {
                                                                        const list = [...formData.reminders];
                                                                        list[idx].title = e.target.value;
                                                                        setFormData({...formData, reminders: list});
                                                                    }} />
                                                                    <div className="grid grid-cols-2 gap-2">
                                                                        <input className="bg-transparent text-xs text-slate-500 outline-none border-b border-slate-200 dark:border-slate-700" type="date" value={r.date?.split('T')[0]} onChange={e => {
                                                                            const list = [...formData.reminders];
                                                                            list[idx].date = e.target.value;
                                                                            setFormData({...formData, reminders: list});
                                                                        }} />
                                                                        <select className="bg-transparent text-xs font-bold text-orange-500 outline-none border-b border-slate-200 dark:border-slate-700" value={r.type} onChange={e => {
                                                                            const list = [...formData.reminders];
                                                                            list[idx].type = e.target.value;
                                                                            setFormData({...formData, reminders: list});
                                                                        }}>
                                                                            <option value="medicine">Thuốc</option>
                                                                            <option value="spa">Spa</option>
                                                                            <option value="checkup">Khám</option>
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                            {formData.reminders.length === 0 && (
                                                                <div className="text-center py-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Không có lịch nhắc</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex gap-4 pt-6">
                                                    <button
                                                        type="button"
                                                        onClick={() => setStep(2)}
                                                        className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-2xl transition-all active:scale-95"
                                                    >
                                                        Quay lại
                                                    </button>
                                                    <button
                                                        type="button"
                                                        disabled={submitting}
                                                        onClick={() => handleAddPet()}
                                                        className="flex-[2] py-4 bg-[#1a2b4c] text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                                                    >
                                                        {submitting ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                                                        Hoàn thành
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Delete Pet Modal */}
            <AnimatePresence>
                {showDeleteModal && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowDeleteModal(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl overflow-hidden p-8"
                        >
                            <div className="text-center mb-6">
                                <div className="size-16 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <Trash2 size={32} />
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Xóa thú cưng?</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                                    Bạn đang thực hiện xóa hồ sơ của <span className="font-bold text-slate-900 dark:text-white">{selectedPetForDelete?.name}</span>. Hành động này sẽ thay đổi trạng thái của bé thành ngừng hoạt động.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 block">Lý do xóa hồ sơ *</label>
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
                                        {submitting ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                                        Xác nhận xóa
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </main>
    );
}
