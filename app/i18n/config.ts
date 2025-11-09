import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../locales/en.json';
import sv from '../locales/sv.json';

const LANGUAGE_STORAGE_KEY = 'aperto-language';

const resources = {
  sv: {
    translation: sv,
  },
  en: {
    translation: en,
  },
};

const initI18n = async () => {
  let savedLanguage;

  try {
    savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
  } catch (error) {
    console.error('Error loading saved language:', error);
  }

  await i18n.use(initReactI18next).init({
    resources,
    lng: savedLanguage || 'sv', // Swedish as default
    fallbackLng: 'en', // English as fallback
    debug: __DEV__,

    interpolation: {
      escapeValue: false, // React Native already escapes
    },

    react: {
      useSuspense: false, // Disable suspense for React Native
    },
  });

  return i18n;
};

export const changeLanguage = async (lng: string) => {
  try {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lng);
    await i18n.changeLanguage(lng);
  } catch (error) {
    console.error('Error saving language:', error);
  }
};

export { initI18n };
export default i18n;
