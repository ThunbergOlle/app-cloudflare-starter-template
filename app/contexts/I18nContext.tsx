import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import i18n, { initI18n, changeLanguage } from '../i18n/config';

export type SupportedLanguage = 'sv' | 'en';

interface I18nContextType {
  currentLanguage: SupportedLanguage;
  changeLanguage: (language: SupportedLanguage) => Promise<void>;
  isReady: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  children: React.ReactNode;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const [isReady, setIsReady] = useState(false);
  const [currentLanguage, setCurrentLanguage] =
    useState<SupportedLanguage>('sv');

  useEffect(() => {
    const init = async () => {
      try {
        await initI18n();
        setCurrentLanguage(i18n.language as SupportedLanguage);
        setIsReady(true);
      } catch (error) {
        console.error('Failed to initialize i18n:', error);
        setIsReady(true); // Still set ready to prevent infinite loading
      }
    };

    init();
  }, []);

  // Listen for language changes - only after i18n is initialized
  useEffect(() => {
    if (!isReady) return;

    const handleLanguageChange = (lng: string) => {
      setCurrentLanguage(lng as SupportedLanguage);
    };

    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [isReady]);

  const handleChangeLanguage = async (language: SupportedLanguage) => {
    try {
      await changeLanguage(language);
      setCurrentLanguage(language);
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  const value: I18nContextType = {
    currentLanguage,
    changeLanguage: handleChangeLanguage,
    isReady,
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18nContext = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18nContext must be used within an I18nProvider');
  }
  return context;
};

// Custom hook that combines react-i18next with our context
export const useAppTranslation = () => {
  const { t, i18n } = useTranslation();
  const { currentLanguage, changeLanguage, isReady } = useI18nContext();

  return {
    t,
    i18n,
    currentLanguage,
    changeLanguage,
    isReady,
  };
};

