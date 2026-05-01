import React, { useState } from 'react';
import { 
    Search, Filter, Clock, User, Phone, 
    Camera, CheckCircle, Play, MoreVertical, 
    Image as ImageIcon, Video, ChevronRight, AlertCircle
} from 'lucide-react';

type TaskStatus = 'pending' | 'processing' | 'completed';

interface Task {
    id: string;
    petName: string;
    petType: string;
    customerName: string;
    service: string;
    time: string;
    status: TaskStatus;
    notes?: string;
    imageUrl?: string;
}

const MOCK_TASKS: Task[] = [
    {
        id: 'T001',
        petName: 'Cún Lu',
        petType: 'Poodle',
        customerName: 'Nguyễn Văn A',
        service: 'Grooming Premium',
        time: '09:00 SA',
        status: 'processing',
        notes: 'Cẩn thận khi sấy lông tai',
        imageUrl: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=2071&auto=format&fit=crop'
    },
    {
        id: 'T002',
        petName: 'Mèo Mướp',
        petType: 'Mèo ta',
        customerName: 'Trần Thị B',
        service: 'Tiêm phòng định kỳ',
        time: '10:30 SA',
        status: 'pending',
    },
    {
        id: 'T003',
        petName: 'Luna',
        petType: 'Corgi',
        customerName: 'Lê Văn C',
        service: 'Lưu trú (Daycare)',
        time: '11:00 SA',
        status: 'completed',
    }
];

export default function StaffTasks() {
    const [tasks] = useState<Task[]>(MOCK_TASKS);
    const [activeTab, setActiveTab] = useState<TaskStatus | 'all'>('all');

    const statusColors = {
        pending: 'bg-orange-100 text-orange-600',
        processing: 'bg-blue-100 text-blue-600',
        completed: 'bg-green-100 text-green-600'
    };

    const statusLabels = {
        pending: 'Chờ thực hiện',
        processing: 'Đang làm',
        completed: 'Đã xong'
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Danh sách ca trực</h1>
                        <p className="text-slate-500 font-medium">Quản lý và cập nhật tiến độ công việc</p>
                    </div>
                    
                    <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-100">
                        {['all', 'pending', 'processing', 'completed'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                                    activeTab === tab 
                                    ? 'bg-[#1a2b4c] text-white shadow-md' 
                                    : 'text-slate-400 hover:text-slate-600'
                                }`}
                            >
                                {tab === 'all' ? 'Tất cả' : statusLabels[tab as TaskStatus]}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Task List */}
                <div className="space-y-4">
                    {tasks.filter(t => activeTab === 'all' || t.status === activeTab).map((task) => (
                        <div key={task.id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-500 group">
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Pet Avatar */}
                                <div className="w-full md:w-32 h-32 bg-slate-100 rounded-2xl overflow-hidden shrink-0">
                                    {task.imageUrl ? (
                                        <img src={task.imageUrl} alt="pet" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                                            <ImageIcon size={32} />
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 space-y-3">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-xl font-black text-slate-900">{task.petName}</h3>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${statusColors[task.status]}`}>
                                                    {statusLabels[task.status]}
                                                </span>
                                            </div>
                                            <p className="text-sm font-bold text-indigo-500">{task.service}</p>
                                        </div>
                                        <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-colors">
                                            <MoreVertical size={20} />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-8">
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <User size={14} className="text-slate-400" />
                                            <span className="font-bold text-slate-700">{task.customerName}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <Clock size={14} className="text-slate-400" />
                                            <span>Giờ hẹn: <span className="font-bold text-slate-700">{task.time}</span></span>
                                        </div>
                                    </div>

                                    {task.notes && (
                                        <div className="flex items-start gap-2 p-3 bg-orange-50 rounded-xl border border-orange-100">
                                            <AlertCircle size={14} className="text-orange-500 mt-0.5 shrink-0" />
                                            <p className="text-[11px] text-orange-700 leading-relaxed font-medium">
                                                {task.notes}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex flex-row md:flex-col justify-center gap-2 shrink-0 md:border-l md:border-slate-100 md:pl-6">
                                    {task.status === 'pending' && (
                                        <button className="flex-1 md:w-32 py-3 bg-[#1a2b4c] text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-900/10 hover:scale-105 transition-transform flex items-center justify-center gap-2">
                                            <Play size={14} /> Bắt đầu
                                        </button>
                                    )}
                                    {task.status === 'processing' && (
                                        <>
                                            <button className="flex-1 md:w-32 py-3 bg-indigo-500 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-500/10 hover:scale-105 transition-transform flex items-center justify-center gap-2">
                                                <Camera size={14} /> Báo cáo
                                            </button>
                                            <button className="flex-1 md:w-32 py-3 bg-green-500 text-white rounded-xl text-xs font-black shadow-lg shadow-green-500/10 hover:scale-105 transition-transform flex items-center justify-center gap-2">
                                                <CheckCircle size={14} /> Xong
                                            </button>
                                        </>
                                    )}
                                    <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-colors flex items-center justify-center">
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
