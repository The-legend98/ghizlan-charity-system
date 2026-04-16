'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';

const PRIMARY   = '#1B6CA8';
const PRIMARY_L = '#4AACCD';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await api.post('/forgot-password', { email });
      setSent(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'حدث خطأ، تحقق من البريد وحاول مجدداً');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: '#EEF5FB' }} dir="rtl">

      {/* BG */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <svg width="100%" height="100%" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="dotsFP" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
              <circle cx="15" cy="15" r="1" fill="#1B6CA8" opacity="0.12"/>
            </pattern>
          </defs>
          <rect width="1200" height="800" fill="url(#dotsFP)"/>
          <circle cx="1150" cy="80"  r="200" fill="none" stroke="#1B6CA8" strokeWidth="0.6" opacity="0.2"/>
          <circle cx="1150" cy="80"  r="140" fill="none" stroke="#4AACCD" strokeWidth="0.6" opacity="0.2"/>
          <circle cx="50"   cy="720" r="160" fill="none" stroke="#1B6CA8" strokeWidth="0.6" opacity="0.15"/>
        </svg>
      </div>

      <div className="w-full max-w-md" style={{ position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div className="flex flex-col items-center justify-center text-center mb-8">
          <img src="/g-logo.png" alt="غزلان الخير" className="mx-auto mb-4"
            style={{ width: 80, height: 80, objectFit: 'contain', filter: 'drop-shadow(0 0 7px rgba(74,172,205,0.45))' }}
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <h1 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#111827' }}>مؤسسة غزلان الخير</h1>
          <p style={{ color: PRIMARY_L, fontSize: '0.8rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '1px', marginTop: 4 }}>
            Ghozlan Alkhair Foundation
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8"
          style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', border: `1px solid ${PRIMARY}20`, boxShadow: `0 8px 40px ${PRIMARY}15` }}>

          {sent ? (
            /* Success */
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{ background: '#D1FAE5', border: '3px solid #6EE7B7' }}>
                <svg className="w-8 h-8" fill="none" stroke="#059669" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <h2 className="text-base font-bold text-gray-900 mb-2">تم إرسال الرابط!</h2>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                تحقق من بريدك الإلكتروني وافتح رابط إعادة تعيين كلمة المرور
              </p>
              <button onClick={() => router.push('/dashboard/login')}
                className="w-full h-11 text-white rounded-xl text-sm font-semibold"
                style={{ background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_L})` }}>
                العودة لتسجيل الدخول
              </button>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${PRIMARY}12` }}>
                  <svg className="w-5 h-5" fill="none" stroke={PRIMARY} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">نسيت كلمة المرور؟</h2>
                  <p className="text-xs text-gray-400">أدخل بريدك وسنرسل لك رابط الاسترداد</p>
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

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">البريد الإلكتروني</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="example@ghozlan.org" required
                    className="w-full h-11 rounded-xl px-4 text-sm text-gray-900 focus:outline-none transition-all"
                    style={{ border: `2px solid ${PRIMARY}25`, background: 'white' }}
                    onFocus={e => (e.target.style.borderColor = `${PRIMARY}60`)}
                    onBlur={e  => (e.target.style.borderColor = `${PRIMARY}25`)}
                  />
                </div>

                <button type="submit" disabled={loading}
                  className="w-full h-12 text-white rounded-xl text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2"
                  style={{ background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_L})`, boxShadow: `0 4px 16px ${PRIMARY}40` }}>
                  {loading ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>جاري الإرسال...</>
                  ) : (
                    <>إرسال رابط الاسترداد<svg className="w-4 h-4" fill="none" stroke="white" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg></>
                  )}
                </button>
              </form>

              <div className="mt-5 pt-5 text-center" style={{ borderTop: `1px solid ${PRIMARY}12` }}>
                <button onClick={() => router.push('/dashboard/login')}
                  className="text-xs font-medium transition-all flex items-center justify-center gap-1.5 w-full"
                  style={{ color: PRIMARY, background: 'none', border: 'none', cursor: 'pointer' }}>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
                  العودة لتسجيل الدخول
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}