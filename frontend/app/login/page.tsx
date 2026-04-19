'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import api from '@/lib/axios';

const PRIMARY   = '#1B6CA8';
const PRIMARY_L = '#4AACCD';

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
      router.push(user.role === 'manager' ? '/dashboard/manager' : '/dashboard/employee');
    } catch (err: any) {
      setError(err.response?.data?.message || 'البريد الإلكتروني أو كلمة المرور غير صحيحة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px', background: '#EEF5FB', position: 'relative', overflow: 'hidden' }} dir="rtl">

      {/* BG Pattern */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <svg width="100%" height="100%" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="dotsLogin" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
              <circle cx="15" cy="15" r="1" fill="#1B6CA8" opacity="0.1"/>
            </pattern>
          </defs>
          <rect width="1200" height="800" fill="url(#dotsLogin)"/>
          <circle cx="1150" cy="80"  r="200" fill="none" stroke="#1B6CA8" strokeWidth="0.6" opacity="0.15"/>
          <circle cx="1150" cy="80"  r="140" fill="none" stroke="#4AACCD" strokeWidth="0.6" opacity="0.15"/>
          <circle cx="1150" cy="80"  r="80"  fill="none" stroke="#C9A84C" strokeWidth="0.6" opacity="0.15"/>
          <circle cx="50"   cy="720" r="160" fill="none" stroke="#1B6CA8" strokeWidth="0.6" opacity="0.12"/>
          <circle cx="50"   cy="720" r="100" fill="none" stroke="#4AACCD" strokeWidth="0.6" opacity="0.12"/>
          <line x1="900" y1="0"   x2="1200" y2="300" stroke="#4AACCD" strokeWidth="0.5" opacity="0.12"/>
          <line x1="0"   y1="550" x2="280"  y2="800" stroke="#C9A84C" strokeWidth="0.5" opacity="0.12"/>
        </svg>
      </div>

      <div style={{ width: '100%', maxWidth: 380, position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: 'center', marginBottom: 24 }}>
          <motion.img
            src="/g-logo.png"
            alt="غزلان الخير"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{ width: 72, height: 72, objectFit: 'contain', filter: 'drop-shadow(0 0 6px rgba(74,172,205,0.4))', display: 'block', margin: '0 auto 10px' }}
          />
          <h1 style={{ fontSize: 18, fontWeight: 800, color: '#111827', margin: '0 0 3px' }}>مؤسسة غزلان الخير</h1>
          <p style={{ fontSize: 10, color: PRIMARY_L, fontWeight: 500, letterSpacing: '1.5px', textTransform: 'uppercase', margin: 0 }}>Ghozlan Alkhair Foundation</p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          style={{ borderRadius: 18, padding: '24px 28px', background: 'rgba(255,255,255,0.93)', backdropFilter: 'blur(12px)', border: `1px solid ${PRIMARY}18`, boxShadow: `0 8px 32px ${PRIMARY}12` }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: `${PRIMARY}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="16" height="16" fill="none" stroke={PRIMARY} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>تسجيل الدخول</div>
              <div style={{ fontSize: 10, color: '#9CA3AF' }}>للموظفين والإدارة فقط</div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
              style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '8px 12px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 7, fontSize: 11, color: '#DC2626' }}>
              <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              {error}
            </motion.div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#4B5563', marginBottom: 5 }}>البريد الإلكتروني</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="example@ghozlan.org" required
                style={{ width: '100%', height: 38, borderRadius: 10, padding: '0 12px', fontSize: 12, color: '#111827', border: `1.5px solid ${PRIMARY}22`, background: 'white', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                onFocus={e => (e.target.style.borderColor = `${PRIMARY}55`)}
                onBlur={e => (e.target.style.borderColor = `${PRIMARY}22`)}/>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#4B5563', marginBottom: 5 }}>كلمة المرور</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required
                style={{ width: '100%', height: 38, borderRadius: 10, padding: '0 12px', fontSize: 12, color: '#111827', border: `1.5px solid ${PRIMARY}22`, background: 'white', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                onFocus={e => (e.target.style.borderColor = `${PRIMARY}55`)}
                onBlur={e => (e.target.style.borderColor = `${PRIMARY}22`)}/>
            </div>

            <motion.button type="submit" disabled={loading}
              whileHover={!loading ? { scale: 1.02, boxShadow: `0 6px 20px ${PRIMARY}40` } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
              style={{ width: '100%', height: 40, background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_L})`, color: 'white', border: 'none', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.65 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, boxShadow: `0 4px 14px ${PRIMARY}35` }}>
              {loading ? (
                <><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }}/>جاري الدخول...</>
              ) : (
                <>دخول إلى النظام<svg width="14" height="14" fill="none" stroke="white" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14"/></svg></>
              )}
            </motion.button>

            <div style={{ textAlign: 'center', marginTop: 10 }}>
              <button type="button" onClick={() => router.push('/dashboard/forgot-password')}
                style={{ fontSize: 11, color: PRIMARY, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
                نسيت كلمة المرور؟
              </button>
            </div>
          </form>

          {/* Divider */}
          <div style={{ borderTop: `1px solid ${PRIMARY}10`, marginTop: 16, paddingTop: 14 }}>
            <motion.button type="button" onClick={() => router.push('/')}
              whileHover={{ background: `${PRIMARY}10` }}
              style={{ width: '100%', height: 36, borderRadius: 10, fontSize: 11, fontWeight: 500, color: PRIMARY, border: `1px solid ${PRIMARY}18`, background: `${PRIMARY}06`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'background 0.2s' }}>
              <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
              العودة للصفحة الرئيسية
            </motion.button>
          </div>
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          style={{ textAlign: 'center', fontSize: 10, color: '#9CA3AF', marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
          <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
          هذه الصفحة مخصصة للفريق الداخلي فقط
        </motion.p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}