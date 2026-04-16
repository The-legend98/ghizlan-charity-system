'use client';

import { useState } from 'react';
import api from '@/lib/axios';
import { motion, useScroll, useSpring, AnimatePresence, Variants } from 'framer-motion';
import { useTheme } from '@/app/providers/ThemeProvider';
import { useLang } from '@/app/providers/LangProvider';
import { THEMES, PRIMARY, PRIMARY_L, GOLD } from '@/lib/themes';
import Navbar from '@/components/Navbar';

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  return (
    <motion.div style={{ scaleX, transformOrigin: 'left', position: 'fixed', top: 0, left: 0, right: 0, height: 3, zIndex: 999, background: `linear-gradient(to right, ${PRIMARY}, ${PRIMARY_L}, ${GOLD})` }} />
  );
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function TrackPage() {
  const { dark } = useTheme();
  const { lang, dir } = useLang();
  const t = dark ? THEMES.dark : THEMES.light;

  const [query, setQuery]                 = useState('');
  const [result, setResult]               = useState<any>(null);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState('');
  const [files, setFiles]                 = useState<File[]>([]);
  const [uploading, setUploading]         = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError]     = useState('');

  const tx = {
    heroTitle: lang === 'ar' ? 'تتبع حالة طلبك' : 'Track Your Request',
    heroSub: lang === 'ar' ? 'أدخل رقم طلبك المرجعي أو رقم هاتفك لمعرفة آخر تحديث' : 'Enter your reference number or phone number to get the latest update',
    placeholder: lang === 'ar' ? 'مثال: GH-1234567 أو رقم هاتفك' : 'E.g.: GH-1234567 or your phone number',
    search: lang === 'ar' ? 'بحث' : 'Search',
    notFound: lang === 'ar' ? 'لم يتم العثور على طلب بهذا الرقم أو الهاتف' : 'No request found with this number or phone',
    steps: lang === 'ar' ? ['تم التقديم', 'قيد المراجعة', 'القرار النهائي'] : ['Submitted', 'Under Review', 'Final Decision'],
    details: lang === 'ar' ? 'تفاصيل الطلب' : 'Request Details',
    assistanceType: lang === 'ar' ? 'نوع المساعدة' : 'Assistance Type',
    submitDate: lang === 'ar' ? 'تاريخ التقديم' : 'Submission Date',
    lastUpdate: lang === 'ar' ? 'آخر تحديث' : 'Last Update',
    currentStatus: lang === 'ar' ? 'الحالة الحالية' : 'Current Status',
    uploadTitle: lang === 'ar' ? 'رفع مستندات إضافية' : 'Upload Additional Documents',
    uploadSub: lang === 'ar' ? 'ارفع الملفات المطلوبة (صور أو PDF) — الحد الأقصى 5MB لكل ملف' : 'Upload required files (images or PDF) — max 5MB per file',
    uploadArea: lang === 'ar' ? 'اضغط لاختيار الملفات' : 'Click to select files',
    uploadBtn: lang === 'ar' ? 'رفع الملفات' : 'Upload Files',
    uploading: lang === 'ar' ? 'جاري الرفع...' : 'Uploading...',
    uploadDone: lang === 'ar' ? 'تم رفع الملفات بنجاح!' : 'Files uploaded successfully!',
    uploadDoneSub: lang === 'ar' ? 'سيراجع فريقنا الملفات المرفوعة ويتواصل معك قريباً' : 'Our team will review the uploaded files and contact you soon',
    footerNote: lang === 'ar' ? 'تحتاج مساعدة؟ تواصل معنا عبر واتساب' : 'Need help? Contact us via WhatsApp',
    statusMessages: {
      new:        lang === 'ar' ? 'تم استلام طلبك وسيبدأ فريقنا بمراجعته قريباً.' : 'Your request has been received and our team will begin reviewing it soon.',
      reviewing:  lang === 'ar' ? 'طلبك قيد المراجعة حالياً. سنتواصل معك خلال ١-٣ أيام عمل.' : 'Your request is currently under review. We will contact you within 1-3 business days.',
      needs_info: lang === 'ar' ? 'نحتاج منك مستندات أو معلومات إضافية. يرجى رفع الملفات المطلوبة أدناه.' : 'We need additional documents or information from you. Please upload the required files below.',
      approved:   lang === 'ar' ? 'تهانينا! تم قبول طلبك. سيتواصل معك فريقنا لترتيب تقديم المساعدة.' : 'Congratulations! Your request has been approved. Our team will contact you to arrange the assistance.',
      rejected:   lang === 'ar' ? 'نأسف، لم نتمكن من قبول طلبك في الوقت الحالي. يمكنك التواصل معنا لمزيد من المعلومات.' : 'We\'re sorry, we were unable to approve your request at this time. You can contact us for more information.',
    },
  };

  const statusMap: Record<string, { label: string; color: string; step: number }> = {
    new:        { label: lang === 'ar' ? 'جديد' : 'New',               color: 'blue',   step: 1 },
    reviewing:  { label: lang === 'ar' ? 'قيد المراجعة' : 'Reviewing', color: 'yellow', step: 2 },
    needs_info: { label: lang === 'ar' ? 'بحاجة معلومات' : 'Needs Info', color: 'orange', step: 2 },
    approved:   { label: lang === 'ar' ? 'مقبول' : 'Approved',         color: 'green',  step: 3 },
    rejected:   { label: lang === 'ar' ? 'مرفوض' : 'Rejected',         color: 'red',    step: 3 },
  };

  const assistanceLabels: Record<string, string> = {
    medical:   lang === 'ar' ? 'علاج طبي'  : 'Medical Care',
    education: lang === 'ar' ? 'تعليم'      : 'Education',
    financial: lang === 'ar' ? 'دعم معيشي' : 'Financial Aid',
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true); setError(''); setResult(null);
    setFiles([]); setUploadSuccess(false); setUploadError('');
    try {
      const res = await api.get(`/requests/track?query=${query.trim()}`);
      setResult(res.data);
    } catch {
      setError(tx.notFound);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!files.length || !result) return;
    setUploading(true); setUploadError('');
    try {
      const formData = new FormData();
      formData.append('phone', result.phone);
      formData.append('ref_number', result.ref_number);
      files.forEach(f => formData.append('files[]', f));
      await api.post(`/requests/${result.id}/documents/add`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setUploadSuccess(true); setFiles([]);
    } catch (err: any) {
      setUploadError(err.response?.data?.message || (lang === 'ar' ? 'حدث خطأ أثناء الرفع' : 'Upload error occurred'));
    } finally {
      setUploading(false);
    }
  };

  const status = result ? statusMap[result.status] : null;

  const getStatusColors = (color: string) => {
    const map: Record<string, { bg: string; border: string; text: string; badge: string }> = {
      green:  { bg: dark ? '#0D2B1A' : '#F0FDF4', border: dark ? '#166534' : '#BBF7D0', text: dark ? '#4ADE80' : '#166534', badge: dark ? '#14532D' : '#DCFCE7' },
      red:    { bg: dark ? '#2D1515' : '#FEF2F2', border: dark ? '#991B1B' : '#FECACA', text: dark ? '#F87171' : '#991B1B', badge: dark ? '#450A0A' : '#FEE2E2' },
      yellow: { bg: dark ? '#2D2510' : '#FFFBEB', border: dark ? '#854D0E' : '#FDE68A', text: dark ? '#FBBF24' : '#854D0E', badge: dark ? '#422006' : '#FEF9C3' },
      orange: { bg: dark ? '#2D1A0A' : '#FFF7ED', border: dark ? '#9A3412' : '#FED7AA', text: dark ? '#FB923C' : '#9A3412', badge: dark ? '#431407' : '#FFEDD5' },
      blue:   { bg: dark ? `${PRIMARY}18` : `${PRIMARY}08`, border: dark ? `${PRIMARY}50` : `${PRIMARY}20`, text: dark ? PRIMARY_L : PRIMARY, badge: dark ? `${PRIMARY}25` : `${PRIMARY}15` },
    };
    return map[color] || map.blue;
  };

  return (
    <div dir={dir} style={{ minHeight: '100vh', background: t.bg2, transition: 'background 0.3s', position: 'relative', overflowX: 'hidden' }}>

      <ScrollProgress />

      {/* خلفية ديكورية متحركة */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <motion.div animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.9, 0.5] }} transition={{ duration: 8, repeat: Infinity }}
          style={{ position: 'absolute', top: -100, right: -100, width: 380, height: 380, borderRadius: '50%', background: `radial-gradient(circle, ${PRIMARY}15 0%, transparent 70%)` }} />
        <motion.div animate={{ scale: [1, 1.12, 1], opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 10, repeat: Infinity, delay: 2 }}
          style={{ position: 'absolute', top: 250, left: -80, width: 260, height: 260, borderRadius: '50%', background: `radial-gradient(circle, ${GOLD}10 0%, transparent 70%)` }} />
      </div>

      <Navbar />

      {/* HERO */}
      <div style={{ position: 'relative', zIndex: 1, background: `linear-gradient(135deg, ${PRIMARY}ee 0%, ${PRIMARY_L}cc 100%)`, padding: '32px 20px 44px', textAlign: 'center', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.08 }}>
          <svg width="100%" height="100%" viewBox="0 0 400 180"><defs><pattern id="dots2" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.5" fill="white"/></pattern></defs><rect width="400" height="180" fill="url(#dots2)" /></svg>
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
            style={{ width: 56, height: 56, borderRadius: 18, margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.3)' }}
          >
            <svg style={{ width: 26, height: 26 }} fill="none" stroke="white" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            style={{ fontSize: 24, fontWeight: 900, color: 'white', marginBottom: 6, letterSpacing: '-0.5px' }}>
            {tx.heroTitle}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.35 }}
            style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, maxWidth: 300, margin: '0 auto', lineHeight: 1.6 }}>
            {tx.heroSub}
          </motion.p>
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
          <svg viewBox="0 0 1440 28" fill={t.bg2} style={{ display: 'block' }}><path d="M0,14 C360,28 1080,0 1440,14 L1440,28 L0,28 Z"/></svg>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '24px 16px 48px', position: 'relative', zIndex: 1 }}>

        {/* Search Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          style={{ background: t.card, borderRadius: 20, border: `1px solid ${t.border}`, boxShadow: dark ? '0 4px 24px rgba(0,0,0,0.3)' : '0 4px 24px rgba(27,108,168,0.07)', padding: '20px 16px', marginBottom: 16 }}
        >
          <div style={{ display: 'flex', gap: 10 }}>
            <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder={tx.placeholder}
              style={{ flex: 1, height: 46,  borderRadius: 12, padding: '0 14px', fontSize: 13, color: t.text, background: dark ? 'rgba(255,255,255,0.06)' : t.bg2,
                      border: `1.5px solid ${dark ? 'rgba(255,255,255,0.12)' : t.border}`,outline: 'none', transition: 'all 0.2s' }}
            />
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSearch} disabled={loading}
              style={{ height: 46, padding: '0 18px', background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_L})`, color: 'white', border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: 6, boxShadow: `0 4px 14px ${PRIMARY}40`, flexShrink: 0 }}
            >
              {loading
                ? <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                : <><svg style={{ width: 15, height: 15 }} fill="none" stroke="white" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>{tx.search}</>
              }
            </motion.button>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 10 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#EF4444', background: dark ? '#2D1515' : '#FEF2F2', borderRadius: 10, padding: '8px 12px', fontSize: 12 }}
              >
                <svg style={{ width: 14, height: 14, flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                {error}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Result */}
        <AnimatePresence>
          {result && status && (() => {
            const sc = getStatusColors(status.color);
            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
              >

                {/* Status Card */}
                <motion.div
                  initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                  style={{ background: t.card, borderRadius: 20, border: `1px solid ${t.border}`, boxShadow: dark ? '0 4px 24px rgba(0,0,0,0.3)' : '0 4px 24px rgba(27,108,168,0.07)', overflow: 'hidden' }}
                >
                  <div style={{ padding: '16px 20px', borderBottom: `1px solid ${sc.border}`, background: sc.bg }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                      <div>
                        <p style={{ fontSize: 11, color: sc.text, marginBottom: 4, fontWeight: 600, opacity: 0.8 }}>{result.ref_number}</p>
                        <p style={{ fontSize: 16, fontWeight: 800, color: t.text, margin: 0 }}>{result.full_name}</p>
                      </div>
                      <motion.span
                        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                        style={{ fontSize: 12, fontWeight: 700, padding: '6px 14px', borderRadius: 100, background: sc.badge, color: sc.text, whiteSpace: 'nowrap', flexShrink: 0 }}
                      >
                        {status.label}
                      </motion.span>
                    </div>
                  </div>

                  {/* Progress Bar */}
              <div style={{ padding: '24px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative' ,direction: 'ltr'}}>
                  
                  {/* خط الخلفية */}
                  <div style={{ position: 'absolute', top: 14, right: '10%', left: '10%', height: 3, borderRadius: 2, background: t.border }} />
                  
               {/* خط التقدم */}
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: status.step === 1 ? '0%' : status.step === 2 ? '40%' : '80%' }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                    style={{
                      position: 'absolute', top: 14,
                      left: '10%',  // ✅ ثابت
                      height: 3, borderRadius: 2,
                      background: `linear-gradient(to right, ${PRIMARY_L}, ${PRIMARY})`,
                      transformOrigin: 'right',  // ✅ يتمدد من اليمين دايماً
                    }}
                  />

                  {/* Steps — معكوسة بالإنجليزي */}
                  {tx.steps.map((step, i) => {
                      const stepNum = i + 1;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + i * 0.1 }}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, zIndex: 1, flex: 1 }}
                      >
                        <motion.div
                          animate={stepNum === status.step ? { boxShadow: [`0 0 0 0px ${PRIMARY}30`, `0 0 0 6px ${PRIMARY}20`, `0 0 0 0px ${PRIMARY}30`] } : {}}
                          transition={{ duration: 2, repeat: Infinity }}
                          style={{ width: 30, height: 30, borderRadius: '50%', border: `2.5px solid ${stepNum <= status.step ? PRIMARY : t.border}`, background: stepNum < status.step ? PRIMARY : t.card, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: stepNum < status.step ? 'white' : stepNum === status.step ? PRIMARY : t.textMute }}
                        >
                          {stepNum < status.step
                            ? <svg style={{ width: 14, height: 14 }} fill="none" stroke="white" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg>
                            : stepNum}
                        </motion.div>
                        <span style={{ fontSize: 10, fontWeight: 600, textAlign: 'center', color: stepNum === status.step ? PRIMARY : t.textMute, lineHeight: 1.3 }}>{step}</span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
                </motion.div>

                {/* Details */}
                <motion.div
                  initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                  style={{ background: t.card, borderRadius: 20, border: `1px solid ${t.border}`, boxShadow: dark ? '0 4px 24px rgba(0,0,0,0.3)' : '0 4px 24px rgba(27,108,168,0.07)', padding: '18px 16px' }}
                >
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: t.text, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <svg style={{ width: 16, height: 16 }} fill="none" stroke={PRIMARY} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                    {tx.details}
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {[
                      { label: tx.assistanceType, value: assistanceLabels[result.assistance_type] || result.assistance_type },
                      { label: tx.submitDate,     value: new Date(result.created_at).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-GB') },
                      { label: tx.lastUpdate,     value: new Date(result.updated_at).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-GB') },
                      { label: tx.currentStatus,  value: status.label },
                    ].map((item, i) => (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.08 }}
                        whileHover={{ scale: 1.02 }}
                        style={{ background: t.bg2, borderRadius: 12, padding: '10px 12px', border: `1px solid ${t.border}`, cursor: 'default' }}
                      >
                        <p style={{ fontSize: 10, color: t.textMute, marginBottom: 4 }}>{item.label}</p>
                        <p style={{ fontSize: 13, fontWeight: 700, color: t.text, margin: 0 }}>{item.value}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Message */}
                <motion.div
                  initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                  style={{ borderRadius: 16, padding: '14px 16px', display: 'flex', gap: 10, alignItems: 'flex-start', background: sc.bg, border: `1px solid ${sc.border}`, color: sc.text }}
                >
                  <motion.svg
                    animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 3, repeat: Infinity, repeatDelay: 5 }}
                    style={{ width: 17, height: 17, flexShrink: 0, marginTop: 1 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </motion.svg>
                  <span style={{ fontSize: 13, lineHeight: 1.7 }}>{(tx.statusMessages as any)[result.status]}</span>
                </motion.div>

                {/* Upload */}
                <AnimatePresence>
                  {result.status === 'needs_info' && !uploadSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      style={{ background: t.card, borderRadius: 20, border: `1px solid ${dark ? '#9A341230' : '#FED7AA'}`, boxShadow: dark ? '0 4px 24px rgba(0,0,0,0.3)' : '0 4px 24px rgba(249,115,22,0.07)', padding: '18px 16px' }}
                    >
                      <h3 style={{ fontSize: 13, fontWeight: 700, color: t.text, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: dark ? '#431407' : '#FFF7ED', flexShrink: 0 }}>
                          <svg style={{ width: 14, height: 14 }} fill="none" stroke="#F97316" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                        </div>
                        {tx.uploadTitle}
                      </h3>
                      <p style={{ fontSize: 11, color: t.textMute, marginBottom: 14 }}>{tx.uploadSub}</p>

                      <motion.div
                        whileHover={{ borderColor: '#F97316', background: dark ? '#43140730' : '#FFF7ED80' }}
                        onClick={() => document.getElementById('extra-files')?.click()}
                        style={{ borderRadius: 14, border: `2px dashed ${dark ? '#9A341250' : '#FB923C40'}`, padding: '20px 16px', textAlign: 'center', cursor: 'pointer', marginBottom: 12, background: dark ? '#43140720' : '#FFF7ED50', transition: 'all 0.2s' }}
                      >
                        <input id="extra-files" type="file" multiple accept="image/*,.pdf" style={{ display: 'none' }}
                          onChange={e => setFiles(prev => [...prev, ...Array.from(e.target.files || [])])} />
                        <motion.svg animate={{ y: [0, -4, 0] }} transition={{ duration: 2, repeat: Infinity }}
                          style={{ width: 28, height: 28, margin: '0 auto 8px', display: 'block' }} fill="none" stroke="#F97316" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                        </motion.svg>
                        <p style={{ fontSize: 12, fontWeight: 600, color: t.textSub, margin: 0 }}>{tx.uploadArea}</p>
                        <p style={{ fontSize: 11, color: t.textMute, marginTop: 3 }}>JPG, PNG, PDF</p>
                      </motion.div>

                      <AnimatePresence>
                        {files.length > 0 && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                            style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                            {files.map((f, i) => (
                              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                                style={{ display: 'flex', alignItems: 'center', gap: 8, borderRadius: 10, padding: '8px 12px', background: dark ? '#43140730' : '#FFF7ED', border: `1px solid ${dark ? '#9A341230' : '#FB923C20'}` }}>
                                <span style={{ fontSize: 12, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: t.text }}>{f.name}</span>
                                <span style={{ fontSize: 11, color: t.textMute, flexShrink: 0 }}>{(f.size / 1024).toFixed(0)} KB</span>
                                <motion.button whileHover={{ scale: 1.2 }} onClick={() => setFiles(files.filter((_, j) => j !== i))}
                                  style={{ color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, padding: '0 2px' }}>✕</motion.button>
                              </motion.div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {uploadError && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          style={{ borderRadius: 10, padding: '10px 12px', marginBottom: 10, fontSize: 12, color: '#EF4444', background: dark ? '#2D1515' : '#FEE2E2' }}>
                          ⚠️ {uploadError}
                        </motion.div>
                      )}

                      <motion.button
                        whileHover={!uploading && files.length ? { scale: 1.02, boxShadow: '0 6px 20px rgba(249,115,22,0.5)' } : {}}
                        whileTap={!uploading && files.length ? { scale: 0.97 } : {}}
                        onClick={handleUpload} disabled={uploading || !files.length}
                        style={{ width: '100%', height: 46, borderRadius: 12, fontSize: 13, fontWeight: 700, color: 'white', border: 'none', cursor: uploading || !files.length ? 'not-allowed' : 'pointer', opacity: !files.length ? 0.5 : 1, background: files.length ? 'linear-gradient(135deg, #F97316, #FB923C)' : t.border, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: files.length ? '0 4px 14px rgba(249,115,22,0.4)' : 'none' }}
                      >
                        {uploading
                          ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />{tx.uploading}</>
                          : <><svg style={{ width: 15, height: 15 }} fill="none" stroke="white" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>{tx.uploadBtn} {files.length > 0 ? `(${files.length})` : ''}</>
                        }
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Upload Success */}
                <AnimatePresence>
                  {uploadSuccess && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                      style={{ borderRadius: 18, padding: '24px 16px', textAlign: 'center', background: dark ? '#0D2B1A' : '#F0FDF4', border: `1px solid ${dark ? '#166534' : '#BBF7D0'}` }}
                    >
                      <motion.div
                        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
                        style={{ width: 50, height: 50, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', background: dark ? '#14532D' : '#DCFCE7' }}
                      >
                        <svg style={{ width: 24, height: 24 }} fill="none" stroke="#059669" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg>
                      </motion.div>
                      <p style={{ fontSize: 14, fontWeight: 800, color: dark ? '#4ADE80' : '#166534', marginBottom: 4 }}>{tx.uploadDone}</p>
                      <p style={{ fontSize: 12, color: dark ? '#86EFAC' : '#15803D', margin: 0 }}>{tx.uploadDoneSub}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

              </motion.div>
            );
          })()}
        </AnimatePresence>

        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          style={{ textAlign: 'center', fontSize: 11, color: t.textMute, marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
        >
          <svg style={{ width: 13, height: 13 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
          {tx.footerNote}
        </motion.p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: ${t.textMute}; opacity: 0.6; }
        input:focus { border-color: ${PRIMARY}80 !important; box-shadow: 0 0 0 3px ${PRIMARY}12; background: ${t.card} !important; }
      `}</style>
    </div>
  );
}