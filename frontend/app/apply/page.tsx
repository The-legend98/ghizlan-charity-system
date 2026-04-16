'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { requestSchema, RequestForm } from '@/lib/validations/request';
import api from '@/lib/axios';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useScroll, useSpring, Variants } from 'framer-motion';
import { useTheme } from '@/app/providers/ThemeProvider';
import { useLang } from '@/app/providers/LangProvider';
import { THEMES, PRIMARY, PRIMARY_L, GOLD } from '@/lib/themes';
import Navbar from '@/components/Navbar';

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  return (
    <motion.div style={{ scaleX, transformOrigin: 'left', position: 'fixed', top: 0, left: 0, right: 0, height: 3, zIndex: 999, background: `linear-gradient(to right, ${PRIMARY}, ${PRIMARY_L}, ${GOLD})` }} />
  );
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

export default function ApplyPage() {
  const { dark } = useTheme();
  const { lang, dir } = useLang();
  const t = dark ? THEMES.dark : THEMES.light;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<RequestForm>({
    resolver: zodResolver(requestSchema),
  });

  
const onSubmit = async (data: RequestForm) => {
  if (submitted) return;
  setLoading(true); setSubmitted(true); setError('');
  try {
    const res = await api.post('/requests', data);
    router.push(`/confirm?ref=${res.data.ref_number}&name=${data.full_name}&requestId=${res.data.request_id}`);
  } catch (err: any) {
    setError(err.response?.data?.message || (lang === 'ar' ? 'حدث خطأ، حاول مجدداً' : 'An error occurred, please try again'));
    setSubmitted(false);
  } finally {
    setLoading(false);
  }
};

  const inputStyle: React.CSSProperties = {
    width: '100%', height: 46, border: `1.5px solid ${t.border}`, borderRadius: 12,
    padding: '0 14px', fontSize: 14, color: t.text, background: t.bg, outline: 'none',
    transition: 'all 0.2s', appearance: 'none' as const, boxSizing: 'border-box',
  };
  const textareaStyle: React.CSSProperties = {
    width: '100%', border: `1.5px solid ${t.border}`, borderRadius: 12,
    padding: '12px 14px', fontSize: 14, color: t.text, background: t.bg, outline: 'none',
    transition: 'all 0.2s', resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
  };
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, color: t.textSub, marginBottom: 6 };
  const errorStyle: React.CSSProperties = { color: '#EF4444', fontSize: 11, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 };

  const ErrorIcon = () => (
    <svg style={{ width: 12, height: 12, flexShrink: 0 }} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  );

  const SectionHeader = ({ num, title, sub, color }: { num: string; title: string; sub: string; color: string }) => (
    <div style={{ padding: '14px 20px', borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', gap: 12, background: dark ? `linear-gradient(to left, ${color}18, ${t.card})` : `linear-gradient(to left, ${color}08, ${t.card})` }}>
      <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 14, fontWeight: 700, background: `linear-gradient(135deg, ${color}, ${color}cc)`, boxShadow: `0 4px 12px ${color}40` }}>{num}</div>
      <div>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: t.text, margin: 0 }}>{title}</h2>
        <p style={{ fontSize: 11, color: t.textMute, marginTop: 2, marginBottom: 0 }}>{sub}</p>
      </div>
    </div>
  );

  const cardStyle: React.CSSProperties = {
    background: t.card, borderRadius: 18, border: `1px solid ${t.border}`,
    boxShadow: dark ? '0 4px 24px rgba(0,0,0,0.3)' : '0 4px 24px rgba(27,108,168,0.07)', overflow: 'hidden',
  };

  const tx = {
    heroTitle: lang === 'ar' ? 'تقديم طلب مساعدة' : 'Apply for Assistance',
    heroSub: lang === 'ar' ? 'يُرجى تعبئة النموذج بدقة لضمان معالجة طلبك في أسرع وقت ممكن' : 'Please fill out the form accurately to ensure your request is processed as quickly as possible',
    steps: lang === 'ar' ? ['البيانات الشخصية', 'الوضع العائلي', 'تفاصيل الطلب'] : ['Personal Info', 'Family Status', 'Request Details'],
    sec1Title: lang === 'ar' ? 'البيانات الشخصية' : 'Personal Information',
    sec1Sub: lang === 'ar' ? 'معلومات التواصل الأساسية' : 'Basic contact information',
    sec2Title: lang === 'ar' ? 'الوضع العائلي والمالي' : 'Family & Financial Status',
    sec2Sub: lang === 'ar' ? 'تفاصيل الأسرة والوضع الاقتصادي' : 'Family and economic details',
    sec3Title: lang === 'ar' ? 'تفاصيل الطلب' : 'Request Details',
    sec3Sub: lang === 'ar' ? 'نوع المساعدة المطلوبة وتفاصيلها' : 'Type of assistance needed and details',
    fullName: lang === 'ar' ? 'الاسم الكامل' : 'Full Name',
    phone: lang === 'ar' ? 'رقم الهاتف' : 'Phone Number',
    email: lang === 'ar' ? 'البريد الإلكتروني' : 'Email',
    age: lang === 'ar' ? 'العمر' : 'Age',
    gender: lang === 'ar' ? 'الجنس' : 'Gender',
    genderOpt: lang === 'ar' ? ['اختر الجنس', 'ذكر', 'أنثى'] : ['Select Gender', 'Male', 'Female'],
    region: lang === 'ar' ? 'المحافظة' : 'Governorate',
    regionOpt: lang === 'ar' ? 'اختر المحافظة' : 'Select Governorate',
    address: lang === 'ar' ? 'العنوان التفصيلي' : 'Detailed Address',
    addressPh: lang === 'ar' ? 'الحي، الشارع...' : 'Neighborhood, street...',
    familyMembers: lang === 'ar' ? 'عدد أفراد الأسرة' : 'Family Members',
    children: lang === 'ar' ? 'عدد الأطفال' : 'Number of Children',
    income: lang === 'ar' ? 'الدخل الشهري (ليرة سورية)' : 'Monthly Income (SYP)',
    housing: lang === 'ar' ? 'وضع السكن' : 'Housing Status',
    housingOpts: lang === 'ar' ? ['اختر وضع السكن', 'ملك', 'إيجار', 'أخرى'] : ['Select Housing', 'Owned', 'Rented', 'Other'],
    housingDetails: lang === 'ar' ? 'وضّح وضع سكنك' : 'Describe your housing',
    housingDetailsPh: lang === 'ar' ? 'اشرح وضع سكنك...' : 'Describe your housing situation...',
    assistanceType: lang === 'ar' ? 'نوع المساعدة' : 'Type of Assistance',
    assistanceOpts: lang === 'ar'
      ? [{ v: 'medical', l: 'علاج طبي' }, { v: 'education', l: 'تعليم' }, { v: 'financial', l: 'دعم معيشي' }]
      : [{ v: 'medical', l: 'Medical Care' }, { v: 'education', l: 'Education' }, { v: 'financial', l: 'Financial Aid' }],
    description: lang === 'ar' ? 'وصف الحالة' : 'Case Description',
    descPh: lang === 'ar' ? 'اشرح حالتك واحتياجك بالتفصيل...' : 'Describe your situation and needs in detail...',
    note: lang === 'ar' ? 'بعد إرسال الطلب ستصلك رسالة تأكيد. سيتواصل معك فريق المؤسسة خلال' : 'After submitting you will receive a confirmation. Our team will contact you within',
    noteDays: lang === 'ar' ? '٣-٧ أيام عمل' : '3-7 business days',
    formErrors: lang === 'ar' ? 'يوجد أخطاء في النموذج:' : 'Form has errors:',
    submit: lang === 'ar' ? 'إرسال الطلب' : 'Submit Request',
    submitting: lang === 'ar' ? 'جاري الإرسال...' : 'Submitting...',
    secure: lang === 'ar' ? 'جميع البيانات محمية وسرية' : 'All data is protected and confidential',
  };

  return (
    <div dir={dir} style={{ minHeight: '100vh', background: t.bg2, transition: 'background 0.3s', position: 'relative', overflowX: 'hidden' }}>

      <ScrollProgress />

      {/* خلفية ديكورية متحركة */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <motion.div animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }} transition={{ duration: 8, repeat: Infinity }}
          style={{ position: 'absolute', top: -120, right: -120, width: 400, height: 400, borderRadius: '50%', background: `radial-gradient(circle, ${PRIMARY}18 0%, transparent 70%)` }} />
        <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.9, 0.5] }} transition={{ duration: 10, repeat: Infinity, delay: 2 }}
          style={{ position: 'absolute', top: 200, left: -80, width: 280, height: 280, borderRadius: '50%', background: `radial-gradient(circle, ${GOLD}12 0%, transparent 70%)` }} />
        <motion.div animate={{ scale: [1, 1.06, 1], opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 9, repeat: Infinity, delay: 1 }}
          style={{ position: 'absolute', bottom: 100, right: -60, width: 320, height: 320, borderRadius: '50%', background: `radial-gradient(circle, ${PRIMARY_L}10 0%, transparent 70%)` }} />
      </div>

      <Navbar />

      {/* HERO */}
      <div style={{ position: 'relative', zIndex: 1, background: `linear-gradient(135deg, ${PRIMARY}ee 0%, ${PRIMARY_L}cc 100%)`, padding: '36px 20px 48px', textAlign: 'center', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.1 }}>
          <svg width="100%" height="100%" viewBox="0 0 400 200"><defs><pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.5" fill="white"/></pattern></defs><rect width="400" height="200" fill="url(#dots)" /></svg>
        </div>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
            style={{ width: 60, height: 60, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.3)' }}
          >
            <svg style={{ width: 28, height: 28 }} fill="none" stroke="white" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{ fontSize: 26, fontWeight: 900, color: 'white', marginBottom: 8, letterSpacing: '-0.5px' }}
          >
            {tx.heroTitle}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            style={{ color: 'rgba(255,255,255,0.82)', fontSize: 13, maxWidth: 340, margin: '0 auto', lineHeight: 1.7 }}
          >
            {tx.heroSub}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 20 }}
          >
            {tx.steps.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.15)', borderRadius: 100, padding: '4px 10px', border: '1px solid rgba(255,255,255,0.25)' }}
                >
                  <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', color: PRIMARY, fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.9)', fontWeight: 600, whiteSpace: 'nowrap' }} className="step-label">{s}</span>
                </motion.div>
                {i < 2 && <div style={{ width: 16, height: 1, background: 'rgba(255,255,255,0.3)' }} className="step-line" />}
              </div>
            ))}
          </motion.div>
        </div>

        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
          <svg viewBox="0 0 1440 30" fill={t.bg2} style={{ display: 'block' }}><path d="M0,15 C360,30 1080,0 1440,15 L1440,30 L0,30 Z"/></svg>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '24px 16px 40px', position: 'relative', zIndex: 1 }}>

        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: dark ? '#2D1515' : '#FEF2F2', border: '1px solid #FECACA', color: '#EF4444', borderRadius: 14, padding: '12px 16px', marginBottom: 16, fontSize: 13, display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg style={{ width: 16, height: 16, flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit(onSubmit, (errs) => {
          const msgs = Object.values(errs).map((e: any) => e.message || (lang === 'ar' ? 'حقل مطلوب' : 'Required field'));
          setValidationErrors(msgs);
        })} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* ── ١ البيانات الشخصية ── */}
          <motion.div style={cardStyle} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <SectionHeader num="1" title={tx.sec1Title} sub={tx.sec1Sub} color={PRIMARY} />
            <div style={{ padding: '20px 16px' }}>
              <div className="form-grid">
                <div>
                  <label style={labelStyle}>{tx.fullName} <span style={{ color: '#EF4444' }}>*</span></label>
                  <input {...register('full_name')} placeholder={lang === 'ar' ? 'أدخل اسمك الكامل' : 'Enter your full name'} style={inputStyle} />
                  {errors.full_name && <p style={errorStyle}><ErrorIcon />{errors.full_name.message}</p>}
                </div>
                <div>
                  <label style={labelStyle}>{tx.phone} <span style={{ color: '#EF4444' }}>*</span></label>
                  <input {...register('phone')} placeholder="09xxxxxxxx" style={inputStyle} />
                  {errors.phone && <p style={errorStyle}><ErrorIcon />{errors.phone.message}</p>}
                </div>
                <div>
                  <label style={labelStyle}>{lang === 'ar' ? 'الرقم الوطني' : 'National ID'}</label>
                  <input {...register('national_id' as any)} placeholder={lang === 'ar' ? 'أدخل رقمك الوطني' : 'Enter your national ID'} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>{tx.email}</label>
                  <input {...register('email')} placeholder="example@email.com" type="email" style={inputStyle} />
                  {errors.email && <p style={errorStyle}><ErrorIcon />{errors.email.message}</p>}
                </div>
                <div>
                  <label style={labelStyle}>{tx.age} <span style={{ color: '#EF4444' }}>*</span></label>
                  <input type="number" {...register('age')} placeholder={lang === 'ar' ? 'سنة' : 'years'} style={inputStyle} />
                  {errors.age && <p style={errorStyle}><ErrorIcon />{errors.age.message}</p>}
                </div>
                <div>
                  <label style={labelStyle}>{tx.gender} <span style={{ color: '#EF4444' }}>*</span></label>
                  <select {...register('gender')} style={inputStyle}>
                    <option value="">{tx.genderOpt[0]}</option>
                    <option value="male">{tx.genderOpt[1]}</option>
                    <option value="female">{tx.genderOpt[2]}</option>
                  </select>
                  {errors.gender && <p style={errorStyle}><ErrorIcon />{lang === 'ar' ? 'الجنس مطلوب' : 'Gender is required'}</p>}
                </div>
                <div>
                  <label style={labelStyle}>{tx.region} <span style={{ color: '#EF4444' }}>*</span></label>
                  <select {...register('region')} style={inputStyle}>
                    <option value="">{tx.regionOpt}</option>
                    {['دمشق','ريف دمشق','حلب','حمص','حماة','اللاذقية','طرطوس','إدلب','الحسكة','دير الزور','الرقة','السويداء','درعا','القنيطرة'].map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                  {errors.region && <p style={errorStyle}><ErrorIcon />{errors.region.message}</p>}
                </div>
                <div className="full-col">
                  <label style={labelStyle}>{tx.address}</label>
                  <input {...register('address')} placeholder={tx.addressPh} style={inputStyle} />
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── ٢ الوضع العائلي ── */}
          <motion.div style={cardStyle} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: 0.1 }}>
            <SectionHeader num="2" title={tx.sec2Title} sub={tx.sec2Sub} color="#0F6E56" />
            <div style={{ padding: '20px 16px' }}>
              <div className="form-grid">
                <div>
                  <label style={labelStyle}>{tx.familyMembers} <span style={{ color: '#EF4444' }}>*</span></label>
                  <input type="number" {...register('family_members')} placeholder={lang === 'ar' ? 'عدد الأفراد' : 'Number of members'} style={inputStyle} />
                  {errors.family_members && <p style={errorStyle}><ErrorIcon />{errors.family_members.message}</p>}
                </div>
                <div>
                  <label style={labelStyle}>{tx.children}</label>
                  <input type="number" {...register('children_count')} placeholder="0" style={inputStyle} />
                </div>
              <div>
                <label style={labelStyle}>{lang === 'ar' ? 'الدخل الشهري' : 'Monthly Income'}</label>
                <select {...register('income_range' as any)} style={inputStyle}>
                  <option value="">{lang === 'ar' ? 'اختر الدخل الشهري' : 'Select monthly income'}</option>
                  <option value="none">{lang === 'ar' ? 'لا يوجد دخل' : 'No income'}</option>
                  <option value="under_1m">{lang === 'ar' ? 'أقل من ١,٠٠٠,٠٠٠ ل.س' : 'Under 1,000,000 SYP'}</option>
                  <option value="1m_2m">{lang === 'ar' ? '١,٠٠٠,٠٠٠ — ٢,٠٠٠,٠٠٠ ل.س' : '1M — 2M SYP'}</option>
                  <option value="2m_4m">{lang === 'ar' ? '٢,٠٠٠,٠٠٠ — ٤,٠٠٠,٠٠٠ ل.س' : '2M — 4M SYP'}</option>
                  <option value="over_4m">{lang === 'ar' ? 'أكثر من ٤,٠٠٠,٠٠٠ ل.س' : 'Over 4,000,000 SYP'}</option>
                </select>
              </div>
                <div>
                  <label style={labelStyle}>{tx.housing} <span style={{ color: '#EF4444' }}>*</span></label>
                  <select {...register('housing_status')} style={inputStyle}>
                    <option value="">{tx.housingOpts[0]}</option>
                    <option value="owned">{tx.housingOpts[1]}</option>
                    <option value="rented">{tx.housingOpts[2]}</option>
                    <option value="other">{tx.housingOpts[3]}</option>
                  </select>
                  {errors.housing_status && <p style={errorStyle}><ErrorIcon />{lang === 'ar' ? 'وضع السكن مطلوب' : 'Housing status is required'}</p>}
                </div>
                {watch('housing_status') === 'other' && (
                  <motion.div className="full-col"
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} transition={{ duration: 0.3 }}>
                    <label style={labelStyle}>{tx.housingDetails}</label>
                    <input {...register('housing_details' as any)} placeholder={tx.housingDetailsPh} style={inputStyle} />
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>

          {/* ── ٣ تفاصيل الطلب ── */}
          <motion.div style={cardStyle} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: 0.2 }}>
            <SectionHeader num="3" title={tx.sec3Title} sub={tx.sec3Sub} color={GOLD} />
            <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>{tx.assistanceType} <span style={{ color: '#EF4444' }}>*</span></label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 4 }}>
                  {[
                    { value: 'medical',   label: tx.assistanceOpts[0].l, icon: <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg> },
                    { value: 'education', label: tx.assistanceOpts[1].l, icon: <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg> },
                    { value: 'financial', label: tx.assistanceOpts[2].l, icon: <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
                  ].map((opt, i) => {
                    const selected = watch('assistance_type') === opt.value;
                    return (
                      <motion.label key={opt.value}
                        whileHover={{ scale: 1.04, y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '12px 8px', borderRadius: 12, cursor: 'pointer', border: `2px solid ${selected ? GOLD : t.border}`, background: selected ? `${GOLD}12` : t.bg, transition: 'border-color 0.2s, background 0.2s' }}
                      >
                        <input type="radio" {...register('assistance_type')} value={opt.value} style={{ display: 'none' }} />
                        <motion.span animate={selected ? { rotate: [0, -10, 10, 0] } : {}} transition={{ duration: 0.4 }}>{opt.icon}</motion.span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: selected ? GOLD : t.textSub }}>{opt.label}</span>
                      </motion.label>
                    );
                  })}
                </div>
                {errors.assistance_type && <p style={errorStyle}><ErrorIcon />{lang === 'ar' ? 'نوع المساعدة مطلوب' : 'Assistance type is required'}</p>}
              </div>
              <div>
                <label style={labelStyle}>{tx.description} <span style={{ color: '#EF4444' }}>*</span></label>
                <textarea {...register('description')} rows={5} placeholder={tx.descPh} style={textareaStyle} />
                {errors.description && <p style={errorStyle}><ErrorIcon />{errors.description.message}</p>}
              </div>
            </div>
          </motion.div>

          {/* ملاحظة */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            style={{ borderRadius: 14, padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'flex-start', background: dark ? `${GOLD}12` : `${GOLD}08`, border: `1px solid ${GOLD}35` }}>
            <motion.svg animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 3, repeat: Infinity, repeatDelay: 4 }}
              style={{ width: 17, height: 17, flexShrink: 0, marginTop: 1 }} fill="none" stroke={GOLD} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </motion.svg>
            <p style={{ fontSize: 12.5, color: dark ? '#D4A84C' : '#92650a', lineHeight: 1.75, margin: 0 }}>
              {tx.note} <strong>{tx.noteDays}</strong>.
            </p>
          </motion.div>

          {validationErrors.length > 0 && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              style={{ background: dark ? '#2D1515' : '#FEF2F2', border: '1px solid #FECACA', borderRadius: 14, padding: '12px 16px' }}>
              <p style={{ color: '#EF4444', fontWeight: 700, fontSize: 13, marginBottom: 6 }}>{tx.formErrors}</p>
              {validationErrors.map((msg, i) => <p key={i} style={{ color: '#EF4444', fontSize: 12, marginBottom: 3 }}>• {msg}</p>)}
            </motion.div>
          )}

          <motion.button type="submit" disabled={loading}
            whileHover={!loading ? { scale: 1.02, boxShadow: `0 12px 32px ${PRIMARY}55` } : {}}
            whileTap={!loading ? { scale: 0.98 } : {}}
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            style={{ width: '100%', height: 52, background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_L})`, color: 'white', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.65 : 1, boxShadow: `0 8px 24px ${PRIMARY}45`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            {loading ? (
              <><span style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />{tx.submitting}</>
            ) : (
              <>{tx.submit}<svg style={{ width: 18, height: 18 }} fill="none" stroke="white" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg></>
            )}
          </motion.button>

          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            style={{ textAlign: 'center', fontSize: 11, color: t.textMute, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, margin: 0 }}>
            <svg style={{ width: 13, height: 13 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            {tx.secure}
          </motion.p>
        </form>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .full-col { grid-column: 1 / -1; }
        input::placeholder, textarea::placeholder { color: ${t.textMute}; opacity: 0.6; }
        input:focus, textarea:focus, select:focus { border-color: ${PRIMARY}80 !important; box-shadow: 0 0 0 3px ${PRIMARY}12; background: ${t.card} !important; }
        select option { background: ${t.card}; color: ${t.text}; }
        @media (max-width: 480px) {
          .form-grid { grid-template-columns: 1fr !important; }
          .full-col { grid-column: 1 !important; }
          .step-label { display: none !important; }
        }
      `}</style>
    </div>
  );
}