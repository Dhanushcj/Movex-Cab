import { useTheme } from '../context/ThemeContext';
import Colors from '../constants/colors';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { useLanguage } from '../context/LanguageContext';

export default function LanguageScreen({ onBack }: { onBack: () => void }) {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors);
  const { language, setLanguage } = useLanguage();
  const [selectedLang, setSelectedLang] = useState<'en' | 'ta'>(language);

  const handleApply = () => {
    setLanguage(selectedLang);
    onBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonIcon}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>App Language</Text>
          <View style={{ width: 40 }} />
          {/* Spacer */}
        </View>

        <Text style={styles.subtitle}>Choose your preferred language</Text>

        <View style={styles.languageGrid}>
          {/* English Option */}
          <TouchableOpacity
            style={[styles.langCard, selectedLang === 'en' ? styles.langCardActive : styles.langCardInactive]}
            onPress={() => setSelectedLang('en')}
            activeOpacity={0.8}
          >
            <View style={styles.iconBox}>
              <Text style={styles.iconTextA}>A</Text>
            </View>
            <View style={styles.textBox}>
              <Text style={[styles.langText, selectedLang === 'en' ? styles.langTextActive : styles.langTextInactive]}>English</Text>
            </View>
          </TouchableOpacity>

          {/* Tamil Option */}
          <TouchableOpacity
            style={[styles.langCard, selectedLang === 'ta' ? styles.langCardActive : styles.langCardInactive]}
            onPress={() => setSelectedLang('ta')}
            activeOpacity={0.8}
          >
            <View style={styles.iconBox}>
              <Text style={styles.iconTextTa}>த</Text>
            </View>
            <View style={styles.textBox}>
              <Text style={[styles.langText, selectedLang === 'ta' ? styles.langTextActive : styles.langTextInactive]}>Tamil</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.footerContainer}>
        <TouchableOpacity style={styles.cancelBtn} onPress={onBack}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
          <Text style={styles.applyText}>Apply</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (Colors: any) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bgPrimary
  },
  container: {
    flex: 1,
    paddingHorizontal: 16
  },
  header: {
    marginTop: Platform.OS === 'ios' ? 40 : 60,
    marginBottom: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DEE0E3',
    alignItems: 'center',
    justifyContent: 'center'
  },
  backButtonIcon: {
    fontSize: 18,
    color: Colors.textPrimary
  },
  headerTitle: {
    fontSize: 16,
    color: Colors.textPrimary
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 28
  },
  languageGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8
  },
  langCard: {
    width: 160,
    height: 80,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12
  },
  langCardActive: {
    backgroundColor: '#0053B3',
    borderWidth: 0
  },
  langCardInactive: {
    backgroundColor: Colors.bgSecondary,
    borderWidth: 1,
    borderColor: '#DEE0E3'
  },
  iconBox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: Colors.bgSecondary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconTextA: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0053B3'
  },
  iconTextTa: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textMuted
  },
  textBox: {
    flex: 1
  },
  langText: {
    fontSize: 16
  },
  langTextActive: {
    color: Colors.bgSecondary
  },
  langTextInactive: {
    color: Colors.textMuted
  },
  footerContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    backgroundColor: Colors.bgPrimary,
    gap: 16,
    justifyContent: 'center'
  },
  cancelBtn: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#0053B3',
    backgroundColor: Colors.bgSecondary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cancelText: {
    color: '#0053B3',
    fontSize: 14
  },
  applyBtn: {
    flex: 1,
    height: 44,
    backgroundColor: '#0053B3',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  applyText: {
    color: Colors.bgSecondary,
    fontSize: 14
  }
});
