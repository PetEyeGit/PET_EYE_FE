import React, { useState, useEffect } from 'react';
import {
    Users, UserPlus, Search, Shield, CheckCircle, XCircle,
    Settings, Save, Info, Briefcase, Loader2, X, Eye, EyeOff,
    Award, FileText, Trash2, ExternalLink
} from 'lucide-react';
import { staffService, type StaffResponse, type StaffCreationRequest, type StaffCertificateRequest } from '../../services/staff.service';
import { shopService } from '../../services/shop.service';
import { userService } from '../../services/user.service';
import toast from 'react-hot-toast';

const SPECIALTIES = ['Grooming', 'Vet / Clinic', 'Boarding', 'General'];
const ROLES = ['Nhân viên grooming', 'Bác sĩ thú y', 'Nhân viên chăm sóc', 'Quản lý ca'];

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
            certificates: [] // We add new ones via separate API or this form
        });
        setShowForm(true);
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
                // Also add new certificates if any
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
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Quản lý nhân sự</h1>
                        <p className="text-slate-500 font-medium">Thiết lập đội ngũ và cơ chế phân công công việc</p>
                    </div>
                    <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-100">
                        {(['list', 'settings'] as const).map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)}
                                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${activeTab === tab ? 'bg-[#1a2b4c] text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>
                                {tab === 'list' ? <><Users size={16} /> Danh sách</> : <><Settings size={16} /> Thiết lập</>}
                            </button>
                        ))}
                    </div>
                </div>

                {activeTab === 'list' ? (
                    <div className="space-y-6">
                        {/* Actions */}
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input type="text" placeholder="Tìm kiếm nhân viên..." value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-[#1a2b4c] outline-none transition-all" />
                            </div>
                            <button onClick={handleOpenCreate}
                                className="px-6 py-3 bg-[#1a2b4c] text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/20 hover:scale-105 transition-transform">
                                <UserPlus size={20} /> Thêm nhân viên
                            </button>
                        </div>

                        {/* Create Modal */}
                        {showForm && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
                                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-8 my-8">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-black text-slate-900">{editingStaff ? 'Cập nhật nhân viên' : 'Tạo tài khoản nhân viên'}</h2>
                                        <button onClick={() => setShowForm(false)} className="p-2 rounded-xl hover:bg-slate-100"><X size={20} /></button>
                                    </div>
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="col-span-2">
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Họ tên *</label>
                                                <input required value={form.fullName} onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))}
                                                    className="w-full mt-1.5 px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1a2b4c] outline-none" placeholder="Nguyễn Văn A" />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email *</label>
                                                <input required type="email" value={form.email} disabled={!!editingStaff} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                                                    className="w-full mt-1.5 px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1a2b4c] outline-none disabled:bg-slate-50 disabled:text-slate-400" placeholder="nv@shop.com" />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Số điện thoại</label>
                                                <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                                                    className="w-full mt-1.5 px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1a2b4c] outline-none" placeholder="09xxxxxxxx" />
                                            </div>
                                            {!editingStaff && (
                                                <div className="relative">
                                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mật khẩu *</label>
                                                    <input required type={showPass ? 'text' : 'password'} value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                                                        className="w-full mt-1.5 px-4 py-3 pr-10 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1a2b4c] outline-none" placeholder="Mật khẩu ban đầu" />
                                                    <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-3 top-9 text-slate-400">{showPass ? <EyeOff size={16}/> : <Eye size={16}/>}</button>
                                                </div>
                                            )}
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Vai trò</label>
                                                <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                                                    className="w-full mt-1.5 px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1a2b4c] outline-none bg-white">
                                                    <option value="">Chọn vai trò</option>
                                                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                                </select>
                                            </div>
                                            <div className="col-span-2">
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Chuyên môn</label>
                                                <select value={form.specialization} onChange={e => setForm(p => ({ ...p, specialization: e.target.value }))}
                                                    className="w-full mt-1.5 px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1a2b4c] outline-none bg-white">
                                                    <option value="">Chọn chuyên môn</option>
                                                    {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                            </div>
                                        </div>

                                        {/* Certificates Section */}
                                        <div className="pt-4 border-t border-slate-100">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                                                    <Award size={18} className="text-indigo-500" /> Chứng chỉ chuyên môn
                                                </h3>
                                                <button type="button" onClick={handleAddCertField}
                                                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">
                                                    + Thêm chứng chỉ
                                                </button>
                                            </div>
                                            
                                            <div className="space-y-3">
                                                {form.certificates?.map((cert, idx) => (
                                                    <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 relative group">
                                                        <button type="button" onClick={() => removeCertField(idx)}
                                                            className="absolute -top-2 -right-2 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <X size={14} />
                                                        </button>
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <input required value={cert.certificateName}
                                                                onChange={e => {
                                                                    const n = [...(form.certificates || [])];
                                                                    n[idx].certificateName = e.target.value;
                                                                    setForm(p => ({ ...p, certificates: n }));
                                                                }}
                                                                className="col-span-2 px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none" placeholder="Tên chứng chỉ (ví dụ: Bằng bác sĩ thú y)" />
                                                            
                                                            <div className="relative h-10">
                                                                <input type="file" className="hidden" id={`cert-file-${idx}`} accept="image/*"
                                                                    onChange={e => e.target.files?.[0] && handleCertFileChange(idx, e.target.files[0])} />
                                                                <label htmlFor={`cert-file-${idx}`} className="flex items-center justify-center gap-2 h-full px-3 text-xs font-bold border border-dashed border-indigo-300 text-indigo-600 rounded-xl cursor-pointer hover:bg-indigo-50 transition-colors">
                                                                    <Save size={14} /> {cert.imageUrl ? 'Đã có ảnh' : 'Tải lên ảnh'}
                                                                </label>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <input type="date" value={cert.issueDate}
                                                                    onChange={e => {
                                                                        const n = [...(form.certificates || [])];
                                                                        n[idx].issueDate = e.target.value;
                                                                        setForm(p => ({ ...p, certificates: n }));
                                                                    }}
                                                                    className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none" title="Ngày cấp" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                                {(!form.certificates || form.certificates.length === 0) && (
                                                    <p className="text-center py-4 text-xs text-slate-400 italic">Chưa có chứng chỉ nào được thêm</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex gap-3 pt-4">
                                            <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50">Hủy</button>
                                            <button type="submit" disabled={submitting}
                                                className="flex-1 py-3 bg-[#1a2b4c] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-60">
                                                {submitting ? <Loader2 size={18} className="animate-spin" /> : (editingStaff ? <Save size={18} /> : <UserPlus size={18} />)}
                                                {submitting ? 'Đang lưu...' : (editingStaff ? 'Cập nhật' : 'Tạo tài khoản')}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* Certificate View Modal */}
                        {viewingCerts && (
                            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
                                <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl p-8">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                                                <Award size={24} />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-black text-slate-900">Chứng chỉ: {viewingCerts.fullName}</h2>
                                                <p className="text-xs text-slate-500">Tổng cộng {viewingCerts.certificates?.length || 0} chứng chỉ</p>
                                            </div>
                                        </div>
                                        <button onClick={() => setViewingCerts(null)} className="p-2 rounded-xl hover:bg-slate-100"><X size={20} /></button>
                                    </div>

                                    <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                                        {viewingCerts.certificates?.map((cert) => (
                                            <div key={cert.id} className="group relative bg-slate-50 rounded-3xl border border-slate-100 overflow-hidden">
                                                <div className="flex flex-col md:flex-row gap-6 p-6">
                                                    {/* Image Preview */}
                                                    <div className="w-full md:w-48 h-32 bg-slate-200 rounded-2xl overflow-hidden relative shrink-0">
                                                        <img src={cert.imageUrl} alt={cert.certificateName} className="w-full h-full object-cover" />
                                                        <a href={cert.imageUrl} target="_blank" rel="noreferrer" 
                                                           className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <ExternalLink className="text-white" size={20} />
                                                        </a>
                                                    </div>

                                                    <div className="flex-1">
                                                        <div className="flex items-start justify-between mb-2">
                                                            <h4 className="font-bold text-slate-900">{cert.certificateName}</h4>
                                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                                cert.status === 'VERIFIED' ? 'bg-green-100 text-green-600' : 
                                                                cert.status === 'REJECTED' ? 'bg-red-100 text-red-600' : 
                                                                'bg-amber-100 text-amber-600'
                                                            }`}>
                                                                {cert.status === 'VERIFIED' ? 'Đã xác thực' : 
                                                                 cert.status === 'REJECTED' ? 'Đã từ chối' : 'Chờ duyệt'}
                                                            </span>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4 text-xs text-slate-500 mb-4">
                                                            <div>
                                                                <p className="font-bold text-slate-400 uppercase tracking-tighter text-[9px] mb-0.5">Ngày cấp</p>
                                                                <p className="font-medium text-slate-700">{cert.issueDate || 'N/A'}</p>
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-slate-400 uppercase tracking-tighter text-[9px] mb-0.5">Hết hạn</p>
                                                                <p className="font-medium text-slate-700">{cert.expiryDate || 'N/A'}</p>
                                                            </div>
                                                        </div>

                                                        {/* Owner Actions */}
                                                        <div className="flex items-center gap-2 mt-auto">
                                                            {cert.status !== 'VERIFIED' && (
                                                                <button onClick={() => handleVerifyCert(cert.id, 'VERIFIED')}
                                                                    className="flex-1 py-2 bg-green-600 text-white text-xs font-bold rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-1.5">
                                                                    <CheckCircle size={14} /> Xác thực
                                                                </button>
                                                            )}
                                                            {cert.status !== 'REJECTED' && (
                                                                <button onClick={() => handleVerifyCert(cert.id, 'REJECTED')}
                                                                    className="flex-1 py-2 bg-red-50 text-red-600 text-xs font-bold rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-1.5">
                                                                    <XCircle size={14} /> Từ chối
                                                                </button>
                                                            )}
                                                            <button onClick={() => handleRemoveCert(cert.id)}
                                                                className="p-2 text-slate-400 hover:text-red-500 transition-colors" title="Xóa">
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {(!viewingCerts.certificates || viewingCerts.certificates.length === 0) && (
                                            <div className="text-center py-20 text-slate-300">
                                                <FileText size={48} className="mx-auto mb-4 opacity-20" />
                                                <p className="font-bold">Chưa có chứng chỉ nào</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Staff Table */}
                        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                            {loading ? (
                                <div className="flex items-center justify-center py-20 gap-3 text-slate-400">
                                    <Loader2 size={24} className="animate-spin" /> Đang tải...
                                </div>
                            ) : filtered.length === 0 ? (
                                <div className="text-center py-20 text-slate-400">
                                    <Users size={40} className="mx-auto mb-3 opacity-30" />
                                    <p className="font-medium">Chưa có nhân viên nào</p>
                                    <p className="text-sm">Nhấn "Thêm nhân viên" để bắt đầu</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse min-w-[900px]">
                                        <thead>
                                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                                {['Nhân viên', 'Năng lực', 'Chứng chỉ', 'Trạng thái', 'Hành động'].map(h => (
                                                    <th key={h} className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filtered.map(s => {
                                                const verifiedCount = s.certificates?.filter(c => c.status === 'VERIFIED').length || 0;
                                                const totalCount = s.certificates?.length || 0;
                                                
                                                return (
                                                    <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50/30 transition-colors">
                                                        <td className="px-8 py-6">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center text-indigo-600 font-black text-lg shadow-sm">
                                                                    {s.fullName.charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-slate-900">{s.fullName}</p>
                                                                    <p className="text-xs text-slate-500">{s.email}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <div className="flex flex-col gap-1">
                                                                <span className="text-sm font-bold text-slate-700">{s.role || '—'}</span>
                                                                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider">{s.specialization || 'General'}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <button onClick={() => setViewingCerts(s)}
                                                                className="flex items-center gap-2 group">
                                                                <div className="flex -space-x-2">
                                                                    {[0, 1, 2].map(i => (
                                                                        <div key={i} className={`w-7 h-7 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center transition-transform group-hover:-translate-y-1 ${i > 0 ? 'hidden sm:flex' : 'flex'}`}>
                                                                            {s.certificates?.[i] ? (
                                                                                <img src={s.certificates[i].imageUrl} className="w-full h-full rounded-full object-cover" alt="" />
                                                                            ) : <Award size={12} className="text-slate-300" />}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                <div className="text-left ml-2">
                                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Bằng cấp</p>
                                                                    <p className="text-xs font-bold text-slate-700">
                                                                        {verifiedCount}/{totalCount} <span className="text-[10px] text-slate-400 font-medium">xác thực</span>
                                                                    </p>
                                                                </div>
                                                            </button>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <div className="flex items-center gap-2">
                                                                <div className={`w-2 h-2 rounded-full ${s.isActive ? 'bg-green-500' : 'bg-slate-300'}`} />
                                                                <span className="text-sm font-medium text-slate-700">
                                                                    {s.isActive ? 'Đang làm việc' : 'Đã nghỉ'}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <div className="flex items-center gap-2">
                                                                <button onClick={() => handleOpenEdit(s)}
                                                                    className="p-2 bg-slate-50 text-slate-500 rounded-xl hover:bg-slate-100 transition-all" title="Chỉnh sửa">
                                                                    <Settings size={14} />
                                                                </button>
                                                                <button onClick={() => handleToggle(s.id, s.fullName)}
                                                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${s.isActive ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                                                                    {s.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
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
                        </div>
                    </div>
                ) : (
                    /* Settings Tab */
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <Briefcase className="text-indigo-500" /> Cơ chế phân công công việc
                                </h3>
                                <div className="grid grid-cols-1 gap-4">
                                    {[
                                        { id: 'MANUAL', title: 'Chủ shop chỉ định (Manual)', desc: 'Mọi đơn do chủ shop trực tiếp gán cho nhân viên.', icon: Shield },
                                        { id: 'OPEN_POOL', title: 'Nhân viên tự nhận (Open Pool)', desc: 'Đơn vào kho chung, nhân viên rảnh tự nhận task.', icon: Users },
                                        { id: 'AUTO', title: 'Tự động gán (Auto-Assign)', desc: 'Hệ thống tự gán dựa trên chuyên môn & khối lượng việc.', icon: CheckCircle },
                                    ].map(mode => (
                                        <button key={mode.id} onClick={() => setAssignMode(mode.id as any)}
                                            className={`flex items-start gap-4 p-6 rounded-[2rem] border-2 transition-all text-left ${assignMode === mode.id ? 'border-[#1a2b4c] bg-indigo-50/30' : 'border-slate-50 hover:border-slate-200 bg-slate-50/50'}`}>
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${assignMode === mode.id ? 'bg-[#1a2b4c] text-white' : 'bg-white text-slate-400'}`}>
                                                <mode.icon size={24} />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-slate-900 mb-1">{mode.title}</h4>
                                                <p className="text-xs text-slate-500 leading-relaxed">{mode.desc}</p>
                                            </div>
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${assignMode === mode.id ? 'border-[#1a2b4c] bg-[#1a2b4c]' : 'border-slate-300'}`}>
                                                {assignMode === mode.id && <div className="w-2 h-2 bg-white rounded-full" />}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                                <div className="mt-8 flex justify-end">
                                    <button onClick={handleSaveMode} disabled={savingMode}
                                        className="px-8 py-4 bg-[#1a2b4c] text-white rounded-2xl font-black text-sm flex items-center gap-2 shadow-xl shadow-indigo-900/20 hover:scale-105 transition-all disabled:opacity-60">
                                        {savingMode ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                        {savingMode ? 'Đang lưu...' : 'Lưu cấu hình'}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className="bg-indigo-900 p-8 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden">
                                <div className="relative z-10">
                                    <Info size={32} className="mb-4 opacity-80" />
                                    <h3 className="text-lg font-black mb-4">Gợi ý từ PetEye</h3>
                                    <p className="text-xs opacity-70 leading-relaxed">
                                        Nếu shop có từ 3 nhân viên trở lên, chế độ <b>"Open Pool"</b> thường mang lại hiệu suất cao nhất và tạo động lực làm việc tốt hơn.
                                    </p>
                                </div>
                                <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-white/5 rounded-full blur-3xl" />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
