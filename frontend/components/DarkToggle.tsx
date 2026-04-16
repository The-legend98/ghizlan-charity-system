'use client';

import { GOLD } from '@/lib/themes';
import { useTheme } from '@/app/providers/ThemeProvider';

const SunIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

const MoonIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
  </svg>
);

export default function DarkToggle() {
  const { dark, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      title={dark ? 'الوضع الفاتح' : 'الوضع الداكن'}
      style={{
        width: 42, height: 42, borderRadius: 12,
        border: `1.5px solid ${GOLD}60`,
        background: `${GOLD}12`,
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: GOLD,
        transition: 'all 0.25s',
        flexShrink: 0,
      }}
    >
      {dark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}