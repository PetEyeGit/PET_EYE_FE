import React, { useState, useEffect } from 'react';
import { 
    Calendar as CalendarIcon, Clock, User, CheckCircle, XCircle, 
    AlertCircle, Search, Filter, Loader2, ChevronDown, UserCheck,
    LayoutGrid, List as ListIcon, ChevronLeft, ChevronRight, Plus,
    Timer, MessageCircle, MoreVertical, CheckCircle2, Video,
    MapPin, Phone, Mail, Scissors, Info, X, Play
} from 'lucide-react';
import { taskService, type TaskResponse } from '../../services/task.service';
import { staffService, type StaffResponse } from '../../services/staff.service';
import { bookingService } from '../../services/booking.service';
import { BookingResponse } from '../../types/api';
import toast from 'react-hot-toast';
import { 
    format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
    eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths,
    isToday, parseISO 
} from 'date-fns';
import { vi } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';
import { useQuery } from '@tanstack/react-query';

const STATUS_CONFIG: Record<string, any> = {
  PENDING_PAYMENT: { label: 'Chờ thanh toán', icon: AlertCircle, className: 'bg-slate-100 text-slate-500', color: 'bg-amber-500' },
  CONFIRMED: { label: 'Chờ xử lý', icon: Clock, className: 'bg-orange-100 text-orange-700', color: 'bg-blue-500' },
  IN_PROGRESS: { label: 'Đang làm', icon: Loader2, className: 'bg-blue-100 text-blue-700', color: 'bg-indigo-500' },
  COMPLETED: { label: 'Hoàn thành', icon: CheckCircle, className: 'bg-green-100 text-green-700', color: 'bg-emerald-500' },
  CANCELLED: { label: 'Đã hủy', icon: XCircle, className: 'bg-red-100 text-red-700', color: 'bg-red-500' },
};

export default function ShopBookings() {
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
    const [staffList, setStaffList] = useState<StaffResponse[]>([]);
    const [filter, setFilter] = useState<string>('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
    
    // Calendar States
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState<Date | null>(new Date());

    // Data Fetching for List
    const { data: listBookings = [], isLoading: listLoading, refetch: refetchList } = useQuery({
        queryKey: ['allShopTasks'],
        queryFn: () => taskService.getAllShopTasks(),
    });

    // Data Fetching for Calendar (Range based)
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const { data: calendarBookings = [], isLoading: calendarLoading, refetch: refetchCalendar } = useQuery({
        queryKey: ['shopBookingsRange', format(currentDate, 'yyyy-MM')],
        queryFn: () => bookingService.getShopBookings(calendarStart.toISOString(), calendarEnd.toISOString()),
        enabled: viewMode === 'calendar'
    });

    useEffect(() => {
        staffService.getMyShopStaff().then(data => setStaffList(data.filter(s => s.isActive)));
    }, []);

    const handleUpdateStatus = async (bookingId: number, status: string) => {
        setUpdatingId(bookingId);
        try {
            if (status === 'CANCELLED') {
                await bookingService.cancel(bookingId);
                toast.success('Đã hủy đơn hàng');
            } else if (status === 'IN_PROGRESS' || status === 'COMPLETED') {
                await taskService.updateStatus(bookingId, status as any);
                toast.success(status === 'IN_PROGRESS' ? 'Đã bắt đầu công việc' : 'Đã hoàn thành công việc');
            }
            refetchList();
            refetchCalendar();
            if (selectedBooking?.bookingId === bookingId || selectedBooking?.id === bookingId) {
                setSelectedBooking(null);
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Thao tác thất bại');
        } finally {
            setUpdatingId(null);
        }
    };

    const handleAssignStaff = async (bookingId: number, staffId: number | 'unassign') => {
        setUpdatingId(bookingId);
        try {
            if (staffId === 'unassign') {
                await taskService.unassignTask(bookingId);
                toast.success('Đã gỡ nhân viên');
            } else {
                await taskService.assignTask(bookingId, staffId);
                toast.success('Đã giao việc thành công');
            }
            refetchList();
            refetchCalendar();
        } catch {
            toast.error('Giao việc thất bại');
        } finally {
            setUpdatingId(null);
        }
    };

    const filteredList = listBookings.filter((b) => {
        const matchesFilter = filter === 'ALL' || b.status === filter;
        const matchesSearch =
            b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.bookingId.toString().includes(searchTerm);
        return matchesFilter && matchesSearch;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Calendar Helpers
    const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    const getBookingsForDay = (day: Date) => {
        return calendarBookings.filter(b => isSameDay(parseISO(b.appointmentDatetime), day));
    };

    return (
        <div className="h-screen flex flex-col bg-[#f8fafc] dark:bg-[#0f172a] overflow-hidden">
            <div className="flex-1 flex flex-col max-w-[1600px] mx-auto w-full px-4 md:px-8 py-6 overflow-hidden">
                {/* Header with View Toggle */}
                <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 shrink-0">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Quản lý đặt lịch</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium text-xs mt-0.5">Điều phối và theo dõi tiến độ dịch vụ cửa hàng</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center bg-white dark:bg-slate-800 p-1 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                            <button 
                                onClick={() => setViewMode('list')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black transition-all ${viewMode === 'list' ? 'bg-[#1a2b4c] text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <ListIcon size={14} />
                                Danh sách
                            </button>
                            <button 
                                onClick={() => setViewMode('calendar')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black transition-all ${viewMode === 'calendar' ? 'bg-[#1a2b4c] text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <LayoutGrid size={14} />
                                Lịch hẹn
                            </button>
                        </div>
                        <button className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-[#1a2b4c] text-white rounded-xl font-bold shadow-lg shadow-indigo-900/20 hover:scale-[1.02] active:scale-95 transition-all text-xs">
                            <Plus size={16} />
                            Tạo đơn mới
                        </button>
                    </div>
                </header>

                <AnimatePresence mode="wait">
                    {viewMode === 'list' ? (
                        <motion.div 
                            key="list"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex-1 flex flex-col gap-6 overflow-hidden"
                        >
                            {/* List Filters */}
                            <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 shrink-0">
                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="flex-1 relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Tìm khách hàng, thú cưng, mã đơn..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border-none rounded-xl text-sm focus:ring-2 focus:ring-[#1a2b4c]/10 outline-none transition-all dark:text-white"
                                        />
                                    </div>
                                    <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
                                        {[{ v: 'ALL', l: 'Tất cả' }, { v: 'CONFIRMED', l: 'Chờ xử lý' }, { v: 'IN_PROGRESS', l: 'Đang làm' }, { v: 'COMPLETED', l: 'Xong' }].map(t => (
                                            <button
                                                key={t.v}
                                                onClick={() => setFilter(t.v)}
                                                className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider whitespace-nowrap transition-all border ${
                                                    filter === t.v ? 'bg-[#1a2b4c] text-white border-[#1a2b4c]' : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-slate-700'
                                                }`}
                                            >
                                                {t.l}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* List View - Scrollable */}
                            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                                {listLoading ? (
                                    <div className="text-center py-20 flex flex-col items-center gap-4">
                                        <Loader2 size={40} className="animate-spin text-[#1a2b4c]" />
                                        <p className="text-slate-400 font-bold">Đang đồng bộ dữ liệu...</p>
                                    </div>
                                ) : filteredList.map((booking) => {
                                    const cfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG.CONFIRMED;
                                    const StatusIcon = cfg.icon;

                                    return (
                                        <div 
                                            key={booking.bookingId} 
                                            className="bg-white dark:bg-slate-800 rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all border border-slate-100 dark:border-slate-700 group relative"
                                        >
                                            <div className="flex flex-col lg:flex-row gap-6">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-4 mb-5">
                                                        <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-[#1a2b4c] dark:text-indigo-400 font-black text-lg">
                                                            #{booking.bookingId.toString().slice(-3)}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-0.5">
                                                                <h3 className="text-lg font-black text-slate-900 dark:text-white">Đơn hàng #{booking.bookingId}</h3>
                                                                <span className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-wider ${cfg.className}`}>
                                                                    <StatusIcon size={10} className={booking.status === 'IN_PROGRESS' ? 'animate-spin' : ''} />
                                                                    {cfg.label}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-slate-500 font-bold flex items-center gap-2">
                                                                {booking.serviceName}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <div className="space-y-3">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400"><User size={14} /></div>
                                                                <div>
                                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Khách hàng</p>
                                                                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{booking.customerName}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400"><Clock size={14} /></div>
                                                                <div>
                                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Thời gian</p>
                                                                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                                        {format(parseISO(booking.appointmentDatetime), "eee, dd/MM - HH:mm", { locale: vi })}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-3">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400">🐾</div>
                                                                <div>
                                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Thú cưng</p>
                                                                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{booking.petName}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400"><UserCheck size={14} /></div>
                                                                <div className="flex-1">
                                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Phụ trách</p>
                                                                    <div className="relative group/select">
                                                                        <select 
                                                                            disabled={updatingId === booking.bookingId || booking.status === 'COMPLETED' || booking.status === 'CANCELLED'}
                                                                            value={booking.staffId || ''} 
                                                                            onChange={(e) => handleAssignStaff(booking.bookingId, e.target.value === '' ? 'unassign' : Number(e.target.value))}
                                                                            className="w-full pl-3 pr-8 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 rounded-xl text-[11px] font-bold text-[#1a2b4c] dark:text-indigo-400 focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all cursor-pointer appearance-none disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-900"
                                                                        >
                                                                            <option value="">Chưa giao việc</option>
                                                                            {staffList.map(s => <option key={s.id} value={s.id}>{s.fullName}</option>)}
                                                                        </select>
                                                                        <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-400 pointer-events-none group-hover/select:translate-y-[-40%] transition-transform" />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="lg:w-48 flex flex-col justify-center gap-2">
                                                    <button
                                                        onClick={() => setSelectedBooking(booking)}
                                                        className="w-full py-3 bg-[#1a2b4c] text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/10"
                                                    >
                                                        <Info size={12} />
                                                        Xem chi tiết
                                                    </button>

                                                    {booking.status === 'CONFIRMED' && (
                                                        <div className="flex flex-col gap-2">
                                                            <button
                                                                disabled={updatingId === booking.bookingId}
                                                                onClick={() => handleUpdateStatus(booking.bookingId, 'IN_PROGRESS')}
                                                                className="w-full py-3 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                                                            >
                                                                {updatingId === booking.bookingId ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
                                                                Bắt đầu
                                                            </button>
                                                            <button
                                                                disabled={updatingId === booking.bookingId}
                                                                onClick={() => handleUpdateStatus(booking.bookingId, 'CANCELLED')}
                                                                className="w-full py-3 border border-red-100 text-red-500 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                                                            >
                                                                <XCircle size={12} />
                                                                Hủy đơn
                                                            </button>
                                                        </div>
                                                    )}
                                                    {booking.status === 'IN_PROGRESS' && (
                                                        <button
                                                            disabled={updatingId === booking.bookingId}
                                                            onClick={() => handleUpdateStatus(booking.bookingId, 'COMPLETED')}
                                                            className="w-full py-3 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                                                        >
                                                            {updatingId === booking.bookingId ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                                                            Hoàn thành
                                                        </button>
                                                    )}
                                                    {booking.status === 'COMPLETED' && (
                                                        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-700">
                                                            <p className="text-[8px] font-black uppercase tracking-widest opacity-60 mb-0.5">Hoàn thành</p>
                                                            <p className="text-[10px] font-bold">Dịch vụ đã hoàn tất.</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="calendar"
                            initial={{ opacity: 0, scale: 0.99 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.99 }}
                            className="flex-1 grid grid-cols-1 xl:grid-cols-4 gap-6 overflow-hidden"
                        >
                            {/* Calendar Grid - Flexible height */}
                            <div className="xl:col-span-3 bg-white dark:bg-slate-800 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col h-full">
                                <div className="px-6 py-4 border-b border-slate-50 dark:border-slate-700 flex items-center justify-between shrink-0">
                                    <h2 className="text-xl font-black text-slate-900 dark:text-white capitalize">
                                        {format(currentDate, 'MMMM yyyy', { locale: vi })}
                                    </h2>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400">
                                            <ChevronLeft size={20} />
                                        </button>
                                        <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1.5 text-[10px] font-bold text-[#1a2b4c] dark:text-indigo-400">Hôm nay</button>
                                        <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400">
                                            <ChevronRight size={20} />
                                        </button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-7 bg-slate-50/50 dark:bg-slate-900/30 shrink-0">
                                    {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => (
                                        <div key={d} className="py-2.5 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">{d}</div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-7 flex-1 overflow-y-auto custom-scrollbar border-t border-slate-50 dark:border-slate-700">
                                    {calendarDays.map((day, idx) => {
                                        const dayBookings = getBookingsForDay(day);
                                        const isCurrentMonth = isSameMonth(day, monthStart);
                                        const hasBookings = dayBookings.length > 0;
                                        const isSelected = selectedDay && isSameDay(day, selectedDay);

                                        return (
                                            <div 
                                                key={idx}
                                                onClick={() => setSelectedDay(day)}
                                                className={`min-h-[85px] p-2.5 border-b border-r border-slate-50 dark:border-slate-700 cursor-pointer transition-all relative
                                                    ${!isCurrentMonth ? 'opacity-30 bg-slate-50/50' : 'bg-white dark:bg-slate-800'}
                                                    ${isSelected ? 'bg-teal-50/50 ring-2 ring-inset ring-teal-500/30' : ''}
                                                    ${hasBookings && isCurrentMonth ? 'bg-teal-50/40 dark:bg-teal-900/10' : ''}
                                                    hover:bg-slate-50 dark:hover:bg-slate-900/50
                                                `}
                                            >
                                                {/* Appointment indicator line - Modern Teal */}
                                                {hasBookings && isCurrentMonth && (
                                                    <div className="absolute top-0 left-0 w-1 h-full bg-teal-500 shadow-[1px_0_6px_rgba(20,184,166,0.3)]" />
                                                )}

                                                <div className="flex justify-between items-start mb-1.5 relative z-10">
                                                    <span className={`text-xs font-bold ${isToday(day) ? 'text-white bg-[#1a2b4c] size-5 flex items-center justify-center rounded-full shadow-lg shadow-[#1a2b4c]/20' : 'text-slate-700 dark:text-slate-300'}`}>
                                                        {format(day, 'd')}
                                                    </span>
                                                    {hasBookings && (
                                                        <span className="flex items-center gap-1 text-[9px] font-black text-white bg-teal-600 px-1.5 py-0.5 rounded-md shadow-md shadow-teal-500/20">
                                                            <div className="size-1 rounded-full bg-white animate-pulse" />
                                                            {dayBookings.length}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="space-y-1">
                                                    {dayBookings.slice(0, 2).map((b, i) => (
                                                        <div key={i} className="text-[7px] font-bold p-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 truncate leading-tight">
                                                            {b.petName}
                                                        </div>
                                                    ))}
                                                    {dayBookings.length > 2 && <div className="text-[7px] text-slate-400 pl-1">+{dayBookings.length - 2}</div>}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Calendar Sidebar - Independent scroll */}
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col h-full overflow-hidden">
                                <div className="shrink-0 mb-6">
                                    <h3 className="text-lg font-black text-slate-900 dark:text-white mb-0.5">
                                        {selectedDay ? format(selectedDay, 'dd MMMM', { locale: vi }) : 'Chọn ngày'}
                                    </h3>
                                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                                        {selectedDay ? getBookingsForDay(selectedDay).length : 0} Lịch hẹn
                                    </p>
                                </div>

                                <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-4">
                                    {selectedDay && getBookingsForDay(selectedDay).map((b, i) => (
                                        <div 
                                            key={i} 
                                            onClick={() => setSelectedBooking(b)}
                                            className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all group cursor-pointer"
                                        >
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white dark:bg-slate-800 rounded-full shadow-sm">
                                                    <Clock size={10} className="text-[#1a2b4c] dark:text-indigo-400" />
                                                    <span className="text-[9px] font-black text-slate-900 dark:text-white">
                                                        {format(parseISO(b.appointmentDatetime), 'HH:mm')}
                                                    </span>
                                                </div>
                                                <div className={`px-1.5 py-0.5 rounded-md text-[7px] font-black uppercase tracking-wider border ${STATUS_CONFIG[b.status]?.className || ''}`}>
                                                    {STATUS_CONFIG[b.status]?.label || b.status}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 mb-3">
                                                <div className="size-8 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center text-sm shadow-sm border border-slate-50 dark:border-slate-700">🐾</div>
                                                <div>
                                                    <h4 className="text-[11px] font-black text-slate-800 dark:text-white leading-tight">{b.petName}</h4>
                                                    <p className="text-[9px] text-slate-500 font-medium truncate max-w-[120px]">{b.serviceName}</p>
                                                </div>
                                            </div>

                                            <div className="pt-3 border-t border-slate-200/50 dark:border-slate-700/50 space-y-3">
                                                <div>
                                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Khách: <span className="text-slate-700 dark:text-slate-300 ml-1">{b.customerName || 'Khách lẻ'}</span></p>
                                                    <div className="relative group/select">
                                                        <select 
                                                            disabled={updatingId === b.id || b.status === 'COMPLETED' || b.status === 'CANCELLED'}
                                                            value={b.staffId || ''} 
                                                            onChange={(e) => handleAssignStaff(b.id, e.target.value === '' ? 'unassign' : Number(e.target.value))}
                                                            className="w-full pl-3 pr-8 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
                                                        >
                                                            <option value="">Chưa giao việc</option>
                                                            {staffList.map(s => <option key={s.id} value={s.id}>{s.fullName}</option>)}
                                                        </select>
                                                        <ChevronDown size={10} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover/select:translate-y-[-40%] transition-transform" />
                                                    </div>
                                                </div>

                                                {b.status === 'CONFIRMED' && (
                                                    <button
                                                        disabled={updatingId === b.id}
                                                        onClick={(e) => { e.stopPropagation(); handleUpdateStatus(b.id, 'CANCELLED'); }}
                                                        className="w-full py-2 bg-red-50 dark:bg-red-900/10 text-red-500 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-red-100 dark:hover:bg-red-900/20 transition-all flex items-center justify-center gap-1.5 border border-red-50/50"
                                                    >
                                                        {updatingId === b.id ? <Loader2 size={10} className="animate-spin" /> : <XCircle size={10} />}
                                                        Hủy đơn
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {selectedDay && getBookingsForDay(selectedDay).length === 0 && (
                                        <div className="text-center py-10 text-slate-300 dark:text-slate-700">
                                            <CheckCircle2 size={24} className="mx-auto mb-2 opacity-20" />
                                            <p className="text-[10px] font-bold">Không có lịch</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Booking Detail Modal */}
            <AnimatePresence>
                {selectedBooking && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedBooking(null)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-2xl bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
                        >
                            <button 
                                onClick={() => setSelectedBooking(null)}
                                className="absolute top-6 right-6 p-2 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-500 hover:rotate-90 transition-all z-10"
                            >
                                <X size={20} />
                            </button>

                            {/* Left: Pet & Customer Header */}
                            <div className="md:w-2/5 bg-slate-50 dark:bg-slate-900/50 p-8 flex flex-col items-center text-center">
                                <div className="w-24 h-24 rounded-[2rem] bg-white dark:bg-slate-800 shadow-xl flex items-center justify-center text-4xl mb-6 border-4 border-white dark:border-slate-800">
                                    🐾
                                </div>
                                <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">{selectedBooking.petName}</h2>
                                <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border mb-6 ${STATUS_CONFIG[selectedBooking.status]?.className}`}>
                                    {STATUS_CONFIG[selectedBooking.status]?.label}
                                </div>

                                <div className="w-full space-y-4 pt-6 border-t border-slate-200 dark:border-slate-700">
                                    <div className="flex items-center gap-3 text-left">
                                        <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm text-[#1a2b4c] dark:text-indigo-400">
                                            <User size={14} />
                                        </div>
                                        <div>
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Khách hàng</p>
                                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{selectedBooking.customerName}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-left">
                                        <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm text-[#1a2b4c] dark:text-indigo-400">
                                            <Mail size={14} />
                                        </div>
                                        <div>
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Liên hệ</p>
                                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate max-w-[120px]">
                                                {selectedBooking.customerEmail || 'Chưa cập nhật'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Detailed Info */}
                            <div className="flex-1 p-8 overflow-y-auto">
                                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6">Thông tin chi tiết</h3>
                                
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Mã đơn hàng</p>
                                            <p className="text-xs font-bold text-slate-700 dark:text-white">#{(selectedBooking.bookingId || selectedBooking.id)}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Thời gian hẹn</p>
                                            <p className="text-xs font-bold text-slate-700 dark:text-white">
                                                {format(parseISO(selectedBooking.appointmentDatetime), "HH:mm - dd/MM/yyyy")}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2.5">Dịch vụ sử dụng</p>
                                        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-between border border-indigo-100 dark:border-indigo-900/30">
                                            <div className="flex items-center gap-2">
                                                <Scissors size={16} className="text-[#1a2b4c] dark:text-indigo-400" />
                                                <span className="text-xs font-bold text-[#1a2b4c] dark:text-indigo-400">{selectedBooking.serviceName}</span>
                                            </div>
                                            <span className="text-xs font-black text-[#1a2b4c] dark:text-indigo-400">
                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedBooking.servicePrice || 0)}
                                            </span>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2.5">Ghi chú</p>
                                        <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700 italic text-xs text-slate-500">
                                            "{selectedBooking.note || 'Không có ghi chú'}"
                                        </div>
                                    </div>

                                    <div className="pt-6 flex gap-3">
                                        <button 
                                            onClick={() => setSelectedBooking(null)}
                                            className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-white rounded-xl font-bold text-[10px] hover:bg-slate-200 transition-all"
                                        >
                                            Đóng
                                        </button>
                                        {selectedBooking.status === 'CONFIRMED' && (
                                            <button 
                                                onClick={() => handleUpdateStatus((selectedBooking.bookingId || selectedBooking.id), 'CANCELLED')}
                                                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold text-[10px] shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all"
                                            >
                                                Hủy đơn
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
