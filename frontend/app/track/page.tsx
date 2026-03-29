'use client';

import { useState } from 'react';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';

const statusMap: Record<string, { label: string; color: string; step: number }> = {
  new:          { label: 'جديد',              color: 'blue',   step: 1 },
  reviewing:    { label: 'قيد المراجعة',      color: 'yellow', step: 2 },
  needs_info:   { label: 'بحاجة معلومات',     color: 'orange', step: 2 },
  approved:     { label: 'مقبول',             color: 'green',  step: 3 },
  rejected:     { label: 'مرفوض',             color: 'red',    step: 3 },
};

const steps = ['تم التقديم', 'قيد المراجعة', 'القرار النهائي'];

export default function TrackPage() {
  const [query, setQuery]   = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const router = useRouter();

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await api.get(`/requests/track?query=${query.trim()}`);
      setResult(res.data);
    } catch {
      setError('لم يتم العثور على طلب بهذا الرقم أو الهاتف');
    } finally {
      setLoading(false);
    }
  };

  const status = result ? statusMap[result.status] : null;

  const assistanceLabels: Record<string, string> = {
    medical:   'علاج طبي',
    education: 'تعليم',
    financial: 'دعم معيشي',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50" dir="rtl">

      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm">غ</div>
            <span className="text-base font-semibold text-gray-900">جمعية غزلان الخير</span>
          </div>
          <button onClick={() => router.push('/apply')} className="text-xs text-blue-600 border border-blue-200 bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-all">
            تقديم طلب جديد
          </button>
        </div>
      </nav>

      <div className="max-w-lg mx-auto py-10 px-4">

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">تتبع حالة طلبك</h1>
          <p className="text-gray-500 text-sm">أدخل رقم طلبك أو رقم هاتفك</p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
          <div className="flex gap-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="رقم الطلب أو رقم الهاتف..."
              className="flex-1 h-11 border border-gray-200 rounded-xl px-4 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="h-11 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium disabled:opacity-60 transition-all flex items-center gap-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : 'بحث'}
            </button>
          </div>
          {error && <p className="text-red-500 text-xs mt-3 flex items-center gap-1">⚠ {error}</p>}
        </div>

        {/* Result */}
        {result && status && (
          <div className="space-y-4">

            {/* Status Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className={`px-6 py-4 border-b ${
                status.color === 'green'  ? 'bg-green-50 border-green-100' :
                status.color === 'red'    ? 'bg-red-50 border-red-100' :
                status.color === 'yellow' ? 'bg-yellow-50 border-yellow-100' :
                'bg-blue-50 border-blue-100'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">{result.ref_number}</p>
                    <p className="text-base font-semibold text-gray-900">{result.full_name}</p>
                  </div>
                  <span className={`text-sm font-medium px-4 py-1.5 rounded-full ${
                    status.color === 'green'  ? 'bg-green-100 text-green-700' :
                    status.color === 'red'    ? 'bg-red-100 text-red-700' :
                    status.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>{status.label}</span>
                </div>
              </div>

              {/* Progress Steps */}
              <div className="px-6 py-5">
                <div className="flex items-center justify-between relative">
                  <div className="absolute top-3.5 right-5 left-5 h-0.5 bg-gray-100"></div>
                  <div
                    className="absolute top-3.5 right-5 h-0.5 bg-blue-500 transition-all"
                    style={{ width: status.step === 1 ? '0%' : status.step === 2 ? '50%' : '100%' }}
                  ></div>
                  {steps.map((step, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 z-10">
                      <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                        i + 1 < status.step  ? 'bg-blue-600 border-blue-600 text-white' :
                        i + 1 === status.step ? 'bg-white border-blue-500 text-blue-600' :
                        'bg-white border-gray-200 text-gray-300'
                      }`}>
                        {i + 1 < status.step ? '✓' : i + 1}
                      </div>
                      <span className={`text-xs text-center ${i + 1 === status.step ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">تفاصيل الطلب</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'نوع المساعدة', value: assistanceLabels[result.assistance_type] || result.assistance_type },
                  { label: 'تاريخ التقديم', value: result.created_at },
                  { label: 'آخر تحديث',    value: result.updated_at },
                  { label: 'الحالة الحالية', value: status.label },
                ].map((item) => (
                  <div key={item.label}>
                    <p className="text-xs text-gray-400 mb-1">{item.label}</p>
                    <p className="text-sm text-gray-900 font-medium">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Message */}
            <div className={`rounded-2xl p-4 text-sm leading-relaxed ${
              status.color === 'green'  ? 'bg-green-50 text-green-800 border border-green-100' :
              status.color === 'red'    ? 'bg-red-50 text-red-800 border border-red-100' :
              'bg-blue-50 text-blue-800 border border-blue-100'
            }`}>
              {result.status === 'new'        && 'تم استلام طلبك وسيبدأ فريقنا بمراجعته قريباً.'}
              {result.status === 'reviewing'  && 'طلبك قيد المراجعة حالياً. سنتواصل معك خلال ١-٣ أيام عمل.'}
              {result.status === 'needs_info' && 'نحتاج معلومات إضافية — سيتواصل معك أحد موظفينا على هاتفك.'}
              {result.status === 'approved'   && 'تهانينا! تم قبول طلبك. سيتواصل معك فريقنا لترتيب تقديم المساعدة.'}
              {result.status === 'rejected'   && 'نأسف، لم نتمكن من قبول طلبك في الوقت الحالي. يمكنك التواصل معنا لمزيد من المعلومات.'}
            </div>

          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-8">
          تحتاج مساعدة؟ تواصل معنا عبر واتساب
        </p>
      </div>
    </div>
  );
}