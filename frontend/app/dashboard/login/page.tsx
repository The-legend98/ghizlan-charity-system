'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';

const PRIMARY   = '#1B6CA8';
const PRIMARY_L = '#4AACCD';
const GOLD      = '#C9A84C';

export default function DashboardLoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/login', { email, password });
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      if (user.role === 'manager') {
        router.push('/dashboard/manager');
      } else {
        router.push('/dashboard/employee');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'البريد الإلكتروني أو كلمة المرور غير صحيحة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: '#EEF5FB' }} dir="rtl">

      {/* BG Pattern */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <svg width="100%" height="100%" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dotsLogin" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
              <circle cx="15" cy="15" r="1" fill="#1B6CA8" opacity="0.12"/>
            </pattern>
          </defs>
          <rect width="1200" height="800" fill="url(#dotsLogin)"/>
          <circle cx="1150" cy="80"  r="200" fill="none" stroke="#1B6CA8" strokeWidth="0.6" opacity="0.2"/>
          <circle cx="1150" cy="80"  r="140" fill="none" stroke="#4AACCD" strokeWidth="0.6" opacity="0.2"/>
          <circle cx="1150" cy="80"  r="80"  fill="none" stroke="#C9A84C" strokeWidth="0.6" opacity="0.2"/>
          <circle cx="50"   cy="720" r="160" fill="none" stroke="#1B6CA8" strokeWidth="0.6" opacity="0.15"/>
          <circle cx="50"   cy="720" r="100" fill="none" stroke="#4AACCD" strokeWidth="0.6" opacity="0.15"/>
          <line x1="900" y1="0"   x2="1200" y2="300" stroke="#4AACCD" strokeWidth="0.5" opacity="0.15"/>
          <line x1="920" y1="0"   x2="1200" y2="280" stroke="#1B6CA8" strokeWidth="0.5" opacity="0.1"/>
          <line x1="0"   y1="550" x2="280"  y2="800" stroke="#C9A84C" strokeWidth="0.5" opacity="0.15"/>
        </svg>
      </div>

      <div className="w-full max-w-md" style={{ position: 'relative', zIndex: 1 }}>

        {/* Logo */}
    {/* Logo Container */}
<div className="flex flex-col items-center justify-center text-center mb-8 w-full">
  
  {/* الصورة - تأكدت من إضافة mx-auto لضمان توسيطها */}
  <img
    src="/g-logo.png"
    alt="غزلان الخير"
    className="nb-logo-img mx-auto mb-4" 
    style={{ 
      width: 100, 
      height: 100, 
      objectFit: 'contain', 
      filter: 'drop-shadow(0 0 7px rgba(74,172,205,0.45))' 
    }}
  />

  {/* العنوان العربي - أضفنا خط تجوال */}
  <h1 style={{ 
      fontFamily: "'Tajawal', sans-serif",
      fontSize: '1.5rem', // يعادل text-xl
      fontWeight: 800,
      color: '#111827' // يعادل text-gray-900
    }}>
    مؤسسة غزلان الخير
  </h1>

  {/* العنوان الإنجليزي - أضفنا خط Roboto وحروف كبيرة */}
  <p style={{ 
      color: PRIMARY_L, 
      fontFamily: "'Roboto', sans-serif",
      fontSize: '0.875rem', // يعادل text-sm
      fontWeight: 500,
      textTransform: 'uppercase',
      letterSpacing: '1px',
      marginTop: '4px'
    }}>
    Ghozlan Alkhair Foundation
  </p>
</div>

        {/* Card */}
        <div className="rounded-2xl p-8"
          style={{
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(12px)',
            border: `1px solid ${PRIMARY}20`,
            boxShadow: `0 8px 40px ${PRIMARY}15`,
          }}>

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: `${PRIMARY}12` }}>
              <svg className="w-5 h-5" fill="none" stroke={PRIMARY} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">تسجيل الدخول</h2>
              <p className="text-xs text-gray-400">للموظفين والإدارة فقط</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5 flex items-center gap-2">
              <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="example@ghozlan.org"
                required
                className="w-full h-11 rounded-xl px-4 text-sm text-gray-900 focus:outline-none transition-all"
                style={{ border: `2px solid ${PRIMARY}25`, background: 'white' }}
                onFocus={e => (e.target.style.borderColor = `${PRIMARY}60`)}
                onBlur={e => (e.target.style.borderColor = `${PRIMARY}25`)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                كلمة المرور
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full h-11 rounded-xl px-4 text-sm text-gray-900 focus:outline-none transition-all"
                style={{ border: `2px solid ${PRIMARY}25`, background: 'white' }}
                onFocus={e => (e.target.style.borderColor = `${PRIMARY}60`)}
                onBlur={e => (e.target.style.borderColor = `${PRIMARY}25`)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-white rounded-xl text-sm font-semibold disabled:opacity-60 transition-all flex items-center justify-center gap-2 mt-2"
              style={{ background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_L})`, boxShadow: `0 4px 16px ${PRIMARY}40` }}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  جاري الدخول...
                </>
              ) : (
                <>
                  دخول إلى النظام
                  <svg className="w-4 h-4" fill="none" stroke="white" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14"/>
                  </svg>
                </>
              )}
            </button>

            <div className="text-center mt-3">
              <button onClick={() => router.push('/dashboard/forgot-password')}
                className="text-xs font-medium transition-all"
                style={{ color: PRIMARY, background: 'none', border: 'none', cursor: 'pointer' }}>
                نسيت كلمة المرور؟
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="mt-6 pt-5" style={{ borderTop: `1px solid ${PRIMARY}12` }}>
            <button onClick={() => router.push('/')}
              className="w-full h-10 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-2"
              style={{ background: `${PRIMARY}08`, color: PRIMARY, border: `1px solid ${PRIMARY}20` }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
              </svg>
              العودة للصفحة الرئيسية
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6 flex items-center justify-center gap-2">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
          </svg>
          هذه الصفحة مخصصة للفريق الداخلي فقط
        </p>

      </div>
    </div>
  );
}