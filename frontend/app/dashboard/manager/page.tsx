'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import NotificationBell from '@/components/NotificationBell';

const PRIMARY   = '#1B6CA8';
const PRIMARY_L = '#4AACCD';
const GOLD      = '#C9A84C';

const BgPattern = () => (
  <div style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
    <svg width="100%" height="100%" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
      <defs>
        <pattern id="dots" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
          <circle cx="15" cy="15" r="1" fill="#1B6CA8" opacity="0.12"/>
        </pattern>
      </defs>
      <rect width="1200" height="800" fill="url(#dots)"/>
      <circle cx="1150" cy="80"  r="160" fill="none" stroke="#1B6CA8" strokeWidth="0.6" opacity="0.2"/>
      <circle cx="1150" cy="80"  r="100" fill="none" stroke="#4AACCD" strokeWidth="0.6" opacity="0.2"/>
      <circle cx="1150" cy="80"  r="50"  fill="none" stroke="#C9A84C" strokeWidth="0.6" opacity="0.2"/>
      <circle cx="60"   cy="720" r="130" fill="none" stroke="#1B6CA8" strokeWidth="0.6" opacity="0.15"/>
      <circle cx="60"   cy="720" r="80"  fill="none" stroke="#4AACCD" strokeWidth="0.6" opacity="0.15"/>
      <line x1="900" y1="0"   x2="1200" y2="300" stroke="#4AACCD" strokeWidth="0.5" opacity="0.15"/>
      <line x1="0"   y1="550" x2="250"  y2="800" stroke="#C9A84C" strokeWidth="0.5" opacity="0.15"/>
    </svg>
  </div>
);

export default function ManagerDashboard() {
  const router = useRouter();
  const [user, setUser]       = useState<any>(null);
  const [stats, setStats]     = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token    = localStorage.getItem('token');
    if (!token || !userData) { router.push('/login'); return; }
    const parsed = JSON.parse(userData);
    if (parsed.role !== 'manager') { router.push('/dashboard/requests'); return; }
    setUser(parsed);
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res  = await api.get('/requests?per_page=1000');
      const data = res.data.data || [];
      setStats({
        total:      res.data.total || data.length,
        new:        data.filter((r: any) => r.status === 'new').length,
        approved:   data.filter((r: any) => r.status === 'approved').length,
        rejected:   data.filter((r: any) => r.status === 'rejected').length,
        reviewing:  data.filter((r: any) => r.status === 'reviewing').length,
        needs_info: data.filter((r: any) => r.status === 'needs_info').length,
      });
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

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#EEF5FB' }}>
      <div style={{ width: 32, height: 32, border: `3px solid ${PRIMARY}30`, borderTopColor: PRIMARY, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}/>
    </div>
  );

  const kpis = [
    {
      title: 'نسبة القبول',
      value: stats?.total ? Math.round((stats.approved / stats.total) * 100) : 0,
      desc: 'من إجمالي الطلبات',
      color: '#059669', bg: '#D1FAE5',
      icon: <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
    },
    {
      title: 'طلبات معلّقة',
      value: stats?.total ? Math.round(((stats.new + stats.reviewing) / stats.total) * 100) : 0,
      desc: 'تحتاج مراجعة أو قرار',
      color: '#D97706', bg: '#FEF3C7',
      icon: <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
    },
    {
      title: 'نسبة الرفض',
      value: stats?.total ? Math.round((stats.rejected / stats.total) * 100) : 0,
      desc: 'من إجمالي الطلبات',
      color: '#DC2626', bg: '#FEE2E2',
      icon: <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
    },
  ];

  const quickActions = [
    {
      title: 'إدارة الطلبات', desc: 'مراجعة وتغيير حالة الطلبات',
      color: PRIMARY, bg: `${PRIMARY}12`, path: '/dashboard/requests',
      icon: <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>,
    },
    {
      title: 'إدارة الموظفين', desc: 'إضافة وإدارة حسابات الموظفين',
      color: GOLD, bg: `${GOLD}15`, path: '/dashboard/users',
      icon: <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>,
    },
    {
      title: 'أداء الموظفين', desc: 'إحصائيات وتقارير الأداء',
      color: PRIMARY_L, bg: `${PRIMARY_L}15`, path: '/dashboard/performance',
      icon: <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>,
    },
    {
      title: 'التقارير والتصدير', desc: 'تصدير البيانات بصيغة Excel مع فلاتر',
      color: '#059669', bg: '#05966912', path: '/dashboard/reports',
      icon: <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>,
    },
  ];

  const statCards = [
    { label: 'إجمالي الطلبات', value: stats?.total      || 0, color: PRIMARY   },
    { label: 'جديدة',          value: stats?.new         || 0, color: PRIMARY_L },
    { label: 'قيد المراجعة',   value: stats?.reviewing   || 0, color: '#D97706' },
    { label: 'تحتاج معلومات',  value: stats?.needs_info  || 0, color: '#7C3AED' },
    { label: 'مقبولة',         value: stats?.approved    || 0, color: '#059669' },
    { label: 'مرفوضة',         value: stats?.rejected    || 0, color: '#DC2626' },
  ];

  return (
    <div dir="rtl" style={{ minHeight: '100vh', background: '#EEF5FB', position: 'relative' }}>
      <BgPattern />

     {/* ══ NAVBAR ══ */}
    <nav style={{
      background: 'rgba(255,255,255,0.93)',
      backdropFilter: 'blur(12px)',
      borderBottom: `1px solid ${PRIMARY}20`,
      position: 'sticky', top: 0, zIndex: 50,
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', height: 62, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, cursor: 'pointer' }}
          onClick={() => router.push('/dashboard/manager')}>
          <img src="/g-logo.png" alt="غزلان الخير"
            style={{ width: 38, height: 38, objectFit: 'contain' }}
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#111827', letterSpacing: '-0.2px', lineHeight: 1.2 }}>غزلان الخير</div>
            <div style={{ fontSize: 8, color: PRIMARY_L, letterSpacing: '1px', textTransform: 'uppercase' as const, fontWeight: 500 }}>Ghozlan Alkhair</div>
          </div>
        </div>

        {/* Desktop actions */}
        <div className="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

          <NotificationBell />

          {/* User Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 10, background: `${GOLD}15`, border: `1px solid ${GOLD}30` }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: `linear-gradient(135deg, ${GOLD}, #E8C96A)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 11, fontWeight: 800, flexShrink: 0 }}>
              {user?.name?.charAt(0)}
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>{user?.name}</div>
              <div style={{ fontSize: 9, color: GOLD }}>مدير</div>
            </div>
          </div>

          {/* Logout */}
          <button onClick={handleLogout} className="nb-logout-btn"
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: '#DC2626', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '7px 13px', cursor: 'pointer', transition: 'all 0.2s' }}>
            <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
            خروج
          </button>
        </div>

        {/* Mobile */}
        <div className="nav-mobile" style={{ display: 'none', alignItems: 'center', gap: 8 }}>
          <NotificationBell />
          <button onClick={() => setMenuOpen(!menuOpen)}
            style={{ width: 36, height: 36, borderRadius: 9, border: `1px solid ${PRIMARY}25`, background: `${PRIMARY}06`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" fill="none" stroke="#4B5563" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={{ background: 'rgba(255,255,255,0.97)', borderTop: `1px solid ${PRIMARY}15`, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, background: `${GOLD}10`, border: `1px solid ${GOLD}20` }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: `linear-gradient(135deg, ${GOLD}, #E8C96A)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 13, fontWeight: 700 }}>{user?.name?.charAt(0)}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{user?.name}</div>
              <div style={{ fontSize: 10, color: GOLD }}>مدير النظام</div>
            </div>
          </div>
          <button onClick={handleLogout}
            style={{ width: '100%', padding: '11px 14px', borderRadius: 12, border: '1px solid #FECACA', background: '#FEF2F2', color: '#DC2626', fontSize: 13, fontWeight: 600, cursor: 'pointer', textAlign: 'right' as const }}>
            تسجيل الخروج
          </button>
        </div>
      )}
    </nav>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 16px 48px', position: 'relative', zIndex: 1 }}>

        {/* ══ Welcome Banner ══ */}
        <div style={{
          borderRadius: 20, padding: '20px 20px', marginBottom: 20,
          background: `linear-gradient(135deg, ${PRIMARY} 0%, ${PRIMARY_L} 100%)`,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -40, left: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
          <div style={{ position: 'absolute', bottom: -30, right: 40, width: 120, height: 120, borderRadius: '50%', background: 'rgba(201,168,76,0.15)' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 10, padding: '5px 12px', borderRadius: 100, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', fontSize: 11, color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ADE80', display: 'inline-block' }} />
              النظام نشط — مؤسسة غزلان الخير
            </div>
            <h1 style={{ fontSize: 'clamp(18px, 4vw, 26px)', fontWeight: 900, color: 'white', marginBottom: 4, letterSpacing: '-0.5px' }}>
              مرحباً، {user?.name} 
            </h1>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.78)', margin: 0 }}>هيك ملخص أداء المؤسسة اليوم</p>
          </div>
        </div>

        {/* ══ Stats Grid ══ */}
        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
          {statCards.map(stat => (
            <div key={stat.label} style={{
              background: 'white', borderRadius: 16, padding: '14px 12px', textAlign: 'center',
              border: `1px solid ${stat.color}18`, borderTop: `3px solid ${stat.color}`,
              boxShadow: `0 2px 12px ${stat.color}10`,
            }}>
              <div style={{ fontSize: 'clamp(20px, 4vw, 30px)', fontWeight: 900, color: stat.color, lineHeight: 1, marginBottom: 4 }}>{stat.value}</div>
              <div style={{ fontSize: 11, color: '#6B7280' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* ══ KPIs ══ */}
        <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
          {kpis.map(kpi => (
            <div key={kpi.title} style={{ background: 'white', borderRadius: 18, padding: '18px 16px', border: `1px solid ${kpi.color}15`, boxShadow: `0 2px 12px ${kpi.color}08` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#374151' }}>{kpi.title}</div>
                <div style={{ width: 34, height: 34, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: kpi.bg, color: kpi.color, flexShrink: 0 }}>
                  {kpi.icon}
                </div>
              </div>
              <div style={{ fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 900, color: kpi.color, marginBottom: 4 }}>{kpi.value}%</div>
              <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 10 }}>{kpi.desc}</div>
              <div style={{ height: 6, borderRadius: 3, background: '#F3F4F6', overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 3, width: `${kpi.value}%`, background: kpi.color, opacity: 0.75, transition: 'width 0.6s ease' }} />
              </div>
            </div>
          ))}
        </div>

        {/* ══ Quick Actions ══ */}
        <div className="actions-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {quickActions.map(action => (
            <div
              key={action.title}
              onClick={() => router.push(action.path)}
              style={{
                background: 'white', borderRadius: 18, padding: '16px',
                border: `1px solid ${action.color}20`, cursor: 'pointer',
                boxShadow: `0 2px 12px ${action.color}08`,
                transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', gap: 14,
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px ${action.color}20`; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 2px 12px ${action.color}08`; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
            >
              <div style={{ width: 46, height: 46, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: action.bg, color: action.color, flexShrink: 0 }}>
                {action.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 3 }}>{action.title}</div>
                <div style={{ fontSize: 11, color: '#9CA3AF', lineHeight: 1.4 }}>{action.desc}</div>
              </div>
              <svg width="16" height="16" fill="none" stroke={action.color} viewBox="0 0 24 24" style={{ opacity: 0.5, flexShrink: 0 }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </div>
          ))}
        </div>

      </div>

      <style>{`
  @keyframes spin { to { transform: rotate(360deg); } }

  .nav-desktop { display: flex !important; }
  .nav-mobile  { display: none  !important; }

  .nb-requests-btn:hover {
    background: rgba(74,172,205,0.12) !important;
    color: white !important;
    border-color: rgba(74,172,205,0.25) !important;
  }
  .nb-logout-btn:hover {
    background: rgba(220,38,38,0.15) !important;
    color: #FCA5A5 !important;
  }

  @media (max-width: 768px) {
    .nav-desktop  { display: none !important; }
    .nav-mobile   { display: flex !important; }
    .stats-grid   { grid-template-columns: repeat(3, 1fr) !important; }
    .kpi-grid     { grid-template-columns: 1fr !important; }
    .actions-grid { grid-template-columns: 1fr !important; }
  }

  @media (max-width: 480px) {
    .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    .stats-grid   { grid-template-columns: repeat(3, 1fr) !important; }
    .kpi-grid     { grid-template-columns: repeat(3, 1fr) !important; }
    .actions-grid { grid-template-columns: repeat(2, 1fr) !important; }
  }
`}</style>
    </div>
  );
}