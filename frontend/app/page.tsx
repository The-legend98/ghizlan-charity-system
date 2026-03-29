'use client';

import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white" dir="rtl">

      {/* Navbar */}
      <nav className="bg-white/90 backdrop-blur border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">غ</div>
            <div>
              <div className="text-base font-bold text-gray-900">مؤسسة غزلان الخير</div>
              <div className="text-xs text-gray-400">الإنسانية</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/track')}
              className="text-sm text-gray-600 hover:text-blue-600 transition-colors px-3 py-2"
            >
              تتبع طلبي
            </button>
            <button
              onClick={() => router.push('/apply')}
              className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm shadow-blue-200"
            >
              تقديم طلب
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white text-xs font-medium px-4 py-2 rounded-full mb-6 border border-white/20">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block"></span>
            خدمة مجانية — نحن هنا لمساعدتك
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            يداً بيد نبني
            <span className="text-blue-200"> مجتمعاً أفضل</span>
          </h1>
          <p className="text-blue-100 text-lg mb-10 leading-relaxed max-w-xl mx-auto">
            جمعية غزلان الخير الإنسانية تقدم المساعدة للأسر المحتاجة في مجالات العلاج والتعليم والدعم المعيشي
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/apply')}
              className="h-14 px-8 bg-white text-blue-700 rounded-2xl text-base font-bold hover:bg-blue-50 transition-all shadow-lg"
            >
              قدّم طلب مساعدة الآن ←
            </button>
            <button
              onClick={() => router.push('/track')}
              className="h-14 px-8 bg-white/10 text-white rounded-2xl text-base font-medium hover:bg-white/20 transition-all border border-white/20"
            >
              تتبع طلبي الحالي
            </button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gray-100 py-12 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '+٥٠٠', label: 'أسرة استفادت' },
            { value: '+٣', label: 'سنوات خبرة' },
            { value: '٣', label: 'مجالات مساعدة' },
            { value: '٩٨٪', label: 'رضا المستفيدين' },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl font-bold text-blue-600 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">مجالات المساعدة</h2>
            <p className="text-gray-500">نقدم الدعم في ثلاثة مجالات أساسية</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
          {
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.5 12.75l6 6 9-13.5M9 10.5l-1.5 4.5 4.5-1.5M15 3.75A8.25 8.25 0 116.75 12"/>
              </svg>
            ),
            title: 'العلاج الطبي',
            desc: 'تغطية تكاليف العمليات والأدوية والعلاج للحالات المحتاجة',
            color: 'blue',
          },
          {
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/>
              </svg>
            ),
            title: 'التعليم',
            desc: 'دعم الطلاب المحتاجين بالمستلزمات الدراسية والرسوم المدرسية',
            color: 'green',
          },
          {
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/>
              </svg>
            ),
            title: 'الدعم المعيشي',
            desc: 'مساعدة الأسر في تأمين احتياجاتها الأساسية من غذاء وسكن',
            color: 'amber',
          },
        ].map((service) => (
          <div key={service.title} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
              service.color === 'blue'  ? 'bg-blue-50 text-blue-600' :
              service.color === 'green' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
            }`}>
              {service.icon}
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-2">{service.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{service.desc}</p>
          </div>
        ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">كيف تقدم طلبك؟</h2>
            <p className="text-gray-500">أربع خطوات بسيطة</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: '١', title: 'عبّي النموذج', desc: 'أدخل بياناتك واحتياجك' },
              { step: '٢', title: 'ارفع الوثائق', desc: 'أضف المستندات الداعمة' },
              { step: '٣', title: 'انتظر المراجعة', desc: 'خلال ٣-٧ أيام عمل' },
              { step: '٤', title: 'تلقّ المساعدة', desc: 'نتواصل معك مباشرة' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white text-lg font-bold flex items-center justify-center mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 py-16 px-4 text-center text-white">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">هل تحتاج إلى مساعدة؟</h2>
          <p className="text-blue-100 mb-8 text-sm leading-relaxed">لا تتردد في التقديم — فريقنا يراجع كل طلب بعناية</p>
          <button
            onClick={() => router.push('/apply')}
            className="h-14 px-10 bg-white text-blue-700 rounded-2xl text-base font-bold hover:bg-blue-50 transition-all shadow-lg"
          >
            قدّم طلبك الآن ←
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10 px-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">غ</div>
            <span className="text-sm text-gray-300">مؤسسة غزلان الخير الإنسانية</span>
          </div>
          <div className="flex gap-6 text-sm">
            <button onClick={() => router.push('/apply')} className="hover:text-white transition-colors">تقديم طلب</button>
            <button onClick={() => router.push('/track')} className="hover:text-white transition-colors">تتبع طلب</button>
          </div>
          <p className="text-xs text-gray-600">© ٢٠٢٦ جميع الحقوق محفوظة</p>
        </div>
      </footer>

    </div>
  );
}