import React, { useState } from 'react';

type Setting = { id: string; label: string; desc: string; icon: string; on: boolean };

const SETTINGS_GROUPS = [
    {
        title: 'Lịch hẹn',
        items: [
            { id: 'remind_48h', label: 'Nhắc lịch trước 48 giờ', desc: 'Nhận thông báo 2 ngày trước lịch hẹn', icon: 'schedule', on: true },
            { id: 'remind_1h', label: 'Nhắc lịch trước 1 giờ', desc: 'Nhận thông báo 1 giờ trước lịch hẹn', icon: 'alarm', on: true },
            { id: 'cancel', label: 'Hủy/thay đổi lịch', desc: 'Khi cơ sở hủy hoặc thay đổi lịch hẹn của bạn', icon: 'event_busy', on: true },
        ],
    },
    {
        title: 'Thanh toán',
        items: [
            { id: 'payment_success', label: 'Xác nhận thanh toán', desc: 'Khi đặt lịch hoặc thanh toán thành công', icon: 'check_circle', on: true },
            { id: 'refund', label: 'Hoàn tiền', desc: 'Khi có phát sinh hoàn tiền về ví', icon: 'currency_exchange', on: false },
        ],
    },
    {
        title: 'Khuyến mãi & Tin tức',
        items: [
            { id: 'promo', label: 'Ưu đãi & Voucher', desc: 'Nhận thông báo về các mã giảm giá hấp dẫn', icon: 'local_offer', on: false },
            { id: 'news', label: 'Tin tức thú y', desc: 'Bài viết và lời khuyên chăm sóc thú cưng', icon: 'newspaper', on: true },
        ],
    },
];

export default function ProfileNotifications() {
    const [settings, setSettings] = useState<Record<string, boolean>>(
        Object.fromEntries(SETTINGS_GROUPS.flatMap(g => g.items).map(i => [i.id, i.on]))
    );
    const [saved, setSaved] = useState(false);

    const toggle = (id: string) => setSettings(prev => ({ ...prev, [id]: !prev[id] }));

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <main className="flex-1 flex flex-col gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Thông báo</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Tùy chỉnh các thông báo bạn muốn nhận.</p>
                </div>

                {saved && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-center gap-3 text-green-700 dark:text-green-300">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        <span className="font-semibold text-sm">Đã lưu cài đặt thông báo!</span>
                    </div>
                )}

                {/* Channel */}
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                    <h2 className="font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#1a2b4c] dark:text-teal-400">hub</span>
                        Kênh thông báo
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                            { icon: 'notifications', label: 'Thông báo App', on: true },
                            { icon: 'mail', label: 'Email', on: true },
                            { icon: 'phone_in_talk', label: 'SMS', on: false },
                        ].map(c => (
                            <div key={c.label} className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${c.on ? 'border-[#1a2b4c]/30 bg-[#1a2b4c]/5 dark:border-teal-500/30 dark:bg-teal-900/10' : 'border-slate-200 dark:border-slate-700'}`}>
                                <div className="flex items-center gap-3">
                                    <span className={`material-symbols-outlined ${c.on ? 'text-[#1a2b4c] dark:text-teal-400' : 'text-slate-400'}`}>{c.icon}</span>
                                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{c.label}</span>
                                </div>
                                <div className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${c.on ? 'bg-teal-500' : 'bg-slate-200 dark:bg-slate-600'}`}>
                                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${c.on ? 'left-5' : 'left-0.5'}`} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Settings groups */}
                {SETTINGS_GROUPS.map(group => (
                    <div key={group.title} className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                            <h2 className="font-bold text-slate-700 dark:text-slate-300 text-sm uppercase tracking-wider">{group.title}</h2>
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {group.items.map(item => (
                                <div key={item.id} className="flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="size-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                                            <span className="material-symbols-outlined text-lg">{item.icon}</span>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{item.label}</p>
                                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{item.desc}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => toggle(item.id)}
                                        className={`w-12 h-6 rounded-full relative transition-colors shrink-0 ${settings[item.id] ? 'bg-teal-500' : 'bg-slate-200 dark:bg-slate-600'}`}
                                    >
                                        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${settings[item.id] ? 'left-7' : 'left-1'}`} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                <div className="flex justify-end">
                    <button onClick={handleSave} className="px-8 py-3 bg-[#1a2b4c] text-white font-bold rounded-xl shadow-lg shadow-[#1a2b4c]/20 hover:opacity-90 transition-opacity">
                        Lưu cài đặt
                    </button>
                </div>
            </main>
    );
}
