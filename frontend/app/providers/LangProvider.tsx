'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type Lang = 'ar' | 'en';

const translations = {
  ar: {
    nav: {
      track: 'تتبع طلبي',
      apply: 'تقديم طلب',
      lang: 'English 🇬🇧',
    },
    home: {
      hero_badge: 'من قلب سوريا — غزلان الخير عهدٌ بالوفاء لأهلنا',
      hero_title_1: 'من قلب سوريا',
      hero_title_2: 'وإليها...نبني الأمل',
      hero_sub: 'مؤسسة غزلان الخير تؤمن أن المساعدة ليست إحساناً، بل حقٌّ لكل أسرة سورية تكافح من أجل غدٍ أجمل.',
      apply_btn: 'قدّم طلبك الآن — مجاناً وبسرية تامة ←',
      track_btn: 'تتبع طلبي',
      stats_years: 'سنوات من العطاء المتواصل',
      stats_families: 'أسرة استعادت أملها',
      stats_requests: 'تدخل إنساني ناجح',
      stats_volunteers: 'متطوع شغوف',
      service_medical_title: 'نستعيد الابتسامة',
      service_medical_desc: 'تغطية العمليات الجراحية وتأمين الدواء للأكثر احتياجاً — لأن الصحة حق لا رفاهية.',
      service_edu_title: 'لا نترك طالباً خلفنا',
      service_edu_desc: 'ندعم المسيرة التعليمية لضمان جيل سوري متعلم واعٍ يبني مستقبله بثقة.',
      service_fin_title: 'سندٌ في الأزمات',
      service_fin_desc: 'تأمين الاحتياجات الأساسية بخصوصية تامة تحفظ كرامة العائلة وتصون إنسانيتها.',
      step1_title: 'عبّي النموذج',
      step1_desc: 'أدخل بياناتك الشخصية واحتياجك بكل سهولة ويسر',
      step2_title: 'ارفع وثائقك بأمان',
      step2_desc: 'نضمن سرية بياناتك وتشفيرها بالكامل — معلوماتك في أمان تام',
      step3_title: 'دراسة مهنية',
      step3_desc: 'فريقنا يدرس الحالة لضمان وصول الدعم لمستحقيه الفعليين بكل عدالة',
      step4_title: 'تلقّ المساعدة',
      step4_desc: 'نتواصل معك لتقديم الدعم اللازم بسرعة وكرامة',
      donate_title: 'كن أنت غرس الخير',
      donate_desc: 'بمساهمتك البسيطة، قد تنقذ حياة أو تفتح باب مدرسة. شاركنا في كتابة قصص نجاح جديدة.',
      donate_btn: 'ساهم معنا الآن',
      faq: [
        { q: 'من يحق له تقديم طلب مساعدة؟', a: 'كل أسرة أو فرد يعيش ظروفاً صعبة في أي محافظة سورية، بصرف النظر عن الجنس أو العمر.' },
        { q: 'كم يستغرق البت في الطلب؟', a: 'يراجع فريقنا كل طلب خلال ٣-٧ أيام عمل، وقد تختلف المدة حسب اكتمال الوثائق.' },
        { q: 'ما الوثائق المطلوبة مع الطلب؟', a: 'صورة هوية، وثائق تثبت الحاجة كالتقرير الطبي أو وضع السكن، وأي مستندات داعمة أخرى.' },
        { q: 'هل المساعدات تشمل جميع المحافظات؟', a: 'نعم، نستقبل الطلبات من جميع المحافظات السورية دون استثناء.' },
        { q: 'كيف يتم التأكد من وصول الدعم؟', a: 'نعتمد نظام تتبع شفافاً يمكّنك من متابعة طلبك في كل مرحلة، ونوثّق كل تدخل إنساني.' },
        { q: 'هل يمكن تقديم أكثر من طلب؟', a: 'يمكن تقديم طلب واحد لكل نوع مساعدة. بعد البت في الطلب الحالي يمكن تقديم طلب جديد.' },
      ],
    },
    apply: {
      title: 'تقديم طلب مساعدة',
      sub: 'أكمل النموذج وسنتواصل معك في أقرب وقت',
    },
    track: {
      title: 'تتبع طلبك',
      sub: 'أدخل رقم الطلب أو رقم الهاتف',
      placeholder: 'رقم الطلب أو رقم الهاتف',
      btn: 'بحث',
      not_found: 'لم يتم العثور على طلب',
    },
    footer: {
      desc: 'مؤسسة إنسانية سورية تؤمن أن المساعدة حقٌّ لا منّة، ونسعى لبناء مجتمع يدعم أبناءه بكرامة.',
      services: 'الخدمات',
      contact: 'التواصل',
      rights: '© ٢٠٢٦ مؤسسة غزلان الخير — جميع الحقوق محفوظة',
      dark: 'الوضع الداكن',
      light: 'الوضع الفاتح',
      apply: 'تقديم طلب مساعدة',
      track: 'تتبع طلب',
      employees: 'دخول الموظفين',
      email: 'info@ghozlan.org',
      whatsapp: 'واتساب متاح',
      hours: 'أحد — خميس، ٩ص — ٤م',
    },
  },
  en: {
    nav: {
      track: 'Track Request',
      apply: 'Apply Now',
      lang: 'العربية 🇸🇾',
    },
    home: {
      hero_badge: 'From the heart of Syria — A pledge of loyalty to our people',
      hero_title_1: 'From the Heart of Syria',
      hero_title_2: 'Building Hope Together',
      hero_sub: 'Ghozlan Alkhair Foundation believes that assistance is not charity, but a right for every Syrian family striving for a better tomorrow.',
      apply_btn: 'Apply Now — Free & Confidential →',
      track_btn: 'Track My Request',
      stats_years: 'Years of Continuous Giving',
      stats_families: 'Families Who Regained Hope',
      stats_requests: 'Successful Humanitarian Interventions',
      stats_volunteers: 'Passionate Volunteers',
      service_medical_title: 'Restoring Smiles',
      service_medical_desc: 'Covering surgical operations and securing medication for those most in need — because health is a right, not a luxury.',
      service_edu_title: 'No Student Left Behind',
      service_edu_desc: 'Supporting educational journeys to ensure a knowledgeable Syrian generation that builds its future with confidence.',
      service_fin_title: 'A Pillar in Crisis',
      service_fin_desc: 'Securing basic needs with complete privacy that preserves family dignity and protects their humanity.',
      step1_title: 'Fill the Form',
      step1_desc: 'Enter your personal data and needs easily and conveniently',
      step2_title: 'Upload Securely',
      step2_desc: 'We guarantee complete confidentiality and encryption of your data — your information is fully secure',
      step3_title: 'Professional Review',
      step3_desc: 'Our team studies each case to ensure support reaches those truly deserving it with full fairness',
      step4_title: 'Receive Support',
      step4_desc: 'We contact you to provide the necessary support quickly and with dignity',
      donate_title: 'Be the Seed of Goodness',
      donate_desc: 'With your simple contribution, you may save a life or open a school door. Join us in writing new success stories.',
      donate_btn: 'Contribute Now',
      faq: [
        { q: 'Who is eligible to apply?', a: 'Any family or individual living in difficult circumstances in any Syrian governorate, regardless of gender or age.' },
        { q: 'How long does processing take?', a: 'Our team reviews each request within 3-7 business days, which may vary based on document completeness.' },
        { q: 'What documents are required?', a: 'ID copy, documents proving need such as medical report or housing situation, and any other supporting documents.' },
        { q: 'Does assistance cover all governorates?', a: 'Yes, we accept requests from all Syrian governorates without exception.' },
        { q: 'How is support delivery verified?', a: 'We use a transparent tracking system that lets you follow your request at every stage, and we document every humanitarian intervention.' },
        { q: 'Can I submit more than one request?', a: 'One request per assistance type. After the current request is resolved, a new one can be submitted.' },
      ],
    },
    apply: {
      title: 'Apply for Assistance',
      sub: 'Complete the form and we will contact you as soon as possible',
    },
    track: {
      title: 'Track Your Request',
      sub: 'Enter your request number or phone number',
      placeholder: 'Request number or phone number',
      btn: 'Search',
      not_found: 'No request found',
    },
    footer: {
      desc: 'A Syrian humanitarian foundation that believes assistance is a right, not charity, striving to build a community that supports its people with dignity.',
      services: 'Services',
      contact: 'Contact',
      rights: '© 2026 Ghozlan Alkhair Foundation — All rights reserved',
      dark: 'Dark Mode',
      light: 'Light Mode',
      apply: 'Apply for Assistance',
      track: 'Track Request',
      employees: 'Employee Login',
      email: 'info@ghozlan.org',
      whatsapp: 'WhatsApp Available',
      hours: 'Sun — Thu, 9AM — 4PM',
    },
  },
};

type Translations = typeof translations.ar;

interface LangContextType {
  lang: Lang;
  toggleLang: () => void;
  t: Translations;
  dir: 'rtl' | 'ltr';
}

const LangContext = createContext<LangContextType>({
  lang: 'ar',
  toggleLang: () => {},
  t: translations.ar,
  dir: 'rtl',
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('ar');

  const toggleLang = () => setLang(l => l === 'ar' ? 'en' : 'ar');

  const value: LangContextType = {
    lang,
    toggleLang,
    t: translations[lang],
    dir: lang === 'ar' ? 'rtl' : 'ltr',
  };

  return (
    <LangContext.Provider value={value}>
        <div lang={lang}>
        {children}
      </div>
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);