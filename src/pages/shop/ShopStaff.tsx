import React, { useState, useEffect } from 'react';
import {
    Users, UserPlus, Search, Shield, CheckCircle, XCircle,
    Settings, Save, Info, Briefcase, Loader2, X, Eye, EyeOff
} from 'lucide-react';
import { staffService, type StaffResponse, type StaffCreationRequest } from '../../services/staff.service';
import { shopService } from '../../services/shop.service';
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
    const [form, setForm] = useState<StaffCreationRequest>({
        fullName: '', email: '', password: '', phone: '', role: '', specialization: ''
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
        setForm({ fullName: '', email: '', password: '', phone: '', role: '', specialization: '' });
        setShowForm(true);
    };

    const handleOpenEdit = (staff: StaffResponse) => {
        setEditingStaff(staff);
        setForm({
            fullName: staff.fullName,
            email: staff.email || '',
            password: '', // Password not required for edit
            phone: staff.phone || '',
            role: staff.role || '',
            specialization: staff.specialization || ''
        });
        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingStaff) {
                const updated = await staffService.updateStaff(editingStaff.id, form);
                setStaffList(prev => prev.map(s => s.id === editingStaff.id ? updated : s));
                toast.success(`Cập nhật thông tin ${updated.fullName} thành công!`);
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
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-black text-slate-900">{editingStaff ? 'Cập nhật nhân viên' : 'Tạo tài khoản nhân viên'}</h2>
                                        <button onClick={() => setShowForm(false)} className="p-2 rounded-xl hover:bg-slate-100"><X size={20} /></button>
                                    </div>
                                    <form onSubmit={handleSubmit} className="space-y-4">
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
                                        <div className="flex gap-3 pt-2">
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
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/50 border-b border-slate-100">
                                            {['Nhân viên', 'Chuyên môn', 'Vai trò', 'Trạng thái', 'Hành động'].map(h => (
                                                <th key={h} className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtered.map(s => (
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
                                                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-full uppercase tracking-wider">
                                                        {s.specialization || '—'}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="text-sm text-slate-600">{s.role || '—'}</span>
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
                                                            {s.isActive ? <><XCircle size={14} className="inline mr-1"/>Vô hiệu hóa</> : <><CheckCircle size={14} className="inline mr-1"/>Kích hoạt</>}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
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
