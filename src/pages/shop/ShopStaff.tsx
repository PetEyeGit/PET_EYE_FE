import React, { useState, useEffect } from 'react';
import {
    Users, UserPlus, Search, Shield, CheckCircle, XCircle,
    Settings, Save, Info, Briefcase, Loader2, X, Eye, EyeOff,
    Award, FileText, Trash2, ExternalLink, Mail, Phone, UserCircle,
    Zap, Star, ShieldCheck, GraduationCap, LayoutDashboard, ChevronDown
} from 'lucide-react';
import { staffService, type StaffResponse, type StaffCreationRequest } from '../../services/staff.service';
import { shopService } from '../../services/shop.service';
import { userService } from '../../services/user.service';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';

const SPECIALTIES = ['Grooming', 'Vet / Clinic', 'Boarding', 'General'];
const ROLES = [
    { label: 'Kỹ thuật viên Grooming', value: 'Groomer', spec: 'Grooming' },
    { label: 'Bác sĩ thú y', value: 'Vet', spec: 'Vet / Clinic' },
    { label: 'Chuyên viên chăm sóc', value: 'Care', spec: 'Boarding' },
    { label: 'Quản lý vận hành', value: 'Manager', spec: 'General' }
];

export default function ShopStaff() {
    const [activeTab, setActiveTab] = useState<'list' | 'settings'>('list');
    const [staffList, setStaffList] = useState<StaffResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingStaff, setEditingStaff] = useState<StaffResponse | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [assignMode, setAssignMode] = useState<'MANUAL' | 'OPEN_POOL' | 'AUTO'>('MANUAL');
    const [savingMode, setSavingMode] = useState(false);
    const [viewingCerts, setViewingCerts] = useState<StaffResponse | null>(null);
    
    const [form, setForm] = useState<StaffCreationRequest>({
        fullName: '', email: '', password: '', phone: '', role: '', specialization: '', certificates: []
    });

    useEffect(() => {
        fetchStaff();
        fetchShopMode();
    }, []);

    const fetchStaff = async () => {
        setLoading(true);
        try {
            const data = await staffService.getMyShopStaff();
            setStaffList(data);
        } catch { 
            toast.error('Không thể tải danh sách nhân viên'); 
        } finally { 
            setLoading(false); 
        }
    };

    const fetchShopMode = async () => {
        try {
            const shop = await shopService.getMyShop();
            if ((shop as any).assignmentMode) setAssignMode((shop as any).assignmentMode);
        } catch { /* silent */ }
    };

    const handleOpenCreate = () => {
        setEditingStaff(null);
        setForm({ fullName: '', email: '', password: '', phone: '', role: '', specialization: '', certificates: [] });
        setShowForm(true);
    };

    const handleOpenEdit = (staff: StaffResponse) => {
        setEditingStaff(staff);
        setForm({
            fullName: staff.fullName,
            email: staff.email || '',
            password: '', 
            phone: staff.phone || '',
            role: staff.role || '',
            specialization: staff.specialization || '',
            certificates: []
        });
        setShowForm(true);
    };

    const toggleRole = (roleValue: string, specSuggest: string) => {
        setForm(p => {
            const currentRoles = p.role ? p.role.split(',').map(r => r.trim()).filter(r => r) : [];
            let newRoles: string[];
            
            if (currentRoles.includes(roleValue)) {
                newRoles = currentRoles.filter(r => r !== roleValue);
            } else {
                newRoles = [...currentRoles, roleValue];
            }

            const newRoleStr = newRoles.join(', ');
            
            // Auto-suggest specialization if current is empty or generic
            let newSpec = p.specialization;
            if (!p.specialization || p.specialization === 'General') {
                newSpec = specSuggest;
            }

            return { ...p, role: newRoleStr, specialization: newSpec };
        });
    };

    const handleAddCertField = () => {
        setForm(p => ({
            ...p,
            certificates: [...(p.certificates || []), { certificateName: '', imageUrl: '', issueDate: '', expiryDate: '' }]
        }));
    };

    const handleCertFileChange = async (index: number, file: File) => {
        try {
            const url = await userService.uploadAvatar(file);
            const newCerts = [...(form.certificates || [])];
            newCerts[index].imageUrl = url;
            setForm(p => ({ ...p, certificates: newCerts }));
            toast.success('Đã tải lên chứng chỉ');
        } catch {
            toast.error('Tải ảnh thất bại');
        }
    };

    const removeCertField = (index: number) => {
        setForm(p => ({
            ...p,
            certificates: p.certificates?.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingStaff) {
                const updated = await staffService.updateStaff(editingStaff.id, form);
                if (form.certificates && form.certificates.length > 0) {
                    for (const cert of form.certificates) {
                        if (cert.imageUrl && cert.certificateName) {
                            await staffService.addCertificate(editingStaff.id, cert);
                        }
                    }
                }
                const final = await staffService.getStaffById(editingStaff.id);
                setStaffList(prev => prev.map(s => s.id === editingStaff.id ? final : s));
                toast.success(`Cập nhật thông tin ${final.fullName} thành công!`);
            } else {
                const created = await staffService.createStaff(form);
                setStaffList(prev => [created, ...prev]);
                toast.success(`Tạo tài khoản cho ${created.fullName} thành công!`);
            }
            setShowForm(false);
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Thao tác thất bại');
        } finally { 
            setSubmitting(false); 
        }
    };

    const handleToggle = async (id: number, name: string) => {
        try {
            const updated = await staffService.toggleStatus(id);
            setStaffList(prev => prev.map(s => s.id === id ? updated : s));
            toast.success(`${name}: ${updated.isActive ? 'Đã kích hoạt' : 'Đã vô hiệu hóa'}`);
        } catch { 
            toast.error('Không thể thay đổi trạng thái'); 
        }
    };

    const handleVerifyCert = async (certId: number, status: 'VERIFIED' | 'REJECTED') => {
        try {
            const updatedStaff = await staffService.verifyCertificate(certId, status);
            setStaffList(prev => prev.map(s => s.id === updatedStaff.id ? updatedStaff : s));
            if (viewingCerts?.id === updatedStaff.id) setViewingCerts(updatedStaff);
            toast.success(status === 'VERIFIED' ? 'Đã xác thực chứng chỉ' : 'Đã từ chối chứng chỉ');
        } catch {
            toast.error('Thao tác thất bại');
        }
    };

    const handleRemoveCert = async (certId: number) => {
        if (!window.confirm('Bạn có chắc muốn xóa chứng chỉ này?')) return;
        try {
            await staffService.removeCertificate(certId);
            if (viewingCerts) {
                const updated = await staffService.getStaffById(viewingCerts.id);
                setStaffList(prev => prev.map(s => s.id === updated.id ? updated : s));
                setViewingCerts(updated);
            }
            toast.success('Đã xóa chứng chỉ');
        } catch {
            toast.error('Xóa thất bại');
        }
    };

    const handleSaveMode = async () => {
        setSavingMode(true);
        try {
            await shopService.updateMyShop({ assignmentMode: assignMode } as any);
            toast.success('Đã lưu cài đặt phân công!');
        } catch { 
            toast.error('Lưu thất bại'); 
        } finally { 
            setSavingMode(false); 
        }
    };

    const filtered = staffList.filter(s =>
        s.fullName.toLowerCase().includes(search.toLowerCase()) ||
        s.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-4 md:p-8">
            <div className="max-w-7xl mx-auto">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-14 h-14 bg-primary text-white rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-primary/20">
                                <Users size={30} />
                            </div>
                            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Nhân sự</h1>
                        </div>
                        <p className="text-slate-500 font-bold uppercase text-[11px] tracking-[0.2em] ml-2">Đội ngũ & Cơ chế hoạt động</p>
                    </motion.div>
                    
                    <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-800">
                        {(['list', 'settings'] as const).map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)}
                                className={`px-8 py-3 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2.5 ${activeTab === tab ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-slate-600'}`}>
                                {tab === 'list' ? <LayoutDashboard size={18} /> : <Settings size={18} />}
                                {tab === 'list' ? 'Danh sách' : 'Thiết lập'}
                            </button>
                        ))}
                    </div>
                </div>

                {activeTab === 'list' ? (
                    <div className="space-y-8">
                        {/* Search & Add */}
                        <div className="flex flex-col md:flex-row gap-5">
                            <div className="flex-1 relative group">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                                <input type="text" placeholder="Tìm kiếm theo tên hoặc email..." value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="w-full pl-16 pr-6 py-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] shadow-sm focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all font-medium" />
                            </div>
                            <button onClick={handleOpenCreate}
                                className="px-10 py-4 bg-primary text-white rounded-[2rem] font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                                <UserPlus size={20} /> Thêm nhân viên
                            </button>
                        </div>

                        <AnimatePresence>
                            {showForm && (
                                <div className="fixed -inset-10 z-[9999] flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-10 overflow-y-auto custom-scrollbar">
                                    <div className="w-full max-w-2xl flex items-center justify-center py-20 min-h-full">
                                        <motion.div 
                                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                            onClick={() => setShowForm(false)}
                                            className="fixed inset-0 bg-transparent" 
                                        />
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                            className="relative w-full bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden border border-white/10 z-10"
                                        >
                                        {/* Compact Premium Modal Header */}
                                        <div className="bg-primary p-6 relative overflow-hidden shrink-0">
                                            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                                            <div className="relative z-10 flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-inner">
                                                        {editingStaff ? <Settings className="text-white" size={24} /> : <UserPlus className="text-white" size={24} />}
                                                    </div>
                                                    <div>
                                                        <h2 className="text-xl font-black text-white">
                                                            {editingStaff ? 'Cập nhật tài khoản' : 'Tạo mới nhân viên'}
                                                        </h2>
                                                        <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mt-0.5">
                                                            {editingStaff ? `ID: STAFF_${editingStaff.id}` : 'Điền thông tin để bắt đầu'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button onClick={() => setShowForm(false)} className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center text-white transition-all">
                                                    <X size={20} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="overflow-y-auto p-6 custom-scrollbar">
                                            <form onSubmit={handleSubmit} className="space-y-6">
                                                {/* Section 1: Thông tin cơ bản */}
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <UserCircle className="text-primary" size={18} />
                                                        <h3 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Thông tin cá nhân</h3>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="space-y-1.5">
                                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Họ và tên *</label>
                                                            <div className="relative">
                                                                <input required value={form.fullName} onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))}
                                                                    className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary outline-none font-bold text-sm text-slate-700 dark:text-white transition-all" placeholder="Nhập họ tên..." />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Email liên hệ *</label>
                                                            <div className="relative">
                                                                <input required type="email" value={form.email} disabled={!!editingStaff} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                                                                    className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary outline-none font-bold text-sm text-slate-700 dark:text-white transition-all disabled:opacity-50" placeholder="email@vi-du.com" />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Số điện thoại</label>
                                                            <div className="relative">
                                                                <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                                                                    className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary outline-none font-bold text-sm text-slate-700 dark:text-white transition-all" placeholder="090 000 0000" />
                                                                <Phone className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                                                            </div>
                                                        </div>
                                                        {!editingStaff && (
                                                            <div className="space-y-1.5">
                                                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Mật khẩu khởi tạo *</label>
                                                                <div className="relative">
                                                                    <input required type={showPass ? 'text' : 'password'} value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                                                                        className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary outline-none font-bold text-sm text-slate-700 dark:text-white transition-all" placeholder="Tối thiểu 6 ký tự..." />
                                                                    <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors">
                                                                        {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Section 2: Phân quyền & Chuyên môn */}
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <ShieldCheck className="text-primary" size={18} />
                                                        <h3 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Năng lực chuyên môn</h3>
                                                    </div>
                                                    <div className="p-5 bg-primary/5 rounded-3xl border border-primary/10 space-y-5">
                                                        <div className="space-y-2">
                                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Vai trò trong hệ thống (Chọn một hoặc nhiều)</label>
                                                            <div className="flex flex-wrap gap-2">
                                                                {ROLES.map(r => {
                                                                    const isSelected = form.role?.split(', ').includes(r.value);
                                                                    return (
                                                                        <button
                                                                            key={r.value}
                                                                            type="button"
                                                                            onClick={() => toggleRole(r.value, r.spec)}
                                                                            className={`px-4 py-2 rounded-xl text-[11px] font-bold transition-all border ${
                                                                                isSelected 
                                                                                    ? 'bg-primary text-white border-primary shadow-md shadow-primary/20' 
                                                                                    : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-100 dark:border-slate-700 hover:border-primary/40'
                                                                            }`}
                                                                        >
                                                                            {r.label}
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Lĩnh vực chuyên môn chính</label>
                                                            <div className="relative">
                                                                <select value={form.specialization} onChange={e => setForm(p => ({ ...p, specialization: e.target.value }))}
                                                                    className="w-full px-5 py-3 bg-white dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary outline-none font-bold text-sm text-slate-700 dark:text-white transition-all appearance-none cursor-pointer">
                                                                    <option value="">Chọn lĩnh vực...</option>
                                                                    {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                                                                </select>
                                                                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={14} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Section 3: Chứng chỉ */}
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <GraduationCap className="text-primary" size={18} />
                                                            <h3 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Chứng chỉ & Bằng cấp</h3>
                                                        </div>
                                                        <button type="button" onClick={handleAddCertField}
                                                            className="px-4 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all">
                                                            + Thêm chứng chỉ
                                                        </button>
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-1 gap-3">
                                                        {form.certificates?.map((cert, idx) => (
                                                            <motion.div 
                                                                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                                                key={idx} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 relative group"
                                                            >
                                                                <button type="button" onClick={() => removeCertField(idx)}
                                                                    className="absolute top-2 right-2 w-8 h-8 bg-white dark:bg-slate-900 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-500 shadow-sm opacity-0 group-hover:opacity-100 transition-all">
                                                                    <Trash2 size={16} />
                                                                </button>
                                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                    <div className="md:col-span-2 space-y-1.5">
                                                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Tên chứng chỉ</label>
                                                                        <input required value={cert.certificateName}
                                                                            onChange={e => {
                                                                                const n = [...(form.certificates || [])];
                                                                                n[idx].certificateName = e.target.value;
                                                                                setForm(p => ({ ...p, certificates: n }));
                                                                            }}
                                                                            className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg outline-none font-bold text-xs" placeholder="Ví dụ: Bằng bác sĩ thú y..." />
                                                                    </div>
                                                                    <div className="space-y-1.5">
                                                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Ảnh</label>
                                                                        <div className="relative h-[34px]">
                                                                            <input type="file" className="hidden" id={`cert-file-${idx}`} accept="image/*"
                                                                                onChange={e => e.target.files?.[0] && handleCertFileChange(idx, e.target.files[0])} />
                                                                            <label htmlFor={`cert-file-${idx}`} className={`flex items-center justify-center gap-2 h-full px-3 text-[9px] font-black uppercase tracking-widest rounded-lg cursor-pointer transition-all ${cert.imageUrl ? 'bg-emerald-500 text-white' : 'bg-white dark:bg-slate-900 border border-dashed border-primary/40 text-primary hover:bg-primary/5'}`}>
                                                                                {cert.imageUrl ? <CheckCircle size={14} /> : <ImageIcon size={14} />} 
                                                                                {cert.imageUrl ? 'Xong' : 'Tải ảnh'}
                                                                            </label>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        ))}
                                                        {(!form.certificates || form.certificates.length === 0) && (
                                                            <div className="text-center py-6 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl">
                                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Chưa có chứng chỉ</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </form>
                                        </div>

                                        {/* Compact Footer */}
                                        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex gap-3 shrink-0">
                                            <button type="button" onClick={() => setShowForm(false)} 
                                                className="flex-1 py-4 bg-white dark:bg-slate-900 text-slate-500 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-sm hover:bg-slate-100 transition-all border border-slate-100 dark:border-slate-800">
                                                Hủy bỏ
                                            </button>
                                            <button type="button" onClick={handleSubmit} disabled={submitting}
                                                className="flex-[2] py-4 bg-primary text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 disabled:opacity-60 transition-all">
                                                {submitting ? <Loader2 size={18} className="animate-spin" /> : (editingStaff ? <Save size={18} /> : <Zap size={18} />)}
                                                {submitting ? 'Đang lưu...' : (editingStaff ? 'Cập nhật ngay' : 'Kích hoạt')}
                                            </button>
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        )}
                    </AnimatePresence>

                        {/* Certificate View Modal (Redesigned) */}
                        <AnimatePresence>
                            {viewingCerts && (
                                <div className="fixed inset-0 z-[110] flex justify-center p-4 overflow-y-auto pt-10 md:pt-20">
                                    <motion.div 
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                        onClick={() => setViewingCerts(null)}
                                        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" 
                                    />
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-[4rem] shadow-2xl overflow-hidden"
                                    >
                                        <div className="p-10 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                                            <div className="flex items-center gap-5">
                                                <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600">
                                                    <Award size={28} />
                                                </div>
                                                <div>
                                                    <h2 className="text-xl font-black text-slate-900 dark:text-white">Bằng cấp: {viewingCerts.fullName}</h2>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Xác thực chứng chỉ chuyên môn</p>
                                                </div>
                                            </div>
                                            <button onClick={() => setViewingCerts(null)} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                                <X size={20} />
                                            </button>
                                        </div>

                                        <div className="p-10 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                                            {viewingCerts.certificates?.map((cert) => (
                                                <div key={cert.id} className="group relative bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 overflow-hidden">
                                                    <div className="flex flex-col md:flex-row gap-8 p-8">
                                                        <div className="w-full md:w-56 h-40 bg-slate-200 dark:bg-slate-900 rounded-3xl overflow-hidden relative shrink-0 shadow-inner">
                                                            <img src={cert.imageUrl} alt={cert.certificateName} className="w-full h-full object-cover" />
                                                            <a href={cert.imageUrl} target="_blank" rel="noreferrer" 
                                                               className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-[2px]">
                                                                <ExternalLink className="text-white" size={24} />
                                                            </a>
                                                        </div>

                                                        <div className="flex-1 flex flex-col justify-between">
                                                            <div className="space-y-4">
                                                                <div className="flex items-start justify-between">
                                                                    <h4 className="text-lg font-black text-slate-900 dark:text-white leading-tight">{cert.certificateName}</h4>
                                                                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.15em] shadow-sm ${
                                                                        cert.status === 'VERIFIED' ? 'bg-emerald-500 text-white' : 
                                                                        cert.status === 'REJECTED' ? 'bg-rose-500 text-white' : 
                                                                        'bg-amber-400 text-white'
                                                                    }`}>
                                                                        {cert.status === 'VERIFIED' ? 'Đã xác thực' : 
                                                                         cert.status === 'REJECTED' ? 'Từ chối' : 'Chờ duyệt'}
                                                                    </span>
                                                                </div>
                                                                <div className="flex gap-6">
                                                                    <div>
                                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Ngày cấp</p>
                                                                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{cert.issueDate || '—'}</p>
                                                                    </div>
                                                                    <div className="w-px h-8 bg-slate-100 dark:bg-slate-800" />
                                                                    <div>
                                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Hết hạn</p>
                                                                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{cert.expiryDate || '—'}</p>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-3 mt-6">
                                                                {cert.status !== 'VERIFIED' && (
                                                                    <button onClick={() => handleVerifyCert(cert.id, 'VERIFIED')}
                                                                        className="flex-1 py-3 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20">
                                                                        <CheckCircle size={16} /> Xác thực
                                                                    </button>
                                                                )}
                                                                {cert.status !== 'REJECTED' && (
                                                                    <button onClick={() => handleVerifyCert(cert.id, 'REJECTED')}
                                                                        className="flex-1 py-3 bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-rose-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20">
                                                                        <XCircle size={16} /> Từ chối
                                                                    </button>
                                                                )}
                                                                <button onClick={() => handleRemoveCert(cert.id)}
                                                                    className="w-12 h-12 bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-rose-500 rounded-xl transition-all flex items-center justify-center">
                                                                    <Trash2 size={20} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            {(!viewingCerts.certificates || viewingCerts.certificates.length === 0) && (
                                                <div className="text-center py-24 bg-slate-50 dark:bg-slate-800/50 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
                                                    <FileText size={48} className="mx-auto mb-4 text-slate-200" />
                                                    <p className="text-sm font-black text-slate-300 uppercase tracking-widest">Không có dữ liệu chứng chỉ</p>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                </div>
                            )}
                        </AnimatePresence>

                        {/* Staff Table Section */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden"
                        >
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-32 gap-4 text-slate-400">
                                    <Loader2 size={40} className="animate-spin text-primary" />
                                    <p className="text-xs font-black uppercase tracking-widest">Đang đồng bộ dữ liệu...</p>
                                </div>
                            ) : filtered.length === 0 ? (
                                <div className="text-center py-32">
                                    <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Users size={48} className="text-slate-200" />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Chưa có nhân sự nào</h3>
                                    <p className="text-slate-400 text-sm mb-8">Hãy bắt đầu xây dựng đội ngũ chuyên nghiệp của bạn.</p>
                                    <button onClick={handleOpenCreate} className="px-8 py-3 bg-primary text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20">Thêm ngay</button>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse min-w-[1000px]">
                                        <thead>
                                            <tr className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
                                                {['Nhân sự', 'Vị trí & Năng lực', 'Chứng chỉ', 'Hoạt động', 'Tùy chọn'].map(h => (
                                                    <th key={h} className="px-10 py-7 text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                            {filtered.map(s => {
                                                const verifiedCount = s.certificates?.filter(c => c.status === 'VERIFIED').length || 0;
                                                const totalCount = s.certificates?.length || 0;
                                                
                                                return (
                                                    <tr key={s.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                                        <td className="px-10 py-8">
                                                            <div className="flex items-center gap-5">
                                                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-primary font-black text-xl shadow-inner border border-primary/10">
                                                                    {s.fullName.charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <p className="font-black text-slate-900 dark:text-white text-base whitespace-nowrap">{s.fullName}</p>
                                                                    <p className="text-xs text-slate-500 font-medium whitespace-nowrap">{s.email}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-10 py-8">
                                                            <div className="space-y-1.5">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                                                    <span className="text-sm font-black text-slate-700 dark:text-slate-200 whitespace-nowrap">
                                                                        {s.role ? s.role.split(', ').map(rv => ROLES.find(r => r.value === rv)?.label || rv).join(', ') : 'Chưa thiết lập'}
                                                                    </span>
                                                                </div>
                                                                <span className="inline-block px-3 py-1 bg-primary/5 text-primary text-[9px] font-black uppercase tracking-wider rounded-lg border border-primary/5 whitespace-nowrap">
                                                                    {s.specialization || 'Đa năng'}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-10 py-8">
                                                            <button onClick={() => setViewingCerts(s)}
                                                                className="flex items-center gap-3 group/certs">
                                                                <div className="flex -space-x-3">
                                                                    {[0, 1, 2].map(i => (
                                                                        <div key={i} className={`w-9 h-9 rounded-xl border-2 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center transition-all group-hover/certs:-translate-y-1 shadow-sm ${i > 0 ? 'hidden md:flex' : 'flex'}`}>
                                                                            {s.certificates?.[i] ? (
                                                                                <img src={s.certificates[i].imageUrl} className="w-full h-full rounded-xl object-cover" alt="" />
                                                                            ) : <Award size={14} className="text-slate-300" />}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                <div className="text-left">
                                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hồ sơ</p>
                                                                    <div className="flex items-center gap-1.5">
                                                                        <span className="text-sm font-black text-slate-700 dark:text-slate-200">{verifiedCount}/{totalCount}</span>
                                                                        <CheckCircle size={12} className={verifiedCount > 0 ? 'text-emerald-500' : 'text-slate-300'} />
                                                                    </div>
                                                                </div>
                                                            </button>
                                                        </td>
                                                        <td className="px-10 py-8">
                                                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${s.isActive ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-600' : 'bg-slate-100 border-slate-200 text-slate-400'}`}>
                                                                <div className={`w-1.5 h-1.5 rounded-full ${s.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                                                                <span className="text-[10px] font-black uppercase tracking-widest">
                                                                    {s.isActive ? 'Hoạt động' : 'Đã nghỉ'}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-10 py-8">
                                                            <div className="flex items-center gap-3">
                                                                <button onClick={() => handleOpenEdit(s)}
                                                                    className="w-10 h-10 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-primary rounded-xl transition-all flex items-center justify-center shadow-sm" title="Cài đặt">
                                                                    <Settings size={18} />
                                                                </button>
                                                                <button onClick={() => handleToggle(s.id, s.fullName)}
                                                                    className={`h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${s.isActive ? 'bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white'}`}>
                                                                    {s.isActive ? 'Tạm dừng' : 'Kích hoạt'}
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </motion.div>
                    </div>
                ) : (
                    /* Settings Tab (Redesigned) */
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 space-y-8">
                            <div className="bg-white dark:bg-slate-900 p-12 rounded-[4rem] shadow-xl border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-5 mb-10">
                                    <div className="w-16 h-16 bg-primary/10 text-primary rounded-3xl flex items-center justify-center">
                                        <Zap size={32} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Cơ chế vận hành</h3>
                                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Lựa chọn cách thức phân bổ công việc</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-5">
                                    {[
                                        { id: 'MANUAL', title: 'Chỉ định thủ công', desc: 'Chủ shop trực tiếp gán đơn cho nhân viên phù hợp.', icon: Shield, color: 'indigo' },
                                        { id: 'OPEN_POOL', title: 'Nhân viên tự nhận', desc: 'Đơn vào kho chung, nhân viên rảnh sẽ tự nhận nhiệm vụ.', icon: Users, color: 'primary' },
                                        { id: 'AUTO', title: 'Tự động gán (AI)', desc: 'Hệ thống tự phân bổ dựa trên chuyên môn & hiệu suất.', icon: Star, color: 'amber' },
                                    ].map(mode => (
                                        <button key={mode.id} onClick={() => setAssignMode(mode.id as any)}
                                            className={`group flex items-start gap-6 p-8 rounded-[3rem] border-2 transition-all text-left relative overflow-hidden ${assignMode === mode.id ? 'border-primary bg-primary/[0.02]' : 'border-slate-50 dark:border-slate-800 hover:border-primary/20 bg-slate-50/50 dark:bg-slate-800/50'}`}>
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-all ${assignMode === mode.id ? 'bg-primary text-white scale-110' : 'bg-white dark:bg-slate-900 text-slate-400 group-hover:text-primary'}`}>
                                                <mode.icon size={28} />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className={`text-lg font-black mb-1 transition-colors ${assignMode === mode.id ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>{mode.title}</h4>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{mode.desc}</p>
                                            </div>
                                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${assignMode === mode.id ? 'border-primary bg-primary scale-110' : 'border-slate-300'}`}>
                                                {assignMode === mode.id && <div className="w-2.5 h-2.5 bg-white rounded-full shadow-inner" />}
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                <div className="mt-12 flex justify-end">
                                    <button onClick={handleSaveMode} disabled={savingMode}
                                        className="px-12 py-5 bg-primary text-white rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-primary/30 flex items-center gap-3 hover:scale-105 active:scale-95 disabled:opacity-60 transition-all">
                                        {savingMode ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                                        {savingMode ? 'Đang cập nhật...' : 'Lưu cấu hình vận hành'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                            <div className="bg-gradient-to-br from-slate-900 to-primary p-12 rounded-[4rem] shadow-2xl text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                                <div className="relative z-10">
                                    <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center mb-8 border border-white/10 shadow-inner">
                                        <Info size={32} className="text-white/80" />
                                    </div>
                                    <h3 className="text-2xl font-black mb-6 tracking-tight">Gợi ý quản trị</h3>
                                    <p className="text-sm text-white/70 leading-relaxed font-medium mb-8">
                                        Để tối ưu hóa trải nghiệm khách hàng, chúng tôi khuyên bạn nên sử dụng chế độ <b>"AI Tự động gán"</b>. 
                                        Hệ thống sẽ đảm bảo thú cưng luôn được chăm sóc bởi nhân viên có chuyên môn phù hợp nhất vào thời điểm đó.
                                    </p>
                                    <div className="p-6 bg-white/10 rounded-3xl border border-white/10">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-2">Trạng thái hệ thống</p>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                            <span className="text-xs font-black uppercase">Đang tối ưu hóa (Stable)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
}
