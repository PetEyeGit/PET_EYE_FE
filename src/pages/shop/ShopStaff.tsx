import React, { useState } from 'react';
import { 
    Users, UserPlus, Search, Edit2, Trash2, Shield, 
    CheckCircle, XCircle, Mail, Phone, Briefcase, 
    Settings, Info, Save, ChevronRight
} from 'lucide-react';

interface StaffMember {
    id: string;
    name: string;
    email: string;
    phone: string;
    specialty: 'GROOMING' | 'CLINIC' | 'BOARDING' | 'GENERAL';
    status: 'active' | 'inactive';
    joinDate: string;
    taskCount: number;
}

const MOCK_STAFF: StaffMember[] = [
    {
        id: 'ST001',
        name: 'Nguyễn Văn Staff',
        email: 'staff1@peteye.com',
        phone: '0901234567',
        specialty: 'GROOMING',
        status: 'active',
        joinDate: '12/01/2026',
        taskCount: 45
    },
    {
        id: 'ST002',
        name: 'Trần Thị Vet',
        email: 'vet1@peteye.com',
        phone: '0907654321',
        specialty: 'CLINIC',
        status: 'active',
        joinDate: '05/02/2026',
        taskCount: 12
    }
];

export default function ShopStaff() {
    const [staffList] = useState<StaffMember[]>(MOCK_STAFF);
    const [activeTab, setActiveTab] = useState<'list' | 'settings'>('list');
    const [assignMode, setAssignMode] = useState<'MANUAL' | 'SELF_SERVICE' | 'AUTO'>('MANUAL');

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
                        <button
                            onClick={() => setActiveTab('list')}
                            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                                activeTab === 'list' 
                                ? 'bg-[#1a2b4c] text-white shadow-lg' 
                                : 'text-slate-400 hover:text-slate-600'
                            }`}
                        >
                            <Users size={16} /> Danh sách
                        </button>
                        <button
                            onClick={() => setActiveTab('settings')}
                            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                                activeTab === 'settings' 
                                ? 'bg-[#1a2b4c] text-white shadow-lg' 
                                : 'text-slate-400 hover:text-slate-600'
                            }`}
                        >
                            <Settings size={16} /> Thiết lập vận hành
                        </button>
                    </div>
                </div>

                {activeTab === 'list' ? (
                    <div className="space-y-6">
                        {/* Actions Bar */}
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input 
                                    type="text" 
                                    placeholder="Tìm kiếm nhân viên..." 
                                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-[#1a2b4c] outline-none transition-all"
                                />
                            </div>
                            <button className="px-6 py-3 bg-[#1a2b4c] text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/20 hover:scale-105 transition-transform">
                                <UserPlus size={20} /> Thêm nhân viên
                            </button>
                        </div>

                        {/* Staff Table */}
                        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100">
                                        <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Nhân viên</th>
                                        <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Chuyên môn</th>
                                        <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>
                                        <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Hiệu suất</th>
                                        <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {staffList.map((s) => (
                                        <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50/30 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-500 font-bold shadow-sm">
                                                        {s.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900">{s.name}</p>
                                                        <p className="text-xs text-slate-500">{s.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-full uppercase tracking-wider">
                                                    {s.specialty}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${s.status === 'active' ? 'bg-green-500' : 'bg-slate-300'}`} />
                                                    <span className="text-sm font-medium text-slate-700">
                                                        {s.status === 'active' ? 'Đang làm việc' : 'Đã nghỉ'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-sm font-bold text-slate-900">{s.taskCount} ca</p>
                                                <p className="text-[10px] text-slate-400">Từ {s.joinDate}</p>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-[#1a2b4c] hover:text-white transition-all shadow-sm">
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-red-500 hover:text-white transition-all shadow-sm">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Assignment Modes */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <Briefcase className="text-indigo-500" />
                                    Cơ chế phân công công việc
                                </h3>
                                
                                <div className="grid grid-cols-1 gap-4">
                                    {[
                                        { 
                                            id: 'MANUAL', 
                                            title: 'Chủ shop chỉ định (Manual Assign)', 
                                            desc: 'Mọi đơn đặt lịch sẽ do chủ shop hoặc quản lý trực tiếp gán cho nhân viên.',
                                            icon: Shield
                                        },
                                        { 
                                            id: 'SELF_SERVICE', 
                                            title: 'Nhân viên tự nhận (Self-Service)', 
                                            desc: 'Đơn hàng vào kho chung, nhân viên rảnh sẽ tự vào nhận task.',
                                            icon: Users
                                        },
                                        { 
                                            id: 'AUTO', 
                                            title: 'Tự động gán (Auto-Assign)', 
                                            desc: 'Hệ thống tự động gán dựa trên chuyên môn và số lượng việc đang làm.',
                                            icon: CheckCircle
                                        }
                                    ].map((mode) => (
                                        <button 
                                            key={mode.id}
                                            onClick={() => setAssignMode(mode.id as any)}
                                            className={`flex items-start gap-4 p-6 rounded-[2rem] border-2 transition-all text-left ${
                                                assignMode === mode.id 
                                                ? 'border-[#1a2b4c] bg-indigo-50/30' 
                                                : 'border-slate-50 hover:border-slate-200 bg-slate-50/50'
                                            }`}
                                        >
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                                                assignMode === mode.id ? 'bg-[#1a2b4c] text-white' : 'bg-white text-slate-400'
                                            }`}>
                                                <mode.icon size={24} />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-slate-900 mb-1">{mode.title}</h4>
                                                <p className="text-xs text-slate-500 leading-relaxed">{mode.desc}</p>
                                            </div>
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                                assignMode === mode.id ? 'border-[#1a2b4c] bg-[#1a2b4c]' : 'border-slate-300'
                                            }`}>
                                                {assignMode === mode.id && <div className="w-2 h-2 bg-white rounded-full" />}
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                <div className="mt-8 flex justify-end">
                                    <button className="px-8 py-4 bg-[#1a2b4c] text-white rounded-2xl font-black text-sm flex items-center gap-2 shadow-xl shadow-indigo-900/20 hover:scale-105 transition-all">
                                        <Save size={18} /> Lưu cấu hình vận hành
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Info / Tips */}
                        <div className="space-y-6">
                            <div className="bg-indigo-900 p-8 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden">
                                <div className="relative z-10">
                                    <Info size={32} className="mb-4 opacity-80" />
                                    <h3 className="text-lg font-black mb-4">Gợi ý từ PetEye</h3>
                                    <p className="text-xs opacity-70 leading-relaxed mb-6">
                                        Nếu shop của bạn có từ 3 nhân viên trở lên, chế độ <b>"Nhân viên tự nhận"</b> thường mang lại hiệu suất cao nhất và nhân viên có động lực làm việc hơn.
                                    </p>
                                    <div className="p-4 bg-white/10 rounded-2xl border border-white/20">
                                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-2">Trạng thái hiện tại</p>
                                        <div className="flex items-center gap-2 text-sm font-bold">
                                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                                            Đang hoạt động ổn định
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-white/5 rounded-full blur-3xl" />
                            </div>

                            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                                <h3 className="text-lg font-bold text-slate-900 mb-6">Phân quyền mặc định</h3>
                                <div className="space-y-4">
                                    {[
                                        { label: 'Xem đơn đặt lịch', val: true },
                                        { label: 'Cập nhật tiến độ', val: true },
                                        { label: 'Chụp ảnh/Video báo cáo', val: true },
                                        { label: 'Xem doanh thu cửa hàng', val: false },
                                        { label: 'Quản lý dịch vụ', val: false },
                                    ].map((p, i) => (
                                        <div key={i} className="flex items-center justify-between">
                                            <span className="text-xs font-medium text-slate-600">{p.label}</span>
                                            {p.val ? (
                                                <CheckCircle size={16} className="text-green-500" />
                                            ) : (
                                                <XCircle size={16} className="text-red-400" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <button className="w-full mt-8 py-3 text-indigo-600 text-xs font-bold border border-indigo-100 rounded-xl hover:bg-indigo-50 transition-colors">
                                    Chỉnh sửa phân quyền
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
