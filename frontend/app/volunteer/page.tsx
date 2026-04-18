'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useLang } from '@/app/providers/LangProvider';
import { useTheme } from '@/app/providers/ThemeProvider';
import api from '@/lib/axios';

const PRIMARY   = '#1B6CA8';
const PRIMARY_L = '#4AACCD';

const fadeUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

const regions = [
  'دمشق', 'ريف دمشق', 'حلب', 'حمص', 'حماة',
  'اللاذقية', 'طرطوس', 'إدلب', 'الحسكة',
  'دير الزور', 'الرقة', 'السويداء', 'درعا', 'القنيطرة', 'خارج سوريا',
];

export default function VolunteerPage() {
  const router   = useRouter();
  const { lang, dir } = useLang();
  const { dark } = useTheme();

  const t = dark ? {
    bg:       '#0D1B2A',
    card:     '#162436',
    text:     '#F1F5F9',
    textSub:  '#94A3B8',
    textMute: '#64748B',
    border:   'rgba(255,255,255,0.08)',
    input:    '#1E3048',
    navBg:    'rgba(13,27,42,0.95)',
    headerBg: `rgba(27,108,168,0.12)`,
  } : {
    bg:       '#F0F7FF',
    card:     '#FFFFFF',
    text:     '#111827',
    textSub:  '#374151',
    textMute: '#9CA3AF',
    border:   `${PRIMARY}15`,
    input:    '#FFFFFF',
    navBg:    'rgba(255,255,255,0.93)',
    headerBg: `${PRIMARY}05`,
  };

  const [form, setForm] = useState({
    name:           '',
    phone:          '',
    email:          '',
    region:         '',
    volunteer_type: '',
    skills:         '',
    availability:   '',
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  // ✅ submitted في ref — لا يتأثر بأي re-render من useLang أو useTheme
  const submittedRef              = useRef(false);
  const [, forceUpdate]           = useState(0);

  const tx = {
    hero:         lang === 'ar' ? 'انضم إلى فريق غزلان الخير' : 'Join the Ghozlan Alkhair Team',
    heroSub:      lang === 'ar' ? 'كل يد تساعد تُحدث فرقاً — كن جزءاً من التغيير' : 'Every helping hand makes a difference — be part of the change',
    badge:        lang === 'ar' ? 'باب التطوع مفتوح' : 'Volunteering is open',
    formTitle:    lang === 'ar' ? 'نموذج التطوع' : 'Volunteer Form',
    formSub:      lang === 'ar' ? 'أدخل بياناتك وسيتواصل معك فريقنا' : 'Fill in your details and our team will reach out',
    name:         lang === 'ar' ? 'الاسم الكامل' : 'Full Name',
    namePh:       lang === 'ar' ? 'أدخل اسمك الكامل' : 'Enter your full name',
    phone:        lang === 'ar' ? 'رقم الهاتف' : 'Phone Number',
    email:        lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address',
    region:       lang === 'ar' ? 'المنطقة / المحافظة' : 'Region / Governorate',
    regionOpt:    lang === 'ar' ? 'اختر المنطقة' : 'Select region',
    type:         lang === 'ar' ? 'نوع التطوع' : 'Volunteer Type',
    typeOpt:      lang === 'ar' ? 'اختر نوع التطوع' : 'Select type',
    typeOpts: lang === 'ar' ? [
      { value: 'technical',      label: 'دعم تقني' },
      { value: 'field',          label: 'متابعة ميدانية' },
      { value: 'administrative', label: 'عمل إداري' },
      { value: 'social',         label: 'دعم اجتماعي' },
      { value: 'other',          label: 'أخرى' },
    ] : [
      { value: 'technical',      label: 'Technical Support' },
      { value: 'field',          label: 'Field Follow-up' },
      { value: 'administrative', label: 'Administrative Work' },
      { value: 'social',         label: 'Social Support' },
      { value: 'other',          label: 'Other' },
    ],
    skills:       lang === 'ar' ? 'الخبرات والمهارات' : 'Skills & Experience',
    skillsPh:     lang === 'ar' ? 'اذكر مهاراتك وخبراتك المتعلقة بالتطوع...' : 'Describe your relevant skills and experience...',
    availability: lang === 'ar' ? 'وقت التفرغ' : 'Availability',
    availOpt:     lang === 'ar' ? 'اختر وقت التفرغ' : 'Select availability',
    availOpts: lang === 'ar' ? [
      { value: 'full',    label: 'كلي — متفرغ بالكامل' },
      { value: 'partial', label: 'جزئي — بضع ساعات أسبوعياً' },
      { value: 'remote',  label: 'عن بُعد فقط' },
    ] : [
      { value: 'full',    label: 'Full-time — fully available' },
      { value: 'partial', label: 'Part-time — few hours weekly' },
      { value: 'remote',  label: 'Remote only' },
    ],
    submit:       lang === 'ar' ? 'إرسال طلب التطوع' : 'Submit Volunteer Request',
    submitting:   lang === 'ar' ? 'جاري الإرسال...' : 'Submitting...',
    successTitle: lang === 'ar' ? 'شكراً لتطوعك!' : 'Thank you for volunteering!',
    successSub:   lang === 'ar' ? 'استلمنا طلبك وسيتواصل معك فريقنا قريباً' : 'We received your request and our team will contact you soon',
    backHome:     lang === 'ar' ? 'العودة للرئيسية' : 'Back to Home',
    required:     lang === 'ar' ? 'يرجى تعبئة الحقول المطلوبة' : 'Please fill in all required fields',
    errGeneral:   lang === 'ar' ? 'حدث خطأ، حاول مجدداً' : 'An error occurred, please try again',
    privacy:      lang === 'ar' ? 'بياناتك محمية ولن تُشارك مع أي جهة خارجية' : 'Your data is protected and will not be shared with any third party',
    home:         lang === 'ar' ? 'الرئيسية' : 'Home',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', height: 44, borderRadius: 12, padding: '0 14px',
    border: `1.5px solid ${dark ? 'rgba(255,255,255,0.1)' : PRIMARY + '25'}`,
    background: t.input, fontSize: 13, color: t.text, outline: 'none',
    transition: 'border-color 0.2s', boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 12, fontWeight: 700, color: t.textSub, display: 'block', marginBottom: 6,
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    (e.target as HTMLElement).style.borderColor = PRIMARY;
  };
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    (e.target as HTMLElement).style.borderColor = dark ? 'rgba(255,255,255,0.1)' : `${PRIMARY}25`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.region || !form.volunteer_type || !form.availability) {
      setError(tx.required); return;
    }
    setLoading(true); setError('');
    try {
      await api.post('/volunteer', form);
      submittedRef.current = true;
      forceUpdate(n => n + 1);
    } catch {
      setError(tx.errGeneral);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir={dir} style={{ minHeight: '100vh', background: t.bg }}>

      {/* Navbar */}
      <nav style={{ background: t.navBg, backdropFilter: 'blur(12px)', borderBottom: `1px solid ${t.border}`, position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 20px', height: 62, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => router.push('/')}>
            <img src="/g-logo.png" alt="" style={{ width: 36, height: 36, objectFit: 'contain' }}
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}/>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: t.text, lineHeight: 1.2 }}>
                {lang === 'ar' ? 'غزلان الخير' : 'Ghozlan Alkhair'}
              </div>
              <div style={{ fontSize: 8, color: PRIMARY_L, letterSpacing: '1px', textTransform: 'uppercase' as const, fontWeight: 500 }}>
                {lang === 'ar' ? 'Ghozlan Alkhair' : 'غزلان الخير'}
              </div>
            </div>
          </div>
          <button onClick={() => router.push('/')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '7px 14px', borderRadius: 10, border: `1px solid ${t.border}`, background: dark ? 'rgba(255,255,255,0.05)' : `${PRIMARY}06`, color: t.textSub, cursor: 'pointer' }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
            {tx.home}
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, #1558A0 60%, #0D3D72 100%)`, padding: '52px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -60, left: -60, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }}/>
        <div style={{ position: 'absolute', bottom: -40, right: 80, width: 160, height: 160, borderRadius: '50%', background: 'rgba(201,168,76,0.1)' }}/>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 16, padding: '5px 14px', borderRadius: 100, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', fontSize: 11, color: 'rgba(255,255,255,0.85)' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ADE80', display: 'inline-block' }}/>
            {tx.badge}
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            style={{ fontSize: 'clamp(22px,4vw,32px)', fontWeight: 900, color: 'white', marginBottom: 12, letterSpacing: '-0.5px' }}>
            {tx.hero}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', maxWidth: 480, margin: '0 auto' }}>
            {tx.heroSub}
          </motion.p>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '32px 20px 60px' }}>

        {submittedRef.current ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
            style={{ background: t.card, borderRadius: 20, padding: '48px 32px', textAlign: 'center', border: `1px solid ${dark ? 'rgba(74,222,128,0.2)' : '#A7F3D0'}`, boxShadow: '0 4px 24px rgba(5,150,105,0.1)' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: dark ? 'rgba(5,150,105,0.15)' : '#D1FAE5', border: `3px solid ${dark ? 'rgba(74,222,128,0.3)' : '#6EE7B7'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <svg width="32" height="32" fill="none" stroke={dark ? '#4ADE80' : '#059669'} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: t.text, marginBottom: 10 }}>{tx.successTitle}</h2>
            <p style={{ fontSize: 13, color: t.textMute, marginBottom: 28, lineHeight: 1.7 }}>{tx.successSub}</p>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => { submittedRef.current = false; window.location.href = '/'; }}
              style={{ padding: '11px 28px', borderRadius: 12, background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_L})`, color: 'white', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
              {tx.backHome}
            </motion.button>
          </motion.div>
        ) : (
          <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.08 } } }}>
            <motion.div variants={fadeUp}
              style={{ background: t.card, borderRadius: 20, overflow: 'hidden', border: `1px solid ${t.border}`, boxShadow: dark ? '0 4px 24px rgba(0,0,0,0.3)' : `0 4px 24px ${PRIMARY}08`, marginBottom: 16 }}>

              {/* Header */}
              <div style={{ padding: '18px 24px', borderBottom: `1px solid ${t.border}`, background: t.headerBg, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${PRIMARY}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: PRIMARY, flexShrink: 0 }}>
                  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: t.text }}>{tx.formTitle}</div>
                  <div style={{ fontSize: 11, color: t.textMute }}>{tx.formSub}</div>
                </div>
              </div>

              <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>{tx.name} <span style={{ color: '#EF4444' }}>*</span></label>
                    <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder={tx.namePh} style={inputStyle} onFocus={handleFocus} onBlur={handleBlur}/>
                  </div>

                  <div>
                    <label style={labelStyle}>{tx.phone} <span style={{ color: '#EF4444' }}>*</span></label>
                    <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      placeholder="09xxxxxxxx" style={inputStyle} onFocus={handleFocus} onBlur={handleBlur}/>
                  </div>

                  <div>
                    <label style={labelStyle}>{tx.email}</label>
                    <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="example@email.com" style={inputStyle} onFocus={handleFocus} onBlur={handleBlur}/>
                  </div>

                  <div>
                    <label style={labelStyle}>{tx.region} <span style={{ color: '#EF4444' }}>*</span></label>
                    <select value={form.region} onChange={e => setForm(f => ({ ...f, region: e.target.value }))}
                      style={{ ...inputStyle, cursor: 'pointer' }} onFocus={handleFocus} onBlur={handleBlur}>
                      <option value="">{tx.regionOpt}</option>
                      {regions.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle}>{tx.type} <span style={{ color: '#EF4444' }}>*</span></label>
                    <select value={form.volunteer_type} onChange={e => setForm(f => ({ ...f, volunteer_type: e.target.value }))}
                      style={{ ...inputStyle, cursor: 'pointer' }} onFocus={handleFocus} onBlur={handleBlur}>
                      <option value="">{tx.typeOpt}</option>
                      {tx.typeOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle}>{tx.availability} <span style={{ color: '#EF4444' }}>*</span></label>
                    <select value={form.availability} onChange={e => setForm(f => ({ ...f, availability: e.target.value }))}
                      style={{ ...inputStyle, cursor: 'pointer' }} onFocus={handleFocus} onBlur={handleBlur}>
                      <option value="">{tx.availOpt}</option>
                      {tx.availOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>{tx.skills}</label>
                    <textarea value={form.skills} onChange={e => setForm(f => ({ ...f, skills: e.target.value }))}
                      placeholder={tx.skillsPh} rows={4}
                      style={{ ...inputStyle, height: 'auto', padding: '12px 14px', resize: 'none' as const, lineHeight: 1.6 }}
                      onFocus={handleFocus} onBlur={handleBlur}/>
                  </div>
                </div>

                {error && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: dark ? 'rgba(220,38,38,0.1)' : '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: '#DC2626' }}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    {error}
                  </div>
                )}

                <motion.button type="submit" disabled={loading}
                  whileHover={!loading ? { scale: 1.02, boxShadow: `0 8px 28px ${PRIMARY}45` } : {}}
                  whileTap={!loading ? { scale: 0.98 } : {}}
                  style={{ width: '100%', height: 48, background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_L})`, color: 'white', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.65 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {loading ? (
                    <><span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }}/>{tx.submitting}</>
                  ) : (
                    <>{tx.submit}<svg width="16" height="16" fill="none" stroke="white" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg></>
                  )}
                </motion.button>
              </form>
            </motion.div>

            <motion.p variants={fadeUp}
              style={{ textAlign: 'center', fontSize: 11, color: t.textMute, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
              <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
              {tx.privacy}
            </motion.p>
          </motion.div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}