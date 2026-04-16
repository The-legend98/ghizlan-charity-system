'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

const ThemeContext = createContext<{
  dark: boolean;
  toggle: () => void;
}>({ dark: false, toggle: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') setDark(true);
  }, []);

  const toggle = () => {
    setDark(prev => {
      localStorage.setItem('theme', !prev ? 'dark' : 'light');
      return !prev;
    });
  };

  return (
    <ThemeContext.Provider value={{ dark, toggle }}>
      <div data-theme={dark ? 'dark' : 'light'}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);