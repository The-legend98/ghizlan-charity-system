'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useState, useRef } from 'react';
import api from '@/lib/axios';

const PRIMARY   = '#1B6CA8';
const PRIMARY_L = '#4AACCD';
const GOLD      = '#C9A84C';

const docTypes = [
  { value: 'photo',          label: 'صورة شخصية / هوية' },
  { value: 'medical_report', label: 'تقرير طبي' },
  { value: 'official_proof', label: 'إثبات رسمي' },
  { value: 'other',          label: 'أخرى' },
];

function ConfirmContent() {
  const params    = useSearchParams();
  const router    = useRouter();
  const ref       = params.get('ref')       || '0';
  const name      = params.get('name')      || '';
  const requestId = params.get('requestId') || '';

  const [files, setFiles]             = useState<{ file: File; type: string }[]>([]);
  const [uploading, setUploading]     = useState(false);
  const [uploaded, setUploaded]       = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setUploading(true);
    setUploadError('');
    try {
      for (const { file, type } of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);
        await api.post(`/requests/${requestId}/documents`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      setUploaded(true);
    } catch {
      setUploadError('حدث خطأ أثناء رفع الملفات، حاول مجدداً');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F0F7FF' }} dir="rtl">

      {/* Navbar */}
      <nav className="bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-6 py-3 flex items-center gap-3 cursor-pointer"
          onClick={() => router.push('/')}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
            style={{ background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_L})` }}>غ</div>
          <div>
            <div className="text-sm font-bold text-gray-900">مؤسسة غزلان الخير</div>
            <div className="text-xs" style={{ color: PRIMARY_L }}>Ghozlan Alkhair Foundation</div>
          </div>
        </div>
      </nav>

      <div className="flex-1 px-4 py-10">
        <div className="max-w-md mx-auto">

          {/* Success Icon */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 border-4"
              style={{ background: `${PRIMARY}10`, borderColor: `${PRIMARY}30` }}>
              <svg className="w-10 h-10" fill="none" stroke={PRIMARY} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">تم استلام طلبك!</h1>
            <p className="text-gray-500 text-sm">شكراً {name}، سيتواصل معك فريقنا قريباً</p>
          </div>

          {/* Ref Number */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
            <p className="text-sm text-gray-500 mb-3">رقم طلبك المرجعي</p>
            <div className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl mb-2"
              style={{ background: `${PRIMARY}08` }}>
              <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke={PRIMARY} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"/>
              </svg>
              <span className="text-3xl font-bold tracking-wider" style={{ color: PRIMARY }}>{ref}</span>
            </div>
            <p className="text-xs text-gray-400 text-center">احتفظ بهذا الرقم لمتابعة طلبك</p>
          </div>

          {/* Upload */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-5">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3"
              style={{ background: `${GOLD}08` }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: `${GOLD}20` }}>
                <svg className="w-4 h-4" fill="none" stroke={GOLD} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                </svg>
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-900">رفع الوثائق الداعمة</h2>
                <p className="text-xs text-gray-400 mt-0.5">اختياري — لكن يسرّع معالجة طلبك</p>
              </div>
            </div>

            <div className="p-5">
              {uploaded ? (
                <div className="text-center py-6">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
                    style={{ background: '#f0fdf4', border: '3px solid #bbf7d0' }}>
                    <svg className="w-7 h-7" fill="none" stroke="#16a34a" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/>
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-green-700">تم رفع الوثائق بنجاح!</p>
                </div>
              ) : (
                <>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all mb-4"
                    style={{ borderColor: `${PRIMARY}30` }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = PRIMARY)}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = `${PRIMARY}30`)}
                  >
                    <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                      style={{ background: `${PRIMARY}10` }}>
                      <svg className="w-6 h-6" fill="none" stroke={PRIMARY} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-700 mb-1">اضغط لرفع الملفات</p>
                    <p className="text-xs text-gray-400">صور، PDF — حتى 10MB لكل ملف</p>
                    <input ref={fileInputRef} type="file" multiple accept="image/*,.pdf"
                      onChange={handleFileChange} className="hidden" />
                  </div>

                  {files.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {files.map((f, i) => (
                        <div key={i} className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 text-white"
                            style={{ background: PRIMARY }}>
                            {f.file.name.endsWith('.pdf') ? 'PDF' : 'IMG'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-700 truncate font-medium">{f.file.name}</p>
                            <select value={f.type} onChange={e => handleTypeChange(i, e.target.value)}
                              className="mt-1 text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white w-full focus:outline-none">
                              {docTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                          </div>
                          <button onClick={() => removeFile(i)}
                            className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {uploadError && (
                    <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-3 text-xs">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      {uploadError}
                    </div>
                  )}

                  {files.length > 0 && (
                    <button onClick={handleUpload} disabled={uploading}
                      className="w-full h-11 text-white rounded-xl text-sm font-medium disabled:opacity-60 transition-all flex items-center justify-center gap-2"
                      style={{ background: `linear-gradient(135deg, ${GOLD}, #e8b84b)` }}>
                      {uploading ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                          جاري الرفع...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="white" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                          </svg>
                          رفع {files.length} {files.length === 1 ? 'ملف' : 'ملفات'}
                        </>
                      )}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Steps */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5 space-y-3">
            {[
              { icon: '📅', text: 'سيتم مراجعة طلبك خلال', bold: '٣-٧ أيام عمل' },
              { icon: '📱', text: 'ستصلك رسالة على', bold: 'واتساب أو SMS' },
              { icon: '📞', text: 'إذا احتجنا مستندات إضافية،', bold: 'سنتواصل معك مباشرة' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: `${PRIMARY}10` }}>
                  <svg className="w-4 h-4" fill="none" stroke={PRIMARY} viewBox="0 0 24 24">
                    {i === 0 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>}
                    {i === 1 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>}
                    {i === 2 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>}
                  </svg>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {item.text} <strong className="text-gray-900">{item.bold}</strong>
                </p>
              </div>
            ))}
          </div>

          <button
            onClick={() => router.push(`/track?query=${ref}`)}
            className="w-full h-12 text-white rounded-2xl text-sm font-semibold shadow-lg transition-all mb-3 flex items-center justify-center gap-2"
            style={{ background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_L})` }}
          >
            <svg className="w-4 h-4" fill="none" stroke="white" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            تتبع حالة طلبي
          </button>
          <button
            onClick={() => router.push('/')}
            className="w-full h-11 rounded-2xl text-sm border transition-all text-gray-600 hover:bg-gray-50"
            style={{ borderColor: `${PRIMARY}30` }}
          >
            العودة للصفحة الرئيسية
          </button>

        </div>
      </div>
    </div>
  );
}

export default function ConfirmPage() {
  return <Suspense><ConfirmContent /></Suspense>;
}