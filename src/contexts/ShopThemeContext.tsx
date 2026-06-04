import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

type Theme = 'dark' | 'light';

interface ShopThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
}

const ShopThemeContext = createContext<ShopThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'peteye-shop-theme';

export function ShopThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return (stored === 'light' || stored === 'dark') ? stored : 'light'; // Default light for shop, or dark? Let's use dark as default to show off the new design if we want, but 'light' is safer. Let's make it 'light' by default. Wait, the user wants dark mode based on admin, so maybe they prefer it dark. Let's make default 'dark'.
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  const isDark = theme === 'dark';

  return (
    <ShopThemeContext.Provider value={{ theme, toggleTheme, isDark }}>
      {children}
    </ShopThemeContext.Provider>
  );
}

export function useShopTheme() {
  const ctx = useContext(ShopThemeContext);
  if (!ctx) throw new Error('useShopTheme must be used within ShopThemeProvider');
  return ctx;
}
