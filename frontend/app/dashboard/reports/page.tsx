'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { exportRequests, exportPerformance, exportStats } from '@/lib/exportExcel';

const PRIMARY   = '#1B6CA8';
const PRIMARY_L = '#4AACCD';
const GOLD      = '#C9A84C';

const resultMap: Record<string, { label: string; color: string }> = {
  completed:     { label: 'اكتملت بنجاح', color: '#059669' },
  partial:       { label: 'جزئية',         color: '#D97706' },
  not_delivered: { label: 'لم تصل',        color: '#DC2626' },
};

const BgPattern = () => (
  <div style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
    <svg width="100%" height="100%" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
      <defs>
        <pattern id="dotsReports" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
          <circle cx="15" cy="15" r="1" fill="#1B6CA8" opacity="0.10"/>
        </pattern>
      </defs>
      <rect width="1200" height="800" fill="url(#dotsReports)"/>
      <circle cx="1150" cy="80"  r="160" fill="none" stroke="#1B6CA8" strokeWidth="0.6" opacity="0.15"/>
      <circle cx="1150" cy="80"  r="100" fill="none" stroke="#4AACCD" strokeWidth="0.6" opacity="0.15"/>
      <circle cx="60"   cy="720" r="120" fill="none" stroke="#1B6CA8" strokeWidth="0.6" opacity="0.12"/>
    </svg>
  </div>
);

const selectClass = "h-9 border-2 rounded-xl px-3 text-xs bg-white focus:outline-none text-gray-700 transition-all";
const inputClass  = "h-9 border-2 rounded-xl px-3 text-xs bg-white focus:outline-none text-gray-700 transition-all";

const regions = [
  'دمشق', 'ريف دمشق', 'حلب', 'حمص', 'حماة',
  'اللاذقية', 'طرطوس', 'إدلب', 'الحسكة',
  'دير الزور', 'الرقة', 'السويداء', 'درعا', 'القنيطرة',
];

export default function ReportsPage() {
  const router = useRouter();
  const [user, setUser]                   = useState<any>(null);
  const [employees, setEmployees]         = useState<any[]>([]);
  const [employeesList, setEmployeesList] = useState<any[]>([]);
  const [loadingReq, setLoadingReq]       = useState(false);
  const [loadingPerf, setLoadingPerf]     = useState(false);
  const [loadingStats, setLoadingStats]   = useState(false);

  // توثيق الحالات
  const [docStats, setDocStats]           = useState<any>(null);
  const [docList, setDocList]             = useState<any[]>([]);
  const [loadingDoc, setLoadingDoc]       = useState(false);
  const [loadingDocExport, setLoadingDocExport] = useState(false);
  const [docFilters, setDocFilters]       = useState({
    result: '', needs_follow_up: '', follow_up_status: '', date_from: '', date_to: '',
  });

  const [reqFilters, setReqFilters] = useState({
    status: '', region: '', assistance_type: '', priority: '', date_from: '', date_to: '', assigned_to: '',
  });
  const [statsFilters, setStatsFilters] = useState({
    date_from: '', date_to: '', month: '',
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token    = localStorage.getItem('token');
    if (!token || !userData) { router.push('/dashboard/login'); return; }
    const parsed = JSON.parse(userData);
    if (parsed.role !== 'manager') { router.push('/dashboard/requests'); return; }
    setUser(parsed);
    fetchEmployees();
    fetchDocStats();
    api.get('/users').then(res => setEmployeesList(res.data.filter((u: any) => u.role === 'employee')));
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/users/performance');
      setEmployees(res.data);
    } catch {}
  };

  const fetchDocStats = async () => {
    try {
      const res = await api.get('/documentation?per_page=5');
      setDocStats(res.data.stats);
      setDocList(res.data.data?.data || []);
    } catch {}
  };

  const fetchDocWithFilters = async () => {
    setLoadingDoc(true);
    try {
      const params = new URLSearchParams({ per_page: '5' });
      if (docFilters.result)          params.append('result', docFilters.result);
      if (docFilters.needs_follow_up) params.append('needs_follow_up', docFilters.needs_follow_up);
      if (docFilters.follow_up_status) params.append('follow_up_status', docFilters.follow_up_status);
      if (docFilters.date_from)       params.append('date_from', docFilters.date_from);
      if (docFilters.date_to)         params.append('date_to', docFilters.date_to);
      const res = await api.get(`/documentation?${params.toString()}`);
      setDocStats(res.data.stats);
      setDocList(res.data.data?.data || []);
    } catch {}
    finally { setLoadingDoc(false); }
  };

  const handleExportDoc = async () => {
    setLoadingDocExport(true);
    try {
      const params = new URLSearchParams({ per_page: '10000' });
      if (docFilters.result)           params.append('result', docFilters.result);
      if (docFilters.needs_follow_up)  params.append('needs_follow_up', docFilters.needs_follow_up);
      if (docFilters.follow_up_status) params.append('follow_up_status', docFilters.follow_up_status);
      if (docFilters.date_from)        params.append('date_from', docFilters.date_from);
      if (docFilters.date_to)          params.append('date_to', docFilters.date_to);
      const res = await api.get(`/documentation?${params.toString()}`);
      const docs = res.data.data?.data || [];

      // تحضير البيانات للـ Excel
      const ExcelJS = (await import('exceljs')).default;
      const { saveAs } = await import('file-saver');
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet('توثيق الحالات', { views: [{ rightToLeft: true }] });

      ws.columns = [
        { header: 'رقم المرجع',      key: 'ref',       width: 16 },
        { header: 'المستفيد',         key: 'name',      width: 20 },
        { header: 'نوع المساعدة',     key: 'type',      width: 14 },
        { header: 'نتيجة المساعدة',   key: 'result',    width: 16 },
        { header: 'المبلغ المقدم',    key: 'amount',    width: 14 },
        { header: 'الخدمة المقدمة',   key: 'service',   width: 20 },
        { header: 'تاريخ التسليم',    key: 'delivery',  width: 14 },
        { header: 'تحتاج متابعة',     key: 'follow',    width: 14 },
        { header: 'تاريخ المتابعة',   key: 'followDate',width: 14 },
        { header: 'حالة المتابعة',    key: 'followSt',  width: 14 },
        { header: 'الموظف المسؤول',   key: 'creator',   width: 18 },
        { header: 'ملاحظات',          key: 'notes',     width: 24 },
      ];

      // Header style
      ws.getRow(1).eachCell(cell => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1B6CA8' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle', readingOrder: 'rtl' };
      });
      ws.getRow(1).height = 24;

      const assistanceMap: Record<string, string> = { medical: 'علاج طبي', education: 'تعليم', financial: 'دعم معيشي' };

      docs.forEach((d: any, i: number) => {
        const row = ws.addRow({
          ref:        d.request?.ref_number || '—',
          name:       d.request?.full_name  || '—',
          type:       assistanceMap[d.request?.assistance_type] || '—',
          result:     resultMap[d.result]?.label || d.result,
          amount:     d.amount_delivered || '—',
          service:    d.service_delivered || '—',
          delivery:   d.delivery_date ? new Date(d.delivery_date).toLocaleDateString('ar-SA') : '—',
          follow:     d.needs_follow_up ? 'نعم' : 'لا',
          followDate: d.follow_up_date ? new Date(d.follow_up_date).toLocaleDateString('ar-SA') : '—',
          followSt:   d.follow_up_status === 'done' ? 'تمت' : d.needs_follow_up ? 'معلقة' : '—',
          creator:    d.creator?.name || '—',
          notes:      d.notes || '—',
        });
        const bg = i % 2 === 0 ? 'FFFFFFFF' : 'FFEEF5FB';
        row.eachCell(cell => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
          cell.alignment = { horizontal: 'right', vertical: 'middle', readingOrder: 'rtl' };
          cell.font = { size: 10 };
        });
        row.height = 20;
      });

      const buf = await wb.xlsx.writeBuffer();
      const d2  = new Date().toLocaleDateString('ar-SA').replace(/\//g, '-');
      saveAs(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), `توثيق-الحالات-${d2}.xlsx`);
    } catch { alert('حدث خطأ في التصدير'); }
    finally { setLoadingDocExport(false); }
  };

  const handleExportRequests = async () => {
    setLoadingReq(true);
    try {
      const params = new URLSearchParams({ per_page: '10000' });
      if (reqFilters.status)          params.append('status', reqFilters.status);
      if (reqFilters.region)          params.append('region', reqFilters.region);
      if (reqFilters.assistance_type) params.append('assistance_type', reqFilters.assistance_type);
      if (reqFilters.priority)        params.append('priority', reqFilters.priority);
      if (reqFilters.assigned_to)     params.append('assigned_to', reqFilters.assigned_to);
      if (reqFilters.date_from)       params.append('date_from', reqFilters.date_from);
      if (reqFilters.date_to)         params.append('date_to', reqFilters.date_to);
      const res = await api.get(`/requests?${params.toString()}`);
      exportRequests(res.data.data || [], 'تقرير-الطلبات');
    } catch { alert('حدث خطأ في التصدير'); }
    finally { setLoadingReq(false); }
  };

  const handleExportPerformance = async () => {
    setLoadingPerf(true);
    try { exportPerformance(employees); }
    catch { alert('حدث خطأ في التصدير'); }
    finally { setLoadingPerf(false); }
  };

  const handleExportStats = async () => {
    setLoadingStats(true);
    try {
      const params = new URLSearchParams({ per_page: '10000' });
      if (statsFilters.date_from) params.append('date_from', statsFilters.date_from);
      if (statsFilters.date_to)   params.append('date_to', statsFilters.date_to);
      const res = await api.get(`/requests?${params.toString()}`);
      exportStats(res.data.data || [], 'التقرير-الإحصائي');
    } catch { alert('حدث خطأ في التصدير'); }
    finally { setLoadingStats(false); }
  };

  const handleLogout = async () => {
    await api.post('/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/dashboard/login');
  };

  const ExportBtn = ({ onClick, loading }: { onClick: () => void; loading: boolean }) => (
    <button onClick={onClick} disabled={loading}
      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60 transition-all"
      style={{ background: 'linear-gradient(135deg, #059669, #34D399)', boxShadow: '0 4px 12px #05966930' }}>
      {loading ? (
        <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/><span>جاري التصدير...</span></>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          تصدير Excel
        </>
      )}
    </button>
  );

  return (
    <div className="min-h-screen" style={{ background: '#EEF5FB', position: 'relative' }} dir="rtl">
      <BgPattern />

      {/* Navbar */}
      <nav style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${PRIMARY}20`, position: 'sticky', top: 0, zIndex: 50 }}>
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/dashboard/manager')}
              className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-all">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <div>
              <div className="text-sm font-bold text-gray-900">التقارير والتصدير</div>
              <div className="text-xs" style={{ color: PRIMARY_L }}>مؤسسة غزلان الخير</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-xl px-3 py-2"
              style={{ background: `${GOLD}15`, border: `1px solid ${GOLD}30` }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ background: `linear-gradient(135deg, ${GOLD}, #E8C96A)` }}>
                {user?.name?.charAt(0)}
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-900">{user?.name}</div>
                <div className="text-xs" style={{ color: GOLD }}>مدير</div>
              </div>
            </div>
            <button onClick={handleLogout}
              className="text-xs px-3 py-2 rounded-xl text-red-500 hover:bg-red-50 border border-red-100 transition-all">
              خروج
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8" style={{ position: 'relative', zIndex: 1 }}>

        {/* Welcome */}
        <div className="rounded-2xl p-6 mb-6 text-white relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${PRIMARY_L} 100%)` }}>
          <div style={{ position: 'absolute', top: -50, left: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }}/>
          <div style={{ position: 'absolute', bottom: -40, right: 60, width: 150, height: 150, borderRadius: '50%', background: 'rgba(201,168,76,0.15)' }}/>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 mb-3 px-3 py-1.5 rounded-full text-xs font-medium"
              style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="white" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              مركز التقارير
            </div>
            <h1 className="text-xl font-bold mb-1">التقارير والتصدير</h1>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>صدّر أي تقرير بالفلاتر اللي تريدها مباشرةً إلى Excel</p>
          </div>
        </div>

        <div className="space-y-5">

          {/* ١. تقرير الطلبات */}
          <div className="rounded-2xl p-6" style={{ background: 'white', border: `1px solid ${PRIMARY}15`, boxShadow: `0 2px 12px ${PRIMARY}08` }}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${PRIMARY}12`, color: PRIMARY }}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">تقرير الطلبات</div>
                  <div className="text-xs text-gray-400">صدّر الطلبات مع الفلاتر اللي تختارها</div>
                </div>
              </div>
              <ExportBtn onClick={handleExportRequests} loading={loadingReq} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">الحالة</label>
                <select value={reqFilters.status} onChange={e => setReqFilters(f => ({ ...f, status: e.target.value }))}
                  className={selectClass} style={{ borderColor: `${PRIMARY}25`, width: '100%' }}>
                  <option value="">كل الحالات</option>
                  <option value="new">جديد</option>
                  <option value="reviewing">قيد المراجعة</option>
                  <option value="needs_info">يحتاج معلومات</option>
                  <option value="approved">مقبول</option>
                  <option value="rejected">مرفوض</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">المحافظة</label>
                <select value={reqFilters.region} onChange={e => setReqFilters(f => ({ ...f, region: e.target.value }))}
                  className={selectClass} style={{ borderColor: `${PRIMARY}25`, width: '100%' }}>
                  <option value="">كل المحافظات</option>
                  {regions.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">نوع المساعدة</label>
                <select value={reqFilters.assistance_type} onChange={e => setReqFilters(f => ({ ...f, assistance_type: e.target.value }))}
                  className={selectClass} style={{ borderColor: `${PRIMARY}25`, width: '100%' }}>
                  <option value="">كل الأنواع</option>
                  <option value="medical">علاج طبي</option>
                  <option value="education">تعليم</option>
                  <option value="financial">دعم معيشي</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">الأولوية</label>
                <select value={reqFilters.priority} onChange={e => setReqFilters(f => ({ ...f, priority: e.target.value }))}
                  className={selectClass} style={{ borderColor: `${PRIMARY}25`, width: '100%' }}>
                  <option value="">كل الأولويات</option>
                  <option value="high">عالية</option>
                  <option value="medium">متوسطة</option>
                  <option value="normal">عادية</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">الموظف المسؤول</label>
                <select value={reqFilters.assigned_to} onChange={e => setReqFilters(f => ({ ...f, assigned_to: e.target.value }))}
                  className={selectClass} style={{ borderColor: `${PRIMARY}25`, width: '100%' }}>
                  <option value="">كل الموظفين</option>
                  {employeesList.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">من تاريخ</label>
                <input type="date" value={reqFilters.date_from} onChange={e => setReqFilters(f => ({ ...f, date_from: e.target.value }))}
                  className={inputClass} style={{ borderColor: `${PRIMARY}25`, width: '100%' }}/>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">إلى تاريخ</label>
                <input type="date" value={reqFilters.date_to} onChange={e => setReqFilters(f => ({ ...f, date_to: e.target.value }))}
                  className={inputClass} style={{ borderColor: `${PRIMARY}25`, width: '100%' }}/>
              </div>
            </div>
            {(reqFilters.status || reqFilters.region || reqFilters.assistance_type || reqFilters.priority || reqFilters.assigned_to || reqFilters.date_from || reqFilters.date_to) && (
              <button onClick={() => setReqFilters({ status: '', region: '', assistance_type: '', priority: '', assigned_to: '', date_from: '', date_to: '' })}
                className="mt-3 text-xs text-red-500 hover:text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-50 border border-red-100 transition-all">
                مسح الفلاتر
              </button>
            )}
          </div>

          {/* ٢. تقرير أداء الموظفين */}
          <div className="rounded-2xl p-6" style={{ background: 'white', border: `1px solid ${GOLD}20`, boxShadow: `0 2px 12px ${GOLD}08` }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${GOLD}15`, color: GOLD }}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">تقرير أداء الموظفين</div>
                  <div className="text-xs text-gray-400">{employees.length} موظف — إجمالي الطلبات والنسب</div>
                </div>
              </div>
              <ExportBtn onClick={handleExportPerformance} loading={loadingPerf} />
            </div>
            {employees.length > 0 && (
              <div className="mt-4 rounded-xl overflow-hidden" style={{ border: `1px solid ${GOLD}15` }}>
                <div className="grid grid-cols-5 px-4 py-2 text-xs font-semibold text-gray-500" style={{ background: '#FFFBF0' }}>
                  {['الموظف', 'إجمالي', 'مقبولة', 'مرفوضة', 'نسبة القبول'].map(h => <div key={h}>{h}</div>)}
                </div>
                {employees.slice(0, 3).map(emp => (
                  <div key={emp.id} className="grid grid-cols-5 px-4 py-2.5 text-xs border-t items-center" style={{ borderColor: `${GOLD}10` }}>
                    <div className="font-medium text-gray-900">{emp.name}</div>
                    <div style={{ color: PRIMARY }}>{emp.total_requests}</div>
                    <div style={{ color: '#059669' }}>{emp.approved}</div>
                    <div style={{ color: '#DC2626' }}>{emp.rejected}</div>
                    <div className="font-semibold" style={{ color: emp.completion_rate >= 70 ? '#059669' : emp.completion_rate >= 40 ? '#D97706' : '#DC2626' }}>
                      {emp.completion_rate}%
                    </div>
                  </div>
                ))}
                {employees.length > 3 && (
                  <div className="px-4 py-2 text-xs text-gray-400 text-center" style={{ background: '#FFFBF0' }}>
                    و {employees.length - 3} موظف آخر في ملف Excel
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ٣. توثيق الحالات */}
          <div className="rounded-2xl p-6" style={{ background: 'white', border: '1px solid #7C3AED20', boxShadow: '0 2px 12px #7C3AED08' }}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#7C3AED12', color: '#7C3AED' }}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">تقرير توثيق الحالات</div>
                  <div className="text-xs text-gray-400">نتائج المساعدات المقدمة والمتابعات</div>
                </div>
              </div>
              <ExportBtn onClick={handleExportDoc} loading={loadingDocExport} />
            </div>

            {/* إحصائيات سريعة */}
            {docStats && (
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-5">
                {[
                  { label: 'إجمالي موثّق',  value: docStats.total,           color: '#7C3AED' },
                  { label: 'اكتملت',         value: docStats.completed,       color: '#059669' },
                  { label: 'جزئية',          value: docStats.partial,         color: '#D97706' },
                  { label: 'لم تصل',         value: docStats.not_delivered,   color: '#DC2626' },
                  { label: 'تحتاج متابعة',   value: docStats.needs_follow_up, color: GOLD },
                  { label: 'متابعة اليوم',   value: docStats.due_today,       color: '#DC2626' },
                ].map(s => (
                  <div key={s.label} className="rounded-xl p-3 text-center" style={{ background: `${s.color}08`, border: `1px solid ${s.color}20` }}>
                    <div className="text-lg font-black" style={{ color: s.color }}>{s.value}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            )}

            {/* فلاتر */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">النتيجة</label>
                <select value={docFilters.result} onChange={e => setDocFilters(f => ({ ...f, result: e.target.value }))}
                  className={selectClass} style={{ borderColor: '#7C3AED25', width: '100%' }}>
                  <option value="">كل النتائج</option>
                  <option value="completed">اكتملت بنجاح</option>
                  <option value="partial">جزئية</option>
                  <option value="not_delivered">لم تصل</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">المتابعة</label>
                <select value={docFilters.needs_follow_up} onChange={e => setDocFilters(f => ({ ...f, needs_follow_up: e.target.value }))}
                  className={selectClass} style={{ borderColor: '#7C3AED25', width: '100%' }}>
                  <option value="">الكل</option>
                  <option value="1">تحتاج متابعة</option>
                  <option value="0">لا تحتاج</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">حالة المتابعة</label>
                <select value={docFilters.follow_up_status} onChange={e => setDocFilters(f => ({ ...f, follow_up_status: e.target.value }))}
                  className={selectClass} style={{ borderColor: '#7C3AED25', width: '100%' }}>
                  <option value="">الكل</option>
                  <option value="pending">معلقة</option>
                  <option value="done">تمت</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">من تاريخ</label>
                <input type="date" value={docFilters.date_from} onChange={e => setDocFilters(f => ({ ...f, date_from: e.target.value }))}
                  className={inputClass} style={{ borderColor: '#7C3AED25', width: '100%' }}/>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">إلى تاريخ</label>
                <input type="date" value={docFilters.date_to} onChange={e => setDocFilters(f => ({ ...f, date_to: e.target.value }))}
                  className={inputClass} style={{ borderColor: '#7C3AED25', width: '100%' }}/>
              </div>
              <div className="flex items-end">
                <button onClick={fetchDocWithFilters} disabled={loadingDoc}
                  className="w-full h-9 rounded-xl text-xs font-semibold text-white transition-all disabled:opacity-60"
                  style={{ background: '#7C3AED' }}>
                  {loadingDoc ? 'جاري البحث...' : 'تطبيق الفلاتر'}
                </button>
              </div>
            </div>

            {/* Preview */}
            {docList.length > 0 && (
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #7C3AED15' }}>
                <div className="grid grid-cols-5 px-4 py-2 text-xs font-semibold text-gray-500" style={{ background: '#F5F3FF' }}>
                  {['المستفيد', 'نوع المساعدة', 'النتيجة', 'تاريخ التسليم', 'المتابعة'].map(h => <div key={h}>{h}</div>)}
                </div>
                {docList.map((d: any) => (
                  <div key={d.id} className="grid grid-cols-5 px-4 py-2.5 text-xs border-t items-center" style={{ borderColor: '#7C3AED10' }}>
                    <div className="font-medium text-gray-900">{d.request?.full_name || '—'}</div>
                    <div className="text-gray-500">
                      {{ medical: 'علاج طبي', education: 'تعليم', financial: 'دعم معيشي' }[d.request?.assistance_type as string] || '—'}
                    </div>
                    <div className="font-semibold" style={{ color: resultMap[d.result]?.color }}>
                      {resultMap[d.result]?.label}
                    </div>
                    <div className="text-gray-500">{d.delivery_date ? new Date(d.delivery_date).toLocaleDateString('ar-SA') : '—'}</div>
                    <div>
                      {d.needs_follow_up ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                          style={{ background: d.follow_up_status === 'done' ? '#D1FAE5' : `${GOLD}15`, color: d.follow_up_status === 'done' ? '#059669' : GOLD }}>
                          {d.follow_up_status === 'done' ? 'تمت' : 'معلقة'}
                        </span>
                      ) : <span className="text-gray-400">—</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {(docFilters.result || docFilters.needs_follow_up || docFilters.follow_up_status || docFilters.date_from || docFilters.date_to) && (
              <button onClick={() => { setDocFilters({ result: '', needs_follow_up: '', follow_up_status: '', date_from: '', date_to: '' }); fetchDocStats(); }}
                className="mt-3 text-xs text-red-500 hover:text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-50 border border-red-100 transition-all">
                مسح الفلاتر
              </button>
            )}
          </div>

          {/* ٤. التقرير الإحصائي */}
          <div className="rounded-2xl p-6" style={{ background: 'white', border: '1px solid #05966920', boxShadow: '0 2px 12px #05966908' }}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#05966912', color: '#059669' }}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">التقرير الإحصائي الشامل</div>
                  <div className="text-xs text-gray-400">إحصائيات حسب الحالة والمحافظة ونوع المساعدة والشهر</div>
                </div>
              </div>
              <ExportBtn onClick={handleExportStats} loading={loadingStats} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">من تاريخ</label>
                <input type="date" value={statsFilters.date_from} onChange={e => setStatsFilters(f => ({ ...f, date_from: e.target.value }))}
                  className={inputClass} style={{ borderColor: '#05966940', width: '100%' }}/>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">إلى تاريخ</label>
                <input type="date" value={statsFilters.date_to} onChange={e => setStatsFilters(f => ({ ...f, date_to: e.target.value }))}
                  className={inputClass} style={{ borderColor: '#05966940', width: '100%' }}/>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-3">
              {[
                { label: 'ورقة ١', desc: 'حسب الحالة',        color: PRIMARY },
                { label: 'ورقة ٢', desc: 'حسب نوع المساعدة', color: GOLD },
                { label: 'ورقة ٣', desc: 'حسب المحافظة',      color: '#059669' },
                { label: 'ورقة ٤', desc: 'حسب الشهر',         color: '#7C3AED' },
              ].map(sheet => (
                <div key={sheet.label} className="rounded-xl p-3 text-center"
                  style={{ background: `${sheet.color}08`, border: `1px solid ${sheet.color}20` }}>
                  <div className="text-xs font-bold mb-0.5" style={{ color: sheet.color }}>{sheet.label}</div>
                  <div className="text-xs text-gray-500">{sheet.desc}</div>
                </div>
              ))}
            </div>
            {(statsFilters.date_from || statsFilters.date_to) && (
              <button onClick={() => setStatsFilters({ date_from: '', date_to: '', month: '' })}
                className="mt-3 text-xs text-red-500 hover:text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-50 border border-red-100 transition-all">
                مسح الفلاتر
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}