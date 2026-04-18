'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/axios';
import NotificationBell from '@/components/NotificationBell';

const PRIMARY   = '#1B6CA8';
const PRIMARY_L = '#4AACCD';
const GOLD      = '#C9A84C';

const statusMap: Record<string, { label: string; color: string; bg: string }> = {
  new:        { label: 'جديد',           color: PRIMARY,   bg: `${PRIMARY}15` },
  reviewing:  { label: 'قيد المراجعة',  color: '#D97706', bg: '#FEF3C7' },
  needs_info: { label: 'يحتاج معلومات', color: '#7C3AED', bg: '#EDE9FE' },
  approved:   { label: 'مقبول',          color: '#059669', bg: '#D1FAE5' },
  rejected:   { label: 'مرفوض',          color: '#DC2626', bg: '#FEE2E2' },
};

const assistanceMap: Record<string, string> = {
  medical: 'علاج طبي', education: 'تعليم', financial: 'دعم معيشي',
};

const priorityMap: Record<string, { label: string; color: string }> = {
  high:   { label: 'عالية',   color: '#DC2626' },
  medium: { label: 'متوسطة', color: '#D97706' },
  normal: { label: 'عادية',   color: '#6B7280' },
};

const regions = ['دمشق','ريف دمشق','حلب','حمص','حماة','اللاذقية','طرطوس','إدلب','الحسكة','دير الزور','الرقة','السويداء','درعا','القنيطرة'];

const BgPattern = () => (
  <div style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
    <svg width="100%" height="100%" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
      <defs>
        <pattern id="dotsReq" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
          <circle cx="15" cy="15" r="1" fill="#1B6CA8" opacity="0.10"/>
        </pattern>
      </defs>
      <rect width="1200" height="800" fill="url(#dotsReq)"/>
      <circle cx="1150" cy="80" r="160" fill="none" stroke="#1B6CA8" strokeWidth="0.6" opacity="0.15"/>
      <circle cx="60" cy="720" r="120" fill="none" stroke="#1B6CA8" strokeWidth="0.6" opacity="0.12"/>
      <line x1="900" y1="0" x2="1200" y2="300" stroke="#4AACCD" strokeWidth="0.5" opacity="0.12"/>
    </svg>
  </div>
);

function RequestsPageContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const [user, setUser]         = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showFilters, setShowFilters] = useState(false);
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

  useEffect(() => { fetchRequests(currentPage); }, [searchParams]);

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
    } catch { router.push('/dashboard/login'); }
    finally { setLoading(false); }
  };

  const updateURL = (page?: number) => {
    const params = new URLSearchParams();
    if (page && page > 1)        params.set('page', String(page));
    if (filters.status)          params.set('status', filters.status);
    if (filters.region)          params.set('region', filters.region);
    if (filters.assistance_type) params.set('assistance_type', filters.assistance_type);
    if (filters.priority)        params.set('priority', filters.priority);
    if (filters.search)          params.set('search', filters.search);
    router.push(`/dashboard/requests?${params.toString()}`, { scroll: false });
  };

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

  const selectStyle: React.CSSProperties = {
    height: 36, border: `1px solid #E5E7EB`, borderRadius: 10,
    padding: '0 10px', fontSize: 12, background: 'white',
    color: '#374151', outline: 'none', width: '100%',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#EEF5FB', position: 'relative' }} dir="rtl">
      <BgPattern />

     {/* ══ NAVBAR ══ */}
      <nav style={{
  background: 'rgba(255,255,255,0.93)', backdropFilter: 'blur(12px)',
  borderBottom: `1px solid ${PRIMARY}20`, position: 'sticky', top: 0, zIndex: 50,
}}>
  <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px', height: 62, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, width: '100%' }}>

    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
      {user?.role === 'manager' && (
        <button onClick={() => router.push('/dashboard/manager')}
          style={{ width: 34, height: 34, borderRadius: 9, border: `1px solid ${PRIMARY}20`, background: `${PRIMARY}06`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${PRIMARY}12`; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = `${PRIMARY}06`; }}>
          <svg width="15" height="15" fill="none" stroke={PRIMARY} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
        onClick={() => router.push(user?.role === 'manager' ? '/dashboard/manager' : '/dashboard/requests')}>
        <img src="/g-logo.png" alt="غزلان الخير"
          style={{ width: 38, height: 38, objectFit: 'contain' }}
          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}/>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#111827', letterSpacing: '-0.2px', lineHeight: 1.2 }}>إدارة الطلبات</div>
          <div style={{ fontSize: 8, color: PRIMARY_L, letterSpacing: '1px', textTransform: 'uppercase' as const, fontWeight: 500 }}>Ghozlan Alkhair</div>
        </div>
      </div>
    </div>

    {/* Actions */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {user?.role === 'manager' && (
        <button onClick={() => router.push('/dashboard/manager')} className="req-hide-mobile"
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '7px 13px', borderRadius: 10, border: `1px solid ${PRIMARY}25`, background: `${PRIMARY}06`, color: '#4B5563', cursor: 'pointer', fontWeight: 500, transition: 'all 0.2s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${PRIMARY}12`; (e.currentTarget as HTMLElement).style.color = PRIMARY; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = `${PRIMARY}06`; (e.currentTarget as HTMLElement).style.color = '#4B5563'; }}>
          <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1" strokeWidth="2"/><rect x="14" y="3" width="7" height="7" rx="1" strokeWidth="2"/><rect x="3" y="14" width="7" height="7" rx="1" strokeWidth="2"/><rect x="14" y="14" width="7" height="7" rx="1" strokeWidth="2"/></svg>
          لوحة المدير
        </button>
      )}

      <NotificationBell />

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 10, background: user?.role === 'manager' ? `${GOLD}15` : `${PRIMARY}08`, border: `1px solid ${user?.role === 'manager' ? GOLD + '30' : PRIMARY + '20'}` }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: `linear-gradient(135deg, ${user?.role === 'manager' ? GOLD : PRIMARY}, ${user?.role === 'manager' ? '#E8C96A' : PRIMARY_L})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 11, fontWeight: 800, flexShrink: 0 }}>
          {user?.name?.charAt(0)}
        </div>
        <div className="req-hide-mobile">
          <div style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>{user?.name}</div>
          <div style={{ fontSize: 9, color: user?.role === 'manager' ? GOLD : PRIMARY_L }}>{user?.role === 'manager' ? 'مدير' : 'موظف'}</div>
        </div>
      </div>

      <button onClick={handleLogout}
        style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: '#DC2626', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '7px 13px', cursor: 'pointer', transition: 'all 0.2s' }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FEE2E2'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#FEF2F2'; }}>
        <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
        <span className="req-hide-mobile">خروج</span>
      </button>
    </div>

  </div>
</nav>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '16px', position: 'relative', zIndex: 1 }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 800, color: '#111827', margin: 0 }}>قائمة الطلبات</h1>
            <p style={{ fontSize: 11, color: '#9CA3AF', margin: '2px 0 0' }}>{pagination?.total || 0} طلب إجمالاً</p>
          </div>
          {/* زر الفلاتر على الموبايل */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="req-filter-btn"
            style={{ display: 'none', alignItems: 'center', gap: 6, fontSize: 12, padding: '7px 14px', borderRadius: 10, border: `1px solid ${PRIMARY}25`, background: hasFilters ? `${PRIMARY}12` : 'white', color: hasFilters ? PRIMARY : '#4B5563', fontWeight: 600, cursor: 'pointer' }}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M7 12h10M11 20h2"/>
            </svg>
            فلترة {hasFilters && `(${[filters.status,filters.region,filters.assistance_type,filters.priority,filters.search].filter(Boolean).length})`}
          </button>
        </div>


        {/* ── تنبيهات الطلبات ── */}
      {(() => {
        const staleRequests = requests.filter(r => {
          const days = Math.floor((Date.now() - new Date(r.updated_at).getTime()) / (1000 * 60 * 60 * 24));
          return ['new','reviewing','needs_info'].includes(r.status) && days >= 5;
        });
      const followUpToday = requests.filter(r => {
        const doc = r.case_documentation;
        if (!doc?.needs_follow_up || !doc?.follow_up_date) return false;
        if (!['pending','scheduled','rescheduled'].includes(doc.follow_up_status)) return false;
        const diff = Math.floor((new Date(doc.follow_up_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return diff <= 1;
      });
        if (!staleRequests.length && !followUpToday.length) return null;
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
            {staleRequests.length > 0 && (
              <div style={{ borderRadius: 14, padding: '12px 16px', background: '#FEF3C7', border: '1px solid #FDE68A', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <svg width="18" height="18" fill="none" stroke="#D97706" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1 }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#92400E', marginBottom: 6 }}>
                    ⚠️ {staleRequests.length} طلب بدون تحديث أكثر من 5 أيام
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {staleRequests.map(r => {
                      const days = Math.floor((Date.now() - new Date(r.updated_at).getTime()) / (1000 * 60 * 60 * 24));
                      return (
                        <button key={r.id} onClick={() => router.push(`/dashboard/requests/${r.id}`)}
                          style={{ fontSize: 11, padding: '4px 10px', borderRadius: 8, background: '#FEF9C3', border: '1px solid #FDE68A', color: '#92400E', cursor: 'pointer', fontWeight: 600 }}>
                          {r.full_name} — {days} أيام
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
            {followUpToday.length > 0 && (
              <div style={{ borderRadius: 14, padding: '12px 16px', background: '#EDE9FE', border: '1px solid #DDD6FE', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <svg width="18" height="18" fill="none" stroke="#7C3AED" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1 }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#5B21B6', marginBottom: 6 }}>
                     {followUpToday.length} موعد متابعة اليوم أو غداً
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {followUpToday.map(r => (
                      <button key={r.id} onClick={() => router.push(`/dashboard/requests/${r.id}`)}
                        style={{ fontSize: 11, padding: '4px 10px', borderRadius: 8, background: '#F5F3FF', border: '1px solid #DDD6FE', color: '#5B21B6', cursor: 'pointer', fontWeight: 600 }}>
                        {r.full_name} — {new Date(r.follow_up_date).toLocaleDateString('ar-SA')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })()}

        {/* ── Filters ── */}
        <div className={`req-filters ${showFilters ? 'req-filters-open' : ''}`} style={{ background: 'white', borderRadius: 16, padding: '14px', marginBottom: 14, border: `1px solid ${PRIMARY}15`, boxShadow: `0 2px 12px ${PRIMARY}08` }}>
          <div className="req-filters-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, alignItems: 'center' }}>
            <input value={filters.search}
              onChange={e => handleFilterChange('search', e.target.value)}
              placeholder="ابحث بالاسم أو الهاتف..."
              style={{ ...selectStyle, gridColumn: 'span 2' } as any}
              className="req-search-full"
            />
            <select value={filters.status} onChange={e => handleFilterChange('status', e.target.value)} style={selectStyle}>
              <option value="">كل الحالات</option>
              <option value="new">جديد</option>
              <option value="reviewing">قيد المراجعة</option>
              <option value="needs_info">يحتاج معلومات</option>
              <option value="approved">مقبول</option>
              <option value="rejected">مرفوض</option>
            </select>
            <select value={filters.assistance_type} onChange={e => handleFilterChange('assistance_type', e.target.value)} style={selectStyle}>
              <option value="">كل الأنواع</option>
              <option value="medical">علاج طبي</option>
              <option value="education">تعليم</option>
              <option value="financial">دعم معيشي</option>
            </select>
            <select value={filters.priority} onChange={e => handleFilterChange('priority', e.target.value)} style={selectStyle}>
              <option value="">كل الأولويات</option>
              <option value="high">عالية</option>
              <option value="medium">متوسطة</option>
              <option value="normal">عادية</option>
            </select>
            <select value={filters.region} onChange={e => handleFilterChange('region', e.target.value)} style={selectStyle} className="req-region">
              <option value="">كل المحافظات</option>
              {regions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            {hasFilters && (
              <button onClick={clearFilters}
                style={{ fontSize: 11, color: '#DC2626', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 9, padding: '7px 12px', cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap' }}>
                مسح الفلاتر
              </button>
            )}
          </div>
        </div>

        {/* ── Desktop Table ── */}
        <div className="req-table" style={{ background: 'white', borderRadius: 16, border: `1px solid ${PRIMARY}15`, boxShadow: `0 2px 12px ${PRIMARY}08`, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 0' }}>
              <div style={{ width: 32, height: 32, border: `2px solid ${PRIMARY}30`, borderTopColor: PRIMARY, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}/>
            </div>
          ) : requests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <svg style={{ width: 44, height: 44, margin: '0 auto 10px', color: '#D1D5DB', display: 'block' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
              <p style={{ fontSize: 13, color: '#9CA3AF' }}>لا توجد طلبات</p>
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 0.8fr 1fr 0.9fr', padding: '10px 16px', background: '#F8FAFC', borderBottom: `1px solid ${PRIMARY}10` }}>
                {['مقدم الطلب', 'نوع المساعدة', 'الموظف', 'المنطقة', 'الأولوية', 'الحالة', 'التاريخ'].map(h => (
                  <div key={h} style={{ fontSize: 11, fontWeight: 700, color: '#6B7280' }}>{h}</div>
                ))}
              </div>
              {/* Table Rows */}
              {requests.map(req => {
                const status   = statusMap[req.status]     || statusMap.new;
                const priority = priorityMap[req.priority] || priorityMap.normal;
                return (
                  <div key={req.id}
                    onClick={() => router.push(`/dashboard/requests/${req.id}`)}
                    style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 0.8fr 1fr 0.9fr', padding: '12px 16px', borderBottom: `1px solid ${PRIMARY}06`, cursor: 'pointer', transition: 'background 0.15s', alignItems: 'center' }}
                    onMouseEnter={e => (e.currentTarget.style.background = `${PRIMARY}04`)}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{req.full_name}</div>
                      <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{req.phone}</div>
                    </div>
                    <div style={{ fontSize: 12, color: '#6B7280' }}>{assistanceMap[req.assistance_type] || req.assistance_type}</div>
                    <div style={{ fontSize: 12, color: '#6B7280' }}>{req.assigned_to?.name || <span style={{ color: '#D1D5DB' }}>غير معيّن</span>}</div>
                    <div style={{ fontSize: 12, color: '#6B7280' }}>{req.region}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: priority.color }}>{priority.label}</div>
                    <div>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100, background: status.bg, color: status.color }}>
                        {status.label}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: '#9CA3AF' }}>{new Date(req.created_at).toLocaleDateString('ar-SA')}</div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* ── Mobile Cards ── */}
        <div className="req-cards" style={{ display: 'none', flexDirection: 'column', gap: 10 }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 0' }}>
              <div style={{ width: 28, height: 28, border: `2px solid ${PRIMARY}30`, borderTopColor: PRIMARY, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}/>
            </div>
          ) : requests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', background: 'white', borderRadius: 16, border: `1px solid ${PRIMARY}15` }}>
              <p style={{ fontSize: 13, color: '#9CA3AF' }}>لا توجد طلبات</p>
            </div>
          ) : requests.map(req => {
            const status   = statusMap[req.status]     || statusMap.new;
            const priority = priorityMap[req.priority] || priorityMap.normal;
            return (
              <div key={req.id}
                onClick={() => router.push(`/dashboard/requests/${req.id}`)}
                style={{ background: 'white', borderRadius: 14, border: `1px solid ${PRIMARY}12`, boxShadow: `0 2px 10px ${PRIMARY}06`, padding: '14px', cursor: 'pointer', transition: 'all 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 20px ${PRIMARY}15`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 2px 10px ${PRIMARY}06`; }}
              >
                {/* Card Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{req.full_name}</div>
                    <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{req.phone}</div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 100, background: status.bg, color: status.color, flexShrink: 0 }}>
                    {status.label}
                  </span>
                </div>

                {/* Card Details */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[
                    { label: 'النوع',     value: assistanceMap[req.assistance_type] || req.assistance_type },
                    { label: 'المنطقة',   value: req.region },
                    { label: 'الموظف',    value: req.assigned_to?.name || 'غير معيّن' },
                    { label: 'الأولوية',  value: priority.label, color: priority.color },
                  ].map((item, i) => (
                    <div key={i} style={{ background: '#F8FAFC', borderRadius: 8, padding: '7px 10px' }}>
                      <div style={{ fontSize: 10, color: '#9CA3AF', marginBottom: 2 }}>{item.label}</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: item.color || '#374151' }}>{item.value}</div>
                    </div>
                  ))}
                </div>

                {/* Card Footer */}
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${PRIMARY}08`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: '#9CA3AF' }}>
                    {new Date(req.created_at).toLocaleDateString('ar-SA')}
                  </span>
                  <span style={{ fontSize: 11, color: PRIMARY, fontWeight: 600 }}>عرض التفاصيل ←</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Pagination ── */}
        {pagination && pagination.last_page > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, background: 'white', borderRadius: 14, padding: '10px 16px', border: `1px solid ${PRIMARY}15`, flexWrap: 'wrap', gap: 8 }}>
            <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0 }}>
              عرض {pagination.from}–{pagination.to} من {pagination.total}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <button onClick={() => updateURL(currentPage - 1)} disabled={currentPage === 1}
                style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid #E5E7EB`, background: 'white', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.35 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
              </button>
              {Array.from({ length: pagination.last_page }, (_, i) => i + 1)
                .filter(p => p === 1 || p === pagination.last_page || Math.abs(p - currentPage) <= 1)
                .reduce((acc: (number | string)[], p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('...');
                  acc.push(p); return acc;
                }, [])
                .map((p, i) => p === '...' ? (
                  <span key={i} style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#9CA3AF' }}>...</span>
                ) : (
                  <button key={i} onClick={() => updateURL(p as number)}
                    style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${currentPage === p ? PRIMARY : '#E5E7EB'}`, background: currentPage === p ? PRIMARY : 'white', color: currentPage === p ? 'white' : '#6B7280', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    {p}
                  </button>
                ))}
              <button onClick={() => updateURL(currentPage + 1)} disabled={currentPage === pagination.last_page}
                style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid #E5E7EB`, background: 'white', cursor: currentPage === pagination.last_page ? 'not-allowed' : 'pointer', opacity: currentPage === pagination.last_page ? 0.35 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Mobile ── */
        @media (max-width: 768px) {
          .req-table   { display: none !important; }
          .req-cards   { display: flex !important; }
          .req-filter-btn { display: flex !important; }
          .req-hide-mobile { display: none !important; }

          /* الفلاتر مخفية افتراضياً على الموبايل */
          .req-filters {
            display: none !important;
          }
          .req-filters.req-filters-open {
            display: block !important;
          }
          .req-filters-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .req-search-full {
            grid-column: span 2 !important;
          }
          .req-region {
            grid-column: span 2 !important;
          }
        }

        @media (max-width: 480px) {
          .req-filters-grid {
            grid-template-columns: 1fr !important;
          }
          .req-search-full,
          .req-region {
            grid-column: span 1 !important;
          }
        }

        /* Desktop: الفلاتر ظاهرة دايماً */
        @media (min-width: 769px) {
          .req-filters { display: block !important; }
          .req-filter-btn { display: none !important; }
        }
      `}</style>
    </div>
  );
}

export default function RequestsPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#EEF5FB' }}>
        <div style={{ width: 32, height: 32, border: `2px solid ${PRIMARY}30`, borderTopColor: PRIMARY, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}/>
      </div>
    }>
      <RequestsPageContent />
    </Suspense>
  );
}