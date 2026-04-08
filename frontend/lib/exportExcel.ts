import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const statusMap: Record<string, string> = {
  new:        'جديد',
  reviewing:  'قيد المراجعة',
  needs_info: 'يحتاج معلومات',
  approved:   'مقبول',
  rejected:   'مرفوض',
};

const assistanceMap: Record<string, string> = {
  medical:   'علاج طبي',
  education: 'تعليم',
  financial: 'دعم معيشي',
};

const priorityMap: Record<string, string> = {
  high:   'عالية',
  medium: 'متوسطة',
  normal: 'عادية',
};

const genderMap:  Record<string, string> = { male: 'ذكر', female: 'أنثى' };
const housingMap: Record<string, string> = { owned: 'ملك', rented: 'إيجار', other: 'أخرى' };

const PRIMARY  = '1B6CA8';
const PRIMARY_L = '4AACCD';
const GOLD     = 'C9A84C';
const LIGHT_BG = 'EEF5FB';
const WHITE    = 'FFFFFF';
const GRAY     = 'F8FAFC';

const getDate = () => new Date().toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });

// إعداد الـ header الموحد للمؤسسة
const setupHeader = (ws: ExcelJS.Worksheet, title: string, subtitle: string, colCount: number) => {
  ws.views = [{ rightToLeft: true }];

  // Row 1 — اسم المؤسسة
  ws.mergeCells(1, 1, 1, colCount);
  const r1 = ws.getRow(1);
  r1.height = 35;
  const c1 = r1.getCell(1);
  c1.value = 'مؤسسة غزلان الخير الإنسانية';
  c1.font  = { name: 'Arial', size: 16, bold: true, color: { argb: `FF${WHITE}` } };
  c1.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${PRIMARY}` } };
  c1.alignment = { horizontal: 'center', vertical: 'middle', readingOrder: 'rtl' };

  // Row 2 — عنوان التقرير
  ws.mergeCells(2, 1, 2, colCount);
  const r2 = ws.getRow(2);
  r2.height = 28;
  const c2 = r2.getCell(1);
  c2.value = title;
  c2.font  = { name: 'Arial', size: 13, bold: true, color: { argb: `FF${WHITE}` } };
  c2.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${PRIMARY_L}` } };
  c2.alignment = { horizontal: 'center', vertical: 'middle', readingOrder: 'rtl' };

  // Row 3 — التاريخ والوصف
  ws.mergeCells(3, 1, 3, colCount);
  const r3 = ws.getRow(3);
  r3.height = 22;
  const c3 = r3.getCell(1);
  c3.value = `${subtitle}   |   تاريخ الإصدار: ${getDate()}   |   Ghozlan Alkhair Foundation`;
  c3.font  = { name: 'Arial', size: 10, color: { argb: `FF${PRIMARY}` } };
  c3.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${LIGHT_BG}` } };
  c3.alignment = { horizontal: 'center', vertical: 'middle', readingOrder: 'rtl' };

  // Row 4 — فراغ
  ws.mergeCells(4, 1, 4, colCount);
  ws.getRow(4).height = 8;
};

// إعداد row الأعمدة
const setupColHeaders = (ws: ExcelJS.Worksheet, headers: string[], rowIndex: number) => {
  const row = ws.getRow(rowIndex);
  row.height = 26;
  headers.forEach((h, i) => {
    const cell = row.getCell(i + 1);
    cell.value = h;
    cell.font  = { name: 'Arial', size: 11, bold: true, color: { argb: `FF${WHITE}` } };
    cell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${PRIMARY}` } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', readingOrder: 'rtl' };    cell.border = {
      top:    { style: 'thin', color: { argb: `FF${PRIMARY_L}` } },
      bottom: { style: 'thin', color: { argb: `FF${PRIMARY_L}` } },
      left:   { style: 'thin', color: { argb: `FF${PRIMARY_L}` } },
      right:  { style: 'thin', color: { argb: `FF${PRIMARY_L}` } },
    };
  });
};

// إضافة صف بيانات
const addDataRow = (
  ws: ExcelJS.Worksheet,
  data: any[],
  rowIndex: number,
  isEven: boolean,
  specialCols?: Record<number, { color: string; bold?: boolean }>,
) => {
  const row  = ws.getRow(rowIndex);
  row.height = 20;
  const bg   = isEven ? WHITE : LIGHT_BG;

  data.forEach((val, i) => {
    const cell  = row.getCell(i + 1);
    cell.value  = val;
    const spec  = specialCols?.[i];
    cell.font   = {
      name:  'Arial',
      size:  10,
      bold:  spec?.bold ?? false,
      color: { argb: `FF${spec?.color ?? '1F2937'}` },
    };
    cell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${bg}` } };
    cell.alignment = {
  horizontal:   typeof val === 'number' ? 'center' : 'right',
  vertical:     'middle',
  readingOrder: 'rtl',
};
    cell.border = {
      top:    { style: 'hair', color: { argb: 'FFE5E7EB' } },
      bottom: { style: 'hair', color: { argb: 'FFE5E7EB' } },
      left:   { style: 'hair', color: { argb: 'FFE5E7EB' } },
      right:  { style: 'hair', color: { argb: 'FFE5E7EB' } },
    };
  });
};

// Footer
const addFooter = (ws: ExcelJS.Worksheet, rowIndex: number, colCount: number, count: number) => {
  ws.mergeCells(rowIndex, 1, rowIndex, colCount);
  const row  = ws.getRow(rowIndex);
  row.height = 20;
  const cell = row.getCell(1);
  cell.value = `إجمالي السجلات: ${count}   ©   مؤسسة غزلان الخير الإنسانية ${new Date().getFullYear()}`;
  cell.font  = { name: 'Arial', size: 9, italic: true, color: { argb: 'FF6B7280' } };
  cell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${GRAY}` } };
  cell.alignment = { horizontal: 'center', vertical: 'middle', readingOrder: 'rtl' };
};

// توليد الملف
const generateFile = async (
  sheets: { name: string; setup: (ws: ExcelJS.Worksheet) => void }[],
  filename: string,
) => {
  const wb = new ExcelJS.Workbook();
  wb.creator  = 'Ghozlan Alkhair Foundation';
  wb.company  = 'مؤسسة غزلان الخير الإنسانية';
  wb.created  = new Date();

  sheets.forEach(({ name, setup }) => {
    const ws = wb.addWorksheet(name, { views: [{ rightToLeft: true }] });
    setup(ws);
  });

  const buf  = await wb.xlsx.writeBuffer();
  const d    = new Date().toLocaleDateString('ar-SA').replace(/\//g, '-');
  saveAs(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), `${filename}-${d}.xlsx`);
};

// ١. تصدير الطلبات
export const exportRequests = async (requests: any[], filename = 'تقرير-الطلبات') => {
  const headers = [
    'رقم المرجع', 'الاسم الكامل', 'الهاتف', 'البريد', 'العمر', 'الجنس',
    'المحافظة', 'العنوان', 'أفراد الأسرة', 'عدد الأطفال', 'الدخل الشهري',
    'وضع السكن', 'نوع المساعدة', 'الأولوية', 'الحالة', 'الموظف المسؤول',
    'تاريخ التقديم', 'آخر تحديث',
  ];
  const widths = [14, 20, 14, 22, 6, 8, 12, 18, 12, 12, 14, 10, 14, 10, 14, 16, 14, 14];

  await generateFile([{
    name: 'الطلبات',
    setup: (ws) => {
      setupHeader(ws, 'تقرير الطلبات', `عدد الطلبات: ${requests.length}`, headers.length);
      setupColHeaders(ws, headers, 5);
      ws.columns = widths.map(w => ({ width: w }));

      requests.forEach((r, i) => {
        const statusColor = r.status === 'approved' ? '059669' : r.status === 'rejected' ? 'DC2626' : r.status === 'reviewing' ? 'D97706' : PRIMARY;
        addDataRow(ws, [
          r.ref_number, r.full_name, r.phone, r.email || '—', r.age,
          genderMap[r.gender] || r.gender, r.region, r.address || '—',
          r.family_members, r.children_count || 0, r.monthly_income || 0,
          housingMap[r.housing_status] || r.housing_status,
          assistanceMap[r.assistance_type] || r.assistance_type,
          priorityMap[r.priority] || r.priority,
          statusMap[r.status] || r.status,
          r.assigned_to?.name || 'غير معيّن',
          new Date(r.created_at).toLocaleDateString('ar-SA'),
          new Date(r.updated_at).toLocaleDateString('ar-SA'),
        ], 6 + i, i % 2 === 0, {
          0:  { color: PRIMARY, bold: true },
          14: { color: statusColor, bold: true },
        });
      });

      addFooter(ws, 6 + requests.length + 1, headers.length, requests.length);
    },
  }], filename);
};

// ٢. تصدير أداء الموظفين
export const exportPerformance = async (employees: any[], filename = 'أداء-الموظفين') => {
  const headers = ['الاسم', 'البريد', 'إجمالي الطلبات', 'جديدة', 'قيد المراجعة', 'مقبولة', 'مرفوضة', 'معلّقة', 'نسبة القبول'];
  const widths  = [20, 26, 16, 10, 16, 10, 10, 10, 14];

  await generateFile([{
    name: 'أداء الموظفين',
    setup: (ws) => {
      setupHeader(ws, 'تقرير أداء الموظفين', `عدد الموظفين: ${employees.length}`, headers.length);
      setupColHeaders(ws, headers, 5);
      ws.columns = widths.map(w => ({ width: w }));

      employees.forEach((e, i) => {
        const rate      = e.completion_rate;
        const rateColor = rate >= 70 ? '059669' : rate >= 40 ? 'D97706' : 'DC2626';
        addDataRow(ws, [
          e.name, e.email, e.total_requests,
          e.new_requests, e.reviewing, e.approved,
          e.rejected, e.pending, `${rate}%`,
        ], 6 + i, i % 2 === 0, {
          0: { color: PRIMARY, bold: true },
          8: { color: rateColor, bold: true },
        });
      });

      addFooter(ws, 6 + employees.length + 1, headers.length, employees.length);
    },
  }], filename);
};

// دالة مساعدة للإحصائيات
const buildStatsSheet = (
  ws: ExcelJS.Worksheet,
  title: string,
  subtitle: string,
  headers: string[],
  data: [string, number][],
) => {
  setupHeader(ws, title, subtitle, 2);
  setupColHeaders(ws, headers, 5);
  ws.columns = [{ width: 24 }, { width: 12 }];

  data.forEach(([label, count], i) => {
    addDataRow(ws, [label, count], 6 + i, i % 2 === 0, {
      1: { color: PRIMARY, bold: true },
    });
  });

  addFooter(ws, 6 + data.length + 1, 2, data.reduce((s, [, c]) => s + c, 0));
};

// ٣. تصدير إحصائيات عامة
export const exportStats = async (requests: any[], filename = 'الإحصائيات-الشاملة') => {
  const subtitle = `إجمالي الطلبات: ${requests.length}`;

  const byStatus  = Object.entries(statusMap).map(([k, v]) => [v, requests.filter(r => r.status === k).length] as [string, number]);
  const byAssist  = Object.entries(assistanceMap).map(([k, v]) => [v, requests.filter(r => r.assistance_type === k).length] as [string, number]);

  const regionCounts: Record<string, number> = {};
  requests.forEach(r => { regionCounts[r.region] = (regionCounts[r.region] || 0) + 1; });
  const byRegion  = Object.entries(regionCounts).sort((a, b) => b[1] - a[1]) as [string, number][];

  const monthCounts: Record<string, number> = {};
  requests.forEach(r => {
    const m = new Date(r.created_at).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long' });
    monthCounts[m] = (monthCounts[m] || 0) + 1;
  });
  const byMonth = Object.entries(monthCounts) as [string, number][];

  await generateFile([
    { name: 'حسب الحالة',        setup: (ws) => buildStatsSheet(ws, 'إحصائيات حسب الحالة',        subtitle, ['الحالة',        'العدد'], byStatus) },
    { name: 'حسب نوع المساعدة', setup: (ws) => buildStatsSheet(ws, 'إحصائيات حسب نوع المساعدة', subtitle, ['نوع المساعدة', 'العدد'], byAssist) },
    { name: 'حسب المحافظة',      setup: (ws) => buildStatsSheet(ws, 'إحصائيات حسب المحافظة',      subtitle, ['المحافظة',      'العدد'], byRegion) },
    { name: 'حسب الشهر',         setup: (ws) => buildStatsSheet(ws, 'إحصائيات حسب الشهر',         subtitle, ['الشهر',         'العدد'], byMonth) },
  ], filename);
};