import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { ThemeName, themeMap } from '../constants/colors';

const themes: { id: ThemeName; name: string }[] = [
  { id: 'ocean', name: 'Ocean' },
  { id: 'purple', name: 'Purple' },
  { id: 'emerald', name: 'Emerald' },
  { id: 'amber', name: 'Amber' },
  { id: 'rose', name: 'Rose Gold' },
  { id: 'graphite', name: 'Graphite' },
  { id: 'crimson', name: 'Crimson' },
];

export const ThemeSelector: React.FC = () => {
  const { themeName, setThemeName, colors, isDark } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>
        Appearance
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Customize your experience with premium themes.
      </Text>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {themes.map((theme) => {
          const isSelected = themeName === theme.id;
          const themeColors = themeMap[theme.id][isDark ? 'dark' : 'light'];
          
          return (
            <TouchableOpacity
              key={theme.id}
              activeOpacity={0.8}
              onPress={() => setThemeName(theme.id)}
              style={[
                styles.themeCard,
                { 
                  backgroundColor: themeColors.bgSecondary,
                  borderColor: isSelected ? themeColors.accent : themeColors.borderGlass,
                  shadowColor: themeColors.accent,
                },
                isSelected && styles.selectedCard
              ]}
            >
              <View style={[styles.colorCircle, { backgroundColor: themeColors.accent }]} />
              <Text style={[styles.themeName, { color: themeColors.textPrimary }]}>
                {theme.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
    paddingHorizontal: 20,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 16,
    paddingHorizontal: 20,
    opacity: 0.8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  themeCard: {
    padding: 16,
    borderRadius: 16, // softer corners
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
    elevation: 2,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
  },
  selectedCard: {
    shadowOpacity: 0.2,
    elevation: 4,
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginBottom: 12,
  },
  themeName: {
    fontSize: 14,
    fontWeight: '600',
  }
});
