'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useState, useRef } from 'react';
import api from '@/lib/axios';

const docTypes = [
  { value: 'photo',          label: 'صورة شخصية / هوية' },
  { value: 'medical_report', label: 'تقرير طبي' },
  { value: 'official_proof', label: 'إثبات رسمي' },
  { value: 'other',          label: 'أخرى' },
];

function ConfirmContent() {
  const params = useSearchParams();
  const router = useRouter();
  const ref       = params.get('ref')       || '0';
  const name      = params.get('name')      || '';
  const requestId = params.get('requestId') || '';

  const [files, setFiles]         = useState<{ file: File; type: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded]   = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    const newFiles = selected.map(f => ({ file: f, type: 'other' }));
    setFiles(prev => [...prev, ...newFiles]);
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex flex-col" dir="rtl">

      <nav className="bg-white/80 backdrop-blur border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm">غ</div>
          <span className="text-base font-semibold text-gray-900">جمعية غزلان الخير <span className="text-blue-600 font-normal text-sm">الإنسانية</span></span>
        </div>
      </nav>

      <div className="flex-1 px-4 py-10">
        <div className="max-w-md mx-auto">

          {/* Success */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-green-100 border-4 border-green-200 flex items-center justify-center mx-auto mb-5">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">تم استلام طلبك!</h1>
            <p className="text-gray-500 text-sm">شكراً {name}، سيتواصل معك فريقنا قريباً</p>
          </div>

          {/* Ref Number */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
            <p className="text-sm text-gray-500 mb-2">رقم طلبك المرجعي</p>
            <div className="text-3xl font-bold text-blue-600 tracking-wider mb-1">{ref}</div>
            <p className="text-xs text-gray-400">احتفظ بهذا الرقم لمتابعة طلبك</p>
          </div>

          {/* Upload Section */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-5">
            <div className="bg-gradient-to-l from-amber-50 to-white px-5 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">رفع الوثائق الداعمة</h2>
              <p className="text-xs text-gray-400 mt-0.5">اختياري — لكن يسرّع معالجة طلبك</p>
            </div>

            <div className="p-5">
              {uploaded ? (
                <div className="text-center py-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-green-700">تم رفع الوثائق بنجاح!</p>
                </div>
              ) : (
                <>
                  {/* Upload Area */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all mb-4"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3">
                      <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                      </svg>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">اضغط لرفع الملفات</p>
                    <p className="text-xs text-gray-400">صور، PDF — حتى 10MB لكل ملف</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>

                  {/* File List */}
                  {files.length > 0 && (
                    <div className="space-y-3 mb-4">
                      {files.map((f, i) => (
                        <div key={i} className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold flex-shrink-0">
                            {f.file.name.endsWith('.pdf') ? 'PDF' : 'IMG'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-700 truncate font-medium">{f.file.name}</p>
                            <select
                              value={f.type}
                              onChange={(e) => handleTypeChange(i, e.target.value)}
                              className="mt-1 text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white w-full focus:outline-none focus:ring-1 focus:ring-blue-400"
                            >
                              {docTypes.map(t => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                              ))}
                            </select>
                          </div>
                          <button onClick={() => removeFile(i)} className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {uploadError && <p className="text-red-500 text-xs mb-3">⚠ {uploadError}</p>}

                  {files.length > 0 && (
                    <button
                      onClick={handleUpload}
                      disabled={uploading}
                      className="w-full h-11 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-medium disabled:opacity-60 transition-all flex items-center justify-center gap-2"
                    >
                      {uploading ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                          جاري الرفع...
                        </>
                      ) : `رفع ${files.length} ملف`}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Steps */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5 space-y-3">
            {[
              { step: '١', text: 'سيتم مراجعة طلبك خلال', bold: '٣-٧ أيام عمل' },
              { step: '٢', text: 'ستصلك رسالة على', bold: 'واتساب أو SMS' },
              { step: '٣', text: 'إذا احتجنا مستندات إضافية،', bold: 'سنتواصل معك مباشرة' },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold flex-shrink-0">{item.step}</div>
                <p className="text-sm text-gray-600 leading-relaxed">{item.text} <strong className="text-gray-900">{item.bold}</strong></p>
              </div>
            ))}
          </div>

          <button
            onClick={() => router.push(`/track?query=${ref}`)}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-semibold shadow-lg shadow-blue-200 transition-all mb-3"
          >
            تتبع حالة طلبي ←
          </button>
          <button
            onClick={() => router.push('/')}
            className="w-full h-12 bg-white hover:bg-gray-50 text-gray-600 rounded-2xl text-sm border border-gray-200 transition-all"
          >
            العودة للصفحة الرئيسية
          </button>

        </div>
      </div>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense>
      <ConfirmContent />
    </Suspense>
  );
}