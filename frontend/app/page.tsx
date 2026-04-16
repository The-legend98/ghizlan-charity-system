'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, Variants } from 'framer-motion';
import { useTheme } from '@/app/providers/ThemeProvider';
import { useLang } from '@/app/providers/LangProvider';
import Navbar from '@/components/Navbar';

const THEMES = {
  light: {
    bg: '#FFFFFF', bg2: '#F8FAFD', text: '#0A1628', textSub: '#4B5563',
    textMute: '#6B7280', border: '#EFF2F7', card: '#FFFFFF',
    footerBg: '#0A1628', footerText: '#4B5563',
  },
  dark: {
    bg: '#0D1117', bg2: '#161B22', text: '#F0F6FC', textSub: '#8B949E',
    textMute: '#6E7681', border: '#21262D', card: '#161B22',
    footerBg: '#010409', footerText: '#6E7681',
  },
};

const PRIMARY   = '#1B6CA8';
const PRIMARY_L = '#4AACCD';
const GOLD      = '#C9A84C';

// ── Animation Variants ──
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};

const fadeLeft: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};
// ── useInView hook ──
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    obs.observe(el); return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// ── Counter ──
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

// ── Scroll Progress Bar ──
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  return (
    <motion.div
      style={{
        scaleX, transformOrigin: 'left',
        position: 'fixed', top: 0, left: 0, right: 0,
        height: 3, zIndex: 999,
        background: `linear-gradient(to right, ${PRIMARY}, ${PRIMARY_L}, ${GOLD})`,
      }}
    />
  );
}

// ── Animated Section ──
function AnimSection({ children, className = '', style: extraStyle = {}, delay = 0, direction = 'up' }: {
  children: React.ReactNode; className?: string; style?: React.CSSProperties; delay?: number; direction?: 'up' | 'left' | 'scale';
}) {
  const variant = direction === 'left' ? fadeLeft : direction === 'scale' ? scaleIn : fadeUp;
  return (
    <motion.div
      className={className}
      style={extraStyle}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      transition={{ delay }}   
      variants={variant}
    >
      {children}
    </motion.div>
  );
}

// ── Counter Stat ──
function CounterStat({ target, suffix = '', label, icon, t }: {
  target: number; suffix?: string; label: string; icon: React.ReactNode; t: typeof THEMES.light;
}) {
  const { ref, inView } = useInView(0.3);
  const count = useCounter(target, inView);
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -8, scale: 1.03, boxShadow: `0 24px 60px ${PRIMARY}25` }}
      style={{
        textAlign: 'center', padding: '32px 20px', borderRadius: 20,
        background: t.card, border: `1px solid ${t.border}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        transition: 'border-color 0.3s',
        cursor: 'default',
      }}
    >
      <div style={{ width: 56, height: 56, borderRadius: 16, background: `${PRIMARY}12`, color: PRIMARY, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>{icon}</div>
      <div style={{ fontSize: 40, fontWeight: 900, color: PRIMARY, letterSpacing: '-2px', lineHeight: 1, marginBottom: 8 }}>{count}{suffix}</div>
      <div style={{ fontSize: 13, color: t.textMute, fontWeight: 500 }}>{label}</div>
    </motion.div>
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
  chevron:   <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
  sun:       <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  moon:      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>,
};

// ── Particles ──
function Particles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight;
    const particles: { x: number; y: number; r: number; dx: number; dy: number; o: number }[] = [];
    for (let i = 0; i < 45; i++) particles.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, r: Math.random() * 2 + 0.5, dx: (Math.random() - 0.5) * 0.3, dy: (Math.random() - 0.5) * 0.3, o: Math.random() * 0.35 + 0.1 });
    let frame: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fillStyle = `rgba(255,255,255,${p.o})`; ctx.fill(); p.x += p.dx; p.y += p.dy; if (p.x < 0 || p.x > canvas.width) p.dx *= -1; if (p.y < 0 || p.y > canvas.height) p.dy *= -1; });
      frame = requestAnimationFrame(draw);
    };
    draw(); return () => cancelAnimationFrame(frame);
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}/>;
}

// ── Section Title ──
function SectionTitle({ label, labelColor = PRIMARY, title, titleGradient, sub, t }: {
  label: string; labelColor?: string; title: string; titleGradient?: string; sub?: string; t: typeof THEMES.light;
}) {
  return (
    <AnimSection style={{ textAlign: 'center', marginBottom: 52 }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 16, background: `${labelColor}0F`, border: `1px solid ${labelColor}20`, borderRadius: 100, padding: '8px 20px' }}
      >
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: labelColor }}/>
        <span style={{ fontSize: 12, fontWeight: 700, color: labelColor, letterSpacing: '3px', textTransform: 'uppercase' as const }}>{label}</span>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: labelColor }}/>
      </motion.div>
      <h2 className="section-h2" style={{ fontSize: 42, fontWeight: 900, color: t.text, letterSpacing: '-1px', marginBottom: 12, lineHeight: 1.1 }}>
        {titleGradient
          ? <>{title}{' '}<span style={{ background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_L})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{titleGradient}</span></>
          : title}
      </h2>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: sub ? 16 : 0 }}>
        <div style={{ width: 32, height: 3, borderRadius: 2, background: `linear-gradient(to left, ${labelColor}, ${labelColor}60)` }}/>
        <motion.div
          animate={{ scale: [1, 1.4, 1] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          style={{ width: 8, height: 8, borderRadius: '50%', background: GOLD }}
        />
        <div style={{ width: 32, height: 3, borderRadius: 2, background: `linear-gradient(to right, ${labelColor}, ${labelColor}60)` }}/>
      </div>
      {sub && <p style={{ fontSize: 15, color: t.textMute, maxWidth: 440, margin: '12px auto 0', lineHeight: 1.75 }}>{sub}</p>}
    </AnimSection>
  );
}

export default function HomePage() {
  const router = useRouter();
  const { dark, toggle } = useTheme();
  const { lang, t: lx, dir } = useLang();
  const t = dark ? THEMES.dark : THEMES.light;
  const TH = t.text;

  // Parallax for hero image
  const heroRef = useRef<HTMLElement>(null);
  const { scrollY } = useScroll();
  const heroImgY = useTransform(scrollY, [0, 600], [0, 120]);

  return (
    <div dir={dir} style={{ background: t.bg, minHeight: '100vh', transition: 'background 0.3s' }}>

      {/* ── Scroll Progress ── */}
      <ScrollProgress />

      {/* ── NAVBAR ── */}
      <Navbar />

      {/* ══ HERO ══ */}
      <section ref={heroRef} style={{ position: 'relative', height: '100vh', minHeight: 'calc(100vh - 68px)', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
        {/* Parallax Image */}
        <motion.img
          src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1800&q=85"
          alt=""
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '110%',
            objectFit: 'cover', objectPosition: 'center 30%',
            y: heroImgY,
          }}
        />
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to bottom, rgba(5,15,35,0.88) 0%, rgba(5,15,35,0.55) 25%, rgba(5,15,35,0.3) 50%, transparent 70%), linear-gradient(135deg, rgba(10,22,40,0.9) 0%, ${PRIMARY}bb 55%, ${PRIMARY_L}70 100%)` }}/>
        <Particles />

        <div className="hero-content" style={{ position: 'relative', zIndex: 10, maxWidth: 1120, margin: '0 auto', padding: '80px 24px', width: '100%' }}>
          <div style={{ maxWidth: 620 }}>

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.22)', borderRadius: 100, padding: '7px 18px', marginBottom: 28 }}
            >
              <motion.span
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ADE80', display: 'inline-block', boxShadow: '0 0 0 3px rgba(74,222,128,0.3)' }}
              />
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.95)', fontWeight: 500 }}>{lx.home.hero_badge}</span>
            </motion.div>

            {/* Title */}
            <motion.h1
              className="hero-title"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              style={{ fontSize: 'clamp(38px, 6vw, 76px)', fontWeight: 900, color: 'white', lineHeight: 1.3, marginBottom: 22, letterSpacing: '-2px', textShadow: '0 2px 20px rgba(0,0,0,0.4)' }}
            >
              {lx.home.hero_title_1}
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                style={{ display: 'block', background: `linear-gradient(135deg, ${GOLD}, #FFE490)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' ,paddingBottom: '8px' }}
              >
                {lx.home.hero_title_2}
              </motion.span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.7 }}
              style={{ fontSize: 16, color: 'rgba(255,255,255,0.85)', lineHeight: 1.8, marginBottom: 40, maxWidth: 500, textShadow: '0 1px 8px rgba(0,0,0,0.3)' }}
            >
              {lx.home.hero_sub}
            </motion.p>

            {/* Buttons */}
            <motion.div
              className="hero-buttons"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.9 }}
              style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 44 }}
            >
              <motion.button
                whileHover={{ scale: 1.04, boxShadow: '0 16px 40px rgba(0,0,0,0.4)' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => router.push('/apply')}
                style={{ height: 52, padding: '0 32px', background: 'white', color: PRIMARY, borderRadius: 14, border: 'none', fontSize: 15, fontWeight: 800, cursor: 'pointer', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}
              >
                {lx.home.apply_btn}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.04, background: 'rgba(255,255,255,0.2)' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => router.push('/track')}
                style={{ height: 52, padding: '0 28px', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)', color: 'white', borderRadius: 14, border: '1.5px solid rgba(255,255,255,0.3)', fontSize: 15, fontWeight: 500, cursor: 'pointer' }}
              >
                {lx.home.track_btn}
              </motion.button>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ position: 'absolute', bottom: 80, left: '50%', transform: 'translateX(-50%)', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}
        >
          <div style={{ width: 24, height: 40, borderRadius: 12, border: '2px solid rgba(255,255,255,0.4)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '6px 0' }}>
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{ width: 4, height: 8, borderRadius: 2, background: 'rgba(255,255,255,0.7)' }}
            />
          </div>
        </motion.div>

        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
          <svg viewBox="0 0 1440 60" fill={t.bg} style={{ display: 'block' }}>
            <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z"/>
          </svg>
        </div>
      </section>

      {/* ══ STATS ══ */}
      <section style={{ background: t.bg, padding: '72px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <AnimSection style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 16, background: `${PRIMARY}0F`, border: `1px solid ${PRIMARY}20`, borderRadius: 100, padding: '8px 20px' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: PRIMARY }}/>
              <span style={{ fontSize: 12, fontWeight: 700, color: PRIMARY, letterSpacing: '3px', textTransform: 'uppercase' as const }}>{lang === 'ar' ? 'بالأرقام' : 'In Numbers'}</span>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: PRIMARY }}/>
            </div>
            <h2 className="section-h2" style={{ fontSize: 42, fontWeight: 900, color: TH, letterSpacing: '-1px', marginBottom: 12, lineHeight: 1.1 }}>
              {lang === 'ar' ? <>إنجازاتنا <span style={{ background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_L})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>تتحدث</span></> : <>Our <span style={{ background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_L})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Impact</span></>}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ width: 32, height: 3, borderRadius: 2, background: `linear-gradient(to left, ${PRIMARY}, ${PRIMARY_L})` }}/>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: GOLD }}/>
              <div style={{ width: 32, height: 3, borderRadius: 2, background: `linear-gradient(to right, ${PRIMARY}, ${PRIMARY_L})` }}/>
            </div>
            <p style={{ fontSize: 15, color: t.textMute, maxWidth: 380, margin: '0 auto', lineHeight: 1.7 }}>
              {lang === 'ar' ? 'أرقام حقيقية تعكس حجم تأثيرنا في المجتمع' : 'Real numbers reflecting our community impact'}
            </p>
          </AnimSection>
          <motion.div
            className="stats-grid"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              { target: 500, suffix: '+', label: lx.home.stats_families,   icon: Icons.people },
              { target: 3,   suffix: '+', label: lx.home.stats_years,      icon: Icons.shield },
              { target: 1200,   suffix: '',  label: lx.home.stats_requests,   icon: Icons.heart },
              { target: 150,  suffix: '٪', label: lx.home.stats_volunteers, icon: Icons.star },
            ].map((s, i) => <CounterStat key={i} {...s} t={t}/>)}
          </motion.div>
        </div>
      </section>

      {/* ══ من نحن ══ */}
      <section style={{ background: t.bg2, padding: '80px 24px' }}>
        <div className="about-grid" style={{ maxWidth: 1120, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          <AnimSection>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 18, background: `${PRIMARY}0F`, border: `1px solid ${PRIMARY}20`, borderRadius: 100, padding: '8px 20px' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: PRIMARY }}/>
              <span style={{ fontSize: 12, fontWeight: 700, color: PRIMARY, letterSpacing: '3px', textTransform: 'uppercase' as const }}>{lang === 'ar' ? 'من نحن' : 'About Us'}</span>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: PRIMARY }}/>
            </div>
            <h2 className="section-h2" style={{ fontSize: 42, fontWeight: 900, color: TH, lineHeight: 1.1, marginBottom: 10, letterSpacing: '-1px' }}>
              {lang === 'ar' ? <>مؤسسة إنسانية{' '}<span style={{ background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_L})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>بقلب يحب الخير</span></> : <>A Foundation with a <span style={{ background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_L})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Heart of Gold</span></>}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 22 }}>
              <div style={{ width: 32, height: 3, borderRadius: 2, background: `linear-gradient(to left, ${PRIMARY}, ${PRIMARY_L})` }}/>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: GOLD }}/>
              <div style={{ width: 32, height: 3, borderRadius: 2, background: `linear-gradient(to right, ${PRIMARY}, ${PRIMARY_L})` }}/>
            </div>
            <p style={{ fontSize: 15, color: t.textSub, lineHeight: 1.85, marginBottom: 16 }}>
              {lang === 'ar' ? 'تأسست مؤسسة غزلان الخير بهدف تقديم يد العون للأسر المحتاجة، وبناء جسر من الأمل بين المانحين والمستفيدين في المجتمع.' : 'Ghozlan Alkhair Foundation was established to extend a helping hand to families in need, building a bridge of hope between donors and beneficiaries in the community.'}
            </p>
            <p style={{ fontSize: 15, color: t.textSub, lineHeight: 1.85, marginBottom: 32 }}>
              {lang === 'ar' ? 'نعمل بشفافية واحترافية لضمان وصول المساعدة لمن يحتاجها فعلاً، لأن كل إنسان يستحق حياة كريمة.' : 'We work with transparency and professionalism to ensure assistance reaches those who truly need it, because every person deserves a dignified life.'}
            </p>
            <div className="about-values" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { title: lang === 'ar' ? 'رسالتنا' : 'Mission', desc: lang === 'ar' ? 'تمكين الأسر من حياة كريمة' : 'Empowering families to live with dignity', color: PRIMARY },
                { title: lang === 'ar' ? 'رؤيتنا' : 'Vision',  desc: lang === 'ar' ? 'مجتمع يدعم بعضه البعض' : 'A community that supports each other', color: '#059669' },
                { title: lang === 'ar' ? 'قيمنا'  : 'Values',  desc: lang === 'ar' ? 'الشفافية والأمانة' : 'Transparency and integrity', color: GOLD },
                { title: lang === 'ar' ? 'هدفنا'  : 'Goal',    desc: lang === 'ar' ? 'الوصول لكل محتاج' : 'Reaching every person in need', color: PRIMARY_L },
              ].map((v, i) => (
                <motion.div
                  key={v.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  whileHover={{ scale: 1.03, y: -3 }}
                  style={{ padding: '14px 16px', borderRadius: 12, background: `${v.color}${dark ? '18' : '08'}`, border: `1.5px solid ${v.color}${dark ? '30' : '18'}`, cursor: 'default' }}
                >
                  <div style={{ fontSize: 13, fontWeight: 800, color: v.color, marginBottom: 4 }}>{v.title}</div>
                  <div style={{ fontSize: 12, color: t.textMute, lineHeight: 1.5 }}>{v.desc}</div>
                </motion.div>
              ))}
            </div>
          </AnimSection>
          <AnimSection delay={0.2} direction="left" className="about-img" style={{ position: 'relative' }}>
            <motion.img
              src="https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=700&q=85"
              alt="فريق العمل"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.4 }}
              style={{ borderRadius: 24, width: '100%', height: 400, objectFit: 'cover', boxShadow: `0 32px 80px ${PRIMARY}25`, display: 'block' }}
            />
            <motion.div
              initial={{ opacity: 0, x: 20, y: 20 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.6 }}
              style={{ position: 'absolute', bottom: -18, right: -18, background: t.card, borderRadius: 16, padding: '14px 20px', boxShadow: '0 12px 40px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', gap: 12, border: `2px solid ${t.border}` }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${PRIMARY}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: PRIMARY }}>{Icons.check}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: TH }}>{lang === 'ar' ? '+٣ سنوات' : '+3 Years'}</div>
                <div style={{ fontSize: 11, color: t.textMute }}>{lang === 'ar' ? 'من الخدمة الإنسانية' : 'of Humanitarian Service'}</div>
              </div>
            </motion.div>
          </AnimSection>
        </div>
      </section>

      {/* ══ SERVICES ══ */}
      <section style={{ background: t.bg, padding: '80px 24px' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <SectionTitle
            label={lang === 'ar' ? 'خدماتنا' : 'Our Services'}
            title={lang === 'ar' ? 'مجالات المساعدة' : 'Areas of Assistance'}
            sub={lang === 'ar' ? 'نقدم الدعم الإنساني في ثلاثة مجالات أساسية' : 'We provide humanitarian support in three key areas'}
            t={t}
          />
          <div className="services-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {[
             { img: 'https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=600&q=80', title: lx.home.service_medical_title, desc: lx.home.service_medical_desc, color: PRIMARY, icon: Icons.medical },
             { img: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80', title: lx.home.service_edu_title,     desc: lx.home.service_edu_desc,     color: '#0F6E56', icon: Icons.education },
             { img: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&q=80', title: lx.home.service_fin_title,     desc: lx.home.service_fin_desc,     color: GOLD,    icon: Icons.support },].map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                whileHover={{ y: -8, boxShadow: `0 24px 60px ${s.color}20` }}
                style={{ borderRadius: 20, overflow: 'hidden', border: `1px solid ${t.border}`, background: t.card }}
              >
                <div style={{ height: 200, overflow: 'hidden', position: 'relative' }}>
                  <motion.img
                    src={s.img} alt={s.title}
                    whileHover={{ scale: 1.08 }}
                    transition={{ duration: 0.5 }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, ${s.color}65, transparent)` }}/>
                  <div style={{ position: 'absolute', bottom: 14, right: 14, width: 42, height: 42, borderRadius: 12, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>{s.icon}</div>
                </div>
                <div style={{ padding: '22px 24px 26px' }}>
                  <div style={{ width: 32, height: 3, borderRadius: 2, background: s.color, marginBottom: 12 }}/>
                  <h3 style={{ fontSize: 17, fontWeight: 800, color: TH, marginBottom: 8 }}>{s.title}</h3>
                  <p style={{ fontSize: 13, color: t.textMute, lineHeight: 1.75, marginBottom: 16 }}>{s.desc}</p>
                  <motion.button
                    whileHover={{ gap: 10 }}
                    onClick={() => router.push('/apply')}
                    style={{ fontSize: 13, fontWeight: 700, color: s.color, background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    {lang === 'ar' ? 'تقدّم بطلب' : 'Apply Now'} {Icons.arrow}
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section style={{ background: t.bg2, padding: '80px 24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <SectionTitle
            label={lang === 'ar' ? 'آلية العمل' : 'How It Works'}
            labelColor={GOLD}
            title={lang === 'ar' ? 'كيف تقدم طلبك؟' : 'How to Apply?'}
            sub={lang === 'ar' ? 'أربع خطوات بسيطة للحصول على المساعدة' : 'Four simple steps to get assistance'}
            t={t}
          />
          <div className="steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, position: 'relative' }}>
            <div className="steps-line" style={{ position: 'absolute', top: 33, right: '14%', left: '14%', height: 1, background: `linear-gradient(to left, transparent, ${PRIMARY}25, transparent)`, pointerEvents: 'none' }}/>
            {[
              { num: '01', title: lx.home.step1_title, desc: lx.home.step1_desc, color: PRIMARY, icon: Icons.form },
              { num: '02', title: lx.home.step2_title, desc: lx.home.step2_desc, color: GOLD,    icon: Icons.upload },
              { num: '03', title: lx.home.step3_title, desc: lx.home.step3_desc, color: PRIMARY, icon: Icons.review },
              { num: '04', title: lx.home.step4_title, desc: lx.home.step4_desc, color: GOLD,    icon: Icons.gift },    
               ].map((item, i) => (
              <motion.div
                key={item.num}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  style={{ width: 66, height: 66, borderRadius: 20, background: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', boxShadow: `0 10px 30px ${item.color}45` }}
                >
                  {item.icon}
                </motion.div>
                <div style={{ fontSize: 20, fontWeight: 800, color: item.color, letterSpacing: '1.5px', marginBottom: 6 ,fontFamily: 'sans-serif' }}>{item.num}</div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: TH, marginBottom: 8 }}>{item.title}</h3>
                <p style={{ fontSize: 12.5, color: t.textMute, lineHeight: 1.7 }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
          <AnimSection style={{ textAlign: 'center', marginTop: 48 }}>
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: `0 14px 40px ${PRIMARY}55` }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push('/apply')}
              style={{ height: 52, padding: '0 40px', background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_L})`, color: 'white', borderRadius: 14, border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: `0 8px 28px ${PRIMARY}40` }}
            >
              {lang === 'ar' ? 'ابدأ الآن — قدّم طلبك مجاناً' : 'Start Now — Apply for Free'}
            </motion.button>
          </AnimSection>
        </div>
      </section>

      {/* ══ TESTIMONIALS ══ */}
      <section style={{ background: t.bg, padding: '80px 24px' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <SectionTitle
            label={lang === 'ar' ? 'قصص نجاح' : 'Success Stories'}
            labelColor={GOLD}
            title={lang === 'ar' ? 'ماذا يقول المستفيدون؟' : 'What Beneficiaries Say'}
            sub={lang === 'ar' ? 'قصص حقيقية من أسر استفادت من دعم المؤسسة' : 'Real stories from families who benefited from foundation support'}
            t={t}
          />
          <div className="testimonials-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 22 }}>
            {[
              { text: lang === 'ar' ? 'ساعدتنا المؤسسة في تغطية تكاليف عملية ابني، لا أجد كلمات تعبر عن امتناني لهذا الفريق الرائع.' : 'The foundation helped us cover my son\'s surgery costs. I cannot find words to express my gratitude to this wonderful team.', name: lang === 'ar' ? 'أم محمد' : 'Um Mohammad', region: lang === 'ar' ? 'حلب' : 'Aleppo', type: lang === 'ar' ? 'علاج طبي' : 'Medical', color: PRIMARY },
              { text: lang === 'ar' ? 'بفضل دعم المؤسسة تمكنت ابنتي من إكمال دراستها والحصول على شهادتها، شكراً لكل من ساهم.' : 'Thanks to the foundation\'s support, my daughter was able to complete her studies and get her degree.', name: lang === 'ar' ? 'أبو سارة' : 'Abu Sara', region: lang === 'ar' ? 'إدلب' : 'Idlib', type: lang === 'ar' ? 'تعليم' : 'Education', color: '#0F6E56' },
              { text: lang === 'ar' ? 'في أصعب الظروف وجدنا يداً حانية تمدّ لنا العون، المؤسسة كانت نعمة حقيقية لأسرتنا.' : 'In the hardest times we found a caring hand extending help to us. The foundation was a true blessing for our family.', name: lang === 'ar' ? 'أم عمر' : 'Um Omar', region: lang === 'ar' ? 'درعا' : 'Daraa', type: lang === 'ar' ? 'دعم معيشي' : 'Financial', color: GOLD },
            ].map((t2, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                whileHover={{ y: -6, boxShadow: `0 20px 50px ${t2.color}18` }}
                style={{ padding: '28px', borderRadius: 20, background: t.card, borderTop: `3px solid ${t2.color}`, border: `1px solid ${t.border}`, cursor: 'default' }}
              >
                <div style={{ fontSize: 52, lineHeight: 1, color: `${t2.color}20`, fontFamily: 'Georgia,serif', marginBottom: 12 }}>"</div>
                <p style={{ fontSize: 14, color: t.textSub, lineHeight: 1.85, marginBottom: 20, fontStyle: 'italic' }}>{t2.text}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: `linear-gradient(135deg, ${t2.color}, ${t2.color}70)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 15, fontWeight: 800, flexShrink: 0 }}>{t2.name.charAt(0)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: TH }}>{t2.name}</div>
                    <div style={{ fontSize: 11, color: t.textMute }}>{t2.region}</div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: t2.color, background: `${t2.color}12`, padding: '4px 10px', borderRadius: 8 }}>{t2.type}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TEAM & VOLUNTEER ══ */}
      <section style={{ background: t.bg2, padding: '64px 24px' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <SectionTitle
            label={lang === 'ar' ? 'فريقنا' : 'Our Team'}
            title={lang === 'ar' ? 'من يقف خلف غزلان الخير' : 'The People Behind Ghozlan Alkhair'}
            sub={lang === 'ar' ? 'فريق متطوع متكامل يعمل بصمت لخدمة أهلنا في سوريا' : 'A dedicated volunteer team working quietly to serve our people in Syria'}
            t={t}
          />

          <div className="partners-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 48 }}>
          {[
        {
          role: lang === 'ar' ? 'الإدارة والتنسيق' : 'Management',
          color: PRIMARY,
          desc: lang === 'ar' ? 'يشرفون على سير العمل واتخاذ القرار' : 'Oversee operations and decisions',
          icon: (
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2v-4M9 21H5a2 2 0 01-2-2v-4m0 0h18"/>
            </svg>
          ),
        },
        {
          role: lang === 'ar' ? 'فريق المراجعة' : 'Review Team',
          color: PRIMARY_L,
          desc: lang === 'ar' ? 'يراجعون الطلبات ويتحققون من البيانات' : 'Review and verify applications',
          icon: (
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
            </svg>
          ),
        },
        {
          role: lang === 'ar' ? 'المتابعة الميدانية' : 'Field Follow-up',
          color: GOLD,
          desc: lang === 'ar' ? 'يتابعون الحالات ويتحققون من التسليم' : 'Follow up cases and verify delivery',
          icon: (
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          ),
        },
        {
          role: lang === 'ar' ? 'الدعم التقني' : 'Tech Support',
          color: '#059669',
          desc: lang === 'ar' ? 'يديرون المنصة ويضمنون سيرها' : 'Manage the platform and ensure it runs',
          icon: (
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2"/>
              <path d="M8 21h8M12 17v4"/>
            </svg>
          ),
        },
      ].map((item, i) => (
        <motion.div key={item.role}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1, duration: 0.5 }}
          whileHover={{ y: -5 }}
          style={{ background: t.card, borderRadius: 16, padding: '28px 20px', textAlign: 'center', border: `1px solid ${item.color}20` }}
        >
          <div style={{ width: 52, height: 52, borderRadius: 14, background: `${item.color}12`, border: `1.5px solid ${item.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', color: item.color }}>
            {item.icon}
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: t.text, marginBottom: 8 }}>{item.role}</div>
          <div style={{ fontSize: 11, color: t.textMute, lineHeight: 1.6 }}>{item.desc}</div>
        </motion.div>
      ))}
    </div>

    {/* Volunteer CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ borderRadius: 20, padding: '40px 32px', background: `linear-gradient(135deg, ${PRIMARY}10, ${PRIMARY_L}08)`, border: `1px solid ${PRIMARY}20`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' as const }}
        >
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: t.text, marginBottom: 8 }}>
              {lang === 'ar' ? 'هل تريد أن تكون جزءاً من الفريق؟' : 'Want to be part of the team?'}
            </div>
            <div style={{ fontSize: 13, color: t.textMute, lineHeight: 1.7, maxWidth: 480 }}>
              {lang === 'ar'
                ? 'نرحب بكل من يريد المساهمة في خدمة أهلنا — سواء بوقته أو خبرته أو مهاراته'
                : 'We welcome anyone who wants to contribute — whether with their time, expertise, or skills'}
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: `0 8px 28px ${PRIMARY}40` }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push('/volunteer')}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '13px 28px', borderRadius: 14, background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_L})`, color: 'white', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' as const, flexShrink: 0 }}
          >
            <svg width="16" height="16" fill="none" stroke="white" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
            </svg>
            {lang === 'ar' ? 'انضم كمتطوع' : 'Join as Volunteer'}
          </motion.button>
        </motion.div>

      </div>
    </section>

      {/* ══ FAQ ══ */}
      <section style={{ background: t.bg, padding: '80px 24px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <SectionTitle
            label={lang === 'ar' ? 'الأسئلة الشائعة' : 'FAQ'}
            title={lang === 'ar' ? 'أسئلة شائعة' : 'Frequently Asked Questions'}
            sub={lang === 'ar' ? 'إجابات على أكثر الأسئلة شيوعاً' : 'Answers to the most common questions'}
            t={t}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {lx.home.faq.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
              >
                <details style={{ borderRadius: 14, border: `1px solid ${t.border}`, background: t.card, overflow: 'hidden' }}>
                  <summary style={{ padding: '16px 20px', cursor: 'pointer', fontWeight: 700, fontSize: 14, color: TH, display: 'flex', alignItems: 'center', justifyContent: 'space-between', listStyle: 'none', userSelect: 'none' }}>
                    {faq.q}
                    <span style={{ color: t.textMute, flexShrink: 0, marginRight: 12 }}>{Icons.chevron}</span>
                  </summary>
                  <div style={{ padding: '8px 20px 16px', fontSize: 14, color: t.textSub, lineHeight: 1.8, borderTop: `1px solid ${t.border}` }}>{faq.a}</div>
                </details>
              </motion.div>
            ))}
           
          </div>
        </div>
      </section>

      {/* ══ CONTACT ══ */}
      <section style={{ background: t.bg2, padding: '80px 24px', position: 'relative', zIndex: 0, overflow: 'hidden' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <SectionTitle
            label={lang === 'ar' ? 'تواصل معنا' : 'Contact Us'}
            title={lang === 'ar' ? 'نحن هنا لمساعدتك' : 'We Are Here to Help'}
            sub={lang === 'ar' ? 'تواصل معنا عبر أي قناة تناسبك' : 'Contact us through any channel that suits you'}
            t={t}
          />
          <div className="contact-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {[
              { title: lang === 'ar' ? 'واتساب' : 'WhatsApp', desc: lang === 'ar' ? 'تواصل معنا مباشرة' : 'Contact us directly', value: '+963 XX XXX XXXX', color: '#25D366', icon: Icons.phone },
              { title: lang === 'ar' ? 'البريد الإلكتروني' : 'Email', desc: lang === 'ar' ? 'أرسل لنا استفسارك' : 'Send us your inquiry', value: 'info@ghozlan.org', color: PRIMARY, icon: Icons.mail },
              { title: lang === 'ar' ? 'ساعات العمل' : 'Working Hours', desc: lang === 'ar' ? 'أحد — خميس' : 'Sun — Thu', value: lang === 'ar' ? '٩ ص — ٤ م' : '9 AM — 4 PM', color: GOLD, icon: Icons.clock },
            ].map((c, i) => (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                whileHover={{ y: -6, boxShadow: `0 20px 50px ${c.color}18` }}
                style={{ background: t.card, borderRadius: 20, padding: '32px 24px', textAlign: 'center', border: `1px solid ${t.border}`, cursor: 'default' }}
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  style={{ width: 54, height: 54, borderRadius: 14, background: `${c.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: c.color }}
                >
                  {c.icon}
                </motion.div>
                <div style={{ fontSize: 16, fontWeight: 800, color: TH, marginBottom: 5 }}>{c.title}</div>
                <div style={{ fontSize: 12, color: t.textMute, marginBottom: 10 }}>{c.desc}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: c.color }}>{c.value}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ══ */}
            <section style={{ 
        position: 'relative', overflow: 'hidden', 
        padding: '80px 24px',
        minHeight: 500, 
        zIndex: 1, isolation: 'isolate',
        marginTop: 0,
      }}>
        <motion.img
          src="https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1600&q=85"

          alt=""
          style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
            objectPosition: 'center center',
          }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, rgba(5,15,35,0.88), rgba(27,108,168,0.82))',
        }}/>
        <AnimSection style={{ position: 'relative', zIndex: 10, maxWidth: 560, margin: '0 auto', textAlign: 'center', color: 'white' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 100, padding: '6px 18px', marginBottom: 22 }}>
            <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }} style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ADE80', display: 'inline-block' }}/>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>{lang === 'ar' ? 'نستقبل الطلبات الآن' : 'Now Accepting Applications'}</span>
          </div>
          <h2 className="cta-title" style={{ fontSize: 44, fontWeight: 900, marginBottom: 8, letterSpacing: '-1px', lineHeight: 1.1 }}>
            {lang === 'ar' ? 'هل تحتاج إلى مساعدة؟' : 'Do You Need Assistance?'}
          </h2>
          <div style={{ width: 48, height: 4, borderRadius: 2, background: `linear-gradient(to left, ${GOLD}, #FFE490)`, margin: '0 auto 18px' }}/>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.72)', marginBottom: 36, lineHeight: 1.75 }}>
            {lang === 'ar' ? 'لا تتردد في التقديم — فريقنا يراجع كل طلب بعناية' : 'Don\'t hesitate to apply — our team reviews every request carefully'}
          </p>
          <div className="cta-buttons" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} onClick={() => router.push('/apply')}
              style={{ height: 52, padding: '0 36px', background: 'white', color: PRIMARY, borderRadius: 14, border: 'none', fontSize: 15, fontWeight: 800, cursor: 'pointer', boxShadow: '0 10px 32px rgba(0,0,0,0.25)' }}>
              {lang === 'ar' ? 'قدّم طلبك الآن ←' : 'Apply Now →'}
            </motion.button>
            <motion.button whileHover={{ scale: 1.05, background: 'rgba(255,255,255,0.2)' }} whileTap={{ scale: 0.97 }} onClick={() => router.push('/track')}
              style={{ height: 52, padding: '0 28px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', color: 'white', borderRadius: 14, border: '1.5px solid rgba(255,255,255,0.25)', fontSize: 15, fontWeight: 500, cursor: 'pointer' }}>
              {lang === 'ar' ? 'تتبع طلبك' : 'Track Your Request'}
            </motion.button>
          </div>
        </AnimSection>
      </section>

      {/* ══ FOOTER ══ */}
      <footer style={{ background: dark ? '#010409' : '#0A1628', padding: '52px 20px 28px', transition: 'background 0.3s' }} dir={dir}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <div onClick={() => router.push('/')} style={{ display: 'inline-flex', alignItems: 'center', gap: 12, cursor: 'pointer', marginBottom: 14 }}>
              <img src="/g-logo.png" alt="مؤسسة غزلان الخير" className="footer-logo-img"
                style={{ width: 80, height: 80, objectFit: 'contain', filter: 'drop-shadow(0 0 8px rgba(74,172,205,0.4))' }}/>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'white', lineHeight: 1.2 }}>{lang === 'ar' ? 'مؤسسة غزلان الخير' : 'Ghozlan Alkhair Foundation'}</div>
                <div style={{ fontSize: 10, color: PRIMARY_L, letterSpacing: '0.4px' }}>{lang === 'ar' ? 'Ghozlan Alkhair Foundation' : 'مؤسسة غزلان الخير'}</div>
              </div>
            </div>
            <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.85, maxWidth: 300, margin: '0 auto 20px' }}>{lx.footer.desc}</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <div style={{ width: 48, height: 1, background: 'rgba(201,168,76,0.25)' }}/>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: GOLD, opacity: 0.5 }}/>
              <div style={{ width: 48, height: 1, background: 'rgba(201,168,76,0.25)' }}/>
            </div>
          </div>

          <div className="footer-links" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, maxWidth: 560, margin: '0 auto 40px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: '#4B5563', marginBottom: 14, letterSpacing: '2px', textTransform: 'uppercase' as const }}>{lx.footer.services}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
                {[{ label: lx.footer.apply, path: '/apply' }, { label: lx.footer.track, path: '/track' }].map(l => (
                  <button key={l.label} onClick={() => router.push(l.path)}
                    style={{ fontSize: 13, color: '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer', padding: 0, transition: 'color 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'white')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#9CA3AF')}
                  >{l.label}</button>
                ))}
                <button onClick={() => router.push('/dashboard/login')}
                  style={{ fontSize: 12, color: PRIMARY_L, background: `${PRIMARY_L}10`, border: `1px solid ${PRIMARY_L}25`, borderRadius: 8, padding: '5px 12px', cursor: 'pointer', transition: 'all 0.2s', fontWeight: 500 }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${PRIMARY_L}22`; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = `${PRIMARY_L}10`; }}
                >{lx.footer.employees}</button>
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: '#4B5563', marginBottom: 14, letterSpacing: '2px', textTransform: 'uppercase' as const }}>{lx.footer.contact}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
                {[{ icon: Icons.mail, text: lx.footer.email }, { icon: Icons.phone, text: lx.footer.whatsapp }, { icon: Icons.clock, text: lx.footer.hours }].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: '#9CA3AF' }}>
                    <span style={{ color: '#6B7280', flexShrink: 0 }}>{item.icon}</span>
                    {item.text}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p style={{ fontSize: 12, color: '#4B5563', margin: 0 }}>{lx.footer.rights}</p>
            <button onClick={toggle} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 10, border: `1.5px solid ${dark ? 'rgba(74,172,205,0.35)' : 'rgba(255,255,255,0.15)'}`, background: dark ? 'rgba(74,172,205,0.1)' : 'rgba(255,255,255,0.06)', cursor: 'pointer', color: dark ? PRIMARY_L : '#9CA3AF', fontSize: 12, fontWeight: 600, transition: 'all 0.22s' }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = dark ? 'rgba(74,172,205,0.18)' : 'rgba(255,255,255,0.12)'; el.style.color = 'white'; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = dark ? 'rgba(74,172,205,0.1)' : 'rgba(255,255,255,0.06)'; el.style.color = dark ? PRIMARY_L : '#9CA3AF'; }}
            >
              {dark ? Icons.sun : Icons.moon}
              <span>{dark ? lx.footer.light : lx.footer.dark}</span>
            </button>
          </div>
        </div>

        <style>{`
          @media (max-width: 640px) { .footer-logo-img { width: 62px !important; height: 62px !important; } }
          .footer-bottom { border-top: 1px solid rgba(255,255,255,0.06); padding-top: 20px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; }
          @media (max-width: 640px) { .footer-bottom { flex-direction: column !important; align-items: center !important; text-align: center !important; gap: 14px !important; } }
          @media (max-width: 480px) { .footer-links { gap: 20px !important; } }
          @media (max-width: 340px) { .footer-links { grid-template-columns: 1fr !important; } }
        `}</style>
      </footer>

      <style>{`
        details summary::-webkit-details-marker { display: none; }
        @media (max-width: 768px) {
          .hero-content { padding: 110px 20px 60px !important; }
          .hero-title { font-size: 36px !important; letter-spacing: -1px !important; }
          .hero-buttons { flex-direction: column !important; }
          .hero-buttons button { width: 100% !important; text-align: center !important; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 12px !important; }
          .about-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
          .about-img  { display: none !important; }
          .about-values { grid-template-columns: 1fr 1fr !important; }
          .services-grid { grid-template-columns: 1fr !important; }
          .steps-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 24px !important; }
          .steps-line { display: none !important; }
          .testimonials-grid { grid-template-columns: 1fr !important; }
          .partners-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .contact-grid { grid-template-columns: 1fr !important; }
          .section-h2 { font-size: 28px !important; }
          .cta-title { font-size: 30px !important; }
          .cta-buttons { flex-direction: column !important; align-items: center !important; }
          .cta-buttons button { width: 100% !important; max-width: 320px !important; }
        }
        @media (max-width: 480px) {
          .steps-grid { grid-template-columns: 1fr !important; }
          .hero-title { font-size: 30px !important; }
        }
      `}</style>
    </div>
  );
}