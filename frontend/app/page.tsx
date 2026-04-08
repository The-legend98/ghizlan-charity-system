'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const THEMES = {
  light: {
    bg: '#FFFFFF', bg2: '#F8FAFD', text: '#0A1628', textSub: '#4B5563',
    textMute: '#6B7280', border: '#EFF2F7', card: '#FFFFFF',
    navBg: 'rgba(255,255,255,0.97)', navBorder: 'rgba(27,108,168,0.08)',
    footerBg: '#0A1628', footerText: '#4B5563',
  },
  dark: {
    bg: '#0D1117', bg2: '#161B22', text: '#F0F6FC', textSub: '#8B949E',
    textMute: '#6E7681', border: '#21262D', card: '#161B22',
    navBg: 'rgba(13,17,23,0.97)', navBorder: 'rgba(74,172,205,0.15)',
    footerBg: '#010409', footerText: '#6E7681',
  },
};

const PRIMARY = '#1B6CA8';
const PRIMARY_L = '#4AACCD';
const GOLD = '#C9A84C';

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function useCounter(target: number, inView: boolean, duration = 2000) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target, duration]);
  return count;
}

function FadeIn({ children, delay = 0, className = '', style: extraStyle = {} }: {
  children: React.ReactNode; delay?: number; className?: string; style?: React.CSSProperties;
}) {
  const { ref, inView } = useInView();
  return (
    <div ref={ref} className={className} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? 'translateY(0)' : 'translateY(32px)',
      transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
      ...extraStyle,
    }}>{children}</div>
  );
}

function CounterStat({ target, suffix = '', label, icon, t }: {
  target: number; suffix?: string; label: string; icon: React.ReactNode; t: typeof THEMES.light;
}) {
  const { ref, inView } = useInView(0.3);
  const count = useCounter(target, inView);
  return (
    <div ref={ref} style={{
      textAlign: 'center', padding: '32px 20px', borderRadius: 20,
      background: t.card, border: `1px solid ${t.border}`,
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
      opacity: inView ? 1 : 0,
      transform: inView ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
    }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = `0 20px 60px ${PRIMARY}20`;
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-6px) scale(1.02)';
        (e.currentTarget as HTMLElement).style.borderColor = `${PRIMARY}30`;
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0) scale(1)';
        (e.currentTarget as HTMLElement).style.borderColor = t.border;
      }}>
      <div style={{ width: 56, height: 56, borderRadius: 16, background: `${PRIMARY}12`, color: PRIMARY, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
        {icon}
      </div>
      <div style={{ fontSize: 40, fontWeight: 900, color: PRIMARY, letterSpacing: '-2px', lineHeight: 1, marginBottom: 8 }}>
        {count}{suffix}
      </div>
      <div style={{ fontSize: 13, color: t.textMute, fontWeight: 500 }}>{label}</div>
    </div>
  );
}

const Icons = {
  people:    <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
  shield:    <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  heart:     <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
  star:      <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  medical:   <svg width="26" height="26" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
  education: <svg width="26" height="26" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>,
  support:   <svg width="26" height="26" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  check:     <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  arrow:     <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  mail:      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  phone:     <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.4 1.14 2 2 0 012 .84h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>,
  clock:     <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  form:      <svg width="26" height="26" fill="none" stroke="white" viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  upload:    <svg width="26" height="26" fill="none" stroke="white" viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/></svg>,
  review:    <svg width="26" height="26" fill="none" stroke="white" viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  gift:      <svg width="26" height="26" fill="none" stroke="white" viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/></svg>,
  user:      <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  chevron:   <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
  sun:       <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  moon:      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>,
};

function Particles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const particles: { x: number; y: number; r: number; dx: number; dy: number; o: number }[] = [];
    for (let i = 0; i < 45; i++) {
      particles.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, r: Math.random() * 2 + 0.5, dx: (Math.random() - 0.5) * 0.3, dy: (Math.random() - 0.5) * 0.3, o: Math.random() * 0.35 + 0.1 });
    }
    let frame: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${p.o})`;
        ctx.fill();
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      });
      frame = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(frame);
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}/>;
}

function SectionTitle({ label, labelColor = PRIMARY, title, titleGradient, sub, t }: {
  label: string; labelColor?: string; title: string; titleGradient?: string; sub?: string; t: typeof THEMES.light;
}) {
  return (
    <div style={{ textAlign: 'center', marginBottom: 52 }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 16,
        background: `${labelColor}0F`, border: `1px solid ${labelColor}20`, borderRadius: 100, padding: '8px 20px' }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: labelColor }}/>
        <span style={{ fontSize: 12, fontWeight: 700, color: labelColor, letterSpacing: '3px', textTransform: 'uppercase' as const }}>{label}</span>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: labelColor }}/>
      </div>
      <h2 style={{ fontSize: 42, fontWeight: 900, color: t.text, letterSpacing: '-1px', marginBottom: 12, lineHeight: 1.1 }}>
        {titleGradient ? (
          <>
            {title}{' '}
            <span style={{ background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_L})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{titleGradient}</span>
          </>
        ) : title}
      </h2>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: sub ? 16 : 0 }}>
        <div style={{ width: 32, height: 3, borderRadius: 2, background: `linear-gradient(to left, ${labelColor}, ${labelColor}60)` }}/>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: GOLD }}/>
        <div style={{ width: 32, height: 3, borderRadius: 2, background: `linear-gradient(to right, ${labelColor}, ${labelColor}60)` }}/>
      </div>
      {sub && <p style={{ fontSize: 15, color: t.textMute, maxWidth: 440, margin: '12px auto 0', lineHeight: 1.75 }}>{sub}</p>}
    </div>
  );
}

function DarkToggle({ dark, toggle, t }: { dark: boolean; toggle: () => void; t: typeof THEMES.light }) {
  return (
    <button onClick={toggle}
      style={{ width: 42, height: 42, borderRadius: 12, border: `1.5px solid ${t.border}`, background: t.card, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.text, transition: 'all 0.25s', flexShrink: 0 }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = PRIMARY; (e.currentTarget as HTMLElement).style.color = PRIMARY; (e.currentTarget as HTMLElement).style.background = `${PRIMARY}08`; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = t.border; (e.currentTarget as HTMLElement).style.color = t.text; (e.currentTarget as HTMLElement).style.background = t.card; }}
      title={dark ? 'الوضع الفاتح' : 'الوضع الداكن'}>
      {dark ? Icons.sun : Icons.moon}
    </button>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [dark, setDark] = useState(false);
  const t = dark ? THEMES.dark : THEMES.light;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const TH = t.text;

  return (
    <div dir="rtl" style={{ background: t.bg, minHeight: '100vh', transition: 'background 0.3s' }}
>

      {/* ══ NAVBAR ══ */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: scrolled ? t.navBg : 'transparent', backdropFilter: scrolled ? 'blur(20px)' : 'none', borderBottom: scrolled ? `1px solid ${t.navBorder}` : '1px solid transparent', boxShadow: scrolled ? '0 1px 20px rgba(0,0,0,0.08)' : 'none', transition: 'all 0.4s ease' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 24px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 14, flexShrink: 0, background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_L})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: 20, boxShadow: `0 6px 18px ${PRIMARY}40` }}>غ</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: scrolled ? t.text : 'white', letterSpacing: '-0.3px', transition: 'color 0.4s' }}>مؤسسة غزلان الخير</div>
              <div style={{ fontSize: 10, letterSpacing: '0.5px', color: scrolled ? PRIMARY_L : 'rgba(255,255,255,0.7)', transition: 'color 0.4s' }}>Ghozlan Alkhair Foundation</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button onClick={() => router.push('/track')}
              style={{ fontSize: 13, fontWeight: 500, color: scrolled ? t.textSub : 'rgba(255,255,255,0.85)', background: 'transparent', border: 'none', cursor: 'pointer', padding: '8px 16px', borderRadius: 10, transition: 'all 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = scrolled ? (dark ? 'rgba(255,255,255,0.08)' : '#F3F4F6') : 'rgba(255,255,255,0.12)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
              تتبع طلبي
            </button>
            <button onClick={() => router.push('/dashboard/login')}
              style={{ fontSize: 13, fontWeight: 500, color: scrolled ? PRIMARY : 'rgba(255,255,255,0.9)', background: scrolled ? `${PRIMARY}10` : 'rgba(255,255,255,0.12)', border: `1.5px solid ${scrolled ? `${PRIMARY}25` : 'rgba(255,255,255,0.25)'}`, cursor: 'pointer', padding: '8px 14px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.3s' }}>
              {Icons.user} بوابة الموظفين
            </button>
            <button onClick={() => router.push('/apply')}
              style={{ fontSize: 13, fontWeight: 700, color: 'white', background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_L})`, border: 'none', cursor: 'pointer', padding: '10px 22px', borderRadius: 12, boxShadow: `0 4px 16px ${PRIMARY}50`, transition: 'all 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px ${PRIMARY}60`; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 16px ${PRIMARY}50`; }}>
              تقديم طلب مساعدة
            </button>
            <DarkToggle dark={dark} toggle={() => setDark(!dark)} t={t} />

          </div>
        </div>
      </nav>

      {/* ══ HERO ══ */}
      <section style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden', display: 'flex', alignItems: 'center', marginTop: -68 }}>
        <img src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1800&q=85" alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}/>
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, #0A1628f5 0%, ${PRIMARY}cc 55%, ${PRIMARY_L}80 100%)` }}/>
        <Particles />
        <div style={{ position: 'absolute', top: -80, left: -80, width: 480, height: 480, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.06)', pointerEvents: 'none' }}/>
        <div style={{ position: 'absolute', top: -40, left: -40, width: 320, height: 320, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.09)', pointerEvents: 'none' }}/>
        <div style={{ position: 'absolute', bottom: 40, right: -60, width: 360, height: 360, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.05)', pointerEvents: 'none' }}/>
        <div style={{ position: 'relative', zIndex: 10, maxWidth: 1120, margin: '0 auto', padding: '130px 24px 90px', width: '100%' }}>
          <div style={{ maxWidth: 620, animation: 'fadeInUp 0.9s ease forwards' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 100, padding: '7px 18px', marginBottom: 28 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ADE80', display: 'inline-block', boxShadow: '0 0 0 3px rgba(74,222,128,0.3)' }}/>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.92)', fontWeight: 500, letterSpacing: '0.3px' }}>خدمة مجانية تماماً — نحن هنا لأجلك</span>
            </div>
            <h1 style={{ fontSize: 'clamp(44px, 6.5vw, 76px)', fontWeight: 900, color: 'white', lineHeight: 1.08, marginBottom: 22, letterSpacing: '-2px' }}>
              يداً بيد
              <span style={{ display: 'block', background: `linear-gradient(135deg, ${GOLD}, #FFE490)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>نبني مجتمعاً أفضل</span>
            </h1>
            <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.78)', lineHeight: 1.8, marginBottom: 44, maxWidth: 500 }}>
              مؤسسة غزلان الخير تمد يد العون للأسر المحتاجة في مجالات العلاج الطبي والتعليم والدعم المعيشي
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 44 }}>
              <button onClick={() => router.push('/apply')}
                style={{ height: 54, padding: '0 36px', background: 'white', color: PRIMARY, borderRadius: 14, border: 'none', fontSize: 15, fontWeight: 800, cursor: 'pointer', boxShadow: '0 10px 30px rgba(0,0,0,0.25)', transition: 'all 0.25s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 16px 40px rgba(0,0,0,0.3)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = '0 10px 30px rgba(0,0,0,0.25)'; }}>
                قدّم طلب مساعدة الآن ←
              </button>
              <button onClick={() => router.push('/track')}
                style={{ height: 54, padding: '0 30px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', color: 'white', borderRadius: 14, border: '1.5px solid rgba(255,255,255,0.25)', fontSize: 15, fontWeight: 500, cursor: 'pointer', transition: 'all 0.25s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.18)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'; }}>
                تتبع طلبي
              </button>
            </div>
          
          </div>
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
          <svg viewBox="0 0 1440 60" fill={t.bg} style={{ display: 'block' }}>
            <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z"/>
          </svg>
        </div>
      </section>

      {/* ══ STATS ══ */}
      <section style={{ background: t.bg, padding: '88px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <FadeIn style={{ textAlign: 'center', marginBottom: 52 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 16,
            background: `${PRIMARY}0F`, border: `1px solid ${PRIMARY}20`, borderRadius: 100, padding: '8px 20px' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: PRIMARY }}/>
            <span style={{ fontSize: 12, fontWeight: 700, color: PRIMARY, letterSpacing: '3px', textTransform: 'uppercase' as const }}>بالأرقام</span>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: PRIMARY }}/>
          </div>
          <h2 style={{ fontSize: 42, fontWeight: 900, color: TH, letterSpacing: '-1px', marginBottom: 12, lineHeight: 1.1 }}>
            إنجازاتنا
            <span style={{ display: 'inline-block', marginRight: 10, background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_L})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>تتحدث</span>
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
            <div style={{ width: 32, height: 3, borderRadius: 2, background: `linear-gradient(to left, ${PRIMARY}, ${PRIMARY_L})` }}/>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: GOLD }}/>
            <div style={{ width: 32, height: 3, borderRadius: 2, background: `linear-gradient(to right, ${PRIMARY}, ${PRIMARY_L})` }}/>
          </div>
          <p style={{ fontSize: 15, color: t.textMute, maxWidth: 380, margin: '0 auto', lineHeight: 1.7 }}>أرقام حقيقية تعكس حجم تأثيرنا في المجتمع</p>
        </FadeIn>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
            {[
              { target: 500, suffix: '+', label: 'أسرة استفادت',    icon: Icons.people },
              { target: 3,   suffix: '+', label: 'سنوات من العطاء', icon: Icons.shield },
              { target: 3,   suffix: '',  label: 'مجالات مساعدة',   icon: Icons.heart },
              { target: 98,  suffix: '٪', label: 'رضا المستفيدين',  icon: Icons.star },
            ].map((s, i) => <CounterStat key={i} {...s} t={t}/>)}
          </div>
        </div>
      </section>

      {/* ══ من نحن ══ */}
      <section style={{ background: t.bg2, padding: '96px 24px' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          <FadeIn>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 18,
            background: `${PRIMARY}0F`, border: `1px solid ${PRIMARY}20`, borderRadius: 100, padding: '8px 20px' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: PRIMARY }}/>
            <span style={{ fontSize: 12, fontWeight: 700, color: PRIMARY, letterSpacing: '3px', textTransform: 'uppercase' as const }}>من نحن</span>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: PRIMARY }}/>
          </div>
          <h2 style={{ fontSize: 42, fontWeight: 900, color: TH, lineHeight: 1.1, marginBottom: 10, letterSpacing: '-1px' }}>
            مؤسسة إنسانية{' '}
            <span style={{ background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_L})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              بقلب يحب الخير
            </span>
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 22 }}>
            <div style={{ width: 32, height: 3, borderRadius: 2, background: `linear-gradient(to left, ${PRIMARY}, ${PRIMARY_L})` }}/>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: GOLD }}/>
            <div style={{ width: 32, height: 3, borderRadius: 2, background: `linear-gradient(to right, ${PRIMARY}, ${PRIMARY_L})` }}/>
          </div>
          <p style={{ fontSize: 15, color: t.textSub, lineHeight: 1.85, marginBottom: 16 }}>تأسست مؤسسة غزلان الخير بهدف تقديم يد العون للأسر المحتاجة، وبناء جسر من الأمل بين المانحين والمستفيدين في المجتمع.</p>
          <p style={{ fontSize: 15, color: t.textSub, lineHeight: 1.85, marginBottom: 32 }}>نعمل بشفافية واحترافية لضمان وصول المساعدة لمن يحتاجها فعلاً، لأن كل إنسان يستحق حياة كريمة.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { title: 'رسالتنا', desc: 'تمكين الأسر من حياة كريمة', color: PRIMARY },
              { title: 'رؤيتنا', desc: 'مجتمع يدعم بعضه البعض',     color: '#059669' },
              { title: 'قيمنا',  desc: 'الشفافية والأمانة',            color: GOLD },
              { title: 'هدفنا',  desc: 'الوصول لكل محتاج',            color: PRIMARY_L },
            ].map(v => (
              <div key={v.title} style={{ padding: '14px 16px', borderRadius: 12, background: `${v.color}${dark ? '18' : '08'}`, border: `1.5px solid ${v.color}${dark ? '30' : '18'}`, transition: 'all 0.2s', cursor: 'default' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: v.color, marginBottom: 4 }}>{v.title}</div>
                <div style={{ fontSize: 12, color: t.textMute, lineHeight: 1.5 }}>{v.desc}</div>
              </div>
            ))}
          </div>
        </FadeIn>
          <FadeIn delay={0.2} style={{ position: 'relative' }}>
            <img src="https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=700&q=85" alt="فريق العمل"
              style={{ borderRadius: 24, width: '100%', height: 400, objectFit: 'cover', boxShadow: `0 32px 80px ${PRIMARY}25`, display: 'block' }}/>
            <div style={{ position: 'absolute', bottom: -18, right: -18, background: t.card, borderRadius: 16, padding: '14px 20px', boxShadow: dark ? '0 12px 40px rgba(0,0,0,0.4)' : '0 12px 40px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', gap: 12, border: `2px solid ${t.border}` }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${PRIMARY}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: PRIMARY }}>{Icons.check}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: TH }}>+٣ سنوات</div>
                <div style={{ fontSize: 11, color: t.textMute }}>من الخدمة الإنسانية</div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══ SERVICES ══ */}
      <section style={{ background: t.bg, padding: '96px 24px' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <FadeIn>
            <SectionTitle label="خدماتنا" title="مجالات المساعدة" sub="نقدم الدعم الإنساني في ثلاثة مجالات أساسية تمس حياة الإنسان اليومية" t={t}/>
          </FadeIn>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {[
              { img: 'https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=600&q=80', title: 'العلاج الطبي',  desc: 'تغطية تكاليف العمليات والأدوية والعلاج للحالات التي لا تستطيع تحمّل النفقات', color: PRIMARY,   icon: Icons.medical },
              { img: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80', title: 'التعليم',       desc: 'دعم الطلاب المحتاجين بالمستلزمات الدراسية والرسوم المدرسية وبيئة تعليم مناسبة', color: '#0F6E56', icon: Icons.education },
              { img: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&q=80', title: 'الدعم المعيشي', desc: 'مساعدة الأسر في تأمين احتياجاتها الأساسية من غذاء وسكن ومستلزمات الحياة', color: GOLD,      icon: Icons.support },
            ].map((s, i) => (
              <FadeIn key={s.title} delay={i * 0.1}>
                <div style={{ borderRadius: 20, overflow: 'hidden', border: `1px solid ${t.border}`, background: t.card, transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)', cursor: 'pointer' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 24px 64px ${s.color}25`; (e.currentTarget as HTMLElement).style.transform = 'translateY(-8px)'; (e.currentTarget as HTMLElement).style.borderColor = `${s.color}35`; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.borderColor = t.border; }}>
                  <div style={{ height: 210, overflow: 'hidden', position: 'relative' }}>
                    <img src={s.img} alt={s.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s ease' }}
                      onMouseEnter={e => (e.target as HTMLElement).style.transform = 'scale(1.08)'}
                      onMouseLeave={e => (e.target as HTMLElement).style.transform = 'scale(1)'}/>
                    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, ${s.color}65, transparent)` }}/>
                    <div style={{ position: 'absolute', bottom: 14, right: 14, width: 42, height: 42, borderRadius: 12, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>{s.icon}</div>
                  </div>
                  <div style={{ padding: '24px 26px 28px' }}>
                    <div style={{ width: 32, height: 3, borderRadius: 2, background: s.color, marginBottom: 14 }}/>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: TH, marginBottom: 10, letterSpacing: '-0.3px' }}>{s.title}</h3>
                    <p style={{ fontSize: 13, color: t.textMute, lineHeight: 1.75, marginBottom: 18 }}>{s.desc}</p>
                    <button onClick={() => router.push('/apply')}
                      style={{ fontSize: 13, fontWeight: 700, color: s.color, background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 6, transition: 'gap 0.2s' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.gap = '10px'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.gap = '6px'}>
                      تقدّم بطلب {Icons.arrow}
                    </button>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section style={{ background: t.bg2, padding: '96px 24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -80, right: -80, width: 360, height: 360, borderRadius: '50%', background: `${PRIMARY}${dark ? '08' : '04'}`, pointerEvents: 'none' }}/>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <FadeIn>
            <SectionTitle label="آلية العمل" labelColor={GOLD} title="كيف تقدم طلبك؟" sub="أربع خطوات بسيطة للحصول على المساعدة" t={t}/>
          </FadeIn>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, position: 'relative' }}>
            <div style={{ position: 'absolute', top: 33, right: '14%', left: '14%', height: 1, background: `linear-gradient(to left, transparent, ${PRIMARY}25, ${PRIMARY}25, transparent)`, pointerEvents: 'none' }}/>
            {[
              { num: '٠١', title: 'عبّي النموذج',   desc: 'أدخل بياناتك الشخصية واحتياجك بالتفصيل', color: PRIMARY, icon: Icons.form },
              { num: '٠٢', title: 'ارفع الوثائق',   desc: 'أضف المستندات الداعمة لطلبك',             color: GOLD,    icon: Icons.upload },
              { num: '٠٣', title: 'انتظر المراجعة', desc: 'يراجع فريقنا طلبك خلال ٣-٧ أيام',        color: PRIMARY, icon: Icons.review },
              { num: '٠٤', title: 'تلقّ المساعدة',  desc: 'نتواصل معك مباشرة لتقديم الدعم',          color: GOLD,    icon: Icons.gift },
            ].map((item, i) => (
              <FadeIn key={item.num} delay={i * 0.12}>
                <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                  <div style={{ width: 66, height: 66, borderRadius: 20, background: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', boxShadow: `0 10px 30px ${item.color}45`, transition: 'transform 0.3s', cursor: 'default' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.12) rotate(-5deg)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; }}>
                    {item.icon}
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 800, color: item.color, letterSpacing: '1.5px', marginBottom: 6 }}>{item.num}</div>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: TH, marginBottom: 8, letterSpacing: '-0.2px' }}>{item.title}</h3>
                  <p style={{ fontSize: 12.5, color: t.textMute, lineHeight: 1.7 }}>{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
          <FadeIn style={{ textAlign: 'center', marginTop: 52 }}>
            <button onClick={() => router.push('/apply')}
              style={{ height: 52, padding: '0 40px', background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_L})`, color: 'white', borderRadius: 14, border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: `0 8px 28px ${PRIMARY}40`, transition: 'all 0.25s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = `0 14px 36px ${PRIMARY}50`; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 28px ${PRIMARY}40`; }}>
              ابدأ الآن — قدّم طلبك مجاناً
            </button>
          </FadeIn>
        </div>
      </section>

      {/* ══ TESTIMONIALS ══ */}
      <section style={{ background: t.bg, padding: '96px 24px' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <FadeIn>
            <SectionTitle label="قصص نجاح" labelColor={GOLD} title="ماذا يقول المستفيدون؟" sub="قصص حقيقية من أسر استفادت من دعم المؤسسة" t={t}/>
          </FadeIn>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 22 }}>
            {[
              { text: 'ساعدتنا المؤسسة في تغطية تكاليف عملية ابني، لا أجد كلمات تعبر عن امتناني لهذا الفريق الرائع.', name: 'أم محمد', region: 'حلب',  type: 'علاج طبي',  color: PRIMARY },
              { text: 'بفضل دعم المؤسسة تمكنت ابنتي من إكمال دراستها والحصول على شهادتها، شكراً لكل من ساهم.', name: 'أبو سارة', region: 'إدلب', type: 'تعليم',     color: '#0F6E56' },
              { text: 'في أصعب الظروف وجدنا يداً حانية تمدّ لنا العون، المؤسسة كانت نعمة حقيقية لأسرتنا.',     name: 'أم عمر',  region: 'درعا', type: 'دعم معيشي', color: GOLD },
            ].map((t2, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div style={{
                    padding: '30px', borderRadius: 20, background: t.card,
                    borderTop: `3px solid ${t2.color}`,
                    borderRight: `1px solid ${t.border}`,
                    borderBottom: `1px solid ${t.border}`,
                    borderLeft: `1px solid ${t.border}`,
                    transition: 'all 0.3s', cursor: 'default',
                  }}
                    onMouseEnter={e => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.boxShadow = `0 20px 60px ${t2.color}18`;
                      el.style.transform = 'translateY(-4px)';
                      el.style.borderRightColor = `${t2.color}30`;
                      el.style.borderBottomColor = `${t2.color}30`;
                      el.style.borderLeftColor = `${t2.color}30`;
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.boxShadow = 'none';
                      el.style.transform = 'none';
                      el.style.borderRightColor = t.border;
                      el.style.borderBottomColor = t.border;
                      el.style.borderLeftColor = t.border;
                    }}>
                  <div style={{ fontSize: 56, lineHeight: 1, color: `${t2.color}20`, fontFamily: 'Georgia, serif', marginBottom: 14, marginTop: -6 }}>"</div>
                  <p style={{ fontSize: 14, color: t.textSub, lineHeight: 1.85, marginBottom: 22, fontStyle: 'italic' }}>{t2.text}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 42, height: 42, borderRadius: '50%', background: `linear-gradient(135deg, ${t2.color}, ${t2.color}70)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 16, fontWeight: 800, flexShrink: 0 }}>{t2.name.charAt(0)}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: TH }}>{t2.name}</div>
                      <div style={{ fontSize: 11, color: t.textMute }}>{t2.region}</div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: t2.color, background: `${t2.color}12`, padding: '4px 10px', borderRadius: 8 }}>{t2.type}</span>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PARTNERS ══ */}
      <section style={{ background: t.bg2, padding: '72px 24px' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <FadeIn>
            <SectionTitle label="شركاؤنا" title="داعمونا وشركاؤنا" sub="نفخر بشراكتنا مع جهات تشاركنا قيم العطاء والإنسانية" t={t}/>
          </FadeIn>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {[
              { name: 'منظمة الأمم المتحدة', abbr: 'UN', color: PRIMARY },
              { name: 'الهلال الأحمر',       abbr: 'RC', color: '#DC2626' },
              { name: 'منظمة إنسانية دولية', abbr: 'IO', color: '#059669' },
              { name: 'جهة داعمة محلية',     abbr: 'LD', color: GOLD },
            ].map((p, i) => (
              <FadeIn key={p.name} delay={i * 0.08}>
                <div style={{ background: t.card, borderRadius: 16, padding: '28px 20px', textAlign: 'center', border: `1px solid ${t.border}`, transition: 'all 0.25s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 12px 36px ${p.color}20`; (e.currentTarget as HTMLElement).style.borderColor = `${p.color}30`; (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; (e.currentTarget as HTMLElement).style.borderColor = t.border; (e.currentTarget as HTMLElement).style.transform = 'none'; }}>
                  <div style={{ width: 54, height: 54, borderRadius: 14, background: `${p.color}${dark ? '20' : '0F'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: 16, fontWeight: 900, color: p.color, border: `1.5px solid ${p.color}25` }}>{p.abbr}</div>
                  <div style={{ fontSize: 12, color: t.textMute, fontWeight: 600 }}>{p.name}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <section style={{ background: t.bg, padding: '96px 24px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <FadeIn>
            <SectionTitle label="الأسئلة الشائعة" title="أسئلة شائعة" sub="إجابات على أكثر الأسئلة شيوعاً" t={t}/>
          </FadeIn>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { q: 'من يحق له تقديم طلب مساعدة؟',  a: 'كل أسرة أو فرد يعيش ظروفاً صعبة في أي محافظة سورية، بصرف النظر عن الجنس أو العمر.' },
              { q: 'كم يستغرق البت في الطلب؟',      a: 'يراجع فريقنا كل طلب خلال ٣-٧ أيام عمل، وقد تختلف المدة حسب اكتمال الوثائق.' },
              { q: 'ما الوثائق المطلوبة مع الطلب؟', a: 'صورة هوية، وثائق تثبت الحاجة كالتقرير الطبي أو وضع السكن، وأي مستندات داعمة أخرى.' },
              { q: 'هل يمكن تقديم أكثر من طلب؟',    a: 'يمكن تقديم طلب واحد لكل نوع مساعدة. بعد البت في الطلب الحالي يمكن تقديم طلب جديد.' },
              { q: 'كيف أعرف حالة طلبي؟',           a: 'يمكنك تتبع طلبك في أي وقت من خلال صفحة التتبع برقم المرجع أو رقم هاتفك.' },
            ].map((faq, i) => (
              <FadeIn key={i} delay={i * 0.04}>
                <details style={{ borderRadius: 14, border: `1px solid ${t.border}`, background: t.card, overflow: 'hidden', transition: 'all 0.2s' }}>
                  <summary style={{ padding: '18px 22px', cursor: 'pointer', fontWeight: 700, fontSize: 14, color: TH, display: 'flex', alignItems: 'center', justifyContent: 'space-between', listStyle: 'none', userSelect: 'none', transition: 'background 0.2s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = t.bg2}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                    {faq.q}
                    <span style={{ color: t.textMute, flexShrink: 0, marginRight: 12 }}>{Icons.chevron}</span>
                  </summary>
                  <div style={{ padding: '8px 22px 18px', fontSize: 14, color: t.textSub, lineHeight: 1.8, borderTop: `1px solid ${t.border}` }}>
                    {faq.a}
                  </div>
                </details>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CONTACT ══ */}
      <section style={{ background: t.bg2, padding: '96px 24px' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <FadeIn>
            <SectionTitle label="تواصل معنا" title="نحن هنا لمساعدتك" sub="تواصل معنا عبر أي قناة تناسبك" t={t}/>
          </FadeIn>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {[
              { title: 'واتساب',             desc: 'تواصل معنا مباشرة', value: '+963 XX XXX XXXX', color: '#25D366', icon: Icons.phone },
              { title: 'البريد الإلكتروني', desc: 'أرسل لنا استفسارك', value: 'info@ghozlan.org',  color: PRIMARY,   icon: Icons.mail },
              { title: 'ساعات العمل',        desc: 'أحد — خميس',        value: '٩ ص — ٤ م',        color: GOLD,      icon: Icons.clock },
            ].map((c, i) => (
              <FadeIn key={c.title} delay={i * 0.1}>
                <div style={{ background: t.card, borderRadius: 20, padding: '36px 28px', textAlign: 'center', border: `1px solid ${t.border}`, transition: 'all 0.3s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 16px 48px ${c.color}20`; (e.currentTarget as HTMLElement).style.borderColor = `${c.color}30`; (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; (e.currentTarget as HTMLElement).style.borderColor = t.border; (e.currentTarget as HTMLElement).style.transform = 'none'; }}>
                  <div style={{ width: 54, height: 54, borderRadius: 14, background: `${c.color}${dark ? '20' : '10'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', color: c.color }}>{c.icon}</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: TH, marginBottom: 5, letterSpacing: '-0.2px' }}>{c.title}</div>
                  <div style={{ fontSize: 12, color: t.textMute, marginBottom: 12 }}>{c.desc}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: c.color }}>{c.value}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '96px 24px' }}>
        <img src="https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=1600&q=80" alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}/>
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, #0A1628f5, ${PRIMARY}d5)` }}/>
        <Particles />
        <FadeIn style={{ position: 'relative', zIndex: 10, maxWidth: 560, margin: '0 auto', textAlign: 'center', color: 'white' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 100, padding: '6px 18px', marginBottom: 22 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ADE80', display: 'inline-block' }}/>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>نستقبل الطلبات الآن</span>
          </div>
          <h2 style={{ fontSize: 44, fontWeight: 900, marginBottom: 8, letterSpacing: '-1px', lineHeight: 1.1 }}>هل تحتاج إلى مساعدة؟</h2>
          <div style={{ width: 48, height: 4, borderRadius: 2, background: `linear-gradient(to left, ${GOLD}, #FFE490)`, margin: '0 auto 20px' }}/>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.72)', marginBottom: 40, lineHeight: 1.75 }}>لا تتردد في التقديم — فريقنا يراجع كل طلب بعناية واهتمام بالغ</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => router.push('/apply')}
              style={{ height: 54, padding: '0 40px', background: 'white', color: PRIMARY, borderRadius: 14, border: 'none', fontSize: 15, fontWeight: 800, cursor: 'pointer', boxShadow: '0 10px 32px rgba(0,0,0,0.25)', transition: 'all 0.25s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 18px 48px rgba(0,0,0,0.35)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = '0 10px 32px rgba(0,0,0,0.25)'; }}>
              قدّم طلبك الآن ←
            </button>
            <button onClick={() => router.push('/track')}
              style={{ height: 54, padding: '0 30px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', color: 'white', borderRadius: 14, border: '1.5px solid rgba(255,255,255,0.25)', fontSize: 15, fontWeight: 500, cursor: 'pointer', transition: 'all 0.25s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.18)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'; }}>
              تتبع طلبك
            </button>
          </div>
        </FadeIn>
      </section>

      {/* ══ FOOTER ══ */}
      <footer style={{ background: t.footerBg, padding: '72px 24px 36px' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 56, marginBottom: 52 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_L})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: 20 }}>غ</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: 'white' }}>مؤسسة غزلان الخير</div>
                  <div style={{ fontSize: 10, color: PRIMARY_L, letterSpacing: '0.5px' }}>Ghozlan Alkhair Foundation</div>
                </div>
              </div>
              <p style={{ fontSize: 13, color: t.footerText, lineHeight: 1.85, maxWidth: 280 }}>منظمة إنسانية تهدف إلى تقديم الدعم للأسر المحتاجة وبناء مجتمع متماسك قائم على التكافل والمحبة.</p>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, color: '#6B7280', marginBottom: 20, letterSpacing: '2px', textTransform: 'uppercase' as const }}>الخدمات</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[{ label: 'تقديم طلب مساعدة', path: '/apply' }, { label: 'تتبع طلب', path: '/track' }].map(l => (
                  <button key={l.label} onClick={() => router.push(l.path)}
                    style={{ fontSize: 13, color: '#4B5563', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'right', padding: 0, transition: 'color 0.15s' }}
                    onMouseEnter={e => (e.target as HTMLElement).style.color = 'white'}
                    onMouseLeave={e => (e.target as HTMLElement).style.color = '#4B5563'}>
                    {l.label}
                  </button>
                ))}
                <button onClick={() => router.push('/dashboard/login')}
                  style={{ fontSize: 12, color: PRIMARY_L, background: `${PRIMARY_L}12`, border: `1px solid ${PRIMARY_L}30`, borderRadius: 8, padding: '7px 14px', cursor: 'pointer', width: 'fit-content', transition: 'all 0.2s' }}
                  onMouseEnter={e => { (e.target as HTMLElement).style.background = `${PRIMARY_L}22`; }}
                  onMouseLeave={e => { (e.target as HTMLElement).style.background = `${PRIMARY_L}12`; }}>
                  بوابة الموظفين
                </button>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, color: '#6B7280', marginBottom: 20, letterSpacing: '2px', textTransform: 'uppercase' as const }}>التواصل</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { icon: Icons.mail,  text: 'info@ghozlan.org' },
                  { icon: Icons.phone, text: 'واتساب متاح' },
                  { icon: Icons.clock, text: 'أحد — خميس، ٩ص — ٤م' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#4B5563' }}>
                    <span style={{ color: '#374151' }}>{item.icon}</span>
                    {item.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ fontSize: 12, color: '#374151' }}>© ٢٠٢٦ مؤسسة غزلان الخير — جميع الحقوق محفوظة</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <p style={{ fontSize: 12, color: '#2D3748' }}>Ghozlan Alkhair Foundation</p>
              <button onClick={() => setDark(!dark)}
                style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280', transition: 'all 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'white'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.25)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#6B7280'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)'; }}>
                {dark ? Icons.sun : Icons.moon}
              </button>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        details summary::-webkit-details-marker { display: none; }
      `}</style>
    </div>
  );
}