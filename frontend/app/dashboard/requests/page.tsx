'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';import api from '@/lib/axios';
import NotificationBell from '@/components/NotificationBell';
import { exportRequests } from '@/lib/exportExcel';



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

const regions = [
  'دمشق', 'ريف دمشق', 'حلب', 'حمص', 'حماة',
  'اللاذقية', 'طرطوس', 'إدلب', 'الحسكة',
  'دير الزور', 'الرقة', 'السويداء', 'درعا', 'القنيطرة',
];

const BgPattern = () => (
  <div style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
    <svg width="100%" height="100%" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="dotsReq" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
          <circle cx="15" cy="15" r="1" fill="#1B6CA8" opacity="0.10"/>
        </pattern>
      </defs>
      <rect width="1200" height="800" fill="url(#dotsReq)"/>
      <circle cx="1150" cy="80" r="160" fill="none" stroke="#1B6CA8" strokeWidth="0.6" opacity="0.15"/>
      <circle cx="1150" cy="80" r="100" fill="none" stroke="#4AACCD" strokeWidth="0.6" opacity="0.15"/>
      <circle cx="60" cy="720" r="120" fill="none" stroke="#1B6CA8" strokeWidth="0.6" opacity="0.12"/>
      <line x1="900" y1="0" x2="1200" y2="300" stroke="#4AACCD" strokeWidth="0.5" opacity="0.12"/>
      <line x1="0" y1="550" x2="250" y2="800" stroke="#C9A84C" strokeWidth="0.5" opacity="0.12"/>
    </svg>
  </div>
);

export default function RequestsPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const [user, setUser]         = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filters, setFilters]   = useState({
    status:          searchParams.get('status')          || '',
    region:          searchParams.get('region')          || '',
    assistance_type: searchParams.get('assistance_type') || '',
    priority:        searchParams.get('priority')        || '',
    search:          searchParams.get('search')          || '',
  });
  const [pagination, setPagination] = useState<any>(null);
  const currentPage = Number(searchParams.get('page') || 1);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token    = localStorage.getItem('token');
    if (!token || !userData) { router.push('/dashboard/login'); return; }
    setUser(JSON.parse(userData));
  }, []);

  useEffect(() => {
    fetchRequests(currentPage);
  }, [searchParams]);

  const buildParams = (page?: number) => {
    const params = new URLSearchParams();
    if (page && page > 1)        params.set('page', String(page));
    if (filters.status)          params.set('status', filters.status);
    if (filters.region)          params.set('region', filters.region);
    if (filters.assistance_type) params.set('assistance_type', filters.assistance_type);
    if (filters.priority)        params.set('priority', filters.priority);
    if (filters.search)          params.set('search', filters.search);
    return params;
  };

  const updateURL = (page?: number) => {
    const params = buildParams(page);
    router.push(`/dashboard/requests?${params.toString()}`, { scroll: false });
  };

  const fetchRequests = async (page?: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (page && page > 1)        params.set('page', String(page));
      if (filters.status)          params.set('status', filters.status);
      if (filters.region)          params.set('region', filters.region);
      if (filters.assistance_type) params.set('assistance_type', filters.assistance_type);
      if (filters.priority)        params.set('priority', filters.priority);
      if (filters.search)          params.set('search', filters.search);

      const res = await api.get(`/requests?${params.toString()}`);
      setRequests(res.data.data || []);
      setPagination(res.data);
    } catch {
      router.push('/dashboard/login');
    } finally {
      setLoading(false);
    }
  };

  // عند تغيير الفلاتر — رجّع لصفحة 1 وحدّث URL
  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    const params = new URLSearchParams();
    if (newFilters.status)          params.set('status', newFilters.status);
    if (newFilters.region)          params.set('region', newFilters.region);
    if (newFilters.assistance_type) params.set('assistance_type', newFilters.assistance_type);
    if (newFilters.priority)        params.set('priority', newFilters.priority);
    if (newFilters.search)          params.set('search', newFilters.search);
    router.push(`/dashboard/requests?${params.toString()}`, { scroll: false });
  };

  const clearFilters = () => {
    setFilters({ status: '', region: '', assistance_type: '', priority: '', search: '' });
    router.push('/dashboard/requests', { scroll: false });
  };

  const handleLogout = async () => {
    await api.post('/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/dashboard/login');
  };

  const hasFilters = !!(filters.status || filters.region || filters.assistance_type || filters.priority || filters.search);
  const selectClass = "h-9 border border-gray-200 rounded-xl px-3 text-xs bg-white focus:outline-none text-gray-700";

  const renderTable = () => {
    if (loading) return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: PRIMARY }}></div>
      </div>
    );

    if (requests.length === 0) return (
      <div className="text-center py-20">
        <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
        </svg>
        <p className="text-sm text-gray-400">لا توجد طلبات</p>
      </div>
    );

    return (
      <>
        <div className="grid grid-cols-8 gap-0 px-5 py-3 border-b bg-gray-50" style={{ borderColor: `${PRIMARY}10` }}>
          {['مقدم الطلب', 'نوع المساعدة', 'الموظف المسؤول', 'المنطقة', 'الأولوية', 'الحالة', 'تاريخ التقديم', 'آخر تحديث'].map(h => (
            <div key={h} className="text-xs font-semibold text-gray-500">{h}</div>
          ))}
        </div>
        {requests.map((req) => {
          const status   = statusMap[req.status]     || statusMap.new;
          const priority = priorityMap[req.priority] || priorityMap.normal;
          return (
            <div key={req.id}
              onClick={() => router.push(`/dashboard/requests/${req.id}`)}
              className="grid grid-cols-8 gap-0 px-5 py-4 border-b cursor-pointer transition-all items-center"
              style={{ borderColor: `${PRIMARY}08` }}
              onMouseEnter={e => (e.currentTarget.style.background = `${PRIMARY}05`)}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <div>
                <div className="text-sm font-semibold text-gray-900">{req.full_name}</div>
                <div className="text-xs text-gray-400 mt-0.5">{req.phone}</div>
              </div>
              <div className="text-sm text-gray-600">{assistanceMap[req.assistance_type] || req.assistance_type}</div>
              <div className="text-sm text-gray-600">{req.assigned_to?.name || <span className="text-gray-300">غير معيّن</span>}</div>
              <div className="text-sm text-gray-600">{req.region}</div>
              <div className="text-sm font-semibold" style={{ color: priority.color }}>{priority.label}</div>
              <div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full"
                  style={{ background: status.bg, color: status.color }}>
                  {status.label}
                </span>
              </div>
              <div className="text-xs text-gray-400">{new Date(req.created_at).toLocaleDateString('ar-SA')}</div>
              <div className="text-xs text-gray-400">{new Date(req.updated_at).toLocaleDateString('ar-SA')}</div>
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
      <nav style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${PRIMARY}20`, position: 'sticky', top: 0, zIndex: 50 }}>
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
              style={{ background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_L})` }}>غ</div>
            <div>
              <div className="text-sm font-bold text-gray-900">إدارة الطلبات</div>
              <div className="text-xs" style={{ color: PRIMARY_L }}>مؤسسة غزلان الخير</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {user?.role === 'manager' && (
              <button onClick={() => router.push('/dashboard/manager')}
                className="text-xs px-3 py-2 rounded-xl border transition-all text-gray-600 hover:bg-white"
                style={{ borderColor: `${PRIMARY}30`, background: `${PRIMARY}06` }}>
                لوحة المدير
              </button>
            )}
            <NotificationBell />
            <div className="flex items-center gap-2 rounded-xl px-3 py-2"
              style={{ background: user?.role === 'manager' ? `${GOLD}15` : `${PRIMARY}10`, border: `1px solid ${user?.role === 'manager' ? GOLD : PRIMARY}20` }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ background: `linear-gradient(135deg, ${user?.role === 'manager' ? GOLD : PRIMARY}, ${user?.role === 'manager' ? '#E8C96A' : PRIMARY_L})` }}>
                {user?.name?.charAt(0)}
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-900">{user?.name}</div>
                <div className="text-xs" style={{ color: user?.role === 'manager' ? GOLD : PRIMARY_L }}>{user?.role === 'manager' ? 'مدير' : 'موظف'}</div>
              </div>
            </div>
            <button onClick={handleLogout}
              className="text-xs px-3 py-2 rounded-xl text-red-500 hover:bg-red-50 transition-all border border-red-100">
              خروج
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-6" style={{ position: 'relative', zIndex: 1 }}>

        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">قائمة الطلبات</h1>
            <p className="text-xs text-gray-400 mt-0.5">{pagination?.total || 0} طلب إجمالاً</p>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-2xl p-4 mb-4"
          style={{ background: 'white', border: `1px solid ${PRIMARY}15`, boxShadow: `0 2px 12px ${PRIMARY}08` }}>
          <div className="flex gap-3 flex-wrap items-center">
            <input value={filters.search}
              onChange={e => handleFilterChange('search', e.target.value)}
              placeholder="ابحث بالاسم أو الهاتف..."
              className="flex-1 min-w-48 h-9 border border-gray-200 rounded-xl px-3 text-xs bg-gray-50 focus:outline-none focus:bg-white transition-all text-gray-700"/>
            <select value={filters.status} onChange={e => handleFilterChange('status', e.target.value)} className={selectClass}>
              <option value="">كل الحالات</option>
              <option value="new">جديد</option>
              <option value="reviewing">قيد المراجعة</option>
              <option value="needs_info">يحتاج معلومات</option>
              <option value="approved">مقبول</option>
              <option value="rejected">مرفوض</option>
            </select>
            <select value={filters.assistance_type} onChange={e => handleFilterChange('assistance_type', e.target.value)} className={selectClass}>
              <option value="">كل أنواع المساعدة</option>
              <option value="medical">علاج طبي</option>
              <option value="education">تعليم</option>
              <option value="financial">دعم معيشي</option>
            </select>
            <select value={filters.priority} onChange={e => handleFilterChange('priority', e.target.value)} className={selectClass}>
              <option value="">كل الأولويات</option>
              <option value="high">عالية</option>
              <option value="medium">متوسطة</option>
              <option value="normal">عادية</option>
            </select>
            <select value={filters.region} onChange={e => handleFilterChange('region', e.target.value)} className={selectClass}>
              <option value="">كل المحافظات</option>
              {regions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            {hasFilters && (
              <button onClick={clearFilters}
                className="text-xs text-red-500 hover:text-red-700 px-3 py-2 rounded-xl hover:bg-red-50 transition-all border border-red-100">
                مسح الفلاتر
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'white', border: `1px solid ${PRIMARY}15`, boxShadow: `0 2px 12px ${PRIMARY}08` }}>
          {renderTable()}
        </div>

        {/* Pagination */}
        {pagination && pagination.last_page > 1 && (
          <div className="flex items-center justify-between mt-4 rounded-2xl px-5 py-3"
            style={{ background: 'white', border: `1px solid ${PRIMARY}15` }}>
            <p className="text-xs text-gray-400">
              عرض {pagination.from}–{pagination.to} من {pagination.total} طلب
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => updateURL(currentPage - 1)} disabled={currentPage === 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                </svg>
              </button>
              {Array.from({ length: pagination.last_page }, (_, i) => i + 1)
                .filter(p => p === 1 || p === pagination.last_page || Math.abs(p - currentPage) <= 1)
                .reduce((acc: (number | string)[], p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('...');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) => p === '...' ? (
                  <span key={i} className="w-8 h-8 flex items-center justify-center text-xs text-gray-400">...</span>
                ) : (
                  <button key={i} onClick={() => updateURL(p as number)}
                    className="w-8 h-8 rounded-lg text-xs font-medium transition-all"
                    style={{ background: currentPage === p ? PRIMARY : 'transparent', color: currentPage === p ? 'white' : '#6B7280' }}>
                    {p}
                  </button>
                ))}
              <button onClick={() => updateURL(currentPage + 1)} disabled={currentPage === pagination.last_page}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
                </svg>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}