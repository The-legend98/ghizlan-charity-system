'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import NotificationBell from '@/components/NotificationBell';
import { exportStats } from '@/lib/exportExcel';


const PRIMARY   = '#1B6CA8';
const PRIMARY_L = '#4AACCD';
const GOLD      = '#C9A84C';

const BgPattern = () => (
  <div style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
    <svg width="100%" height="100%" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="dots" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
          <circle cx="15" cy="15" r="1" fill="#1B6CA8" opacity="0.12"/>
        </pattern>
      </defs>
      <rect width="1200" height="800" fill="url(#dots)"/>
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

export default function ManagerDashboard() {
  const router = useRouter();
  const [user, setUser]       = useState<any>(null);
  const [stats, setStats]     = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token    = localStorage.getItem('token');
    if (!token || !userData) { router.push('/dashboard/login'); return; }
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

  const kpis = [
    {
      title: 'نسبة القبول',
      value: stats?.total ? Math.round((stats.approved / stats.total) * 100) : 0,
      desc: 'من إجمالي الطلبات',
      color: '#059669', bg: '#D1FAE5',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
    },
    {
      title: 'طلبات معلّقة',
      value: stats?.total ? Math.round(((stats.new + stats.reviewing) / stats.total) * 100) : 0,
      desc: 'تحتاج مراجعة أو قرار',
      color: '#D97706', bg: '#FEF3C7',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
    },
    {
      title: 'نسبة الرفض',
      value: stats?.total ? Math.round((stats.rejected / stats.total) * 100) : 0,
      desc: 'من إجمالي الطلبات',
      color: '#DC2626', bg: '#FEE2E2',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
    },
  ];

  const quickActions = [
    {
      title: 'إدارة الطلبات', desc: 'مراجعة وتغيير حالة الطلبات',
      color: PRIMARY, bg: `${PRIMARY}12`, path: '/dashboard/requests',
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
    },
    {
      title: 'إدارة الموظفين', desc: 'إضافة وإدارة حسابات الموظفين',
      color: GOLD, bg: `${GOLD}15`, path: '/dashboard/users',
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
    },
    {
      title: 'أداء الموظفين', desc: 'إحصائيات وتقارير الأداء',
      color: PRIMARY_L, bg: `${PRIMARY_L}15`, path: '/dashboard/performance',
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
    },
  ];

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
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
              style={{ background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_L})` }}>غ</div>
            <div>
              <div className="text-sm font-bold text-gray-900">لوحة المدير</div>
              <div className="text-xs" style={{ color: PRIMARY_L }}>مؤسسة غزلان الخير</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => router.push('/dashboard/requests')}
              className="text-xs px-3 py-2 rounded-xl border transition-all text-gray-600 hover:bg-white"
              style={{ borderColor: `${PRIMARY}30`, background: `${PRIMARY}06` }}>
              قائمة الطلبات
            </button>
            <NotificationBell />
            <div className="flex items-center gap-2 rounded-xl px-3 py-2"
              style={{ background: `${GOLD}15`, border: `1px solid ${GOLD}30` }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ background: `linear-gradient(135deg, ${GOLD}, #E8C96A)` }}>
                {user?.name?.charAt(0)}
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-900">{user?.name}</div>
                <div className="text-xs" style={{ color: GOLD }}>مدير</div>
              </div>
            </div>
            <button onClick={handleLogout}
              className="text-xs px-3 py-2 rounded-xl text-red-500 hover:bg-red-50 transition-all border border-red-100">
              خروج
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8" style={{ position: 'relative', zIndex: 1 }}>

        {/* Welcome Card */}
        <div className="rounded-2xl p-6 mb-8 text-white relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${PRIMARY_L} 100%)` }}>
          <div style={{
            position: 'absolute', top: -50, left: -50,
            width: 200, height: 200, borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)'
          }}/>
          <div style={{
            position: 'absolute', bottom: -40, right: 60,
            width: 150, height: 150, borderRadius: '50%',
            background: 'rgba(201,168,76,0.15)'
          }}/>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 mb-3 px-3 py-1.5 rounded-full text-xs font-medium"
              style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <span className="w-2 h-2 rounded-full bg-green-400 inline-block animate-pulse"></span>
              النظام نشط — مؤسسة غزلان الخير
            </div>
            <h1 className="text-2xl font-bold mb-1">مرحباً، {user?.name} 👋</h1>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>هيك ملخص أداء المؤسسة اليوم</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {[
            { label: 'إجمالي الطلبات', value: stats?.total || 0,      color: PRIMARY,   borderColor: PRIMARY },
            { label: 'جديدة',          value: stats?.new || 0,         color: PRIMARY_L, borderColor: PRIMARY_L },
            { label: 'قيد المراجعة',   value: stats?.reviewing || 0,   color: '#D97706', borderColor: '#D97706' },
            { label: 'تحتاج معلومات',  value: stats?.needs_info || 0,  color: '#7C3AED', borderColor: '#7C3AED' },
            { label: 'مقبولة',         value: stats?.approved || 0,    color: '#059669', borderColor: '#059669' },
            { label: 'مرفوضة',         value: stats?.rejected || 0,    color: '#DC2626', borderColor: '#DC2626' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl p-4 text-center"
              style={{
                background: 'white',
                border: `1px solid ${stat.borderColor}20`,
                borderTop: `3px solid ${stat.borderColor}`,
                boxShadow: `0 2px 12px ${stat.color}10`
              }}>
              <div className="text-3xl font-bold mb-1" style={{ color: stat.color }}>{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {kpis.map((kpi) => (
            <div key={kpi.title} className="rounded-2xl p-5"
              style={{ background: 'white', border: `1px solid ${kpi.color}15`, boxShadow: `0 2px 12px ${kpi.color}08` }}>
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-semibold text-gray-900">{kpi.title}</div>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: kpi.bg, color: kpi.color }}>
                  {kpi.icon}
                </div>
              </div>
              <div className="text-3xl font-bold mb-1" style={{ color: kpi.color }}>{kpi.value}%</div>
              <div className="text-xs text-gray-400 mb-3">{kpi.desc}</div>
              <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${kpi.value}%`, background: kpi.color, opacity: 0.75 }}></div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <div key={action.title}
              onClick={() => router.push(action.path)}
              className="rounded-2xl p-5 cursor-pointer transition-all hover:-translate-y-0.5"
              style={{
                background: 'white',
                border: `1px solid ${action.color}20`,
                boxShadow: `0 2px 12px ${action.color}08`,
              }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = `0 8px 24px ${action.color}20`)}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = `0 2px 12px ${action.color}08`)}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: action.bg, color: action.color }}>
                  {action.icon}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-900">{action.title}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{action.desc}</div>
                </div>
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke={action.color} viewBox="0 0 24 24" opacity="0.5">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
                </svg>
                
              </div>
            </div>
            
          ))}

          {/* Export Excel */}
          <div
          onClick={() => router.push('/dashboard/reports')}
          className="rounded-2xl p-5 cursor-pointer transition-all hover:-translate-y-0.5"
          style={{ background: 'white', border: '1px solid #05966920', boxShadow: '0 2px 12px #05966908' }}
          onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 8px 24px #05966920')}
          onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 2px 12px #05966908')}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: '#05966912', color: '#059669' }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-gray-900">التقارير والتصدير</div>
              <div className="text-xs text-gray-400 mt-0.5">تصدير البيانات بصيغة Excel مع فلاتر</div>
            </div>
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="#059669" viewBox="0 0 24 24" opacity="0.5">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </div>
        </div>



        </div>
        

      </div>
      
    </div>
  );
}