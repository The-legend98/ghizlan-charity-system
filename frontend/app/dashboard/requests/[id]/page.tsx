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

const followUpStatusMap: Record<string, { label: string; color: string; bg: string }> = {
  pending:     { label: 'بانتظار المتابعة', color: GOLD,      bg: `${GOLD}15`   },
  rescheduled: { label: 'موعد جديد',        color: '#7C3AED', bg: '#EDE9FE'     },
  done:        { label: 'تمت المتابعة',     color: '#059669', bg: '#D1FAE5'     },
  completed:   { label: 'مكتملة',           color: '#059669', bg: '#D1FAE5'     },
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
const incomeMap:  Record<string, string> = {
  none:     'لا يوجد دخل',
  under_1m: 'أقل من ١,٠٠٠,٠٠٠ ل.س',
  '1m_2m':  '١,٠٠٠,٠٠٠ — ٢,٠٠٠,٠٠٠ ل.س',
  '2m_4m':  '٢,٠٠٠,٠٠٠ — ٤,٠٠٠,٠٠٠ ل.س',
  over_4m:  'أكثر من ٤,٠٠٠,٠٠٠ ل.س',
};

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
  <div className="rounded-xl p-3" style={{ background: '#F8FAFC', overflow: 'hidden' }}>
    <div className="text-xs text-gray-400 mb-1">{label}</div>
    <div className="text-sm font-semibold text-gray-900" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</div>
  </div>
);

const Badge = ({ label, color, bg }: { label: string; color: string; bg: string }) => (
  <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 8, background: bg, color, display: 'inline-block' }}>
    {label}
  </span>
);

// ═══ ASSIGN EMPLOYEE SECTION ═══
function AssignEmployeeSection({ requestId, currentEmployee, onAssigned }: {
  requestId: string; currentEmployee: any; onAssigned: () => void;
}) {
  const [employees, setEmployees] = useState<any[]>([]);
  const [selected, setSelected]   = useState('');
  const [saving, setSaving]       = useState(false);

  useEffect(() => {
    api.get('/users').then(res => {
      setEmployees((res.data.data || res.data).filter((u: any) => u.role === 'employee' && u.is_active));
    }).catch(() => {});
  }, []);

  const handleAssign = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await api.patch(`/requests/${requestId}/assign`, { assigned_to: selected });
      onAssigned();
      setSelected('');
    } catch { alert('حدث خطأ أثناء التعيين'); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ marginTop: 12, padding: '12px 14px', borderRadius: 12, background: `${PRIMARY}06`, border: `1px solid ${PRIMARY}20` }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', marginBottom: 8 }}>
        الموظف الحالي: <span style={{ color: PRIMARY, fontWeight: 700 }}>{currentEmployee?.name || 'غير معيّن'}</span>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <select value={selected} onChange={e => setSelected(e.target.value)}
          style={{ flex: 1, height: 36, borderRadius: 9, border: `1.5px solid ${PRIMARY}30`, padding: '0 10px', fontSize: 12, background: 'white', color: '#111827', outline: 'none' }}>
          <option value="">اختر موظفاً...</option>
          {employees.map(e => (
            <option key={e.id} value={e.id}>{e.name}</option>
          ))}
        </select>
        <button onClick={handleAssign} disabled={!selected || saving}
          style={{ padding: '0 14px', height: 36, borderRadius: 9, background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_L})`, color: 'white', fontSize: 12, fontWeight: 700, border: 'none', cursor: !selected || saving ? 'not-allowed' : 'pointer', opacity: !selected || saving ? 0.6 : 1 }}>
          {saving ? '...' : 'تعيين'}
        </button>
      </div>
    </div>
  );
}

const handlePrint = async (request: any, documentation: any) => {
  const status = statusMap[request?.status] || statusMap.new;

  const toBase64 = async (filePath: string): Promise<string> => {
    try {
      const token = localStorage.getItem('token');
      const res   = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/proxy-image?path=${encodeURIComponent(filePath)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const blob = await res.blob();
      return new Promise(resolve => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    } catch { return ''; }
  };

  const docImages: Record<number, string> = {};
  for (const doc of request?.documents || []) {
    if (!doc.file_name?.toLowerCase().endsWith('.pdf'))
      docImages[doc.id] = await toBase64(doc.file_path);
  }

  const docFileImages: Record<number, string> = {};
  for (const f of documentation?.files || []) {
    if (!f.file_name?.toLowerCase().endsWith('.pdf'))
      docFileImages[f.id] = await toBase64(f.file_path);
  }

  const win = window.open('', '_blank', 'width=900,height=700');
  if (!win) return;

  win.document.write(`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8"/>
<title>${request?.full_name} — ${request?.ref_number}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Cairo',Arial,sans-serif; color:#111827; background:white; font-size:13px; direction:rtl; }
  @page { margin:15mm; size:A4; }
  @media print {
    body { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    .no-print { display:none !important; }
    .section { page-break-inside:avoid; }
  }
  .page { max-width:794px; margin:0 auto; padding:24px; }
  .header { display:flex; justify-content:space-between; align-items:center; padding-bottom:14px; border-bottom:3px solid #1B6CA8; margin-bottom:20px; }
  .logo-area { display:flex; align-items:center; gap:12px; }
  .org-name { font-size:17px; font-weight:900; color:#1B6CA8; }
  .org-sub { font-size:10px; color:#6B7280; margin-top:2px; letter-spacing:1px; }
  .ref-area { text-align:left; }
  .ref-num { font-size:15px; font-weight:900; color:#1B6CA8; }
  .status-badge { display:inline-block; padding:3px 10px; border-radius:6px; font-size:11px; font-weight:700; margin-top:4px; }
  .print-date { font-size:10px; color:#9CA3AF; margin-top:4px; }
  .section { margin-bottom:16px; }
  .sec-title { font-size:12px; font-weight:700; color:#1B6CA8; padding:5px 10px; background:#EEF5FB; border-right:4px solid #1B6CA8; margin-bottom:10px; border-radius:0 4px 4px 0; }
  .grid3 { display:grid; grid-template-columns:repeat(3,1fr); gap:6px; }
  .grid2 { display:grid; grid-template-columns:repeat(2,1fr); gap:6px; }
  .grid4 { display:grid; grid-template-columns:repeat(4,1fr); gap:6px; }
  .item { background:#F8FAFC; border-radius:6px; padding:7px 9px; border:1px solid #F1F5F9; }
  .item-lbl { font-size:9px; color:#9CA3AF; margin-bottom:2px; }
  .item-val { font-size:11px; font-weight:600; color:#111827; }
  .desc-box { background:#F8FAFC; border-radius:6px; padding:10px 12px; font-size:11px; color:#374151; line-height:1.8; border:1px solid #F1F5F9; }
  .imgs-wrap { display:flex; flex-wrap:wrap; gap:10px; margin-top:8px; }
  .img-card { text-align:center; }
  .img-card img { width:150px; height:130px; object-fit:cover; border-radius:6px; border:1px solid #E5E7EB; display:block; }
  .img-name { font-size:9px; color:#9CA3AF; margin-top:3px; max-width:150px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .pdf-badge { width:100px; height:60px; background:#EEF5FB; border-radius:6px; display:flex; align-items:center; justify-content:center; font-size:12px; color:#1B6CA8; font-weight:700; border:1px solid #DBEAFE; }
  .doc-box { background:#F0FDF4; border-radius:8px; padding:12px; border:1px solid #A7F3D0; }
  .log-item { display:flex; gap:10px; margin-bottom:8px; align-items:flex-start; }
  .log-dot { width:8px; height:8px; border-radius:50%; background:#1B6CA8; flex-shrink:0; margin-top:4px; }
  .note-item { background:#F8FAFC; border-radius:6px; padding:8px 10px; border-right:3px solid #1B6CA8; margin-bottom:6px; }
  .footer { margin-top:20px; padding-top:10px; border-top:1px solid #E5E7EB; display:flex; justify-content:space-between; font-size:9px; color:#9CA3AF; }
  .print-btn { position:fixed; top:16px; left:16px; padding:10px 20px; background:#1B6CA8; color:white; border:none; border-radius:8px; font-size:14px; font-family:'Cairo',Arial,sans-serif; cursor:pointer; z-index:9999; box-shadow:0 4px 12px rgba(27,108,168,0.4); }
  .print-btn:hover { background:#155d8a; }
</style>
</head>
<body>
<button class="print-btn no-print" onclick="window.print()">🖨️ طباعة / حفظ PDF</button>
<div class="page">
  <div class="header">
    <div class="logo-area">
      <img src="http://192.168.2.102:3000/g-logo.png" style="width:50px;height:50px;object-fit:contain;"
          onerror="this.style.display='none';document.getElementById('fallback-logo').style.display='flex'"/>
      <div id="fallback-logo" style="display:none;width:50px;height:50px;border-radius:50%;background:#1B6CA8;color:white;align-items:center;justify-content:center;font-size:24px;font-weight:900;flex-shrink:0;">غ</div>
      <div>
        <div class="org-name">مؤسسة غزلان الخير الإنسانية</div>
        <div class="org-sub">GHOZLAN ALKHAIR FOUNDATION</div>
      </div>
    </div>
    <div class="ref-area">
      <div class="ref-num">${request?.ref_number}</div>
      <div><span class="status-badge" style="background:${status.bg};color:${status.color}">${status.label}</span></div>
      <div class="print-date">تاريخ الطباعة: ${new Date().toLocaleDateString('ar-SA')}</div>
    </div>
  </div>

  <div class="section">
    <div class="sec-title">١ — البيانات الشخصية</div>
    <div class="grid3">
      <div class="item"><div class="item-lbl">الاسم الكامل</div><div class="item-val">${request?.full_name}</div></div>
      <div class="item"><div class="item-lbl">رقم الهاتف</div><div class="item-val">${request?.phone}</div></div>
      <div class="item"><div class="item-lbl">الرقم الوطني</div><div class="item-val">${request?.national_id || '—'}</div></div>
      <div class="item"><div class="item-lbl">البريد الإلكتروني</div><div class="item-val">${request?.email || '—'}</div></div>
      <div class="item"><div class="item-lbl">العمر</div><div class="item-val">${request?.age} سنة</div></div>
      <div class="item"><div class="item-lbl">الجنس</div><div class="item-val">${genderMap[request?.gender] || '—'}</div></div>
      <div class="item"><div class="item-lbl">المنطقة</div><div class="item-val">${request?.region}</div></div>
      <div class="item"><div class="item-lbl">العنوان</div><div class="item-val">${request?.address || '—'}</div></div>
      <div class="item"><div class="item-lbl">الموظف المسؤول</div><div class="item-val">${request?.assigned_to?.name || 'غير معيّن'}</div></div>
    </div>
  </div>

  <div class="section">
    <div class="sec-title">٢ — الوضع العائلي والمالي</div>
    <div class="grid4">
      <div class="item"><div class="item-lbl">أفراد الأسرة</div><div class="item-val">${request?.family_members}</div></div>
      <div class="item"><div class="item-lbl">عدد الأطفال</div><div class="item-val">${request?.children_count || 0}</div></div>
      <div class="item"><div class="item-lbl">الدخل الشهري</div><div class="item-val">${incomeMap[request?.income_range] || '—'}</div></div>
      <div class="item"><div class="item-lbl">وضع السكن</div><div class="item-val">${housingMap[request?.housing_status] || '—'}</div></div>
    </div>
  </div>

  <div class="section">
    <div class="sec-title">٣ — تفاصيل الطلب</div>
    <div class="grid2" style="margin-bottom:8px">
      <div class="item"><div class="item-lbl">نوع المساعدة</div><div class="item-val">${assistanceMap[request?.assistance_type] || '—'}</div></div>
      <div class="item"><div class="item-lbl">تاريخ التقديم</div><div class="item-val">${new Date(request?.created_at).toLocaleDateString('ar-SA')}</div></div>
    </div>
    <div class="desc-box">${request?.description}</div>
  </div>

  ${request?.documents?.length > 0 ? `
  <div class="section">
    <div class="sec-title">الوثائق المرفوعة (${request.documents.length})</div>
    <div class="imgs-wrap">
      ${request.documents.map((doc: any) => {
        const b64 = docImages[doc.id];
        return `<div class="img-card">
          ${b64 ? `<img src="${b64}" alt="${doc.file_name}"/>` : `<div class="pdf-badge">PDF</div>`}
          <div class="img-name">${doc.file_name}</div>
        </div>`;
      }).join('')}
    </div>
  </div>` : ''}

  ${documentation ? `
  <div class="section">
    <div class="sec-title">توثيق الحالة — ${resultMap[documentation.result]?.label || ''}</div>
    <div class="doc-box">
      <div class="grid3" style="margin-bottom:8px">
        ${documentation.amount_delivered ? `<div class="item"><div class="item-lbl">المبلغ المقدم</div><div class="item-val">${Number(documentation.amount_delivered).toLocaleString('en')} ل.س</div></div>` : ''}
        ${documentation.service_delivered ? `<div class="item"><div class="item-lbl">الخدمة المقدمة</div><div class="item-val">${documentation.service_delivered}</div></div>` : ''}
        <div class="item"><div class="item-lbl">تاريخ التسليم</div><div class="item-val">${new Date(documentation.delivery_date).toLocaleDateString('ar-SA')}</div></div>
        <div class="item"><div class="item-lbl">بواسطة</div><div class="item-val">${documentation.creator?.name || '—'}</div></div>
      </div>
      ${documentation.notes ? `<div class="desc-box" style="margin-bottom:8px;background:white">${documentation.notes}</div>` : ''}
      ${documentation.files?.length > 0 ? `
        <div class="imgs-wrap">
          ${documentation.files.map((f: any) => {
            const b64 = docFileImages[f.id];
            return `<div class="img-card">
              ${b64 ? `<img src="${b64}" alt="${f.file_name}"/>` : `<div class="pdf-badge">PDF</div>`}
              <div class="img-name">${f.file_name}</div>
            </div>`;
          }).join('')}
        </div>` : ''}
    </div>
  </div>` : ''}

  ${request?.status_logs?.length > 0 ? `
  <div class="section">
    <div class="sec-title">سجل الحالات</div>
    ${request.status_logs.map((log: any) => `
      <div class="log-item">
        <div class="log-dot"></div>
        <div>
          <div style="font-size:11px;font-weight:700;color:#111827">${statusMap[log.to_status]?.label || log.to_status}</div>
          ${log.note ? `<div style="font-size:10px;color:#6B7280;margin-top:2px">${log.note}</div>` : ''}
          <div style="font-size:9px;color:#9CA3AF;margin-top:2px">${log.changed_by?.name} — ${new Date(log.created_at).toLocaleDateString('ar-SA')}</div>
        </div>
      </div>`).join('')}
  </div>` : ''}

  ${request?.notes?.length > 0 ? `
  <div class="section">
    <div class="sec-title">الملاحظات الداخلية (${request.notes.length})</div>
    ${request.notes.map((note: any) => `
      <div class="note-item">
        <div style="font-size:9px;color:#9CA3AF;margin-bottom:3px">${note.user?.name} — ${new Date(note.created_at).toLocaleDateString('ar-SA')}</div>
        <div style="font-size:11px;color:#374151">${note.content}</div>
      </div>`).join('')}
  </div>` : ''}

  <div class="footer">
    <div>مؤسسة غزلان الخير الإنسانية — وثيقة داخلية سرية</div>
    <div>${request?.ref_number} — ${new Date().toLocaleDateString('ar-SA')}</div>
  </div>
</div>
</body>
</html>`);
  win.document.close();
};

// ═══ DOCUMENTATION MODAL ═══
function DocumentationModal({ requestId, onClose, onSuccess }: {
  requestId: string; onClose: () => void; onSuccess: () => void;
}) {
  const [form, setForm] = useState({
    result: 'completed', amount_delivered: '', service_delivered: '',
    delivery_date: new Date().toISOString().split('T')[0],
    notes: '', needs_follow_up: false, follow_up_date: '', follow_up_reason: '',
  });
  const [files, setFiles]   = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const handleSubmit = async () => {
    if (!form.delivery_date) { setError('تاريخ التسليم مطلوب'); return; }
    if (form.needs_follow_up && !form.follow_up_date) { setError('تاريخ المتابعة مطلوب'); return; }
    if (form.needs_follow_up && !form.follow_up_reason) { setError('سبب المتابعة مطلوب'); return; }
    setSaving(true); setError('');
    try {
      const fd = new FormData();
      fd.append('request_id', requestId);
      fd.append('result', form.result);
      fd.append('delivery_date', form.delivery_date);
      fd.append('notes', form.notes);
      fd.append('needs_follow_up', form.needs_follow_up ? '1' : '0');
      if (form.amount_delivered)  fd.append('amount_delivered', form.amount_delivered);
      if (form.service_delivered) fd.append('service_delivered', form.service_delivered);
      if (form.needs_follow_up) { fd.append('follow_up_date', form.follow_up_date); fd.append('follow_up_reason', form.follow_up_reason); }
      files.forEach(f => fd.append('files[]', f));
      await api.post('/documentation', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      onSuccess(); onClose();
    } catch (err: any) { setError(err.response?.data?.message || 'حدث خطأ'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl" style={{ background: 'white', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="px-6 py-4 flex items-center justify-between" style={{ background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_L})` }}>
          <div>
            <div className="text-sm font-bold text-white">توثيق الحالة</div>
            <div className="text-xs text-white/70">أدخل تفاصيل المساعدة المقدمة</div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white hover:bg-white/30">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="p-6 space-y-5" style={{ background: 'white', color: '#111827' }}>
          <div>
            <label className="block text-xs font-bold text-gray-900 mb-2">نتيجة المساعدة *</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'completed',     label: 'اكتملت بنجاح', color: '#059669' },
                { value: 'partial',       label: 'جزئية',         color: '#D97706' },
                { value: 'not_delivered', label: 'لم تصل',        color: '#DC2626' },
              ].map(opt => (
                <button key={opt.value} onClick={() => setForm(f => ({ ...f, result: opt.value }))}
                  className="p-4 rounded-xl border-2 text-center transition-all"
                  style={{ borderColor: form.result === opt.value ? opt.color : '#E5E7EB', background: form.result === opt.value ? `${opt.color}12` : 'white' }}>
                  <div className="text-xs font-bold" style={{ color: form.result === opt.value ? opt.color : '#6B7280' }}>{opt.label}</div>
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: '#111827' }}>المبلغ المقدم (اختياري)</label>
              <input type="number" value={form.amount_delivered} onChange={e => setForm(f => ({ ...f, amount_delivered: e.target.value }))} placeholder="0"
                className="w-full h-10 rounded-xl px-3 text-sm focus:outline-none" style={{ border: `1.5px solid ${PRIMARY}30`, background: 'white' }}/>
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: '#111827' }}>الخدمة المقدمة (اختياري)</label>
              <input value={form.service_delivered} onChange={e => setForm(f => ({ ...f, service_delivered: e.target.value }))} placeholder="مثال: عملية جراحية..."
                className="w-full h-10 rounded-xl px-3 text-sm focus:outline-none" style={{ border: `1.5px solid ${PRIMARY}30`, background: 'white' }}/>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold mb-1.5" style={{ color: '#111827' }}>تاريخ تقديم المساعدة *</label>
            <input type="date" value={form.delivery_date} onChange={e => setForm(f => ({ ...f, delivery_date: e.target.value }))}
              className="w-full h-10 rounded-xl px-3 text-sm focus:outline-none" style={{ border: `1.5px solid ${PRIMARY}30`, background: 'white' }}/>
          </div>
          <div>
            <label className="block text-xs font-bold mb-1.5" style={{ color: '#111827' }}>ملاحظات (اختياري)</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} placeholder="أي تفاصيل إضافية..."
              className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none resize-none" style={{ border: `1.5px solid ${PRIMARY}30`, background: 'white' }}/>
          </div>
          <div>
            <label className="block text-xs font-bold mb-1.5" style={{ color: '#111827' }}>صور وملفات إثبات (اختياري)</label>
            <div className="rounded-xl border-2 border-dashed p-4 text-center cursor-pointer hover:bg-gray-50"
              style={{ borderColor: `${PRIMARY}30` }} onClick={() => document.getElementById('doc-files')?.click()}>
              <input id="doc-files" type="file" multiple accept="image/*,.pdf" className="hidden" onChange={e => setFiles(Array.from(e.target.files || []))}/>
              <p className="text-xs font-medium text-gray-500">اضغط لرفع الملفات (صور، PDF)</p>
            </div>
            {files.length > 0 && (
              <div className="mt-2 space-y-1">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg px-3 py-1.5" style={{ background: `${PRIMARY}08`, border: `1px solid ${PRIMARY}15` }}>
                    <span className="text-xs flex-1 truncate text-gray-700">{f.name}</span>
                    <button onClick={() => setFiles(files.filter((_, j) => j !== i))} className="text-xs font-bold text-red-500">✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="rounded-xl p-4" style={{ background: form.needs_follow_up ? `${GOLD}08` : '#F8FAFC', border: `1.5px solid ${form.needs_follow_up ? GOLD : '#E5E7EB'}` }}>
            <div className="flex items-center justify-between cursor-pointer"
              onClick={() => setForm(f => ({ ...f, needs_follow_up: !f.needs_follow_up, follow_up_date: '', follow_up_reason: '' }))}>
              <div>
                <div className="text-sm font-bold text-gray-800">تحتاج متابعة</div>
                <div className="text-xs mt-0.5 text-gray-500">سيتم تنبيهك في تاريخ المتابعة</div>
              </div>
              <div className="relative flex-shrink-0" style={{ width: 48, height: 24 }}>
                <div className="w-full h-full rounded-full transition-all" style={{ background: form.needs_follow_up ? GOLD : '#D1D5DB' }}/>
                <div className="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all" style={{ left: form.needs_follow_up ? '28px' : '4px' }}/>
              </div>
            </div>
            {form.needs_follow_up && (
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-gray-900">تاريخ المتابعة *</label>
                  <input type="date" value={form.follow_up_date} onChange={e => setForm(f => ({ ...f, follow_up_date: e.target.value }))} min={new Date().toISOString().split('T')[0]}
                    className="w-full h-10 rounded-xl px-3 text-sm focus:outline-none" style={{ border: `1.5px solid ${GOLD}60`, background: 'white' }}/>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-gray-900">سبب المتابعة *</label>
                  <input value={form.follow_up_reason} onChange={e => setForm(f => ({ ...f, follow_up_reason: e.target.value }))} placeholder="مثال: التحقق من التعافي..."
                    className="w-full h-10 rounded-xl px-3 text-sm focus:outline-none" style={{ border: `1.5px solid ${GOLD}60`, background: 'white' }}/>
                </div>
              </div>
            )}
          </div>
          {error && <div className="rounded-xl p-3 text-sm text-red-600 font-medium bg-red-50">⚠️ {error}</div>}
          <div className="flex gap-3 pt-2">
            <button onClick={handleSubmit} disabled={saving}
              className="flex-1 h-11 text-white rounded-xl text-sm font-bold disabled:opacity-60"
              style={{ background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_L})` }}>
              {saving ? 'جاري الحفظ...' : 'حفظ التوثيق'}
            </button>
            <button onClick={onClose} className="h-11 px-6 text-gray-600 rounded-xl text-sm border-2 border-gray-200 hover:bg-gray-50">إلغاء</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══ MAIN PAGE ═══
export default function RequestDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id     = params.id as string;

  const [request, setRequest]                   = useState<any>(null);
  const [loading, setLoading]                   = useState(true);
  const [user, setUser]                         = useState<any>(null);
  const [newNote, setNewNote]                   = useState('');
  const [addingNote, setAddingNote]             = useState(false);
  const [statusForm, setStatusForm]             = useState({ status: '', note: '', priority: '' });
  const [updating, setUpdating]                 = useState(false);
  const [showStatusForm, setShowStatusForm]     = useState(false);
  const [showDocModal, setShowDocModal]         = useState(false);
  const [documentation, setDocumentation]       = useState<any>(null);
  const [showFollowUpForm, setShowFollowUpForm] = useState(false);
  const [followUpNotes, setFollowUpNotes]       = useState('');
  const [newFollowUpDate, setNewFollowUpDate]   = useState('');
  const [updatingFollowUp, setUpdatingFollowUp] = useState(false);
  const [printing, setPrinting]                 = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token    = localStorage.getItem('token');
    if (!token || !userData) { router.push('/login'); return; }
    setUser(JSON.parse(userData));
    fetchRequest();
    fetchDocumentation();
  }, [id]);

  const fetchRequest = async () => {
    try {
      const res = await api.get(`/requests/${id}`);
      setRequest(res.data);
      setStatusForm(f => ({ ...f, status: res.data.status, priority: res.data.priority || 'normal' }));
    } catch { router.push('/dashboard/requests'); }
    finally { setLoading(false); }
  };

  const fetchDocumentation = async () => {
    try {
      const res = await api.get(`/documentation/request/${id}`);
      setDocumentation(res.data);
    } catch (err: any) {
      if (err.response?.status === 404) setDocumentation(null);
    }
  };

  const handleUpdateStatus = async () => {
    if (!statusForm.status) return;
    setUpdating(true);
    try {
      await api.patch(`/requests/${id}/status`, statusForm);
      await fetchRequest();
      setShowStatusForm(false);
    } catch (err: any) { alert(err.response?.data?.message || 'حدث خطأ'); }
    finally { setUpdating(false); }
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

  const handleMarkDone = async () => {
    if (!documentation) return;
    setUpdatingFollowUp(true);
    try {
      await api.patch(`/documentation/${documentation.id}/follow-up`, { follow_up_status: 'done', follow_up_notes: followUpNotes });
      await fetchDocumentation();
      setShowFollowUpForm(false);
      setFollowUpNotes('');
    } catch { alert('حدث خطأ'); }
    finally { setUpdatingFollowUp(false); }
  };

  const handleReschedule = async () => {
    if (!newFollowUpDate) { alert('اختر تاريخ المتابعة الجديد'); return; }
    if (!documentation) return;
    setUpdatingFollowUp(true);
    try {
      await api.patch(`/documentation/${documentation.id}/follow-up`, { follow_up_status: 'rescheduled', follow_up_date: newFollowUpDate, follow_up_notes: followUpNotes });
      await fetchDocumentation();
      setShowFollowUpForm(false);
      setNewFollowUpDate('');
      setFollowUpNotes('');
    } catch { alert('حدث خطأ'); }
    finally { setUpdatingFollowUp(false); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#EEF5FB' }}>
      <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: PRIMARY }}/>
    </div>
  );

  const status = statusMap[request?.status] || statusMap.new;
  const isDone = ['done', 'completed'].includes(documentation?.follow_up_status);

  return (
    <div className="min-h-screen" style={{ background: '#EEF5FB', position: 'relative' }} dir="rtl">
      <BgPattern />

      {showDocModal && (
        <DocumentationModal requestId={id} onClose={() => setShowDocModal(false)}
          onSuccess={() => { fetchDocumentation(); fetchRequest(); }} />
      )}

      {/* Navbar */}
      <nav style={{ background: 'rgba(255,255,255,0.93)', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${PRIMARY}20`, position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px', height: 62, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <button onClick={() => router.back()}
              style={{ width: 34, height: 34, borderRadius: 9, border: `1px solid ${PRIMARY}20`, background: `${PRIMARY}06`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="15" height="15" fill="none" stroke={PRIMARY} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
            </button>
            <img src="/g-logo.png" alt="" style={{ width: 36, height: 36, objectFit: 'contain', flexShrink: 0 }}
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}/>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#111827' }}>تفاصيل الطلب #{request?.id}</div>
              <div style={{ fontSize: 9, fontWeight: 600, color: PRIMARY_L }}>{request?.ref_number}</div>
            </div>
          </div>

          {/* Desktop */}
          <div className="hidden md:flex" style={{ alignItems: 'center', gap: 8 }}>
            <Badge label={status.label} color={status.color} bg={status.bg} />
            <button onClick={async () => { setPrinting(true); await handlePrint(request, documentation); setPrinting(false); }} disabled={printing}
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '7px 13px', borderRadius: 10, border: `1px solid ${PRIMARY}25`, background: `${PRIMARY}06`, color: PRIMARY, cursor: printing ? 'not-allowed' : 'pointer', fontWeight: 600 }}>
              {printing
                ? <><span style={{ width: 14, height: 14, border: `2px solid ${PRIMARY}40`, borderTopColor: PRIMARY, borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }}/>جاري التحضير...</>
                : <><svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>طباعة PDF</>
              }
            </button>
            {request?.status === 'approved' && !documentation && (
              <button onClick={() => setShowDocModal(true)}
                style={{ fontSize: 12, padding: '7px 14px', borderRadius: 10, background: '#059669', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                وثّق الحالة
              </button>
            )}
            <button onClick={() => setShowStatusForm(!showStatusForm)}
              style={{ fontSize: 12, padding: '7px 14px', borderRadius: 10, color: 'white', fontWeight: 600, border: 'none', cursor: 'pointer', background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_L})` }}>
              {showStatusForm ? 'إغلاق' : 'تغيير الحالة'}
            </button>
          </div>

          {/* Mobile */}
          <div className="flex md:hidden" style={{ alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <Badge label={status.label} color={status.color} bg={status.bg} />
            <button onClick={async () => { setPrinting(true); await handlePrint(request, documentation); setPrinting(false); }} disabled={printing}
              style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${PRIMARY}25`, background: `${PRIMARY}06`, color: PRIMARY, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
            </button>
            {request?.status === 'approved' && !documentation && (
              <button onClick={() => setShowDocModal(true)}
                style={{ fontSize: 11, padding: '6px 10px', borderRadius: 8, background: '#059669', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                وثّق
              </button>
            )}
            <button onClick={() => setShowStatusForm(!showStatusForm)}
              style={{ fontSize: 11, padding: '6px 10px', borderRadius: 8, color: 'white', fontWeight: 600, border: 'none', cursor: 'pointer', background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_L})` }}>
              {showStatusForm ? 'إغلاق' : 'الحالة'}
            </button>
          </div>

        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-6" style={{ position: 'relative', zIndex: 1 }}>

        {showStatusForm && (
          <div className="rounded-2xl p-5 mb-5" style={{ background: 'white', border: `2px solid ${PRIMARY}30`, boxShadow: `0 4px 20px ${PRIMARY}15`, colorScheme: 'light' as const }}>
            <h3 className="text-sm font-bold text-gray-900 mb-4">تحديث حالة الطلب</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#111827' }}>الحالة الجديدة</label>
                <select value={statusForm.status} onChange={e => setStatusForm(f => ({ ...f, status: e.target.value }))}
                  className="w-full h-10 border-2 rounded-xl px-3 text-sm text-gray-900 bg-white focus:outline-none" style={{ borderColor: `${PRIMARY}30` }}>
                  <option value="new">جديد</option>
                  <option value="reviewing">قيد المراجعة</option>
                  <option value="needs_info">يحتاج معلومات</option>
                  <option value="approved">مقبول</option>
                  <option value="rejected">مرفوض</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#111827' }}>الأولوية</label>
                <select value={statusForm.priority} onChange={e => setStatusForm(f => ({ ...f, priority: e.target.value }))}
                  className="w-full h-10 border-2 rounded-xl px-3 text-sm text-gray-900 bg-white focus:outline-none" style={{ borderColor: `${PRIMARY}30` }}>
                  <option value="normal">عادية</option>
                  <option value="medium">متوسطة</option>
                  <option value="high">عالية</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#111827' }}>ملاحظة (اختياري)</label>
                <input value={statusForm.note} onChange={e => setStatusForm(f => ({ ...f, note: e.target.value }))} placeholder="سبب التغيير..."
                  className="w-full h-10 border-2 rounded-xl px-3 text-sm focus:outline-none"
                  style={{ borderColor: `${PRIMARY}30`, background: 'white', color: '#111827', colorScheme: 'light' as const }}/>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={handleUpdateStatus} disabled={updating}
                className="h-10 px-6 text-white rounded-xl text-sm font-semibold disabled:opacity-60"
                style={{ background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_L})` }}>
                {updating ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </button>
              <button onClick={() => setShowStatusForm(false)} className="h-10 px-6 text-gray-600 rounded-xl text-sm border-2 border-gray-200 hover:bg-gray-50">إلغاء</button>
            </div>
          </div>
        )}

        {documentation && (
          <div className="rounded-2xl p-5 mb-5" style={{ background: 'white', border: '2px solid #05966930', boxShadow: '0 4px 20px #05966915' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">توثيق الحالة</h3>
              <Badge label={resultMap[documentation.result]?.label} color={resultMap[documentation.result]?.color} bg={resultMap[documentation.result]?.bg} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {documentation.amount_delivered && <InfoItem label="المبلغ المقدم" value={`${Number(documentation.amount_delivered).toLocaleString('en')} ل.س`}/>}
              {documentation.service_delivered && <InfoItem label="الخدمة المقدمة" value={documentation.service_delivered}/>}
              <InfoItem label="تاريخ التسليم" value={new Date(documentation.delivery_date).toLocaleDateString('ar-SA')}/>
              <InfoItem label="بواسطة" value={documentation.creator?.name}/>
            </div>
            {documentation.notes && (
              <div className="rounded-xl p-3 mb-4 bg-gray-50">
                <div className="text-xs text-gray-400 mb-1">ملاحظات</div>
                <p className="text-sm text-gray-700">{documentation.notes}</p>
              </div>
            )}
            {documentation.files?.length > 0 && (
              <div className="mb-4">
                <div className="text-xs font-bold text-gray-600 mb-2">ملفات الإثبات</div>
                <div className="flex flex-wrap gap-2">
                  {documentation.files.map((f: any) => (
                    <a key={f.id} href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/storage/${f.file_path}`}
                      target="_blank" rel="noreferrer" className="text-xs px-3 py-1.5 rounded-lg hover:opacity-80"
                      style={{ background: `${PRIMARY}10`, color: PRIMARY }}>
                      {f.file_name}
                    </a>
                  ))}
                </div>
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
                <InfoItem label="الرقم الوطني"   value={request?.national_id || '—'} />
                <InfoItem label="البريد"          value={request?.email || '—'} />
                <InfoItem label="العمر"           value={`${request?.age} سنة`} />
                <InfoItem label="الجنس"           value={genderMap[request?.gender] || request?.gender} />
                <InfoItem label="المنطقة"         value={request?.region} />
                <InfoItem label="العنوان"         value={request?.address || '—'} />
                <InfoItem label="الموظف المسؤول" value={request?.assigned_to?.name || 'غير معيّن'} />
              </div>
              {/* ✅ زر تعيين موظف — للمدير فقط */}
              {user?.role === 'manager' && (
                <AssignEmployeeSection
                  requestId={id}
                  currentEmployee={request?.assigned_to}
                  onAssigned={fetchRequest}
                />
              )}
            </InfoCard>

            <InfoCard num="٢" title="الوضع العائلي والمالي" color="#059669">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <InfoItem label="أفراد الأسرة"  value={request?.family_members} />
                <InfoItem label="عدد الأطفال"   value={request?.children_count} />
                <InfoItem label="الدخل الشهري"  value={incomeMap[request?.income_range] || '—'} />
                <InfoItem label="وضع السكن"     value={housingMap[request?.housing_status] || request?.housing_status} />
              </div>
            </InfoCard>

            <InfoCard num="٣" title="تفاصيل الطلب" color={GOLD}>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <InfoItem label="نوع المساعدة" value={assistanceMap[request?.assistance_type]} />
                <InfoItem label="رقم المرجع"   value={<span style={{ color: PRIMARY, fontWeight: 700 }}>{request?.ref_number}</span>} />
              </div>
              <div className="rounded-xl p-4 bg-gray-50">
                <div className="text-xs text-gray-400 mb-2">وصف الحالة</div>
                <p className="text-sm text-gray-700 leading-relaxed">{request?.description}</p>
              </div>
            </InfoCard>

            <div className="rounded-2xl p-5" style={{ background: 'white', border: `1px solid ${PRIMARY}15`, boxShadow: `0 2px 12px ${PRIMARY}08` }}>
              <h3 className="text-sm font-bold text-gray-900 mb-4">
                الوثائق المرفوعة <span className="text-xs font-normal text-gray-400">({request?.documents?.length || 0})</span>
              </h3>
              {!request?.documents?.length ? (
                <p className="text-sm text-gray-400 text-center py-6">لا توجد وثائق مرفوعة</p>
              ) : (
                <div className="space-y-2">
                  {request.documents.map((doc: any) => {
                    const isPdf   = doc.file_name?.toLowerCase().endsWith('.pdf');
                    const fileUrl = `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/storage/${doc.file_path}`;
                    return (
                      <div key={doc.id} className="flex items-center gap-3 rounded-xl p-3 group transition-all hover:shadow-sm"
                        style={{ background: '#F8FAFC', border: `1px solid ${PRIMARY}10` }}>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{ background: isPdf ? 'linear-gradient(135deg,#DC2626,#EF4444)' : `linear-gradient(135deg,${PRIMARY},${PRIMARY_L})` }}>
                          {isPdf ? 'PDF' : 'IMG'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-gray-700 truncate font-medium">{doc.file_name}</div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <a href={fileUrl} target="_blank" rel="noreferrer"
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ background: `${PRIMARY}12`, color: PRIMARY }}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl p-5" style={{ background: 'white', border: `1px solid ${PRIMARY}15`, boxShadow: `0 2px 12px ${PRIMARY}08` }}>
              <h3 className="text-sm font-bold text-gray-900 mb-4">سجل الحالات</h3>
              {!request?.status_logs?.length ? (
                <p className="text-xs text-gray-400 text-center py-3">لا يوجد سجل بعد</p>
              ) : (
                <div>
                  {request.status_logs.map((log: any, i: number) => (
                    <div key={log.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0" style={{ background: PRIMARY }}/>
                        {i < request.status_logs.length - 1 && <div className="w-px flex-1 mt-1 mb-1" style={{ background: `${PRIMARY}20` }}/>}
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

            <div className="rounded-2xl p-5" style={{ background: 'white', border: `1px solid ${PRIMARY}15`, boxShadow: `0 2px 12px ${PRIMARY}08` }}>
              <h3 className="text-sm font-bold text-gray-900 mb-4">الملاحظات الداخلية</h3>
              <div className="space-y-2 mb-3 max-h-64 overflow-y-auto">
                {!request?.notes?.length ? (
                  <p className="text-xs text-gray-400 text-center py-3">لا توجد ملاحظات</p>
                ) : request.notes.map((note: any) => (
                  <div key={note.id} className="rounded-xl p-3" style={{ background: '#F8FAFC', border: `1px solid ${PRIMARY}10` }}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold" style={{ color: PRIMARY }}>{note.user?.name}</span>
                      <button onClick={() => handleDeleteNote(note.id)} className="text-gray-300 hover:text-red-400">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                      </button>
                    </div>
                    <p className="text-xs text-gray-700 leading-relaxed">{note.content}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(note.created_at).toLocaleDateString('ar-SA')}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={newNote} onChange={e => setNewNote(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddNote()}
                  placeholder="أضف ملاحظة..." className="flex-1 h-9 rounded-xl px-3 text-xs focus:outline-none"
                  style={{ border: `1.5px solid ${PRIMARY}30`, background: 'white' }}/>
                <button onClick={handleAddNote} disabled={addingNote}
                  className="h-9 px-4 text-white rounded-xl text-xs font-semibold disabled:opacity-60"
                  style={{ background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_L})` }}>
                  {addingNote ? '...' : 'إضافة'}
                </button>
              </div>
            </div>

            {documentation?.needs_follow_up && (
              <div className="rounded-2xl p-5" style={{ background: 'white', border: `1px solid ${GOLD}25`, boxShadow: `0 2px 12px ${GOLD}10` }}>
                <h3 className="text-sm font-bold text-gray-900 mb-4">موعد المتابعة</h3>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <Badge
                    label={(followUpStatusMap[documentation.follow_up_status] || followUpStatusMap.pending).label}
                    color={(followUpStatusMap[documentation.follow_up_status] || followUpStatusMap.pending).color}
                    bg={(followUpStatusMap[documentation.follow_up_status] || followUpStatusMap.pending).bg}
                  />
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>
                    {new Date(documentation.follow_up_date).toLocaleDateString('ar-SA')}
                  </span>
                </div>
                <div style={{ background: '#F8FAFC', borderRadius: 10, padding: '10px 12px', marginBottom: 8 }}>
                  <div style={{ fontSize: 10, color: '#9CA3AF', marginBottom: 3 }}>سبب المتابعة</div>
                  <div style={{ fontSize: 13, color: '#111827', fontWeight: 600 }}>{documentation.follow_up_reason}</div>
                </div>
                {documentation.follow_up_notes && (
                  <div style={{ background: '#F8FAFC', borderRadius: 10, padding: '10px 12px', marginBottom: 8 }}>
                    <div style={{ fontSize: 10, color: '#9CA3AF', marginBottom: 3 }}>ملاحظات</div>
                    <div style={{ fontSize: 12, color: '#374151' }}>{documentation.follow_up_notes}</div>
                  </div>
                )}
                {!isDone && (
                  <>
                    <button onClick={() => setShowFollowUpForm(!showFollowUpForm)}
                      style={{ width: '100%', padding: '8px', borderRadius: 10, border: `1px solid ${GOLD}30`, background: showFollowUpForm ? `${GOLD}20` : `${GOLD}10`, color: GOLD, fontSize: 12, fontWeight: 600, cursor: 'pointer', marginTop: 4 }}>
                      {showFollowUpForm ? 'إغلاق' : 'تحديث المتابعة'}
                    </button>
                    {showFollowUpForm && (
                      <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>ملاحظات (اختياري)</label>
                          <textarea value={followUpNotes} onChange={e => setFollowUpNotes(e.target.value)} rows={2} placeholder="أضف ملاحظاتك هنا..."
                            style={{ width: '100%', borderRadius: 10, padding: '8px 12px', fontSize: 12, border: `1.5px solid ${GOLD}40`, outline: 'none', resize: 'none' as const, fontFamily: 'inherit', color: '#111827', background: 'white' }}/>
                        </div>
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>تاريخ موعد جديد</label>
                          <input type="date" value={newFollowUpDate} min={new Date().toISOString().split('T')[0]} onChange={e => setNewFollowUpDate(e.target.value)}
                            style={{ width: '100%', height: 38, borderRadius: 9, border: `1.5px solid ${PRIMARY}25`, padding: '0 12px', fontSize: 12, outline: 'none', background: 'white', color: '#111827', boxSizing: 'border-box' as const }}/>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                          <button onClick={handleMarkDone} disabled={updatingFollowUp}
                            style={{ padding: '9px', borderRadius: 10, border: 'none', background: '#059669', color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer', opacity: updatingFollowUp ? 0.6 : 1 }}>
                            {updatingFollowUp ? '...' : 'تمت المتابعة'}
                          </button>
                          <button onClick={handleReschedule} disabled={!newFollowUpDate || updatingFollowUp}
                            style={{ padding: '9px', borderRadius: 10, border: `1.5px solid ${PRIMARY}25`, background: `${PRIMARY}08`, color: PRIMARY, fontSize: 12, fontWeight: 600, cursor: 'pointer', opacity: (!newFollowUpDate || updatingFollowUp) ? 0.5 : 1 }}>
                            موعد جديد
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}