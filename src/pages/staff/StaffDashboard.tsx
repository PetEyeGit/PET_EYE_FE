import React, { useState, useEffect } from 'react';
import {
    ClipboardList, CheckCircle2, Clock, PlayCircle,
    ChevronRight, Loader2, RefreshCw, XCircle, Bell, Camera, MessageCircle
} from 'lucide-react';
import { taskService, type TaskResponse, type TaskStatus } from '../../services/task.service';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
    CONFIRMED:       { label: 'Chờ làm',        color: 'bg-amber-50 text-amber-600 border-amber-200',   dot: 'bg-amber-500' },
    IN_PROGRESS:     { label: 'Đang làm',        color: 'bg-blue-50 text-blue-600 border-blue-200',      dot: 'bg-blue-500'  },
    COMPLETED:       { label: 'Hoàn thành',      color: 'bg-green-50 text-green-600 border-green-200',   dot: 'bg-green-500' },
    CANCELLED:       { label: 'Đã huỷ',          color: 'bg-red-50 text-red-400 border-red-200',         dot: 'bg-red-400'   },
    PENDING_PAYMENT: { label: 'Chờ thanh toán',  color: 'bg-slate-50 text-slate-500 border-slate-200',   dot: 'bg-slate-400' },
} as const;

const NEXT_STATUS: Record<string, TaskStatus | null> = {
    CONFIRMED: 'IN_PROGRESS', IN_PROGRESS: 'COMPLETED', COMPLETED: null, CANCELLED: null, PENDING_PAYMENT: null,
};
const NEXT_LABEL: Record<string, string> = { CONFIRMED: 'Bắt đầu làm', IN_PROGRESS: 'Hoàn thành' };

const fmt = (iso: string) => new Date(iso).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });

export default function StaffDashboard() {
    const { user } = useAuth();
    const [myTasks, setMyTasks]     = useState<TaskResponse[]>([]);
    const [poolTasks, setPoolTasks] = useState<TaskResponse[]>([]);
    const [activeTab, setActiveTab] = useState<'mine' | 'pool'>('mine');
    const [loading, setLoading]     = useState(false);
    const [updating, setUpdating]   = useState<number | null>(null);

    const load = async () => {
        setLoading(true);
        try {
            const [mine, pool] = await Promise.all([
                taskService.getMyTasks(),
                taskService.getUnassignedTasks().catch(() => []),
            ]);
            setMyTasks(mine);
            setPoolTasks(pool);
        } catch { toast.error('Không thể tải danh sách công việc'); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const handleUpdateStatus = async (bookingId: number, nextStatus: TaskStatus) => {
        setUpdating(bookingId);
        try {
            const updated = await taskService.updateStatus(bookingId, nextStatus);
            setMyTasks(prev => prev.map(t => t.bookingId === bookingId ? updated : t));
            toast.success(`Đã cập nhật: ${STATUS_CONFIG[updated.status]?.label}`);
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Cập nhật thất bại');
        } finally { setUpdating(null); }
    };

    const handleClaim = async (bookingId: number) => {
        setUpdating(bookingId);
        try {
            const claimed = await taskService.claimTask(bookingId);
            setPoolTasks(prev => prev.filter(t => t.bookingId !== bookingId));
            setMyTasks(prev => [claimed, ...prev]);
            toast.success('Đã nhận task!');
            setActiveTab('mine');
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Nhận task thất bại');
        } finally { setUpdating(null); }
    };

    const activeTasks = myTasks.filter(t => ['CONFIRMED', 'IN_PROGRESS'].includes(t.status));
    const doneTasks   = myTasks.filter(t => ['COMPLETED', 'CANCELLED'].includes(t.status));

    const TaskCard = ({ task }: { task: TaskResponse }) => {
        const cfg  = STATUS_CONFIG[task.status] ?? STATUS_CONFIG.CONFIRMED;
        const next = NEXT_STATUS[task.status];
        const busy = updating === task.bookingId;
        return (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <p className="font-black text-slate-900 text-lg">{task.petName}</p>
                        <p className="text-sm text-slate-500">KH: {task.customerName}</p>
                    </div>
                    <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase border ${cfg.color}`}>
                        <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${cfg.dot}`} />{cfg.label}
                    </span>
                </div>
                <div className="space-y-2 mb-5">
                    <div className="flex items-center gap-2 text-sm text-slate-600"><ClipboardList size={14} className="text-indigo-400 shrink-0" />{task.serviceName}</div>
                    <div className="flex items-center gap-2 text-sm text-slate-600"><Clock size={14} className="text-indigo-400 shrink-0" />{fmt(task.appointmentDatetime)}</div>
                    {task.note && <div className="mt-3 p-3 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700">📝 {task.note}</div>}
                </div>
                {next && (
                    <button disabled={busy} onClick={() => handleUpdateStatus(task.bookingId, next)}
                        className={`w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all ${next === 'IN_PROGRESS' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-green-600 text-white hover:bg-green-700'} disabled:opacity-60`}>
                        {busy ? <Loader2 size={18} className="animate-spin" /> : next === 'IN_PROGRESS' ? <PlayCircle size={18} /> : <CheckCircle2 size={18} />}
                        {busy ? 'Đang cập nhật...' : NEXT_LABEL[task.status]}
                    </button>
                )}
            </div>
        );
    };

    const PoolCard = ({ task }: { task: TaskResponse }) => (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
                <div><p className="font-black text-slate-900 text-lg">{task.petName}</p><p className="text-sm text-slate-500">KH: {task.customerName}</p></div>
                <span className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase border bg-purple-50 text-purple-600 border-purple-200">Chưa nhận</span>
            </div>
            <div className="space-y-2 mb-5">
                <div className="flex items-center gap-2 text-sm text-slate-600"><ClipboardList size={14} className="text-indigo-400" />{task.serviceName}</div>
                <div className="flex items-center gap-2 text-sm text-slate-600"><Clock size={14} className="text-indigo-400" />{fmt(task.appointmentDatetime)}</div>
            </div>
            <button disabled={updating === task.bookingId} onClick={() => handleClaim(task.bookingId)}
                className="w-full py-3.5 rounded-2xl bg-[#1a2b4c] text-white font-black text-sm flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-60 transition-all">
                {updating === task.bookingId ? <Loader2 size={18} className="animate-spin"/> : <ChevronRight size={18} />}
                {updating === task.bookingId ? 'Đang nhận...' : 'Nhận task này'}
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900">Công việc của tôi</h1>
                        <p className="text-slate-500 mt-1">Chào {user?.name || 'Nhân viên'}! Hãy hoàn thành các ca trực hôm nay nhé.</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-red-500 transition-all relative">
                            <Bell size={20} /><span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                        </button>
                        <button onClick={load} disabled={loading} className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-[#1a2b4c] transition-all disabled:opacity-50">
                            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    {[
                        { label: 'Chờ làm',    count: myTasks.filter(t => t.status === 'CONFIRMED').length,   color: 'text-amber-500', bg: 'bg-amber-50' },
                        { label: 'Đang làm',   count: myTasks.filter(t => t.status === 'IN_PROGRESS').length, color: 'text-blue-500',  bg: 'bg-blue-50' },
                        { label: 'Hoàn thành', count: myTasks.filter(t => t.status === 'COMPLETED').length,   color: 'text-green-500', bg: 'bg-green-50' },
                    ].map(s => (
                        <div key={s.label} className={`${s.bg} rounded-2xl p-5 text-center`}>
                            <p className={`text-3xl font-black ${s.color}`}>{s.count}</p>
                            <p className="text-xs font-bold text-slate-500 mt-1">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-100 mb-6 w-fit">
                    <button onClick={() => setActiveTab('mine')} className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'mine' ? 'bg-[#1a2b4c] text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>
                        Của tôi {activeTasks.length > 0 && <span className="ml-1.5 bg-white/20 px-1.5 py-0.5 rounded-full">{activeTasks.length}</span>}
                    </button>
                    <button onClick={() => setActiveTab('pool')} className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'pool' ? 'bg-[#1a2b4c] text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>
                        Kho chung {poolTasks.length > 0 && <span className="ml-1.5 bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded-full">{poolTasks.length}</span>}
                    </button>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin text-slate-400" /></div>
                ) : activeTab === 'mine' ? (
                    <div className="space-y-8">
                        {activeTasks.length > 0 && (<>
                            <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest">Đang thực hiện ({activeTasks.length})</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{activeTasks.map(t => <TaskCard key={t.bookingId} task={t} />)}</div>
                        </>)}
                        {doneTasks.length > 0 && (<>
                            <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest">Đã xử lý</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-70">{doneTasks.map(t => <TaskCard key={t.bookingId} task={t} />)}</div>
                        </>)}
                        {myTasks.length === 0 && (
                            <div className="text-center py-20 text-slate-400">
                                <XCircle size={40} className="mx-auto mb-3 opacity-30" />
                                <p className="font-medium">Bạn chưa có task nào được gán</p>
                                <p className="text-sm mt-1">Chuyển qua tab "Kho chung" để nhận task</p>
                            </div>
                        )}
                    </div>
                ) : (
                    poolTasks.length === 0 ? (
                        <div className="text-center py-20 text-slate-400">
                            <ClipboardList size={40} className="mx-auto mb-3 opacity-30" />
                            <p className="font-medium">Kho chung đang trống</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{poolTasks.map(t => <PoolCard key={t.bookingId} task={t} />)}</div>
                    )
                )}

                {/* Quick actions floating bar */}
                <div className="fixed bottom-6 right-6 flex flex-col gap-3">
                    <button className="w-14 h-14 bg-[#1a2b4c] rounded-2xl shadow-xl text-white flex items-center justify-center hover:scale-110 transition-transform" title="Báo cáo ảnh">
                        <Camera size={24} />
                    </button>
                    <button className="w-14 h-14 bg-indigo-500 rounded-2xl shadow-xl text-white flex items-center justify-center hover:scale-110 transition-transform" title="Chat chủ shop">
                        <MessageCircle size={24} />
                    </button>
                </div>
            </div>
        </div>
    );
}
