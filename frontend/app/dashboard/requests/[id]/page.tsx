'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/axios';

const PRIMARY   = '#1B6CA8';
const PRIMARY_L = '#4AACCD';
const GOLD      = '#C9A84C';

const statusMap: Record<string, { label: string; color: string; bg: string }> = {
  new:        { label: 'جديد',           color: PRIMARY,   bg: `${PRIMARY}15` },
  reviewing:  { label: 'قيد المراجعة',  color: '#D97706', bg: '#FEF3C7' },
  needs_info: { label: 'يحتاج معلومات', color: '#7C3AED', bg: '#EDE9FE' },
  approved:   { label: 'مقبول',          color: '#059669', bg: '#D1FAE5' },
  rejected:   { label: 'مرفوض',          color: '#DC2626', bg: '#FEE2E2' },
};

const resultMap: Record<string, { label: string; color: string; bg: string }> = {
  completed:     { label: 'اكتملت بنجاح', color: '#059669', bg: '#D1FAE5' },
  partial:       { label: 'جزئية',         color: '#D97706', bg: '#FEF3C7' },
  not_delivered: { label: 'لم تصل',        color: '#DC2626', bg: '#FEE2E2' },
};

const assistanceMap: Record<string, string> = {
  medical: 'علاج طبي', education: 'تعليم', financial: 'دعم معيشي',
};

const genderMap:  Record<string, string> = { male: 'ذكر', female: 'أنثى' };
const housingMap: Record<string, string> = { owned: 'ملك', rented: 'إيجار', other: 'أخرى' };

const BgPattern = () => (
  <div style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
    <svg width="100%" height="100%" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
      <defs>
        <pattern id="dotsDetail" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
          <circle cx="15" cy="15" r="1" fill="#1B6CA8" opacity="0.10"/>
        </pattern>
      </defs>
      <rect width="1200" height="800" fill="url(#dotsDetail)"/>
      <circle cx="1150" cy="80"  r="160" fill="none" stroke="#1B6CA8" strokeWidth="0.6" opacity="0.15"/>
      <circle cx="1150" cy="80"  r="100" fill="none" stroke="#4AACCD" strokeWidth="0.6" opacity="0.15"/>
      <circle cx="60"   cy="720" r="120" fill="none" stroke="#1B6CA8" strokeWidth="0.6" opacity="0.12"/>
    </svg>
  </div>
);

const InfoCard = ({ num, title, color, children }: { num: string; title: string; color: string; children: React.ReactNode }) => (
  <div className="rounded-2xl p-5" style={{ background: 'white', border: `1px solid ${color}20`, boxShadow: `0 2px 12px ${color}08` }}>
    <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
      <div className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ background: color }}>{num}</div>
      {title}
    </h3>
    {children}
  </div>
);

const InfoItem = ({ label, value }: { label: string; value: any }) => (
  <div className="rounded-xl p-3" style={{ background: '#F8FAFC' }}>
    <div className="text-xs text-gray-400 mb-1">{label}</div>
    <div className="text-sm font-semibold text-gray-900">{value}</div>
  </div>
);

// ═══ DOCUMENTATION MODAL ═══
function DocumentationModal({ requestId, onClose, onSuccess }: {
  requestId: string; onClose: () => void; onSuccess: () => void;
}) {
  const [form, setForm] = useState({
    result:            'completed',
    amount_delivered:  '',
    service_delivered: '',
    delivery_date:     new Date().toISOString().split('T')[0],
    notes:             '',
    needs_follow_up:   false,
    follow_up_date:    '',
    follow_up_reason:  '',
  });
  const [files, setFiles]     = useState<File[]>([]);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async () => {
    if (!form.delivery_date) { setError('تاريخ التسليم مطلوب'); return; }
    if (form.needs_follow_up && !form.follow_up_date) { setError('تاريخ المتابعة مطلوب'); return; }
    if (form.needs_follow_up && !form.follow_up_reason) { setError('سبب المتابعة مطلوب'); return; }

    setSaving(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('request_id',        requestId);
      formData.append('result',            form.result);
      formData.append('delivery_date',     form.delivery_date);
      formData.append('notes',             form.notes);
      formData.append('needs_follow_up',   form.needs_follow_up ? '1' : '0');
      if (form.amount_delivered)  formData.append('amount_delivered',  form.amount_delivered);
      if (form.service_delivered) formData.append('service_delivered', form.service_delivered);
      if (form.needs_follow_up) {
        formData.append('follow_up_date',   form.follow_up_date);
        formData.append('follow_up_reason', form.follow_up_reason);
      }
      files.forEach(f => formData.append('files[]', f));

      await api.post('/documentation', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'حدث خطأ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl" style={{ background: 'white', maxHeight: '90vh', overflowY: 'auto' }}>
         <style>{`
      input[type="date"]::-webkit-calendar-picker-indicator {
        position: absolute;
        left: 10px;
        top: 50%;
        transform: translateY(-50%);
        cursor: pointer;
        opacity: 0.7;
      }
      input[type="date"] {
        position: relative;
        padding-left: 36px;
        padding-right: 12px;
      }
    `}</style>

        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between" style={{ background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_L})` }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div>
              <div className="text-sm font-bold text-white">توثيق الحالة</div>
              <div className="text-xs text-white/70">أدخل تفاصيل المساعدة المقدمة</div>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-5">

    {/* نتيجة المساعدة */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">نتيجة المساعدة *</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  value: 'completed', label: 'اكتملت بنجاح', color: '#059669',
                  icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                },
                {
                  value: 'partial', label: 'جزئية', color: '#D97706',
                  icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
                },
                {
                  value: 'not_delivered', label: 'لم تصل', color: '#DC2626',
                  icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                },
              ].map(opt => (
                <button key={opt.value} onClick={() => setForm(f => ({ ...f, result: opt.value }))}
                  className="p-4 rounded-xl border-2 text-center transition-all"
                  style={{
                    borderColor: form.result === opt.value ? opt.color : '#E5E7EB',
                    background:  form.result === opt.value ? `${opt.color}12` : 'white',
                  }}>
                  <div className="flex justify-center mb-2" style={{ color: form.result === opt.value ? opt.color : '#9CA3AF' }}>
                    {opt.icon}
                  </div>
                  <div className="text-xs font-bold" style={{ color: form.result === opt.value ? opt.color : '#6B7280' }}>
                    {opt.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

         {/* المبلغ والخدمة */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold mb-1.5" style={{ color: '#1F2937' }}>المبلغ المقدم (اختياري)</label>
          <input type="number" value={form.amount_delivered}
            onChange={e => setForm(f => ({ ...f, amount_delivered: e.target.value }))}
            placeholder="0"
            className="w-full h-10 rounded-xl px-3 text-sm focus:outline-none"
            style={{ border: `1.5px solid ${PRIMARY}30`, color: '#1F2937', background: 'white' }}/>
        </div>
        <div>
          <label className="block text-xs font-bold mb-1.5" style={{ color: '#1F2937' }}>الخدمة المقدمة (اختياري)</label>
          <input value={form.service_delivered}
            onChange={e => setForm(f => ({ ...f, service_delivered: e.target.value }))}
            placeholder="مثال: عملية جراحية، كتب مدرسية..."
            className="w-full h-10 rounded-xl px-3 text-sm focus:outline-none"
            style={{ border: `1.5px solid ${PRIMARY}30`, color: '#1F2937', background: 'white' }}/>
        </div>
      </div>

      {/* تاريخ التسليم */}
      <div>
        <label className="block text-xs font-bold mb-1.5" style={{ color: '#1F2937' }}>تاريخ تقديم المساعدة *</label>
        <div className="relative">
          <input type="date" value={form.delivery_date}
            onChange={e => setForm(f => ({ ...f, delivery_date: e.target.value }))}
            className="w-full h-10 rounded-xl px-3 text-sm focus:outline-none"
            style={{ border: `1.5px solid ${PRIMARY}30`, color: '#1F2937', background: 'white' }}/>
        </div>
      </div>

      {/* ملاحظات */}
      <div>
        <label className="block text-xs font-bold mb-1.5" style={{ color: '#1F2937' }}>ملاحظات (اختياري)</label>
        <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
          rows={3} placeholder="أي تفاصيل إضافية عن الحالة..."
          className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none resize-none"
          style={{ border: `1.5px solid ${PRIMARY}30`, color: '#1F2937', background: 'white' }}/>
      </div>

      {/* صور وملفات */}
      <div>
        <label className="block text-xs font-bold mb-1.5" style={{ color: '#1F2937' }}>صور وملفات إثبات (اختياري)</label>
        <div className="rounded-xl border-2 border-dashed p-4 text-center cursor-pointer hover:bg-gray-50 transition-all"
          style={{ borderColor: `${PRIMARY}30` }}
          onClick={() => document.getElementById('doc-files')?.click()}>
          <input id="doc-files" type="file" multiple accept="image/*,.pdf" className="hidden"
            onChange={e => setFiles(Array.from(e.target.files || []))}/>
          <svg className="w-8 h-8 mx-auto mb-2" style={{ color: PRIMARY }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
          </svg>
          <p className="text-xs font-medium" style={{ color: '#6B7280' }}>اضغط لرفع الملفات (صور، PDF)</p>
        </div>
        {files.length > 0 && (
          <div className="mt-2 space-y-1">
            {files.map((f, i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg px-3 py-1.5"
                style={{ background: `${PRIMARY}08`, border: `1px solid ${PRIMARY}15` }}>
                <svg className="w-3.5 h-3.5 flex-shrink-0" style={{ color: PRIMARY }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
                </svg>
                <span className="text-xs flex-1 truncate" style={{ color: '#1F2937' }}>{f.name}</span>
                <button onClick={() => setFiles(files.filter((_, j) => j !== i))}
                  className="text-xs font-bold transition-colors" style={{ color: '#DC2626' }}>✕</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* متابعة */}
      <div className="rounded-xl p-4" style={{
        background: form.needs_follow_up ? `${GOLD}08` : '#F8FAFC',
        border: `1.5px solid ${form.needs_follow_up ? GOLD : '#E5E7EB'}`,
        transition: 'all 0.2s',
      }}>
        <div className="flex items-center justify-between cursor-pointer"
          onClick={() => setForm(f => ({ ...f, needs_follow_up: !f.needs_follow_up, follow_up_date: '', follow_up_reason: '' }))}>
          <div>
            <div className="text-sm font-bold" style={{ color: '#1F2937' }}>تحتاج متابعة</div>
            <div className="text-xs mt-0.5" style={{ color: '#6B7280' }}>سيتم تنبيهك في تاريخ المتابعة</div>
          </div>
          <div className="relative flex-shrink-0" style={{ width: 48, height: 24 }}>
            <div className="w-full h-full rounded-full transition-all duration-300"
              style={{ background: form.needs_follow_up ? GOLD : '#D1D5DB' }}/>
            <div className="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-300"
              style={{ left: form.needs_follow_up ? '28px' : '4px' }}/>
          </div>
        </div>

        {form.needs_follow_up && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: '#1F2937' }}>تاريخ المتابعة *</label>
              <input type="date" value={form.follow_up_date}
                onChange={e => setForm(f => ({ ...f, follow_up_date: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
                className="w-full h-10 rounded-xl px-3 text-sm focus:outline-none"
                style={{ border: `1.5px solid ${GOLD}60`, color: '#1F2937', background: 'white' }}/>
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: '#1F2937' }}>سبب المتابعة *</label>
              <input value={form.follow_up_reason}
                onChange={e => setForm(f => ({ ...f, follow_up_reason: e.target.value }))}
                placeholder="مثال: التحقق من التعافي..."
                className="w-full h-10 rounded-xl px-3 text-sm focus:outline-none"
                style={{ border: `1.5px solid ${GOLD}60`, color: '#1F2937', background: 'white' }}/>
            </div>
          </div>
        )}
      </div>
          {error && (
            <div className="rounded-xl p-3 text-sm text-red-600 font-medium" style={{ background: '#FEE2E2' }}>
              ⚠️ {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button onClick={handleSubmit} disabled={saving}
              className="flex-1 h-11 text-white rounded-xl text-sm font-bold disabled:opacity-60 transition-all"
              style={{ background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_L})` }}>
              {saving ? 'جاري الحفظ...' : 'حفظ التوثيق'}
            </button>
            <button onClick={onClose}
              className="h-11 px-6 text-gray-600 rounded-xl text-sm border-2 border-gray-200 hover:bg-gray-50 transition-all">
              إلغاء
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RequestDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id     = params.id as string;

  const [request, setRequest]             = useState<any>(null);
  const [loading, setLoading]             = useState(true);
  const [user, setUser]                   = useState<any>(null);
  const [newNote, setNewNote]             = useState('');
  const [addingNote, setAddingNote]       = useState(false);
  const [statusForm, setStatusForm]       = useState({ status: '', note: '', priority: '' });
  const [updating, setUpdating]           = useState(false);
  const [showStatusForm, setShowStatusForm]       = useState(false);
  const [showDocModal, setShowDocModal]           = useState(false);
  const [documentation, setDocumentation]         = useState<any>(null);
  const [showFollowUpForm, setShowFollowUpForm]   = useState(false);
  const [followUpForm, setFollowUpForm]           = useState({ follow_up_status: 'done', follow_up_notes: '' });
  const [updatingFollowUp, setUpdatingFollowUp]   = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token    = localStorage.getItem('token');
    if (!token || !userData) { router.push('/dashboard/login'); return; }
    setUser(JSON.parse(userData));
    fetchRequest();
    fetchDocumentation();
  }, [id]);

  const fetchRequest = async () => {
    try {
      const res = await api.get(`/requests/${id}`);
      setRequest(res.data);
      setStatusForm(f => ({ ...f, status: res.data.status, priority: res.data.priority || 'normal' }));
    } catch {
      router.push('/dashboard/requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchDocumentation = async () => {
    try {
      const res = await api.get(`/documentation/request/${id}`);
      setDocumentation(res.data);
    } catch {
      setDocumentation(null);
    }
  };

  const handleUpdateStatus = async () => {
    if (!statusForm.status) return;
    setUpdating(true);
    try {
      await api.patch(`/requests/${id}/status`, statusForm);
      await fetchRequest();
      setShowStatusForm(false);
    } catch (err: any) {
      alert(err.response?.data?.message || 'حدث خطأ');
    } finally {
      setUpdating(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setAddingNote(true);
    try {
      await api.post(`/requests/${id}/notes`, { content: newNote });
      setNewNote('');
      await fetchRequest();
    } catch { alert('حدث خطأ'); }
    finally { setAddingNote(false); }
  };

  const handleDeleteNote = async (noteId: number) => {
    if (!confirm('هل تريد حذف هذه الملاحظة؟')) return;
    try {
      await api.delete(`/requests/${id}/notes/${noteId}`);
      await fetchRequest();
    } catch { alert('حدث خطأ'); }
  };

  const handleUpdateFollowUp = async () => {
    if (!documentation) return;
    setUpdatingFollowUp(true);
    try {
      await api.patch(`/documentation/${documentation.id}/follow-up`, followUpForm);
      await fetchDocumentation();
      setShowFollowUpForm(false);
    } catch { alert('حدث خطأ'); }
    finally { setUpdatingFollowUp(false); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#EEF5FB' }}>
      <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: PRIMARY }}></div>
    </div>
  );

  const status = statusMap[request?.status] || statusMap.new;

  return (
    <div className="min-h-screen" style={{ background: '#EEF5FB', position: 'relative' }} dir="rtl">
      <BgPattern />

      {/* Documentation Modal */}
      {showDocModal && (
        <DocumentationModal
          requestId={id}
          onClose={() => setShowDocModal(false)}
          onSuccess={() => { fetchDocumentation(); fetchRequest(); }}
        />
      )}

      {/* Navbar */}
      <nav style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${PRIMARY}20`, position: 'sticky', top: 0, zIndex: 40 }}>
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:bg-gray-100">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <div>
              <div className="text-sm font-bold text-gray-900">تفاصيل الطلب #{request?.id}</div>
              <div className="text-xs font-semibold" style={{ color: PRIMARY_L }}>{request?.ref_number}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full"
              style={{ background: status.bg, color: status.color }}>{status.label}</span>

            {/* زر التوثيق — يظهر فقط إذا الطلب مقبول وما في توثيق */}
            {request?.status === 'approved' && !documentation && (
              <button onClick={() => setShowDocModal(true)}
                className="text-xs px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-1.5"
                style={{ background: '#059669', color: 'white' }}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                وثّق الحالة
              </button>
            )}

            <button onClick={() => setShowStatusForm(!showStatusForm)}
              className="text-xs px-4 py-2 rounded-xl text-white font-semibold transition-all"
              style={{ background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_L})` }}>
              {showStatusForm ? 'إغلاق' : 'تغيير الحالة'}
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-6" style={{ position: 'relative', zIndex: 1 }}>

        {/* Status Form */}
        {showStatusForm && (
          <div className="rounded-2xl p-5 mb-5"
            style={{ background: 'white', border: `2px solid ${PRIMARY}30`, boxShadow: `0 4px 20px ${PRIMARY}15` }}>
            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs" style={{ background: PRIMARY }}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="white" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
              </div>
              تحديث حالة الطلب
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">الحالة الجديدة</label>
                <select value={statusForm.status} onChange={e => setStatusForm(f => ({ ...f, status: e.target.value }))}
                  className="w-full h-10 border-2 rounded-xl px-3 text-sm text-gray-900 bg-white focus:outline-none"
                  style={{ borderColor: `${PRIMARY}30` }}>
                  <option value="new">جديد</option>
                  <option value="reviewing">قيد المراجعة</option>
                  <option value="needs_info">يحتاج معلومات</option>
                  <option value="approved">مقبول</option>
                  <option value="rejected">مرفوض</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">الأولوية</label>
                <select value={statusForm.priority} onChange={e => setStatusForm(f => ({ ...f, priority: e.target.value }))}
                  className="w-full h-10 border-2 rounded-xl px-3 text-sm text-gray-900 bg-white focus:outline-none"
                  style={{ borderColor: `${PRIMARY}30` }}>
                  <option value="normal">عادية</option>
                  <option value="medium">متوسطة</option>
                  <option value="high">عالية</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">ملاحظة (اختياري)</label>
                <input value={statusForm.note} onChange={e => setStatusForm(f => ({ ...f, note: e.target.value }))}
                  placeholder="سبب التغيير..."
                  className="w-full h-10 border-2 rounded-xl px-3 text-sm bg-white focus:outline-none"
                  style={{ borderColor: `${PRIMARY}30` }}/>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={handleUpdateStatus} disabled={updating}
                className="h-10 px-6 text-white rounded-xl text-sm font-semibold disabled:opacity-60 transition-all"
                style={{ background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_L})` }}>
                {updating ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </button>
              <button onClick={() => setShowStatusForm(false)}
                className="h-10 px-6 text-gray-600 rounded-xl text-sm border-2 border-gray-200 hover:bg-gray-50 transition-all">
                إلغاء
              </button>
            </div>
          </div>
        )}

        {/* Documentation Card — يظهر إذا في توثيق */}
        {documentation && (
          <div className="rounded-2xl p-5 mb-5" style={{ background: 'white', border: `2px solid #05966930`, boxShadow: '0 4px 20px #05966915' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs" style={{ background: '#059669' }}>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="white" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                توثيق الحالة
              </h3>
              <span className="text-xs font-semibold px-3 py-1 rounded-full"
                style={{ background: resultMap[documentation.result]?.bg, color: resultMap[documentation.result]?.color }}>
                {resultMap[documentation.result]?.label}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {documentation.amount_delivered && (
                <InfoItem label="المبلغ المقدم" value={`${Number(documentation.amount_delivered).toLocaleString('en')} ل.س`}/>
              )}
              {documentation.service_delivered && (
                <InfoItem label="الخدمة المقدمة" value={documentation.service_delivered}/>
              )}
              <InfoItem label="تاريخ التسليم"  value={new Date(documentation.delivery_date).toLocaleDateString('ar-SA')}/>
              <InfoItem label="بواسطة"          value={documentation.creator?.name}/>
            </div>

            {documentation.notes && (
              <div className="rounded-xl p-3 mb-4" style={{ background: '#F8FAFC' }}>
                <div className="text-xs text-gray-400 mb-1">ملاحظات</div>
                <p className="text-sm text-gray-700">{documentation.notes}</p>
              </div>
            )}

            {/* ملفات التوثيق */}
            {documentation.files?.length > 0 && (
              <div className="mb-4">
                <div className="text-xs font-bold text-gray-600 mb-2">ملفات الإثبات</div>
                <div className="flex flex-wrap gap-2">
                  {documentation.files.map((f: any) => (
                    <a key={f.id} href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/storage/${f.file_path}`}
                      target="_blank" rel="noreferrer"
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
                      style={{ background: `${PRIMARY}10`, color: PRIMARY }}>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
                      </svg>
                      {f.file_name}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* المتابعة */}
            {documentation.needs_follow_up && (
              <div className="rounded-xl p-4" style={{ background: documentation.follow_up_status === 'done' ? '#D1FAE5' : `${GOLD}10`, border: `1.5px solid ${documentation.follow_up_status === 'done' ? '#059669' : GOLD}30` }}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold mb-1" style={{ color: documentation.follow_up_status === 'done' ? '#059669' : GOLD }}>
                      {documentation.follow_up_status === 'done' ? '✅ تمت المتابعة' : '⏰ تحتاج متابعة'}
                    </div>
                    <div className="text-xs text-gray-600">
                      {documentation.follow_up_reason} — {new Date(documentation.follow_up_date).toLocaleDateString('ar-SA')}
                    </div>
                    {documentation.follow_up_notes && (
                      <div className="text-xs text-gray-500 mt-1">{documentation.follow_up_notes}</div>
                    )}
                  </div>
                  {documentation.follow_up_status === 'pending' && (
                    <button onClick={() => setShowFollowUpForm(!showFollowUpForm)}
                      className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-all"
                      style={{ background: GOLD, color: 'white' }}>
                      تحديث المتابعة
                    </button>
                  )}
                </div>

                {showFollowUpForm && (
                  <div className="mt-3 pt-3 border-t border-white/50 space-y-2">
                    <textarea value={followUpForm.follow_up_notes}
                      onChange={e => setFollowUpForm(f => ({ ...f, follow_up_notes: e.target.value }))}
                      rows={2} placeholder="ملاحظات المتابعة..."
                      className="w-full rounded-xl px-3 py-2 text-xs focus:outline-none resize-none"
                      style={{ border: `1.5px solid ${GOLD}50` }}/>
                    <button onClick={handleUpdateFollowUp} disabled={updatingFollowUp}
                      className="h-8 px-5 text-white rounded-lg text-xs font-semibold disabled:opacity-60"
                      style={{ background: '#059669' }}>
                      {updatingFollowUp ? 'جاري الحفظ...' : 'تأكيد — تمت المتابعة'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-4">

            <InfoCard num="١" title="البيانات الشخصية" color={PRIMARY}>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <InfoItem label="الاسم الكامل"   value={request?.full_name} />
                <InfoItem label="رقم الهاتف"     value={request?.phone} />
                <InfoItem label="البريد"          value={request?.email || '—'} />
                <InfoItem label="العمر"           value={`${request?.age} سنة`} />
                <InfoItem label="الجنس"           value={genderMap[request?.gender] || request?.gender} />
                <InfoItem label="المنطقة"         value={request?.region} />
                <InfoItem label="العنوان"         value={request?.address || '—'} />
                <InfoItem label="الموظف المسؤول" value={request?.assigned_to?.name || 'غير معيّن'} />
              </div>
            </InfoCard>

            <InfoCard num="٢" title="الوضع العائلي والمالي" color="#059669">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <InfoItem label="أفراد الأسرة" value={request?.family_members} />
                <InfoItem label="عدد الأطفال"  value={request?.children_count} />
                <InfoItem label="الدخل الشهري" value={request?.monthly_income ? `${Number(request.monthly_income).toLocaleString('en')} ل.س` : '—'} />
                <InfoItem label="وضع السكن"    value={housingMap[request?.housing_status] || request?.housing_status} />
              </div>
            </InfoCard>

            <InfoCard num="٣" title="تفاصيل الطلب" color={GOLD}>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <InfoItem label="نوع المساعدة" value={assistanceMap[request?.assistance_type]} />
                <InfoItem label="رقم المرجع"   value={<span style={{ color: PRIMARY, fontWeight: 700 }}>{request?.ref_number}</span>} />
              </div>
              <div className="rounded-xl p-4" style={{ background: '#F8FAFC' }}>
                <div className="text-xs text-gray-400 mb-2">وصف الحالة</div>
                <p className="text-sm text-gray-700 leading-relaxed">{request?.description}</p>
              </div>
            </InfoCard>

           {/* Documents */}
        <div className="rounded-2xl p-5" style={{ background: 'white', border: `1px solid ${PRIMARY}15`, boxShadow: `0 2px 12px ${PRIMARY}08` }}>
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-5 h-5 rounded-lg flex items-center justify-center" style={{ background: `${PRIMARY}15` }}>
              <svg className="w-3 h-3" fill="none" stroke={PRIMARY} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
              </svg>
            </div>
            الوثائق المرفوعة
            <span className="text-xs font-normal text-gray-400 mr-1">({request?.documents?.length || 0})</span>
          </h3>

          {!request?.documents?.length ? (
            <div className="text-center py-6">
              <svg className="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <p className="text-sm text-gray-400">لا توجد وثائق مرفوعة</p>
            </div>
          ) : (
            <div className="space-y-2">
              {request.documents.map((doc: any) => {
                const isPdf = doc.file_name?.toLowerCase().endsWith('.pdf');
                const fileUrl = `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/storage/${doc.file_path}`;
                return (
                  <div key={doc.id} className="flex items-center gap-3 rounded-xl p-3 group transition-all hover:shadow-sm"
                    style={{ background: '#F8FAFC', border: `1px solid ${PRIMARY}10` }}>
                    {/* أيكون نوع الملف */}
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ background: isPdf ? `linear-gradient(135deg, #DC2626, #EF4444)` : `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_L})` }}>
                      {isPdf ? 'PDF' : 'IMG'}
                    </div>

                    {/* اسم الملف */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-gray-700 truncate font-medium">{doc.file_name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {doc.type === 'other' ? 'مستند إضافي' :
                        doc.type === 'photo' ? 'صورة' :
                        doc.type === 'medical_report' ? 'تقرير طبي' :
                        doc.type === 'official_proof' ? 'وثيقة رسمية' : doc.type}
                      </div>
                    </div>

                    {/* أزرار العرض والتحميل */}
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* عرض */}
                      <a href={fileUrl} target="_blank" rel="noreferrer"
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-105"
                        style={{ background: `${PRIMARY}12`, color: PRIMARY }}
                        title="عرض الملف">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                        </svg>
                      </a>

                      {/* تحميل */}
                          <button
                            onClick={async () => {
                              try {
                                const response = await api.get(
                                  `/documents/download/${doc.id}`,
                                  { responseType: 'blob' }
                                );
                                const url  = window.URL.createObjectURL(new Blob([response.data]));
                                const link = document.createElement('a');
                                link.href  = url;
                                link.setAttribute('download', doc.file_name);
                                document.body.appendChild(link);
                                link.click();
                                link.remove();
                                window.URL.revokeObjectURL(url);
                              } catch { alert('حدث خطأ في التحميل'); }
                            }}
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-105"
                            style={{ background: '#05966912', color: '#059669' }}
                            title="تحميل الملف">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                            </svg>
                          </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        </div>

          {/* Sidebar */}
          <div className="space-y-4">

            {/* Status Log */}
            <div className="rounded-2xl p-5" style={{ background: 'white', border: `1px solid ${PRIMARY}15`, boxShadow: `0 2px 12px ${PRIMARY}08` }}>
              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-5 h-5 rounded-lg flex items-center justify-center" style={{ background: `${PRIMARY}15` }}>
                  <svg className="w-3 h-3" fill="none" stroke={PRIMARY} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                سجل الحالات
              </h3>
              {!request?.status_logs?.length ? (
                <p className="text-xs text-gray-400 text-center py-3">لا يوجد سجل بعد</p>
              ) : (
                <div className="space-y-0">
                  {request.status_logs.map((log: any, i: number) => (
                    <div key={log.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0" style={{ background: PRIMARY }}></div>
                        {i < request.status_logs.length - 1 && (
                          <div className="w-px flex-1 mt-1 mb-1" style={{ background: `${PRIMARY}20` }}></div>
                        )}
                      </div>
                      <div className="pb-3 flex-1">
                        <div className="text-xs font-semibold text-gray-900">{statusMap[log.to_status]?.label || log.to_status}</div>
                        {log.note && <div className="text-xs text-gray-500 mt-0.5 bg-gray-50 rounded-lg px-2 py-1">{log.note}</div>}
                        <div className="text-xs text-gray-400 mt-0.5">{log.changed_by?.name} — {new Date(log.created_at).toLocaleDateString('ar-SA')}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="rounded-2xl p-5" style={{ background: 'white', border: `1px solid ${PRIMARY}15`, boxShadow: `0 2px 12px ${PRIMARY}08` }}>
              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-5 h-5 rounded-lg flex items-center justify-center" style={{ background: `${GOLD}20` }}>
                  <svg className="w-3 h-3" fill="none" stroke={GOLD} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                </div>
                الملاحظات الداخلية
              </h3>
              <div className="space-y-2 mb-3 max-h-64 overflow-y-auto">
                {!request?.notes?.length ? (
                  <p className="text-xs text-gray-400 text-center py-3">لا توجد ملاحظات</p>
                ) : (
                  request.notes.map((note: any) => (
                    <div key={note.id} className="rounded-xl p-3" style={{ background: '#F8FAFC', border: `1px solid ${PRIMARY}10` }}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-semibold" style={{ color: PRIMARY }}>{note.user?.name}</span>
                        <button onClick={() => handleDeleteNote(note.id)} className="text-gray-300 hover:text-red-400 transition-colors">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                          </svg>
                        </button>
                      </div>
                      <p className="text-xs text-gray-700 leading-relaxed">{note.content}</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(note.created_at).toLocaleDateString('ar-SA')}</p>
                    </div>
                  ))
                )}
              </div>
              <div className="flex gap-2">
                <input value={newNote} onChange={e => setNewNote(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddNote()}
                  placeholder="أضف ملاحظة..."
                  className="flex-1 h-9 rounded-xl px-3 text-xs focus:outline-none"
                  style={{ border: `1.5px solid ${PRIMARY}30`, background: 'white' }}/>
                <button onClick={handleAddNote} disabled={addingNote}
                  className="h-9 px-4 text-white rounded-xl text-xs font-semibold disabled:opacity-60 transition-all"
                  style={{ background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_L})` }}>
                  {addingNote ? '...' : 'إضافة'}
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}