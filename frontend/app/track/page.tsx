'use client';

import { useState } from 'react';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';

const PRIMARY   = '#1B6CA8';
const PRIMARY_L = '#4AACCD';
const GOLD      = '#C9A84C';

const statusMap: Record<string, { label: string; color: string; step: number }> = {
  new:        { label: 'جديد',           color: 'blue',   step: 1 },
  reviewing:  { label: 'قيد المراجعة',  color: 'yellow', step: 2 },
  needs_info: { label: 'بحاجة معلومات', color: 'orange', step: 2 },
  approved:   { label: 'مقبول',          color: 'green',  step: 3 },
  rejected:   { label: 'مرفوض',          color: 'red',    step: 3 },
};

const steps = ['تم التقديم', 'قيد المراجعة', 'القرار النهائي'];

export default function TrackPage() {
  const [query, setQuery]       = useState('');
  const [result, setResult]     = useState<any>(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const router = useRouter();

  // رفع الملفات
  const [files, setFiles]             = useState<File[]>([]);
  const [uploading, setUploading]     = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    setFiles([]);
    setUploadSuccess(false);
    setUploadError('');
    try {
      const res = await api.get(`/requests/track?query=${query.trim()}`);
      setResult(res.data);
    } catch {
      setError('لم يتم العثور على طلب بهذا الرقم أو الهاتف');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!files.length || !result) return;
    setUploading(true);
    setUploadError('');
    try {
        const formData = new FormData();
        formData.append('phone',      result.phone);
        formData.append('ref_number', result.ref_number);
        files.forEach(f => formData.append('files[]', f));
        await api.post(`/requests/${result.id}/documents/add`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        setUploadSuccess(true);
        setFiles([]);
    } catch (err: any) {
        setUploadError(err.response?.data?.message || 'حدث خطأ أثناء الرفع');
    } finally {
        setUploading(false);
    }
};

  const status = result ? statusMap[result.status] : null;

  const assistanceLabels: Record<string, string> = {
    medical:   'علاج طبي',
    education: 'تعليم',
    financial: 'دعم معيشي',
  };

  return (
    <div className="min-h-screen" style={{ background: '#F0F7FF' }} dir="rtl">

      {/* Navbar */}
      <nav className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-2xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/')}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
              style={{ background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_L})` }}>غ</div>
            <div>
              <div className="text-sm font-bold text-gray-900">مؤسسة غزلان الخير</div>
              <div className="text-xs" style={{ color: PRIMARY_L }}>Ghozlan Alkhair Foundation</div>
            </div>
          </div>
          <button onClick={() => router.push('/apply')}
            className="text-xs text-white px-4 py-2 rounded-xl font-medium transition-all"
            style={{ background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_L})` }}>
            تقديم طلب جديد
          </button>
        </div>
      </nav>

      <div className="max-w-lg mx-auto py-10 px-4">

        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: `${PRIMARY}15` }}>
            <svg className="w-8 h-8" fill="none" stroke={PRIMARY} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">تتبع حالة طلبك</h1>
          <p className="text-gray-500 text-sm">أدخل رقم طلبك المرجعي أو رقم هاتفك</p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
          <div className="flex gap-3">
            <input value={query} onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="مثال: GH-1234567 أو رقم هاتفك"
              className="flex-1 h-11 border border-gray-200 rounded-xl px-4 text-sm bg-gray-50 focus:outline-none focus:bg-white transition-all text-gray-900"/>
            <button onClick={handleSearch} disabled={loading}
              className="h-11 px-5 text-white rounded-xl text-sm font-medium disabled:opacity-60 transition-all flex items-center gap-2"
              style={{ background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_L})` }}>
              {loading
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                : <><svg className="w-4 h-4" fill="none" stroke="white" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>بحث</>
              }
            </button>
          </div>
          {error && (
            <div className="flex items-center gap-2 mt-3 text-red-600 bg-red-50 rounded-lg px-3 py-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <p className="text-xs">{error}</p>
            </div>
          )}
        </div>

        {result && status && (
          <div className="space-y-4">

            {/* Status Header */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b" style={{
                background:   status.color === 'green'  ? '#f0fdf4' : status.color === 'red' ? '#fef2f2' : status.color === 'yellow' ? '#fffbeb' : status.color === 'orange' ? '#fff7ed' : `${PRIMARY}08`,
                borderColor:  status.color === 'green'  ? '#bbf7d0' : status.color === 'red' ? '#fecaca' : status.color === 'yellow' ? '#fde68a' : status.color === 'orange' ? '#fed7aa' : `${PRIMARY}20`,
              }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">{result.ref_number}</p>
                    <p className="text-base font-bold text-gray-900">{result.full_name}</p>
                  </div>
                  <span className="text-sm font-semibold px-4 py-1.5 rounded-full" style={{
                    background: status.color === 'green'  ? '#dcfce7' : status.color === 'red' ? '#fee2e2' : status.color === 'yellow' ? '#fef9c3' : status.color === 'orange' ? '#ffedd5' : `${PRIMARY}15`,
                    color:      status.color === 'green'  ? '#166534' : status.color === 'red' ? '#991b1b' : status.color === 'yellow' ? '#854d0e' : status.color === 'orange' ? '#9a3412' : PRIMARY,
                  }}>{status.label}</span>
                </div>
              </div>

              {/* Progress */}
              <div className="px-6 py-6">
                <div className="flex items-center justify-between relative">
                  <div className="absolute top-3.5 right-5 left-5 h-1 rounded-full bg-gray-100"/>
                  <div className="absolute top-3.5 right-5 h-1 rounded-full transition-all"
                    style={{ width: status.step === 1 ? '0%' : status.step === 2 ? '50%' : '100%', background: `linear-gradient(to left, ${PRIMARY_L}, ${PRIMARY})` }}/>
                  {steps.map((step, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 z-10">
                      <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all" style={{
                        background:  i + 1 < status.step ? PRIMARY : 'white',
                        borderColor: i + 1 <= status.step ? PRIMARY : '#e5e7eb',
                        color:       i + 1 < status.step ? 'white' : i + 1 === status.step ? PRIMARY : '#9ca3af',
                      }}>
                        {i + 1 < status.step
                          ? <svg className="w-4 h-4" fill="none" stroke="white" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg>
                          : i + 1}
                      </div>
                      <span className="text-xs text-center font-medium" style={{ color: i + 1 === status.step ? PRIMARY : '#9ca3af' }}>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke={PRIMARY} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                تفاصيل الطلب
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'نوع المساعدة',  value: assistanceLabels[result.assistance_type] || result.assistance_type },
                  { label: 'تاريخ التقديم', value: new Date(result.created_at).toLocaleDateString('ar-SA') },
                  { label: 'آخر تحديث',     value: new Date(result.updated_at).toLocaleDateString('ar-SA') },
                  { label: 'الحالة الحالية', value: status.label },
                ].map(item => (
                  <div key={item.label} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-1">{item.label}</p>
                    <p className="text-sm font-semibold text-gray-900">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Message */}
            <div className="rounded-2xl p-4 text-sm leading-relaxed flex gap-3" style={{
              background: status.color === 'green' ? '#f0fdf4' : status.color === 'red' ? '#fef2f2' : status.color === 'orange' ? '#fff7ed' : `${PRIMARY}08`,
              border:     `1px solid ${status.color === 'green' ? '#bbf7d0' : status.color === 'red' ? '#fecaca' : status.color === 'orange' ? '#fed7aa' : `${PRIMARY}20`}`,
              color:      status.color === 'green' ? '#166534' : status.color === 'red' ? '#991b1b' : status.color === 'orange' ? '#9a3412' : PRIMARY,
            }}>
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>
                {result.status === 'new'        && 'تم استلام طلبك وسيبدأ فريقنا بمراجعته قريباً.'}
                {result.status === 'reviewing'  && 'طلبك قيد المراجعة حالياً. سنتواصل معك خلال ١-٣ أيام عمل.'}
                {result.status === 'needs_info' && 'نحتاج منك مستندات أو معلومات إضافية. يرجى رفع الملفات المطلوبة أدناه.'}
                {result.status === 'approved'   && 'تهانينا! تم قبول طلبك. سيتواصل معك فريقنا لترتيب تقديم المساعدة.'}
                {result.status === 'rejected'   && 'نأسف، لم نتمكن من قبول طلبك في الوقت الحالي. يمكنك التواصل معنا لمزيد من المعلومات.'}
              </span>
            </div>

            {/* ═══ رفع ملفات إضافية — يظهر فقط عند needs_info ═══ */}
            {result.status === 'needs_info' && !uploadSuccess && (
              <div className="bg-white rounded-2xl border shadow-sm p-5" style={{ borderColor: '#FB923C30' }}>
                <h3 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: '#FFF7ED' }}>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="#F97316" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                    </svg>
                  </div>
                  رفع مستندات إضافية
                </h3>
                <p className="text-xs text-gray-400 mb-4">ارفع الملفات المطلوبة (صور أو PDF) — الحد الأقصى 5MB لكل ملف</p>

                {/* منطقة الرفع */}
                <div className="rounded-xl border-2 border-dashed p-5 text-center cursor-pointer hover:bg-gray-50 transition-all mb-3"
                  style={{ borderColor: '#FB923C40' }}
                  onClick={() => document.getElementById('extra-files')?.click()}>
                  <input id="extra-files" type="file" multiple accept="image/*,.pdf" className="hidden"
                    onChange={e => setFiles(prev => [...prev, ...Array.from(e.target.files || [])])}/>
                  <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="#FB923C" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                  </svg>
                  <p className="text-xs font-medium text-gray-500">اضغط لاختيار الملفات</p>
                  <p className="text-xs text-gray-400 mt-0.5">JPG, PNG, PDF</p>
                </div>

                {/* قائمة الملفات المختارة */}
                {files.length > 0 && (
                  <div className="space-y-1.5 mb-4">
                    {files.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 rounded-xl px-3 py-2"
                        style={{ background: '#FFF7ED', border: '1px solid #FB923C20' }}>
                        <svg className="w-3.5 h-3.5 flex-shrink-0 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
                        </svg>
                        <span className="text-xs flex-1 truncate text-gray-700">{f.name}</span>
                        <span className="text-xs text-gray-400">{(f.size / 1024).toFixed(0)} KB</span>
                        <button onClick={() => setFiles(files.filter((_, j) => j !== i))}
                          className="text-red-400 hover:text-red-600 text-xs font-bold transition-colors">✕</button>
                      </div>
                    ))}
                  </div>
                )}

                {uploadError && (
                  <div className="rounded-xl p-3 mb-3 text-xs text-red-600" style={{ background: '#FEE2E2' }}>
                    ⚠️ {uploadError}
                  </div>
                )}

                <button onClick={handleUpload} disabled={uploading || !files.length}
                  className="w-full h-11 rounded-xl text-sm font-bold text-white disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  style={{ background: files.length ? 'linear-gradient(135deg, #F97316, #FB923C)' : '#D1D5DB' }}>
                  {uploading
                    ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>جاري الرفع...</>
                    : <><svg className="w-4 h-4" fill="none" stroke="white" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>رفع {files.length > 0 ? `${files.length} ملف` : 'الملفات'}</>
                  }
                </button>
              </div>
            )}

            {/* نجاح الرفع */}
            {uploadSuccess && (
              <div className="rounded-2xl p-5 text-center" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: '#DCFCE7' }}>
                  <svg className="w-6 h-6" fill="none" stroke="#059669" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <div className="text-sm font-bold text-green-800 mb-1">تم رفع الملفات بنجاح!</div>
                <p className="text-xs text-green-600">سيراجع فريقنا الملفات المرفوعة ويتواصل معك قريباً</p>
              </div>
            )}

          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-8 flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
          </svg>
          تحتاج مساعدة؟ تواصل معنا عبر واتساب
        </p>
      </div>
    </div>
  );
}