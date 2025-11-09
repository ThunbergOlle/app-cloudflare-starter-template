import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTranslation } from '@/contexts/I18nContext';

const { width } = Dimensions.get('window');

interface PermissionSlideProps {
  type: 'camera' | 'location';
  onSkip: () => void;
}

export function PermissionSlide({ type, onSkip }: PermissionSlideProps) {
  const { t } = useAppTranslation();

  const isCamera = type === 'camera';
  
  const config = isCamera ? {
    icon: 'camera' as const,
    title: t('onboarding.camera.title'),
    description: t('onboarding.camera.description'),
    benefits: [
      { icon: 'scan-outline' as const, text: t('onboarding.camera.benefit1') },
      { icon: 'library-outline' as const, text: t('onboarding.camera.benefit2') },
      { icon: 'flash-outline' as const, text: t('onboarding.camera.benefit3') },
    ],
  } : {
    icon: 'location' as const,
    title: t('onboarding.location.title'),
    description: t('onboarding.location.description'),
    benefits: [
      { icon: 'map-outline' as const, text: t('onboarding.location.benefit1') },
      { icon: 'compass-outline' as const, text: t('onboarding.location.benefit2') },
      { icon: 'notifications-outline' as const, text: t('onboarding.location.benefit3') },
    ],
  };

  const handleSkip = () => {
    onSkip();
  };

  return (
    <View style={styles.container}>
      {/* Not Now Button - Top Right */}
      <TouchableOpacity
        style={styles.notNowTopButton}
        onPress={handleSkip}
      >
        <Text style={styles.notNowTopText}>
          {t('onboarding.camera.notNow')}
        </Text>
      </TouchableOpacity>

      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name={config.icon} size={80} color="white" />
        </View>

        {/* Title */}
        <Text style={styles.title}>{config.title}</Text>

        {/* Description */}
        <Text style={styles.description}>{config.description}</Text>

        {/* Benefits List */}
        <View style={styles.benefitsList}>
          {config.benefits.map((benefit, index) => (
            <View key={index} style={styles.benefitItem}>
              <Ionicons name={benefit.icon} size={24} color="rgba(255, 255, 255, 0.8)" />
              <Text style={styles.benefitText}>{benefit.text}</Text>
            </View>
          ))}
        </View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width,
  },
  notNowTopButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 1000,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  notNowTopText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  benefitsList: {
    width: '100%',
    alignItems: 'flex-start',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  benefitText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
});