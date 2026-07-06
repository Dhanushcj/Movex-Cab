import React, { createContext, useState, useContext, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

type LanguageContextType = {
  language: 'en' | 'ta';
  setLanguage: (lang: 'en' | 'ta') => void;
  t: (key: string) => string;
};

const translations = {
  en: {
    'profile.title': 'Profile',
    'profile.darkTheme': 'Dark theme',
    'profile.appLanguage': 'App language',
    'profile.alertSound': 'Order alert sound',
    'profile.helpCentre': 'Help Centre',
    'profile.supportTickets': 'Support tickets',
    'profile.settings': 'Settings',
    'profile.logout': 'Log out',
    'profile.referralTitle': 'Upto ₹4,500 referral bonus',
    'profile.referralSub': 'Refer your friend and earn',
    'driverHome.partnerConsole': 'Partner Console',
    'driverHome.dutyOn': 'DUTY ON',
    'driverHome.offline': 'OFFLINE',
    'driverHome.pending': 'PENDING'
  },
  ta: {
    'profile.title': 'சுயவிவரம்',
    'profile.darkTheme': 'இருண்ட தீம்',
    'profile.appLanguage': 'பயன்பாட்டு மொழி',
    'profile.alertSound': 'ஆர்டர் எச்சரிக்கை ஒலி',
    'profile.helpCentre': 'உதவி மையம்',
    'profile.supportTickets': 'ஆதரவு டிக்கெட்டுகள்',
    'profile.settings': 'அமைப்புகள்',
    'profile.logout': 'வெளியேறு',
    'profile.referralTitle': '₹4,500 வரை பரிந்துரை போனஸ்',
    'profile.referralSub': 'உங்கள் நண்பரைப் பரிந்துரைத்து சம்பாதிக்கவும்',
    'driverHome.partnerConsole': 'கூட்டாளர் கன்சோல்',
    'driverHome.dutyOn': 'பணியில்',
    'driverHome.offline': 'ஆஃப்லைன்',
    'driverHome.pending': 'நிலுவையில்'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<'en' | 'ta'>('en');

  useEffect(() => {
    SecureStore.getItemAsync('app_lang').then(lang => {
      if (lang === 'ta') setLanguageState('ta');
    });
  }, []);

  const setLanguage = (lang: 'en' | 'ta') => {
    setLanguageState(lang);
    SecureStore.setItemAsync('app_lang', lang);
  };

  const t = (key: string): string => {
    return (translations[language] as any)[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
