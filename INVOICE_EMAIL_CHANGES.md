# Tích hợp Email Hóa Đơn - Frontend Changes

## Tổng quan

Frontend đã được cập nhật để tích hợp với chức năng gửi email hóa đơn từ backend. Shop Owner có thể xuất hóa đơn thủ công cho các booking đã hoàn thành.

## Files đã thay đổi

### 1. `src/services/booking.service.ts` ✅

**Đã có sẵn** - Method `sendInvoice()` đã được implement:

```typescript
sendInvoice: async (bookingId: number): Promise<void> => {
    await apiClient.post(`/bookings/${bookingId}/send-invoice`);
}
```

### 2. `src/pages/shop/ShopBookings.tsx` ✨ CẬP NHẬT

#### Thêm State Management
```typescript
const [sendingInvoiceId, setSendingInvoiceId] = useState<number | null>(null);
```

#### Thêm Handler Function
```typescript
const handleSendInvoice = async (bookingId: number) => {
    setSendingInvoiceId(bookingId);
    try {
        await bookingService.sendInvoice(bookingId);
        toast.success('Đã gửi hóa đơn tới email khách hàng!');
    } catch (err: any) {
        toast.error(err.response?.data?.message || 'Gửi hóa đơn thất bại');
    } finally {
        setSendingInvoiceId(null);
    }
};
```

#### Cập nhật Props Interface
```typescript
interface BookingListItemProps {
    booking: any;
    staffList: StaffResponse[];
    updatingId: number | null;
    sendingInvoiceId: number | null;  // ✨ THÊM MỚI
    onAssign: (bookingId: number, staffId: number | 'unassign') => void;
    handleUpdateStatus: (bookingId: number, status: string) => void;
    handleSendInvoice: (bookingId: number) => void;  // ✨ THÊM MỚI
    setSelectedBooking: (booking: any) => void;
}
```

#### Thêm Nút trong List View

Trong component `BookingListItem`, thêm nút xuất hóa đơn cho booking COMPLETED:

```typescript
{booking.status === 'COMPLETED' && (
    <div className="flex flex-col gap-2">
        <div className={/* Status badge */}>
            <p>Hoàn thành</p>
        </div>
        <button 
            onClick={() => handleSendInvoice(booking.bookingId)}
            disabled={sendingInvoiceId === booking.bookingId}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl..."
        >
            {sendingInvoiceId === booking.bookingId ? (
                <Loader2 size={12} className="animate-spin" />
            ) : (
                <Mail size={12} />
            )}
            Xuất hóa đơn
        </button>
    </div>
)}
```

#### Thêm Nút trong Detail Modal

Ở cuối modal chi tiết booking:

```typescript
{selectedBooking.status === 'COMPLETED' && (
    <button 
        onClick={() => handleSendInvoice(selectedBooking.bookingId || selectedBooking.id)}
        disabled={sendingInvoiceId === (selectedBooking.bookingId || selectedBooking.id)}
        className="w-full py-3 bg-emerald-600 text-white rounded-xl..."
    >
        {sendingInvoiceId === bookingId ? (
            <Loader2 size={12} className="animate-spin" />
        ) : (
            <Mail size={12} />
        )}
        Xuất hóa đơn qua Email
    </button>
)}
```

### 3. `docs/INVOICE_EMAIL_FEATURE.md` 📄 TẠO MỚI

Tài liệu chi tiết về:
- Luồng tự động và thủ công gửi email
- Nội dung email hóa đơn
- Frontend implementation
- Backend requirements
- UI/UX guidelines
- Testing procedures

## Chức năng

### Tự động gửi Email (Backend)

Backend tự động gửi email trong các trường hợp:
- ✅ PayOS thanh toán thành công
- ✅ Mock payment confirmation
- ✅ Cash deposit confirmation

### Thủ công gửi Email (Frontend)

Shop Owner có thể gửi hóa đơn thủ công:
- 📍 Từ List View: Nút "Xuất hóa đơn" bên dưới thông tin booking
- 📍 Từ Detail Modal: Nút "Xuất hóa đơn qua Email" ở cuối modal
- ⚡ Chỉ hiện với booking có status `COMPLETED`
- 🔄 Loading state khi đang gửi
- ✅ Toast notification khi thành công/thất bại

## UI Components

### List View Button
- **Vị trí**: Bên dưới badge "Hoàn thành"
- **Style**: Indigo background, white text
- **Icon**: Mail icon
- **Text**: "Xuất hóa đơn"
- **Loading**: Spinner thay thế icon

### Detail Modal Button  
- **Vị trí**: Cuối modal, trước nút "Đóng"
- **Style**: Emerald/Green background, white text
- **Icon**: Mail icon
- **Text**: "Xuất hóa đơn qua Email"
- **Full width**: w-full

## API Integration

**Endpoint**: `POST /bookings/{bookingId}/send-invoice`

**Authorization**: SHOP_OWNER only

**Response**: 
- Success: 200 OK
- Error: 4xx/5xx với message

## Toast Messages

### Success
```
"Đã gửi hóa đơn tới email khách hàng!"
```

### Error
```
"Gửi hóa đơn thất bại. Vui lòng thử lại."
// hoặc backend error message
```

## Testing Checklist

- [ ] Nút "Xuất hóa đơn" chỉ hiện với booking COMPLETED
- [ ] Click nút → hiện loading spinner
- [ ] API call thành công → toast success
- [ ] API call thất bại → toast error  
- [ ] Multiple clicks không gửi duplicate requests
- [ ] State reset sau khi hoàn thành
- [ ] Modal và list view đều hoạt động
- [ ] Email thực sự được gửi đến khách hàng

## Notes

- ✨ Backend đã tự động gửi email sau thanh toán
- 🎯 Frontend chỉ cung cấp nút gửi thủ công cho Shop Owner
- 🔒 **Chỉ Shop Owner mới có quyền xuất hóa đơn** (Staff không được phép)
- 📧 Email sẽ được gửi đến `customerEmail` của booking
- ⚠️ Nếu không có email, backend sẽ báo lỗi

## Scope

**Implemented**: 
- ✅ Shop Bookings Page (List & Detail Modal)
- ✅ Service layer method
- ✅ Error handling
- ✅ Loading states
- ✅ Toast notifications

**Not Implemented**:
- ❌ Staff Dashboard (Staff không có quyền xuất hóa đơn)
- ❌ Customer-facing invoice view (chỉ qua email)
