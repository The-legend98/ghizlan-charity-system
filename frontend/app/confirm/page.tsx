'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useState, useRef } from 'react';
import { motion, useScroll, useSpring, AnimatePresence, Variants } from 'framer-motion';
import api from '@/lib/axios';
import { useLang } from '@/app/providers/LangProvider';
import { useTheme } from '@/app/providers/ThemeProvider';
import Navbar from '@/components/Navbar';

const PRIMARY   = '#1B6CA8';
const PRIMARY_L = '#4AACCD';
const GOLD      = '#C9A84C';

const THEMES = {
  light: {
    bg:       '#F0F7FF',
    card:     '#ffffff',
    border:   '#E5E7EB',
    text:     '#111827',
    textMute: '#6B7280',
    textSub:  '#9CA3AF',
    input:    '#ffffff',
  },
  dark: {
    bg:       '#0A1628',
    card:     '#0F1E35',
    border:   'rgba(74,172,205,0.12)',
    text:     '#F9FAFB',
    textMute: '#9CA3AF',
    textSub:  '#6B7280',
    input:    '#0A1628',
  },
};

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

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

function ConfirmContent() {
  const params    = useSearchParams();
  const router    = useRouter();
  const { lang, dir } = useLang();
  const { dark }  = useTheme();
  const t         = dark ? THEMES.dark : THEMES.light;

  const ref       = params.get('ref')       || '0';
  const name      = params.get('name')      || '';
  const requestId = params.get('requestId') || '';

  const [files, setFiles]             = useState<{ file: File; type: string }[]>([]);
  const [uploading, setUploading]     = useState(false);
  const [uploaded, setUploaded]       = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const docTypes = [
    { value: 'photo',          label: lang === 'ar' ? 'صورة شخصية / هوية' : 'Photo / ID' },
    { value: 'medical_report', label: lang === 'ar' ? 'تقرير طبي'          : 'Medical Report' },
    { value: 'official_proof', label: lang === 'ar' ? 'إثبات رسمي'         : 'Official Proof' },
    { value: 'other',          label: lang === 'ar' ? 'أخرى'               : 'Other' },
  ];

  const tx = {
    title:       lang === 'ar' ? 'تم استلام طلبك!' : 'Request Received!',
    thanks:      lang === 'ar' ? `شكراً ${name}، سيتواصل معك فريقنا قريباً` : `Thank you ${name}, our team will contact you soon`,
    refLabel:    lang === 'ar' ? 'رقم طلبك المرجعي' : 'Your Reference Number',
    refNote:     lang === 'ar' ? 'احتفظ بهذا الرقم لمتابعة طلبك' : 'Keep this number to track your request',
    uploadTitle: lang === 'ar' ? 'رفع الوثائق الداعمة' : 'Upload Supporting Documents',
    uploadSub:   lang === 'ar' ? 'اختياري — لكن يسرّع معالجة طلبك' : 'Optional — but speeds up processing',
    uploadArea:  lang === 'ar' ? 'اضغط لرفع الملفات' : 'Click to upload files',
    uploadNote:  lang === 'ar' ? 'صور، PDF — حتى 10MB لكل ملف' : 'Images, PDF — up to 10MB per file',
    uploading:   lang === 'ar' ? 'جاري الرفع...' : 'Uploading...',
    uploadBtn:   (n: number) => lang === 'ar' ? `رفع ${n} ${n === 1 ? 'ملف' : 'ملفات'}` : `Upload ${n} file${n > 1 ? 's' : ''}`,
    uploadDone:  lang === 'ar' ? 'تم رفع الوثائق بنجاح!' : 'Documents uploaded successfully!',
    uploadErr:   lang === 'ar' ? 'حدث خطأ أثناء رفع الملفات، حاول مجدداً' : 'Upload error occurred, please try again',
    steps: lang === 'ar' ? [
      { text: 'سيتم مراجعة طلبك خلال', bold: '٣-٧ أيام عمل' },
      { text: 'ستصلك رسالة على', bold: 'واتساب أو SMS' },
      { text: 'إذا احتجنا مستندات إضافية،', bold: 'سنتواصل معك مباشرة' },
    ] : [
      { text: 'Your request will be reviewed within', bold: '3-7 business days' },
      { text: 'You will receive a message via', bold: 'WhatsApp or SMS' },
      { text: 'If we need additional documents,', bold: 'we will contact you directly' },
    ],
    trackBtn: lang === 'ar' ? 'تتبع حالة طلبي' : 'Track My Request',
    homeBtn:  lang === 'ar' ? 'العودة للصفحة الرئيسية' : 'Back to Home',
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...selected.map(f => ({ file: f, type: 'other' }))]);
  };
  const handleTypeChange = (index: number, type: string) => {
    setFiles(prev => prev.map((f, i) => i === index ? { ...f, type } : f));
  };
  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };
  const handleUpload = async () => {
    if (!files.length || !requestId) return;
    setUploading(true); setUploadError('');
    try {
      for (const { file, type } of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);
        await api.post(`/requests/${requestId}/documents`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      setUploaded(true);
    } catch {
      setUploadError(tx.uploadErr);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: t.bg, transition: 'background 0.3s' }} dir={dir}>

      <ScrollProgress />
      <Navbar />

      <div style={{ flex: 1, padding: '40px 16px' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>

          {/* Success Icon */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              style={{ width: 80, height: 80, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', background: `${PRIMARY}10`, border: `4px solid ${PRIMARY}30` }}
            >
              <motion.svg
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                width="40" height="40" fill="none" stroke={PRIMARY} viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/>
              </motion.svg>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              style={{ fontSize: 24, fontWeight: 800, color: t.text, margin: '0 0 8px 0' }}
            >
              {tx.title}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              style={{ fontSize: 13, color: t.textMute, margin: 0 }}
            >
              {tx.thanks}
            </motion.p>
          </div>

          {/* Ref Number */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            style={{ background: t.card, borderRadius: 18, border: `1px solid ${t.border}`, boxShadow: dark ? 'none' : '0 2px 12px rgba(0,0,0,0.06)', padding: 24, marginBottom: 16 }}
          >
            <p style={{ fontSize: 13, color: t.textMute, marginBottom: 12, margin: '0 0 12px 0' }}>{tx.refLabel}</p>
            <motion.div
              animate={{ boxShadow: [`0 0 0 0px ${PRIMARY}20`, `0 0 0 8px ${PRIMARY}08`, `0 0 0 0px ${PRIMARY}20`] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '8px 16px', borderRadius: 12, marginBottom: 8, background: `${PRIMARY}08` }}
            >
              <svg width="24" height="24" fill="none" stroke={PRIMARY} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"/>
              </svg>
              <span style={{ fontSize: 30, fontWeight: 800, letterSpacing: 4, color: PRIMARY }}>{ref}</span>
            </motion.div>
            <p style={{ fontSize: 11, color: t.textSub, textAlign: 'center', margin: 0 }}>{tx.refNote}</p>
          </motion.div>

          {/* Upload */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            style={{ background: t.card, borderRadius: 18, border: `1px solid ${t.border}`, overflow: 'hidden', marginBottom: 16, boxShadow: dark ? 'none' : '0 2px 12px rgba(0,0,0,0.06)' }}
          >
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${t.border}`, background: `${GOLD}08`, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${GOLD}20` }}>
                <svg width="16" height="16" fill="none" stroke={GOLD} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: t.text }}>{tx.uploadTitle}</div>
                <div style={{ fontSize: 11, color: t.textMute, marginTop: 2 }}>{tx.uploadSub}</div>
              </div>
            </div>

            <div style={{ padding: 20 }}>
              <AnimatePresence mode="wait">
                {uploaded ? (
                  <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} style={{ textAlign: 'center', padding: '24px 0' }}>
                    <div style={{ width: 56, height: 56, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', background: '#f0fdf4', border: '3px solid #bbf7d0' }}>
                      <svg width="28" height="28" fill="none" stroke="#16a34a" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/>
                      </svg>
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#16a34a', margin: 0 }}>{tx.uploadDone}</p>
                  </motion.div>
                ) : (
                  <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      style={{ border: `2px dashed ${PRIMARY}30`, borderRadius: 14, padding: 24, textAlign: 'center', cursor: 'pointer', marginBottom: 16 }}
                    >
                      <div style={{ width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', background: `${PRIMARY}10` }}>
                        <svg width="24" height="24" fill="none" stroke={PRIMARY} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                        </svg>
                      </div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: t.text, marginBottom: 4 }}>{tx.uploadArea}</p>
                      <p style={{ fontSize: 11, color: t.textSub, margin: 0 }}>{tx.uploadNote}</p>
                      <input ref={fileInputRef} type="file" multiple accept="image/*,.pdf" onChange={handleFileChange} style={{ display: 'none' }} />
                    </div>

                    <AnimatePresence>
                      {files.length > 0 && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {files.map((f, i) => (
                            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ delay: i * 0.05 }}
                              style={{ background: dark ? `${PRIMARY}08` : '#F8FAFC', borderRadius: 12, padding: 12, display: 'flex', alignItems: 'center', gap: 12, border: `1px solid ${t.border}` }}>
                              <div style={{ width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0, color: 'white', background: PRIMARY }}>
                                {f.file.name.endsWith('.pdf') ? 'PDF' : 'IMG'}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontSize: 11, color: t.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500, margin: '0 0 4px 0' }}>{f.file.name}</p>
                                <select value={f.type} onChange={e => handleTypeChange(i, e.target.value)}
                                  style={{ fontSize: 11, border: `1px solid ${t.border}`, borderRadius: 8, padding: '4px 8px', background: t.input, color: t.text, width: '100%', outline: 'none' }}>
                                  {docTypes.map(dt => <option key={dt.value} value={dt.value}>{dt.label}</option>)}
                                </select>
                              </div>
                              <button onClick={() => removeFile(i)} style={{ color: '#D1D5DB', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}>
                                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                              </button>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <AnimatePresence>
                      {uploadError && (
                        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#DC2626', background: '#FEF2F2', borderRadius: 10, padding: '8px 12px', marginBottom: 12, fontSize: 12 }}>
                          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                          {uploadError}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <AnimatePresence>
                      {files.length > 0 && (
                        <motion.button
                          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                          onClick={handleUpload} disabled={uploading}
                          style={{ width: '100%', height: 44, color: 'white', borderRadius: 12, fontSize: 13, fontWeight: 600, border: 'none', cursor: uploading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: uploading ? 0.7 : 1, background: `linear-gradient(135deg, ${GOLD}, #e8b84b)` }}
                        >
                          {uploading
                            ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }}/>{tx.uploading}</>
                            : <><svg width="16" height="16" fill="none" stroke="white" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>{tx.uploadBtn(files.length)}</>
                          }
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Steps */}
          <motion.div
            initial="hidden" animate="visible" variants={stagger}
            style={{ background: t.card, borderRadius: 18, border: `1px solid ${t.border}`, padding: 20, marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 12, boxShadow: dark ? 'none' : '0 2px 12px rgba(0,0,0,0.06)' }}
          >
            {tx.steps.map((item, i) => (
              <motion.div key={i} variants={fadeUp} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: `${PRIMARY}10` }}>
                  <svg width="16" height="16" fill="none" stroke={PRIMARY} viewBox="0 0 24 24">
                    {i === 0 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>}
                    {i === 1 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>}
                    {i === 2 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>}
                  </svg>
                </div>
                <p style={{ fontSize: 13, color: t.textMute, lineHeight: 1.6, margin: 0 }}>
                  {item.text} <strong style={{ color: t.text }}>{item.bold}</strong>
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Buttons */}
          <motion.button
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => router.push(`/track?query=${ref}`)}
            style={{ width: '100%', height: 48, color: 'white', borderRadius: 16, fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12, background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_L})`, boxShadow: `0 8px 24px ${PRIMARY}40` }}
          >
            <svg width="16" height="16" fill="none" stroke="white" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            {tx.trackBtn}
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => router.push('/')}
            style={{ width: '100%', height: 44, borderRadius: 16, fontSize: 13, border: `1px solid ${PRIMARY}30`, color: t.textMute, background: 'transparent', cursor: 'pointer' }}
          >
            {tx.homeBtn}
          </motion.button>

        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function ConfirmPage() {
  return <Suspense><ConfirmContent /></Suspense>;
}