import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useAppTranslation, SupportedLanguage } from '@/contexts/I18nContext';
import { trpc } from '@/utils/trpc';

interface LanguageSelectorProps {
  visible: boolean;
  onClose: () => void;
}

const languages: { code: SupportedLanguage; label: string }[] = [
  { code: 'sv', label: 'Svenska' },
  { code: 'en', label: 'English' },
];

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  visible,
  onClose,
}) => {
  const { t, currentLanguage, changeLanguage } = useAppTranslation();
  const setLocale = trpc.setLocale.useMutation();

  const handleLanguageSelect = async (languageCode: SupportedLanguage) => {
    await changeLanguage(languageCode);
    await setLocale.mutateAsync({ locale: languageCode });

    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('languageSelector.title')}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.languageList}>
          {languages.map((language) => (
            <TouchableOpacity
              key={language.code}
              style={styles.languageItem}
              onPress={() => handleLanguageSelect(language.code)}
            >
              <Text style={styles.languageLabel}>{language.label}</Text>
              {currentLanguage === language.code && (
                <Ionicons name="checkmark" size={20} color={Colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  closeButton: {
    padding: 4,
  },
  languageList: {
    paddingTop: 16,
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  languageLabel: {
    fontSize: 16,
    color: Colors.text,
  },
});

