export type ThemeColors = {
  bgPrimary: string;
  bgSecondary: string;
  bgTertiary: string;
  bgGlass: string;
  borderGlass: string;
  border: string;
  accent: string;
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

export const lightColors: ThemeColors = {
  bgPrimary: '#F8F9FA',      // Very soft clean grey/white
  bgSecondary: '#FFFFFF',    // White card background
  bgTertiary: '#E9ECEF',     // Slightly darker grey for highlights
  bgGlass: 'rgba(255, 255, 255, 0.9)', // Clear frosted glass
  borderGlass: '#E2E8F0',    // Slate-200 border color
  border: '#E2E8F0',         // Standard border
  accent: '#0053B3',         // Vibrant Blue (from Figma)
  accentGlow: 'rgba(0, 83, 179, 0.05)',
  accentCyan: '#00C896',     // Mint green
  success: '#10B981',        // Emerald green
  warning: '#F59E0B',        // Amber surge
  danger: '#EF4444',         // Rose red
  textPrimary: '#0F172A',    // Slate-900 (dark text)
  textSecondary: '#475569',  // Slate-600 (medium text)
  textMuted: '#94A3B8',      // Slate-400 (muted text)
  white: '#FFFFFF',
  iconBg: '#F6F8FE',
};

export const darkColors: ThemeColors = {
  bgPrimary: '#030A11',      // Dark background
  bgSecondary: '#131416',    // Dark card background
  bgTertiary: '#212830',     // Darker highlights
  bgGlass: 'rgba(19, 20, 22, 0.9)', // Dark frosted glass
  borderGlass: '#333A45',    // Dark border color
  border: '#333A45',         // Dark border
  accent: '#0053B3',         // Vibrant Blue (from Figma)
  accentGlow: 'rgba(0, 83, 179, 0.2)',
  accentCyan: '#00C896',     // Mint green
  success: '#10B981',        // Emerald green
  warning: '#F59E0B',        // Amber surge
  danger: '#F52F14',         // Red
  textPrimary: '#FCFCFC',    // White text
  textSecondary: '#A1A3A6',  // Medium text
  textMuted: '#7C848D',      // Muted text
  white: '#FCFCFC',
  iconBg: '#212830',
};

// Default export mapping to light theme initially for backward compatibility

// Mutable global object for dynamic theming
const Colors: ThemeColors = { ...lightColors };

export const setGlobalThemeColors = (isDark: boolean) => {
  const newTheme = isDark ? darkColors : lightColors;
  for (const key in newTheme) {
    (Colors as any)[key] = (newTheme as any)[key];
  }
};

export default Colors;
