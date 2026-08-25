import React, { createContext, useState, useContext, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { themeMap, ThemeColors, ThemeName, setGlobalThemeColors } from '../constants/colors';

type ThemeContextType = {
  isDark: boolean;
  themeName: ThemeName;
  toggleTheme: () => void;
  setThemeName: (name: ThemeName) => void;
  colors: ThemeColors;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState<boolean>(false);
  const [themeName, setThemeNameState] = useState<ThemeName>('ocean');

  useEffect(() => {
    Promise.all([
      SecureStore.getItemAsync('app_theme_mode'),
      SecureStore.getItemAsync('app_theme_name')
    ]).then(([mode, name]) => {
      let currentMode = false;
      let currentName: ThemeName = 'ocean';

      if (mode === 'dark') currentMode = true;
      if (name && Object.keys(themeMap).includes(name)) {
        currentName = name as ThemeName;
      }

      setIsDark(currentMode);
      setThemeNameState(currentName);
      setGlobalThemeColors(currentName, currentMode);
    });
  }, []);

  const toggleTheme = () => {
    setIsDark(prev => {
      const newMode = !prev;
      setGlobalThemeColors(themeName, newMode);
      SecureStore.setItemAsync('app_theme_mode', newMode ? 'dark' : 'light');
      return newMode;
    });
  };

  const setThemeName = (name: ThemeName) => {
    setThemeNameState(name);
    setGlobalThemeColors(name, isDark);
    SecureStore.setItemAsync('app_theme_name', name);
  };

  const colors = themeMap[themeName][isDark ? 'dark' : 'light'];

  return (
    <ThemeContext.Provider value={{ isDark, themeName, toggleTheme, setThemeName, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
