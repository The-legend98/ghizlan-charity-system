'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { requestSchema, RequestForm } from '@/lib/validations/request';
import api from '@/lib/axios';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const PRIMARY   = '#1B6CA8';
const PRIMARY_L = '#4AACCD';
const GOLD      = '#C9A84C';

export default function ApplyPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const router = useRouter();
const [submitted, setSubmitted] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<RequestForm>({
    resolver: zodResolver(requestSchema),
  });

  const onSubmit = async (data: RequestForm) => {
  if (submitted) return; // منع إعادة الإرسال
  setLoading(true);
  setSubmitted(true); // قفل الزر فوراً
  setError('');
  try {
    const cleanData = {
      ...data,
      monthly_income: data.monthly_income
        ? Number(String(data.monthly_income).replace(/,/g, ''))
        : undefined,
    };
    const res = await api.post('/requests', cleanData);
    router.push(`/confirm?ref=${res.data.ref_number}&name=${data.full_name}&requestId=${res.data.request_id}`);
  } catch (err: any) {
    setError(err.response?.data?.message || 'حدث خطأ، حاول مجدداً');
    setSubmitted(false); // فتح الزر فقط عند الخطأ
  } finally {
    setLoading(false);
  }
};

  const inputClass  = "w-full h-11 border border-gray-200 rounded-xl px-4 text-sm text-gray-900 bg-gray-50 focus:outline-none focus:bg-white transition-all";
  const selectClass = "w-full h-11 border border-gray-200 rounded-xl px-4 text-sm text-gray-900 bg-gray-50 focus:outline-none focus:bg-white transition-all appearance-none";
  const labelClass  = "block text-sm font-medium text-gray-700 mb-1.5";
  const errorClass  = "text-red-500 text-xs mt-1 flex items-center gap-1";

  const SectionHeader = ({ num, title, sub, color }: { num: string; title: string; sub: string; color: string }) => (
    <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3"
      style={{ background: `linear-gradient(to left, ${color}10, white)` }}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
        style={{ background: color }}>{num}</div>
      <div>
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: '#F0F7FF' }} dir="rtl">

      {/* Navbar */}
      <nav className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-3xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/')}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
              style={{ background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_L})` }}>غ</div>
            <div>
              <div className="text-sm font-bold text-gray-900">مؤسسة غزلان الخير</div>
              <div className="text-xs" style={{ color: PRIMARY_L }}>Ghozlan Alkhair Foundation</div>
            </div>
          </div>
          <span className="text-xs text-white px-3 py-1.5 rounded-full"
            style={{ background: `${PRIMARY}` }}>تقديم طلب مساعدة</span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto py-10 px-4">

        {/* Hero */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: `${PRIMARY}15` }}>
            <svg className="w-8 h-8" fill="none" stroke={PRIMARY} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">تقديم طلب مساعدة</h1>
          <p className="text-gray-500 text-base max-w-md mx-auto">يُرجى تعبئة النموذج بدقة لضمان معالجة طلبك في أسرع وقت ممكن</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-4 mb-6 text-sm flex items-center gap-3">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          {/* البيانات الشخصية */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <SectionHeader num="١" title="البيانات الشخصية" sub="معلومات التواصل الأساسية" color={PRIMARY} />
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>الاسم الكامل <span className="text-red-400">*</span></label>
                  <input {...register('full_name')} placeholder="أدخل اسمك الكامل" className={inputClass} />
                  {errors.full_name && <p className={errorClass}>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                    {errors.full_name.message}
                  </p>}
                </div>
                <div>
                  <label className={labelClass}>رقم الهاتف <span className="text-red-400">*</span></label>
                  <input {...register('phone')} placeholder="09xxxxxxxx" className={inputClass} />
                  {errors.phone && <p className={errorClass}>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                    {errors.phone.message}
                  </p>}
                </div>
                <div>
                  <label className={labelClass}>البريد الإلكتروني</label>
                  <input
                    {...register('email')}
                    placeholder="example@email.com"
                    className={inputClass}
                    type="email"
                  />
                  {errors.email && <p className={errorClass}>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                    {errors.email.message}
                  </p>}
                </div>
                <div>
                  <label className={labelClass}>العمر <span className="text-red-400">*</span></label>
                  <input type="number" {...register('age')} placeholder="سنة" className={inputClass} />
                  {errors.age && <p className={errorClass}>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                    {errors.age.message}
                  </p>}
                </div>
                <div>
                  <label className={labelClass}>الجنس <span className="text-red-400">*</span></label>
                  <select {...register('gender')} className={selectClass}>
                    <option value="">اختر الجنس</option>
                    <option value="male">ذكر</option>
                    <option value="female">أنثى</option>
                  </select>
                  {errors.gender && <p className={errorClass}>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                    الجنس مطلوب
                  </p>}
                </div>
              <div>
                  <label className={labelClass}> المحافظة <span className="text-red-400">*</span></label>
                  <select {...register('region')} className={selectClass}>
                    <option value="">اختر المحافظة</option>
                    <option value="دمشق">دمشق</option>
                    <option value="ريف دمشق">ريف دمشق</option>
                    <option value="حلب">حلب</option>
                    <option value="حمص">حمص</option>
                    <option value="حماة">حماة</option>
                    <option value="اللاذقية">اللاذقية</option>
                    <option value="طرطوس">طرطوس</option>
                    <option value="إدلب">إدلب</option>
                    <option value="الحسكة">الحسكة</option>
                    <option value="دير الزور">دير الزور</option>
                    <option value="الرقة">الرقة</option>
                    <option value="السويداء">السويداء</option>
                    <option value="درعا">درعا</option>
                    <option value="القنيطرة">القنيطرة</option>
                  </select>
                  {errors.region && <p className={errorClass}>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                    {errors.region.message}
                  </p>}
                </div>
                <div>
                  <label className={labelClass}>العنوان التفصيلي</label>
                  <input {...register('address')} placeholder="الحي، الشارع..." className={inputClass} />
                </div>
              </div>
            </div>
          </div>

          {/* الوضع العائلي */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <SectionHeader num="٢" title="الوضع العائلي والمالي" sub="تفاصيل الأسرة والوضع الاقتصادي" color="#0F6E56" />
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>عدد أفراد الأسرة <span className="text-red-400">*</span></label>
                  <input type="number" {...register('family_members')} placeholder="عدد الأفراد" className={inputClass} />
                  {errors.family_members && <p className={errorClass}>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                    {errors.family_members.message}
                  </p>}
                </div>
                <div>
                  <label className={labelClass}>عدد الأطفال</label>
                  <input type="number" {...register('children_count')} placeholder="٠" className={inputClass} />
                </div>
                <div>
                <label className={labelClass}>الدخل الشهري (ليرة سورية)</label>
                <input
                  type="text"
                  placeholder="٠"
                  className={inputClass}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/,/g, '');
                    if (!/^\d*$/.test(raw)) return;
                    e.target.value = raw ? Number(raw).toLocaleString('en') : '';
                    register('monthly_income').onChange({
                      target: { value: raw, name: 'monthly_income' }
                    });
                  }}
                  onBlur={register('monthly_income').onBlur}
                  name={register('monthly_income').name}
                  ref={register('monthly_income').ref}
                />
              </div>
                <div>
                  <label className={labelClass}>وضع السكن <span className="text-red-400">*</span></label>
                  <select {...register('housing_status')} className={selectClass}>
                    <option value="">اختر وضع السكن</option>
                    <option value="owned">ملك</option>
                    <option value="rented">إيجار</option>
                    <option value="other">أخرى</option>
                  </select>
                  {errors.housing_status && <p className={errorClass}>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                    وضع السكن مطلوب
                  </p>}
                </div>
                {watch('housing_status') === 'other' && (
                  <div className="md:col-span-2">
                    <label className={labelClass}>وضح وضع سكنك</label>
                    <input {...register('address')} placeholder="اشرح وضع سكنك..." className={inputClass} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* تفاصيل الطلب */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <SectionHeader num="٣" title="تفاصيل الطلب" sub="نوع المساعدة المطلوبة وتفاصيلها" color={GOLD} />
            <div className="p-6 space-y-5">
              <div>
                <label className={labelClass}>نوع المساعدة <span className="text-red-400">*</span></label>
                <select {...register('assistance_type')} className={selectClass}>
                  <option value="">اختر نوع المساعدة</option>
                  <option value="medical">علاج طبي</option>
                  <option value="education">تعليم</option>
                  <option value="financial">دعم معيشي</option>
                </select>
                {errors.assistance_type && <p className={errorClass}>
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                  نوع المساعدة مطلوب
                </p>}
              </div>
              <div>
                <label className={labelClass}>وصف الحالة <span className="text-red-400">*</span></label>
                <textarea
                  {...register('description')}
                  rows={5}
                  placeholder="اشرح حالتك واحتياجك بالتفصيل — كلما كان الوصف أوضح كان البت في طلبك أسرع..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-gray-50 focus:outline-none focus:bg-white transition-all resize-none"
                />
                {errors.description && <p className={errorClass}>
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                  {errors.description.message}
                </p>}
              </div>
            </div>
          </div>

          {/* ملاحظة */}
          <div className="rounded-2xl px-5 py-4 flex gap-3 border"
            style={{ background: `${GOLD}10`, borderColor: `${GOLD}30` }}>
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke={GOLD} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <p className="text-sm leading-relaxed" style={{ color: '#92650a' }}>
              بعد إرسال الطلب ستصلك رسالة تأكيد على هاتفك. سيتواصل معك فريق المؤسسة خلال <strong>٣-٧ أيام عمل</strong>.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 text-white rounded-2xl text-base font-semibold shadow-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            style={{ background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_L})` }}
          >
            {loading ? (
              <>
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                جاري الإرسال...
              </>
            ) : (
              <>
                إرسال الطلب
                <svg className="w-5 h-5" fill="none" stroke="white" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                </svg>
              </>
            )}
          </button>

        </form>

        <p className="text-center text-xs text-gray-400 mt-6 flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
          </svg>
          جميع البيانات محمية وسرية — لن تُشارك مع أي جهة خارجية
        </p>
      </div>
    </div>
  );
}