'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { requestSchema, RequestForm } from '@/lib/validations/request';
import api from '@/lib/axios';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ApplyPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const { register, handleSubmit,watch, formState: { errors } } = useForm<RequestForm>({
    resolver: zodResolver(requestSchema),
  });

  const onSubmit = async (data: RequestForm) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/requests', data);
    router.push(`/confirm?ref=${res.data.ref_number}&name=${data.full_name}&requestId=${res.data.request_id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'حدث خطأ، حاول مجدداً');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full h-11 border border-gray-200 rounded-xl px-4 text-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all";
  const selectClass = "w-full h-11 border border-gray-200 rounded-xl px-4 text-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all appearance-none";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";
  const errorClass = "text-red-500 text-xs mt-1 flex items-center gap-1";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50" dir="rtl">

      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm">غ</div>
            <span className="text-base font-semibold text-gray-900">مؤسسة غزلان الخير الإنسانية <span className="text-blue-600 font-normal text-sm">الإنسانية</span></span>
          </div>
          <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full">تقديم طلب مساعدة</span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto py-10 px-4">

        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-medium px-4 py-2 rounded-full mb-4 border border-blue-100">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block"></span>
            خدمة مجانية للمحتاجين
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">تقديم طلب مساعدة</h1>
          <p className="text-gray-500 text-base max-w-md mx-auto">يُرجى تعبئة النموذج بدقة لضمان معالجة طلبك في أسرع وقت ممكن</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-4 mb-6 text-sm flex items-center gap-3">
            <span className="text-red-500 text-lg">✕</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          {/* البيانات الشخصية */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-l from-blue-50 to-white px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-bold">١</div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900">البيانات الشخصية</h2>
                  <p className="text-xs text-gray-400 mt-0.5">معلومات التواصل الأساسية</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>الاسم الكامل <span className="text-red-400">*</span></label>
                  <input {...register('full_name')} placeholder="أدخل اسمك الكامل" className={inputClass} />
                  {errors.full_name && <p className={errorClass}>⚠ {errors.full_name.message}</p>}
                </div>
                <div>
                  <label className={labelClass}>رقم الهاتف <span className="text-red-400">*</span></label>
                  <input {...register('phone')} placeholder="09xxxxxxxx" className={inputClass} />
                  {errors.phone && <p className={errorClass}>⚠ {errors.phone.message}</p>}
                </div>
                <div>
                  <label className={labelClass}>العمر <span className="text-red-400">*</span></label>
                  <input type="number" {...register('age')} placeholder="سنة" className={inputClass} />
                  {errors.age && <p className={errorClass}>⚠ {errors.age.message}</p>}
                </div>
                <div>
                  <label className={labelClass}>الجنس <span className="text-red-400">*</span></label>
                  <select {...register('gender')} className={selectClass}>
                    <option value="">اختر الجنس</option>
                    <option value="male">ذكر</option>
                    <option value="female">أنثى</option>
                  </select>
                  {errors.gender && <p className={errorClass}>⚠ الجنس مطلوب</p>}
                </div>
                <div>
                  <label className={labelClass}>المنطقة / المحافظة <span className="text-red-400">*</span></label>
                  <input {...register('region')} placeholder="مثال: المنطقة الشمالية" className={inputClass} />
                  {errors.region && <p className={errorClass}>⚠ {errors.region.message}</p>}
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
            <div className="bg-gradient-to-l from-green-50 to-white px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600 text-sm font-bold">٢</div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900">الوضع العائلي والمالي</h2>
                  <p className="text-xs text-gray-400 mt-0.5">تفاصيل الأسرة والوضع الاقتصادي</p>
                </div>
              </div>
            </div>
           <div className="p-6">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
    <div>
      <label className={labelClass}>عدد أفراد الأسرة <span className="text-red-400">*</span></label>
      <input type="number" {...register('family_members')} placeholder="عدد الأفراد" className={inputClass} />
      {errors.family_members && <p className={errorClass}>⚠ {errors.family_members.message}</p>}
    </div>
    <div>
      <label className={labelClass}>عدد الأطفال</label>
      <input type="number" {...register('children_count')} placeholder="٠" className={inputClass} />
    </div>
    <div>
      <label className={labelClass}>الدخل الشهري (ليرة سورية)</label>
      <input type="number" {...register('monthly_income')} placeholder="٠" className={inputClass} />
    </div>
    <div>
      <label className={labelClass}>وضع السكن <span className="text-red-400">*</span></label>
      <select {...register('housing_status')} className={selectClass}>
        <option value="">اختر وضع السكن</option>
        <option value="owned">ملك</option>
        <option value="rented">إيجار</option>
        <option value="other">أخرى</option>
      </select>
      {errors.housing_status && <p className={errorClass}>⚠ وضع السكن مطلوب</p>}
    </div>

        {watch('housing_status') === 'other' && (
        <div className="md:col-span-2">
            <label className={labelClass}>وضح وضع سكنك</label>
            <input
            {...register('address')}
            placeholder="اشرح وضع سكنك..."
            className={inputClass}
            />
        </div>
        )}

    </div>
    </div>
            </div>
          {/* تفاصيل الطلب */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-l from-purple-50 to-white px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 text-sm font-bold">٣</div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900">تفاصيل الطلب</h2>
                  <p className="text-xs text-gray-400 mt-0.5">نوع المساعدة المطلوبة وتفاصيلها</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className={labelClass}>نوع المساعدة <span className="text-red-400">*</span></label>
                <select {...register('assistance_type')} className={selectClass}>
                  <option value="">اختر نوع المساعدة</option>
                  <option value="medical">علاج طبي</option>
                  <option value="education">تعليم</option>
                  <option value="financial">دعم معيشي</option>
                </select>
                {errors.assistance_type && <p className={errorClass}>⚠ نوع المساعدة مطلوب</p>}
              </div>
              <div>
                <label className={labelClass}>وصف الحالة <span className="text-red-400">*</span></label>
                <textarea
                  {...register('description')}
                  rows={5}
                  placeholder="اشرح حالتك واحتياجك بالتفصيل — كلما كان الوصف أوضح، كان البت في طلبك أسرع..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all resize-none"
                />
                {errors.description && <p className={errorClass}>⚠ {errors.description.message}</p>}
              </div>
            </div>
          </div>

          {/* ملاحظة */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex gap-3">
            <span className="text-amber-500 text-lg mt-0.5">ℹ</span>
            <p className="text-sm text-amber-800 leading-relaxed">
              بعد إرسال الطلب ستصلك رسالة تأكيد على هاتفك. سيتواصل معك فريق الجمعية خلال <strong>٣-٧ أيام عمل</strong>.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white rounded-2xl text-base font-semibold shadow-lg shadow-blue-200 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                جاري الإرسال...
              </>
            ) : (
              'إرسال الطلب ←'
            )}
          </button>

        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          جميع البيانات محمية وسرية — لن تُشارك مع أي جهة خارجية
        </p>
      </div>
    </div>
  );
}