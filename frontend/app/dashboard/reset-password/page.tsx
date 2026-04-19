'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/axios';

const PRIMARY   = '#1B6CA8';
const PRIMARY_L = '#4AACCD';

function ResetPasswordContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const token        = searchParams.get('token') || '';
  const email        = searchParams.get('email') || '';

  const [form, setForm]   = useState({ password: '', password_confirmation: '' });
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);
  const [error, setError]     = useState('');
  const [showPass, setShowPass]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.password_confirmation) {
      setError('كلمتا المرور غير متطابقتين'); return;
    }
    if (form.password.length < 8) {
      setError('كلمة المرور يجب أن تكون ٨ أحرف على الأقل'); return;
    }
    setLoading(true); setError('');
    try {
      await api.post('/reset-password', { token, email, ...form });
      setDone(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'الرابط غير صالح أو منتهي الصلاحية');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    border: `2px solid ${PRIMARY}25`, background: 'white',
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: '#EEF5FB' }} dir="rtl">

      {/* BG */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <svg width="100%" height="100%" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="dotsRP" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
              <circle cx="15" cy="15" r="1" fill="#1B6CA8" opacity="0.12"/>
            </pattern>
          </defs>
          <rect width="1200" height="800" fill="url(#dotsRP)"/>
          <circle cx="1150" cy="80" r="200" fill="none" stroke="#1B6CA8" strokeWidth="0.6" opacity="0.2"/>
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
          <p style={{ color: PRIMARY_L, fontSize: '0.8rem', fontWeight: 500, textTransform: 'uppercase' as const, letterSpacing: '1px', marginTop: 4 }}>
            Ghozlan Alkhair Foundation
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8"
          style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', border: `1px solid ${PRIMARY}20`, boxShadow: `0 8px 40px ${PRIMARY}15` }}>

          {done ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{ background: '#D1FAE5', border: '3px solid #6EE7B7' }}>
                <svg className="w-8 h-8" fill="none" stroke="#059669" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <h2 className="text-base font-bold text-gray-900 mb-2">تم تغيير كلمة المرور!</h2>
              <p className="text-sm text-gray-500 mb-6">يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة</p>
              <button onClick={() => router.push('/login')}
                className="w-full h-11 text-white rounded-xl text-sm font-semibold"
                style={{ background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_L})` }}>
                تسجيل الدخول
              </button>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${PRIMARY}12` }}>
                  <svg className="w-5 h-5" fill="none" stroke={PRIMARY} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">تعيين كلمة مرور جديدة</h2>
                  <p className="text-xs text-gray-400">اختر كلمة مرور قوية لحسابك</p>
                </div>
              </div>

              {!token && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
                  <p className="text-sm text-red-700">الرابط غير صالح — يرجى طلب رابط جديد</p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5 flex items-center gap-2">
                  <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">

                {/* كلمة المرور */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">كلمة المرور الجديدة</label>
                  <div className="relative">
                    <input type={showPass ? 'text' : 'password'}
                      value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                      placeholder="••••••••" required minLength={8}
                      className="w-full h-11 rounded-xl px-4 text-sm text-gray-900 focus:outline-none transition-all"
                      style={inputStyle}
                      onFocus={e => (e.target.style.borderColor = `${PRIMARY}60`)}
                      onBlur={e  => (e.target.style.borderColor = `${PRIMARY}25`)}
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPass ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">٨ أحرف على الأقل</p>
                </div>

                {/* تأكيد كلمة المرور */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">تأكيد كلمة المرور</label>
                  <div className="relative">
                    <input type={showConfirm ? 'text' : 'password'}
                      value={form.password_confirmation} onChange={e => setForm(f => ({ ...f, password_confirmation: e.target.value }))}
                      placeholder="••••••••" required
                      className="w-full h-11 rounded-xl px-4 text-sm text-gray-900 focus:outline-none transition-all"
                      style={inputStyle}
                      onFocus={e => (e.target.style.borderColor = `${PRIMARY}60`)}
                      onBlur={e  => (e.target.style.borderColor = `${PRIMARY}25`)}
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showConfirm ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* strength indicator */}
                {form.password && (
                  <div>
                    <div className="flex gap-1 mb-1">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="h-1 flex-1 rounded-full transition-all"
                          style={{ background: form.password.length >= i * 2 ? (form.password.length >= 8 ? '#059669' : '#D97706') : '#E5E7EB' }}/>
                      ))}
                    </div>
                    <p className="text-xs" style={{ color: form.password.length >= 8 ? '#059669' : '#D97706' }}>
                      {form.password.length >= 8 ? 'كلمة مرور قوية' : 'كلمة مرور ضعيفة'}
                    </p>
                  </div>
                )}

                <button type="submit" disabled={loading || !token}
                  className="w-full h-12 text-white rounded-xl text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
                  style={{ background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_L})`, boxShadow: `0 4px 16px ${PRIMARY}40` }}>
                  {loading ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>جاري الحفظ...</>
                  ) : (
                    <>حفظ كلمة المرور الجديدة<svg className="w-4 h-4" fill="none" stroke="white" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg></>
                  )}
                </button>
              </form>

              <div className="mt-5 pt-5 text-center" style={{ borderTop: `1px solid ${PRIMARY}12` }}>
                <button onClick={() => router.push('/login')}
                  className="text-xs font-medium flex items-center justify-center gap-1.5 w-full"
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

export default function ResetPasswordPage() {
  return <Suspense><ResetPasswordContent /></Suspense>;
}