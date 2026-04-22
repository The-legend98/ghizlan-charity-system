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
    <svg width="100%" height="100%" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
      <defs>
        <pattern id="dots2" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
          <circle cx="15" cy="15" r="1" fill="#1B6CA8" opacity="0.12"/>
        </pattern>
      </defs>
      <rect width="1200" height="800" fill="url(#dots2)"/>
      <circle cx="1150" cy="80" r="160" fill="none" stroke="#1B6CA8" strokeWidth="0.6" opacity="0.2"/>
      <circle cx="1150" cy="80" r="100" fill="none" stroke="#4AACCD" strokeWidth="0.6" opacity="0.2"/>
      <circle cx="1150" cy="80" r="50"  fill="none" stroke="#C9A84C" strokeWidth="0.6" opacity="0.2"/>
      <circle cx="60"   cy="720" r="130" fill="none" stroke="#1B6CA8" strokeWidth="0.6" opacity="0.15"/>
      <circle cx="60"   cy="720" r="80"  fill="none" stroke="#4AACCD" strokeWidth="0.6" opacity="0.15"/>
      <line x1="900" y1="0"   x2="1200" y2="300" stroke="#4AACCD" strokeWidth="0.5" opacity="0.15"/>
      <line x1="930" y1="0"   x2="1200" y2="270" stroke="#1B6CA8" strokeWidth="0.5" opacity="0.1"/>
      <line x1="0"   y1="550" x2="250"  y2="800" stroke="#C9A84C" strokeWidth="0.5" opacity="0.15"/>
    </svg>
  </div>
);

export default function EmployeeDashboard() {
  const router = useRouter();
  const [user, setUser]                     = useState<any>(null);
  const [requests, setRequests]             = useState<any[]>([]);
  const [loading, setLoading]               = useState(true);
  const [search, setSearch]                 = useState('');
  const [statusFilter, setStatusFilter]     = useState('');
  const [pagination, setPagination]         = useState<any>(null);
  const [staleAlerts, setStaleAlerts]       = useState<any[]>([]);   
  const [followUpAlerts, setFollowUpAlerts] = useState<any[]>([]);   

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token    = localStorage.getItem('token');
    if (!token || !userData) { router.push('/login'); return; }
    const parsed = JSON.parse(userData);
    if (parsed.role === 'manager') { router.push('/dashboard/manager'); return; }
    setUser(parsed);
    fetchRequests();
    fetchAlerts(); 
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [search, statusFilter]);

  //  fetch منفصل — كل الطلبات لاستخراج التنبيهات
  const fetchAlerts = async () => {
    try {
      const res = await api.get('/requests?per_page=500');
      const all: any[] = res.data.data || [];

      setStaleAlerts(all.filter(r => {
        const days = Math.floor(
          (Date.now() - new Date(r.updated_at).getTime()) / (1000 * 60 * 60 * 24)
        );
        return ['new', 'reviewing', 'needs_info'].includes(r.status) && days >= 5;
      }));

      setFollowUpAlerts(all.filter(r => {
        const doc = r.case_documentation;
        if (!doc?.needs_follow_up || !doc?.follow_up_date) return false;
        if (!['pending', 'scheduled', 'rescheduled'].includes(doc.follow_up_status)) return false;
        const diff = Math.floor(
          (new Date(doc.follow_up_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
        return diff <= 1;
      }));
    } catch {}
  };

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
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await api.post('/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const total = pagination?.total || 0;
  const stats = {
    new:       requests.filter(r => r.status === 'new').length,
    reviewing: requests.filter(r => r.status === 'reviewing').length,
    approved:  requests.filter(r => r.status === 'approved').length,
    rejected:  requests.filter(r => r.status === 'rejected').length,
    pending:   requests.filter(r => ['new', 'reviewing', 'needs_info'].includes(r.status)).length,
  };

  if (loading && !user) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#EEF5FB' }}>
      <div style={{ width: 32, height: 32, border: `2px solid ${PRIMARY}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}/>
    </div>
  );

  const renderTable = () => {
    if (loading) return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 0' }}>
        <div style={{ width: 28, height: 28, border: `2px solid ${PRIMARY}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}/>
      </div>
    );

    if (requests.length === 0) return (
      <div style={{ textAlign: 'center', padding: '48px 0' }}>
        <svg width="40" height="40" fill="none" stroke="#D1D5DB" viewBox="0 0 24 24" style={{ margin: '0 auto 12px', display: 'block' }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
        </svg>
        <p style={{ fontSize: 13, color: '#9CA3AF' }}>لا توجد طلبات مسندة إليك</p>
      </div>
    );

    return (
      <>
        {/* Desktop Table */}
        <div className="emp-hide-mobile">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', padding: '10px 20px', borderBottom: '1px solid #F3F4F6', background: '#F9FAFB' }}>
            {['مقدم الطلب', 'نوع المساعدة', 'المنطقة', 'الأولوية', 'الحالة', 'تاريخ التقديم'].map(h => (
              <div key={h} style={{ fontSize: 11, fontWeight: 600, color: '#6B7280' }}>{h}</div>
            ))}
          </div>
          {requests.map(req => {
            const status   = statusMap[req.status]     || statusMap.new;
            const priority = priorityMap[req.priority] || priorityMap.normal;
            return (
              <div key={req.id}
                onClick={() => router.push(`/dashboard/requests/${req.id}`)}
                style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', padding: '14px 20px', borderBottom: '1px solid #F9FAFB', cursor: 'pointer', alignItems: 'center', transition: 'background 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#EFF6FF'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{req.full_name}</div>
                  <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{req.phone}</div>
                </div>
                <div style={{ fontSize: 13, color: '#4B5563' }}>{assistanceMap[req.assistance_type] || req.assistance_type}</div>
                <div style={{ fontSize: 13, color: '#4B5563' }}>{req.region}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: priority.color }}>{priority.label}</div>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 100, background: status.bg, color: status.color }}>
                    {status.label}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: '#9CA3AF' }}>{new Date(req.created_at).toLocaleDateString('ar-SA')}</div>
              </div>
            );
          })}
        </div>

        {/* Mobile Cards */}
        <div className="emp-show-mobile" style={{ display: 'none', padding: 12, flexDirection: 'column', gap: 10 }}>
          {requests.map(req => {
            const status   = statusMap[req.status]     || statusMap.new;
            const priority = priorityMap[req.priority] || priorityMap.normal;
            return (
              <div key={req.id}
                onClick={() => router.push(`/dashboard/requests/${req.id}`)}
                style={{ background: 'white', borderRadius: 14, padding: 14, border: `1px solid ${PRIMARY}12`, boxShadow: `0 2px 8px ${PRIMARY}06`, cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{req.full_name}</div>
                    <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{req.phone}</div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 100, background: status.bg, color: status.color }}>
                    {status.label}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[
                    { label: 'نوع المساعدة', value: assistanceMap[req.assistance_type] || req.assistance_type, color: '#374151' },
                    { label: 'المنطقة',      value: req.region,       color: '#374151' },
                    { label: 'الأولوية',     value: priority.label,   color: priority.color },
                    { label: 'التاريخ',      value: new Date(req.created_at).toLocaleDateString('ar-SA'), color: '#374151' },
                  ].map(item => (
                    <div key={item.label} style={{ background: '#F9FAFB', borderRadius: 8, padding: '8px 10px' }}>
                      <div style={{ fontSize: 9, color: '#9CA3AF', marginBottom: 2 }}>{item.label}</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: item.color }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: '#EEF5FB', position: 'relative' }} dir="rtl">
      <BgPattern />

      {/* Navbar */}
      <nav style={{ background: 'rgba(255,255,255,0.93)', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${PRIMARY}20`, position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 16px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, width: '100%', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, minWidth: 0 }}>
            <img src="/g-logo.png" alt="غزلان الخير"
              style={{ width: 32, height: 32, objectFit: 'contain', flexShrink: 0 }}
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}/>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#111827', lineHeight: 1.2, whiteSpace: 'nowrap' }}>لوحة الموظف</div>
              <div style={{ fontSize: 7, color: PRIMARY_L, letterSpacing: '1px', textTransform: 'uppercase' as const, fontWeight: 500 }}>Ghozlan Alkhair</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <NotificationBell />
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 8px', borderRadius: 10, background: `${PRIMARY}08`, border: `1px solid ${PRIMARY}20` }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_L})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 10, fontWeight: 800, flexShrink: 0 }}>
                {user?.name?.charAt(0)}
              </div>
              <div className="emp-hide-mobile">
                <div style={{ fontSize: 11, fontWeight: 700, color: '#111827' }}>{user?.name}</div>
                <div style={{ fontSize: 8, color: PRIMARY_L }}>موظف</div>
              </div>
            </div>
            <button onClick={handleLogout}
              style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, color: '#DC2626', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 9, padding: '6px 10px', cursor: 'pointer' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FEE2E2'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#FEF2F2'; }}>
              <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
              <span className="emp-hide-mobile">خروج</span>
            </button>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px', position: 'relative', zIndex: 1 }}>

        {/* Welcome Card */}
        <div style={{ borderRadius: 18, padding: '20px 24px', marginBottom: 20, color: 'white', position: 'relative', overflow: 'hidden', background: `linear-gradient(135deg, ${PRIMARY} 0%, ${PRIMARY_L} 100%)` }}>
          <div style={{ position: 'absolute', top: -50, left: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }}/>
          <div style={{ position: 'absolute', bottom: -40, right: 60, width: 150, height: 150, borderRadius: '50%', background: 'rgba(201,168,76,0.15)' }}/>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 10, padding: '5px 12px', borderRadius: 100, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', fontSize: 11, fontWeight: 500 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ADE80', display: 'inline-block' }}/>
              طلباتك المسندة إليك
            </div>
            <h1 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>مرحباً، {user?.name}</h1>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', margin: 0 }}>هيك ملخص طلباتك اليوم</p>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 16 }} className="emp-stats-grid">
          {[
            { label: 'إجمالي طلباتي', value: total,           color: PRIMARY,   border: PRIMARY },
            { label: 'جديدة',          value: stats.new,       color: PRIMARY_L, border: PRIMARY_L },
            { label: 'قيد المراجعة',   value: stats.reviewing, color: '#D97706', border: '#D97706' },
            { label: 'مقبولة',         value: stats.approved,  color: '#059669', border: '#059669' },
            { label: 'مرفوضة',         value: stats.rejected,  color: '#DC2626', border: '#DC2626' },
          ].map(stat => (
            <div key={stat.label} style={{ borderRadius: 16, padding: '16px', textAlign: 'center', background: 'white', border: `1px solid ${stat.border}20`, borderTop: `3px solid ${stat.border}`, boxShadow: `0 2px 10px ${stat.color}08` }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: stat.color, marginBottom: 4 }}>{stat.value}</div>
              <div style={{ fontSize: 11, color: '#6B7280' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Performance */}
        <div style={{ borderRadius: 18, padding: '18px 20px', marginBottom: 16, background: 'white', border: `1px solid ${PRIMARY}15`, boxShadow: `0 2px 12px ${PRIMARY}08` }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="16" height="16" fill="none" stroke={GOLD} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
            أدائي
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[
              { label: 'نسبة القبول',  value: total ? Math.round((stats.approved / total) * 100) : 0, color: '#059669' },
              { label: 'طلبات معلّقة', value: total ? Math.round((stats.pending  / total) * 100) : 0, color: '#D97706' },
              { label: 'نسبة الرفض',   value: total ? Math.round((stats.rejected / total) * 100) : 0, color: '#DC2626' },
            ].map(p => (
              <div key={p.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: p.color, marginBottom: 2 }}>{p.value}%</div>
                <div style={{ fontSize: 10, color: '#9CA3AF', marginBottom: 8 }}>{p.label}</div>
                <div style={{ height: 6, background: '#F3F4F6', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 3, width: `${p.value}%`, background: p.color, opacity: 0.75 }}/>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div style={{ borderRadius: 16, padding: '14px 16px', marginBottom: 14, background: 'white', border: `1px solid ${PRIMARY}15` }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ابحث بالاسم أو الهاتف..."
              style={{ flex: 1, minWidth: 160, height: 36, border: '1px solid #E5E7EB', borderRadius: 10, padding: '0 12px', fontSize: 12, background: '#F9FAFB', outline: 'none', color: '#374151', boxSizing: 'border-box' }}
              onFocus={e => { e.target.style.background = 'white'; e.target.style.borderColor = `${PRIMARY}50`; }}
              onBlur={e => { e.target.style.background = '#F9FAFB'; e.target.style.borderColor = '#E5E7EB'; }}/>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              style={{ height: 36, border: '1px solid #E5E7EB', borderRadius: 10, padding: '0 12px', fontSize: 12, background: 'white', outline: 'none', color: '#374151' }}>
              <option value="">كل الحالات</option>
              <option value="new">جديد</option>
              <option value="reviewing">قيد المراجعة</option>
              <option value="needs_info">يحتاج معلومات</option>
              <option value="approved">مقبول</option>
              <option value="rejected">مرفوض</option>
            </select>
            {(search || statusFilter) && (
              <button onClick={() => { setSearch(''); setStatusFilter(''); }}
                style={{ fontSize: 11, color: '#DC2626', padding: '7px 12px', borderRadius: 10, background: '#FEF2F2', border: '1px solid #FECACA', cursor: 'pointer' }}>
                مسح
              </button>
            )}
          </div>
        </div>

        {/*  Alerts — من fetchAlerts منفصل */}
        {(staleAlerts.length > 0 || followUpAlerts.length > 0) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>

            {staleAlerts.length > 0 && (
              <div style={{ borderRadius: 14, padding: '12px 16px', background: '#FEF3C7', border: '1px solid #FDE68A', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <svg width="18" height="18" fill="none" stroke="#D97706" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#92400E', marginBottom: 6 }}>
                    ⚠️ {staleAlerts.length} طلب بدون تحديث أكثر من 5 أيام
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {staleAlerts.map(r => {
                      const days = Math.floor(
                        (Date.now() - new Date(r.updated_at).getTime()) / (1000 * 60 * 60 * 24)
                      );
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

            {followUpAlerts.length > 0 && (
              <div style={{ borderRadius: 14, padding: '12px 16px', background: '#EDE9FE', border: '1px solid #DDD6FE', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <svg width="18" height="18" fill="none" stroke="#7C3AED" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#5B21B6', marginBottom: 6 }}>
                    📅 {followUpAlerts.length} موعد متابعة اليوم أو غداً
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {followUpAlerts.map(r => (
                      <button key={r.id} onClick={() => router.push(`/dashboard/requests/${r.id}`)}
                        style={{ fontSize: 11, padding: '4px 10px', borderRadius: 8, background: '#F5F3FF', border: '1px solid #DDD6FE', color: '#5B21B6', cursor: 'pointer', fontWeight: 600 }}>
                        {r.full_name} — {new Date(r.case_documentation.follow_up_date).toLocaleDateString('ar-SA')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Table */}
        <div style={{ borderRadius: 18, overflow: 'hidden', background: 'white', border: `1px solid ${PRIMARY}15`, boxShadow: `0 2px 12px ${PRIMARY}08` }}>
          {renderTable()}
        </div>

      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 640px) {
          .emp-hide-mobile { display: none !important; }
          .emp-show-mobile { display: flex !important; }
          .emp-stats-grid  { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (min-width: 641px) {
          .emp-stats-grid { grid-template-columns: repeat(5, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}