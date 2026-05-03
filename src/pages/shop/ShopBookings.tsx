import React, { useState, useEffect } from 'react';
import { 
    Calendar, Clock, User, Phone, Mail, CheckCircle, XCircle, 
    AlertCircle, Search, Filter, Loader2, ChevronDown, UserCheck 
} from 'lucide-react';
import { taskService, type TaskResponse } from '../../services/task.service';
import { staffService, type StaffResponse } from '../../services/staff.service';
import { bookingService } from '../../services/booking.service';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function ShopBookings() {
    const [bookings, setBookings] = useState<TaskResponse[]>([]);
    const [staffList, setStaffList] = useState<StaffResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [updatingId, setUpdatingId] = useState<number | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [tasksData, staffData] = await Promise.all([
                taskService.getAllShopTasks(),
                staffService.getMyShopStaff()
            ]);
            setBookings(tasksData);
            setStaffList(staffData.filter(s => s.isActive));
        } catch {
            toast.error('Không thể tải dữ liệu đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (bookingId: number, status: string) => {
        setUpdatingId(bookingId);
        try {
            if (status === 'CANCELLED') {
                await bookingService.cancel(bookingId);
            } else {
                toast.success('Đã cập nhật trạng thái đơn hàng');
            }
            fetchData();
        } catch {
            toast.error('Cập nhật thất bại');
        } finally {
            setUpdatingId(null);
        }
    };

    const handleAssignStaff = async (bookingId: number, staffId: number | 'unassign') => {
        setUpdatingId(bookingId);
        try {
            if (staffId === 'unassign') {
                await taskService.unassignTask(bookingId);
                toast.success('Đã gỡ nhân viên khỏi đơn hàng');
            } else {
                await taskService.assignTask(bookingId, staffId);
                const staff = staffList.find(s => s.id === staffId);
                toast.success(`Đã giao đơn cho ${staff?.fullName}`);
            }
            fetchData();
        } catch {
            toast.error('Giao việc thất bại');
        } finally {
            setUpdatingId(null);
        }
    };

    const getStatusConfig = (status: string) => {
        const configs: Record<string, any> = {
            PENDING_PAYMENT: { label: 'Chờ thanh toán', icon: AlertCircle, className: 'bg-slate-100 text-slate-500' },
            CONFIRMED: { label: 'Chờ xử lý', icon: Clock, className: 'bg-orange-100 text-orange-700' },
            IN_PROGRESS: { label: 'Đang thực hiện', icon: Loader2, className: 'bg-blue-100 text-blue-700' },
            COMPLETED: { label: 'Hoàn thành', icon: CheckCircle, className: 'bg-green-100 text-green-700' },
            CANCELLED: { label: 'Đã hủy', icon: XCircle, className: 'bg-red-100 text-red-700' },
        };
        return configs[status] || configs.CONFIRMED;
    };

    const filteredBookings = bookings.filter((b) => {
        const matchesFilter = filter === 'ALL' || b.status === filter;
        const matchesSearch =
            b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.bookingId.toString().includes(searchTerm);
        return matchesFilter && matchesSearch;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Quản lý đơn đặt lịch</h1>
                    <p className="text-slate-500 font-medium">Theo dõi và điều phối công việc cho đội ngũ nhân viên</p>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-3xl p-6 shadow-sm mb-6 border border-slate-100">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="text"
                                placeholder="Tìm theo tên khách hàng, thú cưng, mã đơn..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#1a2b4c]/20 outline-none transition-all"
                            />
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                            {[
                                { value: 'ALL', label: 'Tất cả' },
                                { value: 'CONFIRMED', label: 'Chờ xử lý' },
                                { value: 'IN_PROGRESS', label: 'Đang làm' },
                                { value: 'COMPLETED', label: 'Hoàn thành' },
                                { value: 'CANCELLED', label: 'Đã hủy' },
                            ].map((tab) => (
                                <button
                                    key={tab.value}
                                    onClick={() => setFilter(tab.value)}
                                    className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all ${
                                        filter === tab.value
                                            ? 'bg-[#1a2b4c] text-white shadow-lg shadow-[#1a2b4c]/20'
                                            : 'bg-white text-slate-400 hover:text-slate-600 border border-slate-100'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Đợi xử lý', value: bookings.filter(b => b.status === 'CONFIRMED').length, color: 'text-orange-500', bg: 'bg-orange-50' },
                        { label: 'Đang làm', value: bookings.filter(b => b.status === 'IN_PROGRESS').length, color: 'text-blue-500', bg: 'bg-blue-50' },
                        { label: 'Hoàn thành', value: bookings.filter(b => b.status === 'COMPLETED').length, color: 'text-green-500', bg: 'bg-green-50' },
                        { label: 'Tổng đơn', value: bookings.length, color: 'text-[#1a2b4c]', bg: 'bg-indigo-50' },
                    ].map((stat) => (
                        <div key={stat.label} className={`${stat.bg} rounded-3xl p-6 border border-white shadow-sm`}>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                            <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* Bookings List */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-20">
                            <Loader2 size={40} className="animate-spin mx-auto text-slate-300 mb-4" />
                            <p className="text-slate-400 font-bold">Đang tải dữ liệu...</p>
                        </div>
                    ) : filteredBookings.map((booking) => {
                        const statusConfig = getStatusConfig(booking.status);
                        const StatusIcon = statusConfig.icon;

                        return (
                            <div key={booking.bookingId} className="bg-white rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all border border-slate-50 relative overflow-hidden group">
                                <div className="flex flex-col lg:flex-row gap-8">
                                    {/* Left: Info */}
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-6">
                                          <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-[#1a2b4c] font-black text-xl shadow-inner">
                                              #{booking.bookingId.toString().slice(-3)}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                  <h3 className="text-xl font-black text-slate-900">Đơn hàng #{booking.bookingId}</h3>
                                                  <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${statusConfig.className}`}>
                                                    <StatusIcon size={12} className={booking.status === 'IN_PROGRESS' ? 'animate-spin' : ''} />
                                                    {statusConfig.label}
                                                  </span>
                                                </div>
                                                <p className="text-sm text-slate-500 font-bold flex items-center gap-2">
                                                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                                                  {booking.serviceName}
                                                </p>
                                            </div>
                                          </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400"><User size={18} /></div>
                                                    <div>
                                                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Khách hàng</p>
                                                      <p className="text-sm font-bold text-slate-700">{booking.customerName}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400"><Calendar size={18} /></div>
                                                    <div>
                                                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Thời gian</p>
                                                      <p className="text-sm font-bold text-slate-700">
                                                        {format(new Date(booking.appointmentDatetime), "eeee, dd/MM/yyyy 'lúc' HH:mm", { locale: vi })}
                                                      </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">🐾</div>
                                                    <div>
                                                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Thú cưng</p>
                                                      <p className="text-sm font-bold text-slate-700">{booking.petName}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400"><UserCheck size={18} /></div>
                                                    <div className="flex-1">
                                                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nhân viên phụ trách</p>
                                                      <div className="relative mt-1">
                                                        <select 
                                                          disabled={updatingId === booking.bookingId || booking.status === 'COMPLETED' || booking.status === 'CANCELLED'}
                                                          value={booking.staffId || ''} 
                                                          onChange={(e) => handleAssignStaff(booking.bookingId, e.target.value === '' ? 'unassign' : Number(e.target.value))}
                                                          className="w-full pl-0 pr-8 py-0 bg-transparent border-none text-sm font-bold text-indigo-600 focus:ring-0 cursor-pointer appearance-none"
                                                        >
                                                          <option value="">Chưa giao việc</option>
                                                          {staffList.map(s => <option key={s.id} value={s.id}>{s.fullName} ({s.role})</option>)}
                                                        </select>
                                                        <ChevronDown size={14} className="absolute right-0 top-1/2 -translate-y-1/2 text-indigo-400 pointer-events-none" />
                                                      </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {booking.note && (
                                            <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ghi chú</p>
                                                <p className="text-sm text-slate-600 italic">"{booking.note}"</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right: Actions */}
                                    <div className="flex flex-col gap-3 lg:w-56 pt-2">
                                        {booking.status === 'CONFIRMED' && (
                                          <>
                                            <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 mb-2">
                                              <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1">Hành động nhanh</p>
                                              <p className="text-xs text-orange-600 font-bold leading-relaxed">Hãy giao việc cho nhân viên để bắt đầu thực hiện.</p>
                                            </div>
                                            <button
                                              disabled={updatingId === booking.bookingId}
                                              onClick={() => handleUpdateStatus(booking.bookingId, 'CANCELLED')}
                                              className="w-full py-4 border border-red-100 text-red-500 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                                            >
                                              {updatingId === booking.bookingId ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                                              Hủy đơn hàng
                                            </button>
                                          </>
                                        )}
                                        {booking.status === 'IN_PROGRESS' && (
                                          <div className="p-6 bg-indigo-900 rounded-[2rem] text-white shadow-xl shadow-indigo-200">
                                            <Loader2 size={24} className="animate-spin mb-3 opacity-50" />
                                            <p className="text-xs font-black uppercase tracking-widest opacity-60 mb-1">Trạng thái</p>
                                            <p className="text-sm font-bold">Nhân viên đang xử lý đơn hàng này.</p>
                                          </div>
                                        )}
                                        {booking.status === 'COMPLETED' && (
                                          <div className="p-6 bg-green-50 rounded-[2rem] border border-green-100">
                                            <CheckCircle size={24} className="text-green-500 mb-3" />
                                            <p className="text-[10px] font-black text-green-400 uppercase tracking-widest mb-1">Hoàn thành</p>
                                            <p className="text-xs text-green-700 font-bold">Đơn hàng đã được phục vụ thành công.</p>
                                          </div>
                                        )}
                                        {booking.status === 'CANCELLED' && (
                                          <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                                            <XCircle size={24} className="text-slate-400 mb-3" />
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Đã hủy</p>
                                            <p className="text-xs text-slate-500 font-bold">Đơn hàng này không được thực hiện.</p>
                                          </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {!loading && filteredBookings.length === 0 && (
                        <div className="text-center py-32 bg-white rounded-[3rem] border border-slate-100">
                            <div className="w-24 h-24 mx-auto mb-6 bg-slate-50 rounded-full flex items-center justify-center">
                                <Calendar className="w-10 h-10 text-slate-200" />
                            </div>
                            <p className="text-slate-500 font-black text-xl tracking-tight">Không có đơn đặt lịch nào</p>
                            <p className="text-slate-400 font-medium mt-2">Các đơn đặt lịch sẽ tự động hiển thị tại đây</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
