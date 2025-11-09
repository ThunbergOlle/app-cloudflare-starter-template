import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Updates from 'expo-updates';
import { Colors } from '@/constants/Colors';
import { ListItem } from '@/components/ListItem';
import { TextInput } from '@/components/TextInput';
import { useAuthContext } from '@/contexts/AuthContext';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useUser } from '@/hooks/useUser';
import { useAppTranslation } from '@/contexts/I18nContext';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/Button';
import { trpc } from '@/utils/trpc';

export default function ProfileScreen() {
  const { region } = useAppContext();
  const { logout } = useAuthContext();
  const { resetOnboarding } = useOnboarding();
  const { user, isLoading, error, updateFirstName } = useUser();
  const { t } = useAppTranslation();
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState('');
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const deleteAccountMutation = trpc.deleteAccount.useMutation();

  const handleLogout = async () => {
    await logout();
    router.replace('/auth/login');
  };

  const handleNamePress = () => {
    setEditName(user?.firstName || '');
    setIsEditingName(true);
  };

  const handleSaveName = async () => {
    if (!editName.trim()) {
      // If empty, revert to original name and cancel
      setEditName(user?.firstName || '');
      setIsEditingName(false);
      return;
    }

    try {
      await updateFirstName(editName.trim());
      setIsEditingName(false);
    } catch {
      Alert.alert(t('common.error'), t('profile.updateNameError'));
      // Revert to original name on error
      setEditName(user?.firstName || '');
      setIsEditingName(false);
    }
  };

  const handleResetOnboarding = async () => {
    try {
      await resetOnboarding();
      Alert.alert(t('common.ok'), t('profile.onboardingResetSuccess'));
    } catch {
      Alert.alert(t('common.error'), t('profile.onboardingResetError'));
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t('profile.deleteAccountTitle'),
      t('profile.deleteAccountMessage'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('profile.deleteAccountConfirm'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccountMutation.mutateAsync();
              // Use the logout method to properly clear auth state
              await logout();
              Alert.alert(t('common.ok'), t('profile.deleteAccountSuccess'), [
                {
                  text: t('common.ok'),
                  onPress: () => {
                    // AuthGuard will handle redirect to login
                    router.replace('/auth/login');
                  },
                },
              ]);
            } catch (error) {
              console.error('Failed to delete account:', error);
              Alert.alert(t('common.error'), t('profile.deleteAccountError'));
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>{t('profile.loading')}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>{t('profile.loadError')}</Text>
        <Button title={t('profile.logout')} onPress={handleLogout} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={32} color={Colors.textMuted} />
          </View>

          <View style={styles.profileInfo}>
            {isEditingName ? (
              <View style={styles.editNameContainer}>
                <TextInput
                  value={editName}
                  onChangeText={setEditName}
                  placeholder={t('profile.enterName')}
                  style={styles.nameInput}
                  autoFocus
                  onSubmitEditing={handleSaveName}
                  onBlur={handleSaveName}
                  returnKeyType="done"
                  blurOnSubmit
                />
              </View>
            ) : (
              <TouchableOpacity
                onPress={handleNamePress}
                style={styles.userInfoTouchable}
              >
                <Text style={styles.userName}>
                  {user?.firstName || t('profile.tapToAddName')}
                </Text>
                <Text style={styles.userSubtitle}>{user?.email}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Scanned Monuments Section */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>
            {t('profile.scannedMonuments')}
          </Text>

          <View style={styles.settingsList}>
            <ListItem
              title={t('profile.scannedMonuments')}
              iconName="time-outline"
              onPress={() => router.push('/scanned-monuments')}
            />
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>{t('profile.settings')}</Text>

          <View style={styles.settingsList}>
            <ListItem
              title={t('profile.privacyPolicy')}
              iconName="shield-outline"
              showChevron={false}
              showExternal
              onPress={() =>
                Linking.openURL('https://aperto-app.com/privacy-policy')
              }
            />

            <ListItem
              title={t('profile.termsOfService')}
              iconName="document-text-outline"
              onPress={() => router.push('/terms-of-service')}
            />

            <ListItem
              title={t('profile.language')}
              iconName="language-outline"
              onPress={() => setShowLanguageSelector(true)}
            />

            {__DEV__ && (
              <>
                <ListItem
                  title={t('profile.developerTools')}
                  iconName="code-slash-outline"
                  onPress={() => router.push('/debug')}
                />

                <ListItem
                  title={t('profile.resetOnboarding')}
                  iconName="refresh-outline"
                  onPress={handleResetOnboarding}
                />
              </>
            )}

            <ListItem
              title={t('profile.logout')}
              iconName="log-out-outline"
              onPress={handleLogout}
              showChevron={false}
            />

            <ListItem
              title={t('profile.deleteAccount')}
              iconName="trash-outline"
              onPress={handleDeleteAccount}
              showChevron={false}
            />
          </View>
        </View>

        {/* App Info Section */}
        <View style={styles.appInfoSection}>
          <Text style={styles.appInfoText}>
            {t('profile.updateId')}: {Updates.updateId || 'Development'}
          </Text>
          <Text style={styles.appInfoText}>
            {t('profile.region')}: {region}
          </Text>
        </View>
      </ScrollView>

      <LanguageSelector
        visible={showLanguageSelector}
        onClose={() => setShowLanguageSelector(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
    minHeight: 80,
  },
  userInfoTouchable: {
    paddingVertical: 4,
    minHeight: 80,
    justifyContent: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  userSubtitle: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  settingsSection: {
    flex: 1,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  settingsList: {
    backgroundColor: Colors.background,
  },
  logoutItem: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  appInfoSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginTop: 24,
  },
  appInfoText: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textMuted,
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
  },
  editNameContainer: {
    flex: 1,
    justifyContent: 'center',
    minHeight: 80,
  },
  nameInput: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    paddingVertical: 8,
    paddingHorizontal: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
});
