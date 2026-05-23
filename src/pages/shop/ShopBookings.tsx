import React, { useState, useEffect } from 'react';
import { 
    Calendar as CalendarIcon, Clock, User, CheckCircle, XCircle, 
    AlertCircle, Search, Filter, Loader2, ChevronDown, UserCheck,
    LayoutGrid, List as ListIcon, ChevronLeft, ChevronRight, Plus,
    Timer, MessageCircle, MoreVertical, CheckCircle2, Video,
    MapPin, Phone, Mail, Scissors, Info, X, Play,
    Activity, Utensils, Syringe, Heart, Sparkles
} from 'lucide-react';
import { taskService, type TaskResponse } from '../../services/task.service';
import { staffService, type StaffResponse } from '../../services/staff.service';
import { bookingService } from '../../services/booking.service';
import { careLogService } from '../../services/care-log.service';
import { BookingResponse } from '../../types/api';
import toast from 'react-hot-toast';
import { 
    format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
    eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths,
    isToday, parseISO 
} from 'date-fns';
import { vi } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const STATUS_CONFIG: Record<string, any> = {
  PENDING_PAYMENT: { label: 'Chờ thanh toán', icon: AlertCircle, className: 'bg-slate-100 text-slate-500', color: 'bg-amber-500' },
  WAITING_SHOP_APPROVAL: { label: 'Chờ duyệt', icon: Info, className: 'bg-purple-100 text-purple-700', color: 'bg-purple-500' },
  CONFIRMED: { label: 'Chờ xử lý', icon: Clock, className: 'bg-orange-100 text-orange-700', color: 'bg-blue-500' },
  IN_PROGRESS: { label: 'Đang làm', icon: Loader2, className: 'bg-blue-100 text-blue-700', color: 'bg-indigo-500' },
  COMPLETED: { label: 'Hoàn thành', icon: CheckCircle, className: 'bg-green-100 text-green-700', color: 'bg-emerald-500' },
  CANCELLED: { label: 'Đã hủy', icon: XCircle, className: 'bg-red-100 text-red-700', color: 'bg-red-500' },
};

const CARE_LOG_TYPES = [
  { id: 'FEEDING', label: 'Cho ăn', icon: Utensils, color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/20 dark:text-orange-400' },
  { id: 'CLEANING', label: 'Vệ sinh', icon: Activity, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/20 dark:text-blue-400' },
  { id: 'MEDICAL', label: 'Y tế', icon: Syringe, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400' },
  { id: 'EXERCISE', label: 'Vui chơi', icon: Heart, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/20 dark:text-purple-400' },
];

interface StaffAssignmentSelectProps {
    bookingId: number;
    status: string;
    currentStaffId: number | null;
    staffList: StaffResponse[];
    updatingId: number | null;
    onAssign: (bookingId: number, staffId: number | 'unassign') => void;
    selectClassName?: string;
}

function StaffAssignmentSelect({
    bookingId,
    status,
    currentStaffId,
    staffList,
    updatingId,
    onAssign,
    selectClassName
}: StaffAssignmentSelectProps) {
    const { data: pendingRequest, isLoading } = useQuery({
        queryKey: ['pendingStaffChangeRequest', bookingId],
        queryFn: () => taskService.getPendingStaffChangeRequest(bookingId),
        enabled: !!bookingId && (status === 'WAITING_SHOP_APPROVAL' || status === 'CONFIRMED' || status === 'IN_PROGRESS'),
    });

    const { data: changeHistory } = useQuery({
        queryKey: ['staffChangeHistory', bookingId],
        queryFn: () => taskService.getStaffChangeHistory(bookingId),
        enabled: !!bookingId,
    });

    const acceptedRequests = changeHistory?.filter((req: any) => req.status === 'ACCEPTED') || [];
    const hasAcceptedChange = acceptedRequests.length > 0;

    const isPending = !!pendingRequest;
    const isCompletedOrCancelled = status === 'COMPLETED' || status === 'CANCELLED' || status === 'IN_PROGRESS';
    const isDisabled = updatingId === bookingId || isCompletedOrCancelled || isPending || isLoading;
    const selectClass = selectClassName || "w-full pl-3 pr-8 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 rounded-xl text-[11px] font-bold text-[#1a2b4c] dark:text-indigo-400 focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all cursor-pointer appearance-none disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-900";

    return (
        <div className="space-y-1.5 w-full">
            <div className="relative group/select">
                <select 
                    disabled={isDisabled}
                    value={isPending ? (pendingRequest.proposedStaff?.id || '') : (currentStaffId || '')} 
                    onChange={(e) => onAssign(bookingId, e.target.value === '' ? 'unassign' : Number(e.target.value))}
                    className={selectClass}
                >
                    {isPending ? (
                        <option value={pendingRequest.proposedStaff?.id}>
                            {pendingRequest.proposedStaff?.fullName} (Đang chờ duyệt)
                        </option>
                    ) : (
                        <>
                            <option value="">Chưa giao việc</option>
                            {staffList.map(s => <option key={s.id} value={s.id}>{s.fullName}</option>)}
                        </>
                    )}
                </select>
                <ChevronDown size={selectClassName ? 10 : 12} className={`absolute ${selectClassName ? 'right-2.5' : 'right-3'} top-1/2 -translate-y-1/2 text-indigo-400 pointer-events-none group-hover/select:translate-y-[-40%] transition-transform`} />
            </div>
            
            {isPending && (
                <div className="flex items-center gap-1.5 text-[9px] font-extrabold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 px-2.5 py-1.5 rounded-lg border border-amber-100 dark:border-amber-900/30 leading-normal">
                    <Clock size={10} className="animate-pulse shrink-0" />
                    <span>Đang chờ khách duyệt đổi từ <strong>{pendingRequest.oldStaff?.fullName || 'Chưa giao'}</strong> sang <strong>{pendingRequest.proposedStaff?.fullName}</strong></span>
                </div>
            )}

            {!isPending && hasAcceptedChange && (
                <div className="flex items-center gap-1.5 text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-1.5 rounded-lg border border-emerald-100 dark:border-emerald-900/30 leading-normal">
                    <CheckCircle size={10} className="shrink-0 text-emerald-500" />
                    <span>Đã đổi: {acceptedRequests.map((r: any) => `${r.oldStaff?.fullName || 'Chưa giao'} ➔ ${r.proposedStaff?.fullName}`).join(', ')}</span>
                </div>
            )}
        </div>
    );
}


interface BookingListItemProps {
    booking: any;
    staffList: StaffResponse[];
    updatingId: number | null;
    onAssign: (bookingId: number, staffId: number | 'unassign') => void;
    handleUpdateStatus: (bookingId: number, status: string) => void;
    setSelectedBooking: (booking: any) => void;
}

function BookingListItem({
    booking,
    staffList,
    updatingId,
    onAssign,
    handleUpdateStatus,
    setSelectedBooking
}: BookingListItemProps) {
    const { data: pendingRequest } = useQuery({
        queryKey: ['pendingStaffChangeRequest', booking.bookingId],
        queryFn: () => taskService.getPendingStaffChangeRequest(booking.bookingId),
        enabled: !!booking.bookingId && (booking.status === 'WAITING_SHOP_APPROVAL' || booking.status === 'CONFIRMED' || booking.status === 'IN_PROGRESS'),
    });

    const isPending = !!pendingRequest;
    const cfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG.CONFIRMED;
    const StatusIcon = cfg.icon;

    return (
        <div 
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
                                    <StaffAssignmentSelect 
                                        bookingId={booking.bookingId}
                                        status={booking.status}
                                        currentStaffId={booking.staffId}
                                        staffList={staffList}
                                        updatingId={updatingId}
                                        onAssign={onAssign}
                                    />
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

                    {booking.status === 'WAITING_SHOP_APPROVAL' && (
                        <div className="flex flex-col gap-2">
                            {!isPending && (
                                <button
                                    disabled={updatingId === booking.bookingId}
                                    onClick={() => handleUpdateStatus(booking.bookingId, 'CONFIRMED')}
                                    className="w-full py-3 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                                >
                                    {updatingId === booking.bookingId ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                                    Duyệt đơn
                                </button>
                            )}
                            <button
                                disabled={updatingId === booking.bookingId}
                                onClick={() => handleUpdateStatus(booking.bookingId, 'CANCELLED')}
                                className="w-full py-3 border border-red-100 text-red-500 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                            >
                                <XCircle size={12} />
                                Từ chối
                            </button>
                        </div>
                    )}

                    {/* Removed CONFIRMED and IN_PROGRESS actions as requested */}
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
}

export default function ShopBookings() {
    const queryClient = useQueryClient();
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
    const [staffList, setStaffList] = useState<StaffResponse[]>([]);
    const [filter, setFilter] = useState<string>('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
    
    // Staff Change Request States
    const [showReasonModal, setShowReasonModal] = useState(false);
    const [pendingStaffChange, setPendingStaffChange] = useState<{ bookingId: number, staffId: number } | null>(null);
    const [changeReason, setChangeReason] = useState('');
    
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

    const selectedBookingId = selectedBooking?.bookingId || selectedBooking?.id;
    const { data: careLogs = [], isLoading: loadingLogs } = useQuery({
        queryKey: ['shopBookingCareLogs', selectedBookingId],
        queryFn: () => careLogService.getLogs(selectedBookingId),
        enabled: !!selectedBookingId && (selectedBooking.status === 'IN_PROGRESS' || selectedBooking.status === 'COMPLETED'),
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
            } else if (status === 'CONFIRMED') {
                await taskService.updateStatus(bookingId, status as any);
                toast.success('Đã duyệt đơn hàng');
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
        const booking = listBookings.find((b: any) => (b.bookingId || b.id) === bookingId)
                     || calendarBookings.find((b: any) => (b.bookingId || b.id) === bookingId);
        const currentStaffId = booking ? (booking.staffId || (booking.staff && booking.staff.id)) : null;
        // Only require staff change request flow if the booking status is WAITING_SHOP_APPROVAL, CONFIRMED or IN_PROGRESS
        const isChange = booking && 
            (booking.status === 'WAITING_SHOP_APPROVAL' || booking.status === 'CONFIRMED' || booking.status === 'IN_PROGRESS') && 
            currentStaffId && 
            currentStaffId !== staffId;
        
        // Prevent direct unassignment if a staff is already assigned
        if (booking && (booking.status === 'WAITING_SHOP_APPROVAL' || booking.status === 'CONFIRMED' || booking.status === 'IN_PROGRESS')) {
            if (staffId === 'unassign' && currentStaffId) {
                toast.error('Không thể gỡ nhân viên khi đã có nhân viên phụ trách');
                return;
            }
        }

        if (isChange && staffId !== 'unassign') {
            setPendingStaffChange({ bookingId, staffId });
            setShowReasonModal(true);
            return;
        }

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
            await queryClient.invalidateQueries({
                queryKey: ['pendingStaffChangeRequest', bookingId]
            });
        } catch {
            toast.error('Giao việc thất bại');
        } finally {
            setUpdatingId(null);
        }
    };

    const submitStaffChangeRequest = async () => {
        if (!pendingStaffChange || !changeReason) {
            toast.error('Vui lòng nhập lý do đổi nhân viên');
            return;
        }
        setUpdatingId(pendingStaffChange.bookingId);
        try {
            await taskService.requestStaffChange(
                pendingStaffChange.bookingId, 
                pendingStaffChange.staffId, 
                changeReason
            );
            toast.success('Đã gửi yêu cầu đổi nhân viên tới khách hàng');
            setShowReasonModal(false);
            setChangeReason('');
            setPendingStaffChange(null);
            refetchList();
            refetchCalendar();
            await queryClient.invalidateQueries({
                queryKey: ['pendingStaffChangeRequest', pendingStaffChange.bookingId]
            });
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Gửi yêu cầu thất bại');
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
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                            <CalendarIcon className="w-8 h-8 text-blue-600" />
                            Quản lý đặt lịch
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Điều phối và theo dõi tiến độ dịch vụ cửa hàng</p>
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
                                        {[{ v: 'ALL', l: 'Tất cả' }, { v: 'WAITING_SHOP_APPROVAL', l: 'Chờ duyệt' }, { v: 'CONFIRMED', l: 'Chờ xử lý' }, { v: 'IN_PROGRESS', l: 'Đang làm' }, { v: 'COMPLETED', l: 'Xong' }].map(t => (
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
                                ) : filteredList.map((booking) => (
                                    <BookingListItem 
                                        key={booking.bookingId}
                                        booking={booking}
                                        staffList={staffList}
                                        updatingId={updatingId}
                                        onAssign={handleAssignStaff}
                                        handleUpdateStatus={handleUpdateStatus}
                                        setSelectedBooking={setSelectedBooking}
                                    />
                                ))}
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

                                        // Get priority status for coloring
                                        const getDayStatus = () => {
                                            if (dayBookings.some(b => b.status === 'IN_PROGRESS')) return 'IN_PROGRESS';
                                            if (dayBookings.some(b => b.status === 'CONFIRMED')) return 'CONFIRMED';
                                            if (dayBookings.some(b => b.status === 'PENDING_PAYMENT')) return 'PENDING_PAYMENT';
                                            if (dayBookings.some(b => b.status === 'COMPLETED')) return 'COMPLETED';
                                            return dayBookings[0]?.status || 'CANCELLED';
                                        };

                                        const dayStatus = hasBookings ? getDayStatus() : null;
                                        const statusCfg = dayStatus ? STATUS_CONFIG[dayStatus] : null;

                                        return (
                                            <div 
                                                key={idx}
                                                onClick={() => setSelectedDay(day)}
                                                className={`min-h-[85px] p-2.5 border-b border-r border-slate-50 dark:border-slate-700 cursor-pointer transition-all relative
                                                    ${!isCurrentMonth ? 'opacity-30 bg-slate-50/50' : 'bg-white dark:bg-slate-800'}
                                                    ${isSelected ? 'ring-2 ring-inset ring-[#1a2b4c]/20' : ''}
                                                    ${hasBookings && isCurrentMonth && dayStatus ? `${statusCfg?.className.replace('text-', 'bg-').replace('100', '20') || 'bg-blue-50/40'}` : ''}
                                                    hover:bg-slate-50 dark:hover:bg-slate-900/50
                                                `}
                                            >
                                                {/* Appointment indicator line - Color based on Status */}
                                                {hasBookings && isCurrentMonth && statusCfg && (
                                                    <div className={`absolute top-0 left-0 w-1.5 h-full ${statusCfg.color} shadow-[1px_0_6px_rgba(0,0,0,0.1)]`} />
                                                )}

                                                <div className="flex justify-between items-start mb-1.5 relative z-10">
                                                    <span className={`text-xs font-bold ${isToday(day) ? 'text-white bg-[#1a2b4c] size-5 flex items-center justify-center rounded-full shadow-lg shadow-[#1a2b4c]/20' : 'text-slate-700 dark:text-slate-300'}`}>
                                                        {format(day, 'd')}
                                                    </span>
                                                    {hasBookings && statusCfg && (
                                                        <span className={`flex items-center gap-1 text-[9px] font-black text-white ${statusCfg.color} px-1.5 py-0.5 rounded-md shadow-md`}>
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
                                                    <StaffAssignmentSelect 
                                                        bookingId={b.id}
                                                        status={b.status}
                                                        currentStaffId={b.staffId}
                                                        staffList={staffList}
                                                        updatingId={updatingId}
                                                        onAssign={handleAssignStaff}
                                                        selectClassName="w-full pl-3 pr-8 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
                                                    />
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
                                        <div className="min-w-0">
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Liên hệ</p>
                                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
                                                {selectedBooking.customerPhone || 'Chưa có SĐT'}
                                            </p>
                                            <p className="text-[10px] text-slate-500 truncate mt-0.5">
                                                {selectedBooking.customerEmail || 'Chưa cập nhật email'}
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

                                    {/* Care Logs */}
                                    {(selectedBooking.status === 'IN_PROGRESS' || selectedBooking.status === 'COMPLETED') && (
                                        <div className="border-t border-slate-100 dark:border-slate-700 pt-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Nhật ký chăm sóc ({careLogs.length})</p>
                                                {loadingLogs && <Loader2 size={12} className="animate-spin text-slate-400" />}
                                            </div>

                                            {careLogs.length === 0 ? (
                                                <p className="text-xs text-slate-400 italic">Chưa có hoạt động chăm sóc nào được ghi nhận.</p>
                                            ) : (
                                                <div className="relative pl-6 border-l-2 border-indigo-100 dark:border-indigo-900/40 ml-3 space-y-6 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                                                    {careLogs.map((log: any) => {
                                                        const logType = CARE_LOG_TYPES.find(t => t.id === log.type) || {
                                                            label: log.type,
                                                            icon: Activity,
                                                            color: 'text-slate-500 bg-slate-50 dark:bg-slate-900 dark:text-slate-400'
                                                        };
                                                        const LogIcon = logType.icon;

                                                        return (
                                                            <div key={log.id} className="relative group/timeline-item">
                                                                {/* Dot icon */}
                                                                <div className={`absolute -left-[37px] top-0 w-7 h-7 rounded-xl ${logType.color} border-4 border-white dark:border-slate-800 flex items-center justify-center shadow-sm`}>
                                                                    <LogIcon size={11} />
                                                                </div>

                                                                <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-4 border border-slate-100/80 dark:border-slate-700 hover:border-indigo-100 dark:hover:border-indigo-900/30 transition-all duration-300">
                                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-xs font-black text-slate-800 dark:text-slate-200">{logType.label}</span>
                                                                            <span className="text-[9px] text-slate-400 font-bold">• Nhân viên: {log.staffName}</span>
                                                                        </div>
                                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
                                                                            {format(parseISO(log.timestamp), 'HH:mm • dd/MM', { locale: vi })}
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                                                                        {log.note}
                                                                    </p>
                                                                    {log.imageUrl && (
                                                                        <div className="mt-3 max-w-sm rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800">
                                                                            <img src={log.imageUrl} alt="Đính kèm" className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    )}

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

            {/* Staff Change Reason Modal */}
            <AnimatePresence>
                {showReasonModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => {
                                setShowReasonModal(false);
                                setPendingStaffChange(null);
                                setChangeReason('');
                            }}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl overflow-hidden p-6"
                        >
                            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">Lý do đổi nhân viên</h3>
                            <p className="text-xs text-slate-500 mb-4">Vui lòng nhập lý do đổi nhân viên để thông báo cho khách hàng.</p>
                            
                            <textarea
                                value={changeReason}
                                onChange={(e) => setChangeReason(e.target.value)}
                                placeholder="Ví dụ: Nhân viên cũ bận việc đột xuất, Nhân viên này có chuyên môn tốt hơn..."
                                className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all min-h-[100px]"
                            />
                            
                            <div className="mt-6 flex gap-3">
                                <button 
                                    onClick={() => {
                                        setShowReasonModal(false);
                                        setPendingStaffChange(null);
                                        setChangeReason('');
                                    }}
                                    className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-white rounded-xl font-bold text-[10px] hover:bg-slate-200 transition-all"
                                >
                                    Hủy
                                </button>
                                <button 
                                    onClick={submitStaffChangeRequest}
                                    disabled={!changeReason.trim()}
                                    className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-[10px] shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Gửi yêu cầu
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
