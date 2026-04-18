'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useState, useRef } from 'react';
import { motion, useScroll, useSpring, AnimatePresence, Variants } from 'framer-motion';
import api from '@/lib/axios';
import { useLang } from '@/app/providers/LangProvider';
import Navbar from '@/components/Navbar';


const PRIMARY   = '#1B6CA8';
const PRIMARY_L = '#4AACCD';
const GOLD      = '#C9A84C';

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
    <div className="min-h-screen flex flex-col" style={{ background: '#F0F7FF' }} dir={dir}>

      <ScrollProgress />

      {/* Navbar */}
      <Navbar />

      <div className="flex-1 px-4 py-10">
        <div className="max-w-md mx-auto">

          {/* Success Icon */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 border-4"
              style={{ background: `${PRIMARY}10`, borderColor: `${PRIMARY}30` }}
            >
              <motion.svg
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="w-10 h-10" fill="none" stroke={PRIMARY} viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/>
              </motion.svg>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-2xl font-bold text-gray-900 mb-2"
            >
              {tx.title}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-gray-500 text-sm"
            >
              {tx.thanks}
            </motion.p>
          </div>

          {/* Ref Number */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5"
          >
            <p className="text-sm text-gray-500 mb-3">{tx.refLabel}</p>
            <motion.div
              animate={{ boxShadow: [`0 0 0 0px ${PRIMARY}20`, `0 0 0 8px ${PRIMARY}08`, `0 0 0 0px ${PRIMARY}20`] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl mb-2"
              style={{ background: `${PRIMARY}08` }}
            >
              <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke={PRIMARY} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"/>
              </svg>
              <span className="text-3xl font-bold tracking-wider" style={{ color: PRIMARY }}>{ref}</span>
            </motion.div>
            <p className="text-xs text-gray-400 text-center">{tx.refNote}</p>
          </motion.div>

          {/* Upload */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-5"
          >
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3" style={{ background: `${GOLD}08` }}>
              <motion.div
                whileHover={{ rotate: 15, scale: 1.1 }}
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: `${GOLD}20` }}
              >
                <svg className="w-4 h-4" fill="none" stroke={GOLD} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                </svg>
              </motion.div>
              <div>
                <h2 className="text-sm font-semibold text-gray-900">{tx.uploadTitle}</h2>
                <p className="text-xs text-gray-400 mt-0.5">{tx.uploadSub}</p>
              </div>
            </div>

            <div className="p-5">
              <AnimatePresence mode="wait">
                {uploaded ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="text-center py-6"
                  >
                    <motion.div
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
                      className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
                      style={{ background: '#f0fdf4', border: '3px solid #bbf7d0' }}
                    >
                      <svg className="w-7 h-7" fill="none" stroke="#16a34a" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/>
                      </svg>
                    </motion.div>
                    <p className="text-sm font-semibold text-green-700">{tx.uploadDone}</p>
                  </motion.div>
                ) : (
                  <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <motion.div
                      whileHover={{ borderColor: PRIMARY, background: `${PRIMARY}08` }}
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all mb-4"
                      style={{ borderColor: `${PRIMARY}30` }}
                    >
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                        style={{ background: `${PRIMARY}10` }}
                      >
                        <svg className="w-6 h-6" fill="none" stroke={PRIMARY} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                        </svg>
                      </motion.div>
                      <p className="text-sm font-medium text-gray-700 mb-1">{tx.uploadArea}</p>
                      <p className="text-xs text-gray-400">{tx.uploadNote}</p>
                      <input ref={fileInputRef} type="file" multiple accept="image/*,.pdf" onChange={handleFileChange} className="hidden" />
                    </motion.div>

                    <AnimatePresence>
                      {files.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-2 mb-4"
                        >
                          {files.map((f, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 10 }}
                              transition={{ delay: i * 0.05 }}
                              className="bg-gray-50 rounded-xl p-3 flex items-center gap-3"
                            >
                              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 text-white" style={{ background: PRIMARY }}>
                                {f.file.name.endsWith('.pdf') ? 'PDF' : 'IMG'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-700 truncate font-medium">{f.file.name}</p>
                                <select value={f.type} onChange={e => handleTypeChange(i, e.target.value)}
                                  className="mt-1 text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white w-full focus:outline-none">
                                  {docTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                </select>
                              </div>
                              <motion.button
                                whileHover={{ scale: 1.2, color: '#EF4444' }}
                                onClick={() => removeFile(i)}
                                className="text-gray-300 flex-shrink-0"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                              </motion.button>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <AnimatePresence>
                      {uploadError && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          className="flex items-center gap-2 text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-3 text-xs"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                          {uploadError}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <AnimatePresence>
                      {files.length > 0 && (
                        <motion.button
                          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          whileHover={{ scale: 1.02, boxShadow: `0 8px 24px ${GOLD}50` }}
                          whileTap={{ scale: 0.97 }}
                          onClick={handleUpload} disabled={uploading}
                          className="w-full h-11 text-white rounded-xl text-sm font-medium disabled:opacity-60 flex items-center justify-center gap-2"
                          style={{ background: `linear-gradient(135deg, ${GOLD}, #e8b84b)` }}
                        >
                          {uploading ? (
                            <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>{tx.uploading}</>
                          ) : (
                            <><svg className="w-4 h-4" fill="none" stroke="white" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>{tx.uploadBtn(files.length)}</>
                          )}
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
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5 space-y-3"
          >
            {tx.steps.map((item, i) => (
              <motion.div key={i} variants={fadeUp} className="flex items-center gap-3">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: `${PRIMARY}10` }}
                >
                  <svg className="w-4 h-4" fill="none" stroke={PRIMARY} viewBox="0 0 24 24">
                    {i === 0 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>}
                    {i === 1 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>}
                    {i === 2 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>}
                  </svg>
                </motion.div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {item.text} <strong className="text-gray-900">{item.bold}</strong>
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Buttons */}
          <motion.button
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
            whileHover={{ scale: 1.03, boxShadow: `0 12px 32px ${PRIMARY}45` }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push(`/track?query=${ref}`)}
            className="w-full h-12 text-white rounded-2xl text-sm font-semibold shadow-lg mb-3 flex items-center justify-center gap-2"
            style={{ background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_L})` }}
          >
            <svg className="w-4 h-4" fill="none" stroke="white" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            {tx.trackBtn}
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}
            whileHover={{ scale: 1.02, background: '#f0f7ff' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push('/')}
            className="w-full h-11 rounded-2xl text-sm border text-gray-600"
            style={{ borderColor: `${PRIMARY}30` }}
          >
            {tx.homeBtn}
          </motion.button>

        </div>
      </div>
    </div>
  );
}

export default function ConfirmPage() {
  return <Suspense><ConfirmContent /></Suspense>;
}