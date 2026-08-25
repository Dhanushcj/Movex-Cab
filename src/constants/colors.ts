export type ThemeColors = {
  bgPrimary: string;
  bgSecondary: string;
  bgTertiary: string;
  bgGlass: string;
  borderGlass: string;
  border: string;
  accent: string;
  accentSecondary: string;
  accentGlow: string;
  accentCyan: string;
  success: string;
  warning: string;
  danger: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  white: string;
  iconBg: string;
};

// 1. Forge (Ocean Blue) Default
export const oceanLight: ThemeColors = {
  bgPrimary: '#F8F9FA',
  bgSecondary: '#FFFFFF',
  bgTertiary: '#F0F4F8',
  bgGlass: 'rgba(255, 255, 255, 0.9)',
  borderGlass: '#E2E8F0',
  border: '#E2E8F0',
  accent: '#075AAA', // Forge Royal Blue
  accentSecondary: '#FFCC00', // Forge Yellow
  accentGlow: 'rgba(7, 90, 170, 0.05)',
  accentCyan: '#00C896',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  white: '#FFFFFF',
  iconBg: '#F6F8FE',
};

export const oceanDark: ThemeColors = {
  bgPrimary: '#030A11',
  bgSecondary: '#131416',
  bgTertiary: '#1E242B',
  bgGlass: 'rgba(19, 20, 22, 0.9)',
  borderGlass: '#2A303A',
  border: '#2A303A',
  accent: '#075AAA', // Forge Royal Blue
  accentSecondary: '#FFCC00', // Forge Yellow
  accentGlow: 'rgba(7, 90, 170, 0.2)',
  accentCyan: '#00C896',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#F52F14',
  textPrimary: '#FCFCFC',
  textSecondary: '#A1A3A6',
  textMuted: '#7C848D',
  white: '#FCFCFC',
  iconBg: '#212830',
};

// 2. Midnight Purple
export const purpleLight: ThemeColors = {
  ...oceanLight,
  accent: '#6B21A8',
  accentSecondary: '#FFC107',
  accentGlow: 'rgba(107, 33, 168, 0.05)',
  iconBg: '#FAF5FF',
};

export const purpleDark: ThemeColors = {
  ...oceanDark,
  accent: '#9333EA',
  accentSecondary: '#FFC107',
  accentGlow: 'rgba(147, 51, 234, 0.2)',
  iconBg: '#2E1065',
};

// 3. Emerald Green
export const emeraldLight: ThemeColors = {
  ...oceanLight,
  accent: '#059669',
  accentSecondary: '#FFC107',
  accentGlow: 'rgba(5, 150, 105, 0.05)',
  iconBg: '#ECFDF5',
};

export const emeraldDark: ThemeColors = {
  ...oceanDark,
  accent: '#10B981',
  accentSecondary: '#FFC107',
  accentGlow: 'rgba(16, 185, 129, 0.2)',
  iconBg: '#064E3B',
};

// 4. Sunset Amber
export const amberLight: ThemeColors = {
  ...oceanLight,
  accent: '#D97706',
  accentSecondary: '#1648A5',
  accentGlow: 'rgba(217, 119, 6, 0.05)',
  iconBg: '#FFFBEB',
};

export const amberDark: ThemeColors = {
  ...oceanDark,
  accent: '#F59E0B',
  accentSecondary: '#1648A5',
  accentGlow: 'rgba(245, 158, 11, 0.2)',
  iconBg: '#78350F',
};

// 5. Rose Gold
export const roseLight: ThemeColors = {
  ...oceanLight,
  accent: '#E11D48',
  accentSecondary: '#FFC107',
  accentGlow: 'rgba(225, 29, 72, 0.05)',
  iconBg: '#FFF1F2',
};

export const roseDark: ThemeColors = {
  ...oceanDark,
  accent: '#F43F5E',
  accentSecondary: '#FFC107',
  accentGlow: 'rgba(244, 63, 94, 0.2)',
  iconBg: '#881337',
};

// 6. Graphite
export const graphiteLight: ThemeColors = {
  ...oceanLight,
  accent: '#334155',
  accentSecondary: '#FFC107',
  accentGlow: 'rgba(51, 65, 85, 0.05)',
  iconBg: '#F8FAFC',
};

export const graphiteDark: ThemeColors = {
  ...oceanDark,
  accent: '#94A3B8',
  accentSecondary: '#FFC107',
  accentGlow: 'rgba(148, 163, 184, 0.2)',
  iconBg: '#0F172A',
};

// 7. Crimson Red
export const crimsonLight: ThemeColors = {
  ...oceanLight,
  accent: '#B91C1C',
  accentSecondary: '#FFC107',
  accentGlow: 'rgba(185, 28, 28, 0.05)',
  iconBg: '#FEF2F2',
};

export const crimsonDark: ThemeColors = {
  ...oceanDark,
  accent: '#EF4444',
  accentSecondary: '#FFC107',
  accentGlow: 'rgba(239, 68, 68, 0.2)',
  iconBg: '#7F1D1D',
};

export type ThemeName = 'ocean' | 'purple' | 'emerald' | 'amber' | 'rose' | 'graphite' | 'crimson';

export const themeMap = {
  ocean: { light: oceanLight, dark: oceanDark },
  purple: { light: purpleLight, dark: purpleDark },
  emerald: { light: emeraldLight, dark: emeraldDark },
  amber: { light: amberLight, dark: amberDark },
  rose: { light: roseLight, dark: roseDark },
  graphite: { light: graphiteLight, dark: graphiteDark },
  crimson: { light: crimsonLight, dark: crimsonDark },
};

// Mutable global object for dynamic theming (used outside of React components if needed)
const Colors: ThemeColors = { ...oceanLight };

export const setGlobalThemeColors = (themeName: ThemeName, isDark: boolean) => {
  const newTheme = themeMap[themeName][isDark ? 'dark' : 'light'];
  for (const key in newTheme) {
    (Colors as any)[key] = (newTheme as any)[key];
  }
};

export default Colors;
