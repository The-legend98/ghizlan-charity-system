'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import DarkToggle from '@/components/DarkToggle';
import { useLang } from '@/app/providers/LangProvider';

const PRIMARY   = '#1B6CA8';
const PRIMARY_L = '#4AACCD';

const MenuIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);
const CloseIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const TrackIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
  </svg>
);
const ApplyIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);
const GlobeIcon = () => (
  <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
  </svg>
);

export default function Navbar() {
  const router   = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { lang, toggleLang, t } = useLang();

  const isTrack = pathname === '/track';
  const isApply = pathname === '/apply';

  return (
    <>
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: '#04101E',
        borderBottom: '1px solid rgba(74,172,205,0.12)',
        boxShadow: '0 2px 24px rgba(0,0,0,0.4)',
      }} dir="rtl">

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', height: 75, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>

         {/* ══ Logo ══ */}
        <div onClick={() => router.push('/')}
          style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', flexShrink: 0 }}>
          <img src="/g-logo.png" alt="غزلان الخير" className="nb-logo-img"
            style={{ width: 50, height: 50, objectFit: 'contain', filter: 'drop-shadow(0 0 7px rgba(74,172,205,0.4))' }}/>

          <div style={{ textAlign: 'center' }}> {/* ✅ هون بس */}
            <div className="nb-logo-name" style={{
              fontSize: 16, fontWeight: 800, color: 'white',
              letterSpacing: '-0.2px', lineHeight: 1.2,
              fontFamily: "'Tajawal', sans-serif",
            }}>
              {lang === 'ar' ? 'مؤسسة غزلان الخير' : 'Ghozlan Alkhair Foundation'}
            </div>
            <div className="nb-hide-mobile" style={{
              fontSize: 11, color: PRIMARY_L, letterSpacing: '1px',
              opacity: 0.65, marginTop: 2,
              fontFamily: "'Roboto', sans-serif", fontWeight: 500,
              textTransform: 'uppercase' as const,
            }}>
              {lang === 'ar' ? 'Ghozlan Alkhair Foundation' : 'مؤسسة غزلان الخير'}
            </div>
          </div>
        </div>
          {/* ══ Desktop Nav ══ */}
          <div className="nb-desktop" style={{ display: 'flex', alignItems: 'center', gap: 0 }}>

            {/* تتبع طلبي — underline عند التفعيل */}
            <button
              onClick={() => router.push('/track')}
              className="nb-nav-link"
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 13, fontWeight: isTrack ? 600 : 400,
                color: isTrack ? PRIMARY_L : 'rgba(255,255,255,0.6)',
                background: 'transparent', border: 'none',
                borderBottom: `2px solid ${isTrack ? PRIMARY_L : 'transparent'}`,
                cursor: 'pointer', padding: '8px 16px',
                height: 66, transition: 'all 0.2s',
              }}>
              <TrackIcon /> {t.nav.track}
            </button>

            {/* فاصل */}
            <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.08)', margin: '0 6px' }}/>

            {/* تقديم طلب — CTA بارز */}
            <button
              onClick={() => router.push('/apply')}
              className="nb-cta-btn"
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                fontSize: 13, fontWeight: 700, color: 'white',
                background: isApply
                  ? `rgba(27,108,168,0.3)`
                  : `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_L})`,
                border: isApply ? `1px solid ${PRIMARY_L}50` : 'none',
                cursor: 'pointer', padding: '9px 20px', borderRadius: 10,
                margin: '0 8px',
                boxShadow: isApply ? 'none' : `0 4px 16px ${PRIMARY}50`,
                transition: 'all 0.22s',
              }}>
              <ApplyIcon /> {t.nav.apply}
            </button>

            {/* فاصل */}
            <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.08)', margin: '0 8px' }}/>

           {/* زر اللغة */}
          <button onClick={toggleLang} className="nb-lang-btn"
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 11, fontWeight: 600,
              color: 'rgba(255,255,255,0.65)',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 8, padding: '6px 11px',
              cursor: 'pointer', transition: 'all 0.2s',
            }}>
           
            <img
              src={lang === 'ar' ? 'https://flagcdn.com/w20/gb.png' : 'https://flagcdn.com/w20/sy.png'}
              alt={lang === 'ar' ? 'English' : 'عربي'}
              style={{ width: 18, height: 13, borderRadius: 2, objectFit: 'cover' }}
            />
            <span>{lang === 'ar' ? 'English' : 'العربية'}</span>
          </button>

            {/* فاصل */}
            <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.08)', margin: '0 8px' }}/>

            <DarkToggle />
          </div>

          {/* ══ Mobile ══ */}
          <div className="nb-mobile" style={{ display: 'none', alignItems: 'center', gap: 6 }}>
           <button onClick={toggleLang}
            style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '6px 9px', cursor: 'pointer' }}>
            <img
              src={lang === 'ar' ? 'https://flagcdn.com/w20/gb.png' : 'https://flagcdn.com/w20/sy.png'}
              alt=""
              style={{ width: 18, height: 13, borderRadius: 2, objectFit: 'cover' }}
            />
            {lang === 'ar' ? 'EN' : 'عر'}
          </button>
            <DarkToggle />
            <button onClick={() => setMenuOpen(!menuOpen)}
              style={{ width: 38, height: 38, borderRadius: 9, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.8)' }}>
              {menuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {/* ══ Mobile Menu ══ */}
        <div style={{
          maxHeight: menuOpen ? '200px' : '0', overflow: 'hidden',
          transition: 'max-height 0.32s cubic-bezier(0.4,0,0.2,1)',
          background: '#03090F',
          borderTop: menuOpen ? '1px solid rgba(74,172,205,0.08)' : 'none',
        }}>
          <div style={{ padding: '12px 16px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button onClick={() => { router.push('/track'); setMenuOpen(false); }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                padding: '12px', borderRadius: 11,
                border: `1px solid ${isTrack ? PRIMARY_L + '40' : 'rgba(255,255,255,0.08)'}`,
                background: isTrack ? `${PRIMARY_L}12` : 'rgba(255,255,255,0.04)',
                color: isTrack ? PRIMARY_L : 'rgba(255,255,255,0.8)',
                fontSize: 13, fontWeight: isTrack ? 600 : 400, cursor: 'pointer',
              }}>
              <TrackIcon /> {t.nav.track}
            </button>
            <button onClick={() => { router.push('/apply'); setMenuOpen(false); }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                padding: '12px', borderRadius: 11,
                border: 'none',
                background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_L})`,
                color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                boxShadow: `0 4px 14px ${PRIMARY}50`,
              }}>
              <ApplyIcon /> {t.nav.apply}
            </button>
          </div>
        </div>
      </nav>

      <style>{`
        .nb-desktop { display: flex !important; }
        .nb-mobile  { display: none  !important; }

        .nb-nav-link:hover {
          color: white !important;
          border-bottom-color: rgba(74,172,205,0.4) !important;
        }

        .nb-cta-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(27,108,168,0.55) !important;
        }
        .nb-cta-btn:active {
          transform: translateY(0) scale(0.97);
        }

        .nb-lang-btn:hover {
          background: rgba(74,172,205,0.1) !important;
          border-color: rgba(74,172,205,0.25) !important;
          color: white !important;
        }

        @media (max-width: 768px) {
          .nb-desktop     { display: none !important; }
          .nb-mobile      { display: flex !important; }
          .nb-hide-mobile { display: none !important; }
          .nb-logo-img    { width: 34px !important; height: 34px !important; }
          .nb-logo-name   { font-size: 13px !important; }
        }
      `}</style>
    </>
  );
}