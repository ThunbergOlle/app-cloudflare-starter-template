import { useAppTranslation } from '@/contexts/I18nContext';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  const { t } = useAppTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>{t('home.welcome')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8B4513',
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
  },
});
