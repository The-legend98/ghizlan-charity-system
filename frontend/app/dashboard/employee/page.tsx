'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import NotificationBell from '@/components/NotificationBell';

const PRIMARY   = '#1B6CA8';
const PRIMARY_L = '#4AACCD';
const GOLD      = '#C9A84C';

const statusMap: Record<string, { label: string; color: string; bg: string }> = {
  new:          { label: 'جديد',            color: PRIMARY,   bg: `${PRIMARY}15` },
  reviewing:    { label: 'قيد المراجعة',    color: '#D97706', bg: '#FEF3C7' },
  needs_info:   { label: 'يحتاج معلومات',   color: '#7C3AED', bg: '#EDE9FE' },
  approved:     { label: 'مقبول',           color: '#059669', bg: '#D1FAE5' },
  rejected:     { label: 'مرفوض',           color: '#DC2626', bg: '#FEE2E2' },
};

const assistanceMap: Record<string, string> = {
  medical: 'علاج طبي', education: 'تعليم', financial: 'دعم معيشي',
};

const priorityMap: Record<string, { label: string; color: string }> = {
  high:   { label: 'عالية',   color: '#DC2626' },
  medium: { label: 'متوسطة', color: '#D97706' },
  normal: { label: 'عادية',   color: '#6B7280' },
};

const BgPattern = () => (
  <div style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
    <svg width="100%" height="100%" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="dots2" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
          <circle cx="15" cy="15" r="1" fill="#1B6CA8" opacity="0.12"/>
        </pattern>
      </defs>
      <rect width="1200" height="800" fill="url(#dots2)"/>
      <circle cx="1150" cy="80" r="160" fill="none" stroke="#1B6CA8" strokeWidth="0.6" opacity="0.2"/>
      <circle cx="1150" cy="80" r="100" fill="none" stroke="#4AACCD" strokeWidth="0.6" opacity="0.2"/>
      <circle cx="1150" cy="80" r="50" fill="none" stroke="#C9A84C" strokeWidth="0.6" opacity="0.2"/>
      <circle cx="60" cy="720" r="130" fill="none" stroke="#1B6CA8" strokeWidth="0.6" opacity="0.15"/>
      <circle cx="60" cy="720" r="80" fill="none" stroke="#4AACCD" strokeWidth="0.6" opacity="0.15"/>
      <line x1="900" y1="0" x2="1200" y2="300" stroke="#4AACCD" strokeWidth="0.5" opacity="0.15"/>
      <line x1="930" y1="0" x2="1200" y2="270" stroke="#1B6CA8" strokeWidth="0.5" opacity="0.1"/>
      <line x1="0" y1="550" x2="250" y2="800" stroke="#C9A84C" strokeWidth="0.5" opacity="0.15"/>
    </svg>
  </div>
);

export default function EmployeeDashboard() {
  const router = useRouter();
  const [user, setUser]         = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination]     = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token    = localStorage.getItem('token');
    if (!token || !userData) { router.push('/dashboard/login'); return; }
    const parsed = JSON.parse(userData);
    if (parsed.role === 'manager') { router.push('/dashboard/manager'); return; }
    setUser(parsed);
    fetchRequests();
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [search, statusFilter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search)       params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      const res = await api.get(`/requests?${params.toString()}`);
      setRequests(res.data.data || []);
      setPagination(res.data);
    } catch {
      router.push('/dashboard/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await api.post('/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/dashboard/login');
  };

  const total   = pagination?.total || 0;
  const stats = {
    new:       requests.filter(r => r.status === 'new').length,
    reviewing: requests.filter(r => r.status === 'reviewing').length,
    approved:  requests.filter(r => r.status === 'approved').length,
    rejected:  requests.filter(r => r.status === 'rejected').length,
    pending:   requests.filter(r => ['new', 'reviewing', 'needs_info'].includes(r.status)).length,
  };

  if (loading && !user) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#EEF5FB' }}>
      <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: PRIMARY }}></div>
    </div>
  );

  const renderTable = () => {
    if (loading) return (
      <div className="flex items-center justify-center py-16">
        <div className="w-7 h-7 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: PRIMARY }}></div>
      </div>
    );

    if (requests.length === 0) return (
      <div className="text-center py-16">
        <svg className="w-10 h-10 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
        </svg>
        <p className="text-sm text-gray-400">لا توجد طلبات مسندة إليك</p>
      </div>
    );

    return (
      <>
        <div className="grid grid-cols-6 gap-0 px-5 py-3 border-b border-gray-100 bg-gray-50">
          {['مقدم الطلب', 'نوع المساعدة', 'المنطقة', 'الأولوية', 'الحالة', 'تاريخ التقديم'].map(h => (
            <div key={h} className="text-xs font-medium text-gray-500">{h}</div>
          ))}
        </div>
        {requests.map(req => {
          const status   = statusMap[req.status]   || statusMap.new;
          const priority = priorityMap[req.priority] || priorityMap.normal;
          return (
            <div key={req.id}
              onClick={() => router.push(`/dashboard/requests/${req.id}`)}
              className="grid grid-cols-6 gap-0 px-5 py-4 border-b border-gray-50 hover:bg-blue-50 cursor-pointer transition-all items-center">
              <div>
                <div className="text-sm font-medium text-gray-900">{req.full_name}</div>
                <div className="text-xs text-gray-400 mt-0.5">{req.phone}</div>
              </div>
              <div className="text-sm text-gray-600">{assistanceMap[req.assistance_type] || req.assistance_type}</div>
              <div className="text-sm text-gray-600">{req.region}</div>
              <div className="text-sm font-medium" style={{ color: priority.color }}>{priority.label}</div>
              <div>
                <span className="text-xs font-medium px-3 py-1 rounded-full"
                  style={{ background: status.bg, color: status.color }}>
                  {status.label}
                </span>
              </div>
              <div className="text-xs text-gray-400">
                {new Date(req.created_at).toLocaleDateString('ar-SA')}
              </div>
            </div>
          );
        })}
      </>
    );
  };

  return (
    <div className="min-h-screen" style={{ background: '#EEF5FB', position: 'relative' }} dir="rtl">
      <BgPattern />

      {/* Navbar */}
      <nav style={{
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${PRIMARY}20`,
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
              style={{ background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_L})` }}>غ</div>
            <div>
              <div className="text-sm font-bold text-gray-900">لوحة الموظف</div>
              <div className="text-xs" style={{ color: PRIMARY_L }}>مؤسسة غزلان الخير</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <div className="flex items-center gap-2 rounded-xl px-3 py-2"
              style={{ background: `${PRIMARY}10`, border: `1px solid ${PRIMARY}20` }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_L})` }}>
                {user?.name?.charAt(0)}
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-900">{user?.name}</div>
                <div className="text-xs" style={{ color: PRIMARY_L }}>موظف</div>
              </div>
            </div>
            <button onClick={handleLogout}
              className="text-xs px-3 py-2 rounded-xl text-red-500 hover:bg-red-50 transition-all border border-red-100">
              خروج
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8" style={{ position: 'relative', zIndex: 1 }}>

        {/* Welcome Card */}
        <div className="rounded-2xl p-6 mb-6 text-white relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${PRIMARY_L} 100%)` }}>
          <div style={{ position: 'absolute', top: -50, left: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }}/>
          <div style={{ position: 'absolute', bottom: -40, right: 60, width: 150, height: 150, borderRadius: '50%', background: 'rgba(201,168,76,0.15)' }}/>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 mb-3 px-3 py-1.5 rounded-full text-xs font-medium"
              style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <span className="w-2 h-2 rounded-full bg-green-400 inline-block animate-pulse"></span>
              طلباتك المسندة إليك
            </div>
            <h1 className="text-xl font-bold mb-1">مرحباً، {user?.name} 👋</h1>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>هيك ملخص طلباتك اليوم</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-5">
          {[
            { label: 'إجمالي طلباتي', value: total,        color: PRIMARY,   borderColor: PRIMARY },
            { label: 'جديدة',          value: stats.new,    color: PRIMARY_L, borderColor: PRIMARY_L },
            { label: 'قيد المراجعة',   value: stats.reviewing, color: '#D97706', borderColor: '#D97706' },
            { label: 'مقبولة',         value: stats.approved,  color: '#059669', borderColor: '#059669' },
            { label: 'مرفوضة',         value: stats.rejected,  color: '#DC2626', borderColor: '#DC2626' },
          ].map(stat => (
            <div key={stat.label} className="rounded-2xl p-4 text-center"
              style={{
                background: 'white',
                border: `1px solid ${stat.borderColor}20`,
                borderTop: `3px solid ${stat.borderColor}`,
                boxShadow: `0 2px 12px ${stat.color}10`
              }}>
              <div className="text-2xl font-bold mb-1" style={{ color: stat.color }}>{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Performance */}
        <div className="rounded-2xl p-5 mb-5"
          style={{ background: 'white', border: `1px solid ${PRIMARY}15`, boxShadow: `0 2px 12px ${PRIMARY}08` }}>
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-5 h-5 rounded" style={{ background: `${GOLD}20` }}>
              <svg className="w-5 h-5" fill="none" stroke={GOLD} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
            </div>
            أدائي
          </h3>
          <div className="grid grid-cols-3 gap-6">
            {[
              { label: 'نسبة القبول',   value: total ? Math.round((stats.approved / total) * 100) : 0, color: '#059669' },
              { label: 'طلبات معلّقة',  value: total ? Math.round((stats.pending  / total) * 100) : 0, color: '#D97706' },
              { label: 'نسبة الرفض',    value: total ? Math.round((stats.rejected / total) * 100) : 0, color: '#DC2626' },
            ].map(p => (
              <div key={p.label} className="text-center">
                <div className="text-2xl font-bold mb-1" style={{ color: p.color }}>{p.value}%</div>
                <div className="text-xs text-gray-400 mb-2">{p.label}</div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${p.value}%`, background: p.color, opacity: 0.75 }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-2xl p-4 mb-4"
          style={{ background: 'white', border: `1px solid ${PRIMARY}15` }}>
          <div className="flex gap-3 flex-wrap items-center">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="ابحث بالاسم أو الهاتف..."
              className="flex-1 min-w-48 h-9 border border-gray-200 rounded-xl px-3 text-xs bg-gray-50 focus:outline-none focus:bg-white transition-all text-gray-700"
            />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="h-9 border border-gray-200 rounded-xl px-3 text-xs bg-white focus:outline-none text-gray-700">
              <option value="">كل الحالات</option>
              <option value="new">جديد</option>
              <option value="reviewing">قيد المراجعة</option>
              <option value="needs_info">يحتاج معلومات</option>
              <option value="approved">مقبول</option>
              <option value="rejected">مرفوض</option>
            </select>
            {(search || statusFilter) && (
              <button onClick={() => { setSearch(''); setStatusFilter(''); }}
                className="text-xs text-red-500 px-3 py-2 rounded-xl hover:bg-red-50 border border-red-100">
                مسح
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'white', border: `1px solid ${PRIMARY}15`, boxShadow: `0 2px 12px ${PRIMARY}08` }}>
          {renderTable()}
        </div>

      </div>
    </div>
  );
}