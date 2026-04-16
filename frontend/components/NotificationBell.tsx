'use client';

import { useEffect, useState ,useRef  } from 'react';
import { useRouter } from 'next/navigation';

const PRIMARY = '#1B6CA8';

interface Notification {
  id: string;
  requestId: string;
  fullName: string;
  refNumber: string;
  assistanceType: string;
  region: string;
  time: Date;
  read: boolean;
}

const assistanceMap: Record<string, string> = {
  medical:   'علاج طبي',
  education: 'تعليم',
  financial: 'دعم معيشي',
};

export default function NotificationBell() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;
const lastVisitKeyRef = useRef('last_visit');

useEffect(() => {
  if (typeof window === 'undefined') return;

  const userData = localStorage.getItem('user');
  if (!userData) return;
  const user = JSON.parse(userData);

  //  مفتاح خاص لكل مستخدم
  lastVisitKeyRef.current = `last_visit_${user.id}`;
const lastVisit = localStorage.getItem(lastVisitKeyRef.current) || new Date(0).toISOString();

  // جيب الطلبات الجديدة
  const fetchNewRequests = async () => {
    try {
      const { default: api } = await import('@/lib/axios');
      const res = await api.get('/requests?status=new');
      const newReqs = res.data.data || [];
      const filtered = newReqs.filter((r: any) =>
        new Date(r.created_at) > new Date(lastVisit)
      );
      const mapped = filtered.map((r: any) => ({
        id:             String(r.id),
        requestId:      String(r.id),
        fullName:       r.full_name,
        refNumber:      r.ref_number,
        assistanceType: r.assistance_type,
        region:         r.region,
        time:           new Date(r.created_at),
        read:           false,
      }));
      setNotifications(mapped);
    } catch {}
  };

  fetchNewRequests();
  localStorage.setItem(lastVisitKeyRef.current, new Date().toISOString());
  const { getEcho } = require('@/lib/echo');
  const echoInstance = getEcho();

  // ✅ المدير يسمع كل الطلبات، الموظف يسمع طلباته بس
  if (user.role === 'manager') {
    echoInstance
      .channel('requests')
      .listen('.new.request', (data: any) => {
        setNotifications(prev => [{
          id:             Math.random().toString(36),
          requestId:      data.requestId,
          fullName:       data.fullName,
          refNumber:      data.refNumber,
          assistanceType: data.assistanceType,
          region:         data.region,
          time:           new Date(),
          read:           false,
        }, ...prev].slice(0, 20));
      });
  } else {
    echoInstance
      .channel(`employee-${user.id}`) // ← public channel خاص بالموظف
      .listen('.new.request', (data: any) => {
        setNotifications(prev => [{
          id:             Math.random().toString(36),
          requestId:      data.requestId,
          fullName:       data.fullName,
          refNumber:      data.refNumber,
          assistanceType: data.assistanceType,
          region:         data.region,
          time:           new Date(),
          read:           false,
        }, ...prev].slice(0, 20));
      });
  }

  return () => {
    if (user.role === 'manager') {
      echoInstance.leaveChannel('requests');
    } else {
      echoInstance.leaveChannel(`employee-${user.id}`);
    }
  };
}, []);

  const markAllRead = () => {
  setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  //  حفظ وقت القراءة
 localStorage.setItem(lastVisitKeyRef.current, new Date().toISOString());
};

  const handleNotificationClick = (notification: Notification) => {
    setNotifications(prev =>
      prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
    );
    setOpen(false);
    router.push(`/dashboard/requests/${notification.requestId}`);
  };

  const timeAgo = (date: Date) => {
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 60)  return 'الآن';
    if (diff < 3600) return `منذ ${Math.floor(diff / 60)} دقيقة`;
    return `منذ ${Math.floor(diff / 3600)} ساعة`;
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => { setOpen(!open); if (!open) markAllRead(); }}
        className="relative w-9 h-9 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-all"
      >
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -left-1 w-5 h-5 rounded-full text-white text-xs font-bold flex items-center justify-center animate-pulse"
            style={{ background: '#DC2626' }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-11 w-80 bg-white rounded-2xl border border-gray-100 shadow-xl z-50 overflow-hidden">

            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between"
              style={{ background: `${PRIMARY}08` }}>
              <div className="text-sm font-bold text-gray-900">الإشعارات</div>
              {notifications.length > 0 && (
                <button onClick={markAllRead} className="text-xs" style={{ color: PRIMARY }}>
                  تعليم الكل كمقروء
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="text-center py-10">
                  <svg className="w-10 h-10 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                  </svg>
                  <p className="text-xs text-gray-400">لا توجد إشعارات</p>
                </div>
              ) : (
                notifications.map(n => (
                  <div key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className="px-4 py-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-all flex gap-3"
                    style={{ background: n.read ? 'white' : `${PRIMARY}05` }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
                      style={{ background: n.read ? '#9CA3AF' : PRIMARY }}>
                      {n.fullName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-semibold text-gray-900 truncate">{n.fullName}</p>
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1" style={{ background: PRIMARY }}></span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {assistanceMap[n.assistanceType]} — {n.region}
                      </p>
                      <p className="text-xs mt-0.5 font-medium" style={{ color: PRIMARY }}>{n.refNumber}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{timeAgo(n.time)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        </>
      )}
    </div>
  );
}