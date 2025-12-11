/**
 * Theme hook for accessing theme throughout the app
 */

import React, { useContext, createContext, useState, ReactNode } from 'react';
import { Theme, createTheme, ColorScheme } from '../design-system/theme';

interface ThemeContextType {
  theme: Theme;
  colorScheme: ColorScheme;
  toggleTheme: () => void;
  setColorScheme: (scheme: ColorScheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>('dark');
  const theme = createTheme(colorScheme);

  const toggleTheme = () => {
    setColorSchemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setColorScheme = (scheme: ColorScheme) => {
    setColorSchemeState(scheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, colorScheme, toggleTheme, setColorScheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

