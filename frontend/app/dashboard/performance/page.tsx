'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { exportPerformance } from '@/lib/exportExcel';
import { nav } from 'framer-motion/m';


const PRIMARY   = '#1B6CA8';
const PRIMARY_L = '#4AACCD';
const GOLD      = '#C9A84C';

const BgPattern = () => (
  <div style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
    <svg width="100%" height="100%" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="dotsPerf" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
          <circle cx="15" cy="15" r="1" fill="#1B6CA8" opacity="0.10"/>
        </pattern>
      </defs>
      <rect width="1200" height="800" fill="url(#dotsPerf)"/>
      <circle cx="1150" cy="80"  r="160" fill="none" stroke="#1B6CA8" strokeWidth="0.6" opacity="0.15"/>
      <circle cx="1150" cy="80"  r="100" fill="none" stroke="#4AACCD" strokeWidth="0.6" opacity="0.15"/>
      <circle cx="60"   cy="720" r="120" fill="none" stroke="#1B6CA8" strokeWidth="0.6" opacity="0.12"/>
      <line x1="900" y1="0"   x2="1200" y2="300" stroke="#4AACCD" strokeWidth="0.5" opacity="0.12"/>
      <line x1="0"   y1="550" x2="250"  y2="800" stroke="#C9A84C" strokeWidth="0.5" opacity="0.12"/>
    </svg>
  </div>
);

const avatarColors = [
  `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_L})`,
  `linear-gradient(135deg, ${GOLD}, #E8C96A)`,
  'linear-gradient(135deg, #059669, #34D399)',
  'linear-gradient(135deg, #7C3AED, #9F67FA)',
];

export default function PerformancePage() {
  const router = useRouter();
  const [user, setUser]           = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token    = localStorage.getItem('token');
    if (!token || !userData) { router.push('/dashboard/login'); return; }
    const parsed = JSON.parse(userData);
    if (parsed.role !== 'manager') { router.push('/dashboard/requests'); return; }
    setUser(parsed);
    fetchPerformance();
  }, []);

  const fetchPerformance = async () => {
    try {
      const res = await api.get('/users/performance');
      setEmployees(res.data);
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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#EEF5FB' }}>
      <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: PRIMARY }}></div>
    </div>
  );

  const totalRequests = employees.reduce((s, e) => s + e.total_requests, 0);
  const totalApproved = employees.reduce((s, e) => s + e.approved, 0);
  const totalPending  = employees.reduce((s, e) => s + e.pending, 0);

  const getRateColor = (rate: number) =>
    rate >= 70 ? '#059669' : rate >= 40 ? '#D97706' : '#DC2626';

  const getRateGradient = (rate: number) =>
    rate >= 70
      ? 'linear-gradient(to left, #059669, #34D399)'
      : rate >= 40
      ? 'linear-gradient(to left, #D97706, #FBBF24)'
      : 'linear-gradient(to left, #DC2626, #F87171)';

  return (
    <div className="min-h-screen" style={{ background: '#EEF5FB', position: 'relative' }} dir="rtl">
      <BgPattern />

      {/* Navbar */}
    <nav style={{ background: 'rgba(255,255,255,0.93)', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${PRIMARY}20`, position: 'sticky', top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 16px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, width: '100%', boxSizing: 'border-box' }}>

        {/* السهم + اللوغو */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, minWidth: 0 }}>
          <button onClick={() => router.push('/dashboard/manager')}
            style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${PRIMARY}20`, background: `${PRIMARY}06`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${PRIMARY}12`; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = `${PRIMARY}06`; }}>
            <svg width="14" height="14" fill="none" stroke={PRIMARY} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            <img src="/g-logo.png" alt="غزلان الخير"
              style={{ width: 32, height: 32, objectFit: 'contain', flexShrink: 0 }}
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}/>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#111827', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>لوحة أداء الموظفين</div>
              <div style={{ fontSize: 7, color: PRIMARY_L, letterSpacing: '1px', textTransform: 'uppercase' as const, fontWeight: 500 }}>Ghozlan Alkhair</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          {/* User Badge — بدون نص على الموبايل */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 8px', borderRadius: 10, background: `${GOLD}15`, border: `1px solid ${GOLD}30` }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: `linear-gradient(135deg, ${GOLD}, #E8C96A)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 10, fontWeight: 800, flexShrink: 0 }}>
              {user?.name?.charAt(0)}
            </div>
            <div className="hide-mobile">
              <div style={{ fontSize: 11, fontWeight: 700, color: '#111827' }}>{user?.name}</div>
              <div style={{ fontSize: 8, color: GOLD }}>مدير</div>
            </div>
          </div>
          <button onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, color: '#DC2626', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 9, padding: '6px 10px', cursor: 'pointer' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FEE2E2'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#FEF2F2'; }}>
            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
            <span className="hide-mobile">خروج</span>
          </button>
        </div>

      </div>
    </nav>
    <style>{`
      @media (max-width: 480px) {
        .hide-mobile { display: none !important; }
      }
    `}</style>

      <div className="max-w-6xl mx-auto px-6 py-8" style={{ position: 'relative', zIndex: 1 }}>

        {/* Welcome Card */}
        <div className="rounded-2xl p-6 mb-6 text-white relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${PRIMARY_L} 100%)` }}>
          <div style={{ position: 'absolute', top: -50, left: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }}/>
          <div style={{ position: 'absolute', bottom: -40, right: 60, width: 150, height: 150, borderRadius: '50%', background: 'rgba(201,168,76,0.15)' }}/>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 mb-3 px-3 py-1.5 rounded-full text-xs font-medium"
              style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="white" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
              إحصائيات الفريق
            </div>
            <h1 className="text-xl font-bold mb-1">أداء الموظفين</h1>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>{employees.length} موظف نشط في النظام</p>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'إجمالي الطلبات الموزّعة', value: totalRequests, color: PRIMARY,   borderColor: PRIMARY },
            { label: 'إجمالي المقبولة',          value: totalApproved, color: '#059669', borderColor: '#059669' },
            { label: 'إجمالي المعلّقة',           value: totalPending,  color: '#D97706', borderColor: '#D97706' },
          ].map(stat => (
            <div key={stat.label} className="rounded-2xl p-5 text-center"
              style={{ background: 'white', border: `1px solid ${stat.borderColor}20`, borderTop: `3px solid ${stat.borderColor}`, boxShadow: `0 2px 12px ${stat.color}10` }}>
              <div className="text-3xl font-bold mb-1" style={{ color: stat.color }}>{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Employee Cards */}
        {employees.length === 0 ? (
          <div className="rounded-2xl p-12 text-center"
            style={{ background: 'white', border: `1px solid ${PRIMARY}15` }}>
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <p className="text-sm text-gray-400">لا يوجد موظفون نشطون بعد</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {employees.map((emp, index) => {
              const rateColor    = getRateColor(emp.completion_rate);
              const rateGradient = getRateGradient(emp.completion_rate);
              return (
                <div key={emp.id} className="rounded-2xl p-5 transition-all"
                  style={{ background: 'white', border: `1px solid ${PRIMARY}15`, boxShadow: `0 2px 12px ${PRIMARY}08` }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = `0 8px 24px ${PRIMARY}18`)}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = `0 2px 12px ${PRIMARY}08`)}>

                  {/* Header */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-base"
                        style={{ background: avatarColors[index % avatarColors.length] }}>
                        {emp.name?.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900">{emp.name}</div>
                        <div className="text-xs text-gray-400">{emp.email}</div>
                      </div>
                    </div>
                    <div className="text-center px-4 py-2 rounded-xl" style={{ background: `${rateColor}10` }}>
                      <div className="text-2xl font-bold" style={{ color: rateColor }}>{emp.completion_rate}%</div>
                      <div className="text-xs" style={{ color: rateColor, opacity: 0.8 }}>نسبة القبول</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-5">
                    <div className="flex justify-between text-xs text-gray-400 mb-2">
                      <span>نسبة إنجاز الطلبات</span>
                      <span style={{ color: rateColor, fontWeight: 600 }}>{emp.completion_rate}%</span>
                    </div>
                    <div className="h-2.5 rounded-full overflow-hidden" style={{ background: `${PRIMARY}10` }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${emp.completion_rate}%`, background: rateGradient }}></div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[
                      { label: 'إجمالي', value: emp.total_requests, color: PRIMARY,   bg: `${PRIMARY}10`,  borderColor: PRIMARY },
                      { label: 'مقبولة', value: emp.approved,       color: '#059669', bg: '#D1FAE5',       borderColor: '#059669' },
                      { label: 'معلّقة', value: emp.pending,        color: '#D97706', bg: '#FEF3C7',       borderColor: '#D97706' },
                    ].map(stat => (
                      <div key={stat.label} className="rounded-xl p-3 text-center"
                        style={{ background: stat.bg, border: `1px solid ${stat.borderColor}20` }}>
                        <div className="text-xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
                        <div className="text-xs font-medium" style={{ color: stat.color, opacity: 0.75 }}>{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Detail Stats */}
                  <div className="grid grid-cols-2 gap-2 pt-4" style={{ borderTop: `1px solid ${PRIMARY}10` }}>
                    {[
                      { label: 'جديدة',        value: emp.new_requests, color: PRIMARY_L },
                      { label: 'قيد المراجعة', value: emp.reviewing,    color: '#D97706' },
                      { label: 'مقبولة',       value: emp.approved,     color: '#059669' },
                      { label: 'مرفوضة',       value: emp.rejected,     color: '#DC2626' },
                    ].map(item => (
                      <div key={item.label} className="flex items-center justify-between rounded-xl px-3 py-2"
                        style={{ background: '#F8FAFC', border: `1px solid ${item.color}15` }}>
                        <span className="text-xs text-gray-500">{item.label}</span>
                        <span className="text-xs font-bold" style={{ color: item.color }}>{item.value}</span>
                      </div>
                    ))}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}