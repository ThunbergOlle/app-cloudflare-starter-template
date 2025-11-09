import React, { useRef, useState } from 'react';
import { useSharedValue, withTiming } from 'react-native-reanimated';

import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import PagerView from 'react-native-pager-view';
import { OnboardingSlide } from '@/components/OnboardingSlide';
import { PermissionSlide } from '@/components/PermissionSlide';
import { OnboardingIndicator } from '@/components/OnboardingIndicator';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { usePermissionsOnboarding } from '@/contexts/PermissionsOnboardingContext';
import { Button } from '@/components/Button';
import { useAppTranslation } from '@/contexts/I18nContext';

const { width } = Dimensions.get('window');

const ONBOARDING_SLIDES = [
  {
    type: 'feature' as const,
    title: 'Discover Hidden Stories',
    content:
      'Uncover the fascinating history behind monuments and landmarks around you',
    iconName: 'library-outline' as const,
  },
  {
    type: 'feature' as const,
    title: 'Scan Any Monument',
    content:
      'Point your camera at monuments, statues, or historic buildings to learn their stories instantly',
    iconName: 'scan-outline' as const,
  },
  {
    type: 'feature' as const,
    title: 'Explore Nearby',
    content:
      'Find interesting monuments and landmarks near your location with our interactive map',
    iconName: 'map-outline' as const,
  },
  {
    type: 'feature' as const,
    title: 'Ready to Explore?',
    content:
      'Join thousands discovering the hidden stories in their neighborhood',
    iconName: 'rocket-outline' as const,
  },
  {
    type: 'permission' as const,
    permission: 'camera' as const,
  },
  {
    type: 'permission' as const,
    permission: 'location' as const,
  },
];

export default function OnboardingScreen() {
  const { t } = useAppTranslation();
  const { completeOnboarding } = useOnboarding();
  const { requestCameraPermission, requestLocationPermission } =
    usePermissionsOnboarding();
  const pagerRef = useRef<PagerView>(null);
  const scrollX = useSharedValue(0);
  const [currentPage, setCurrentPage] = useState(0);

  const handlePageChange = (pageIndex: number) => {
    setCurrentPage(pageIndex);
    // Update the animated value to match the current page
    scrollX.value = withTiming(pageIndex * width, { duration: 300 });
  };

  const goToNextSlide = () => {
    const nextPage = currentPage + 1;
    if (nextPage < ONBOARDING_SLIDES.length) {
      pagerRef.current?.setPage(nextPage);
    } else {
      handleCompleteOnboarding();
    }
  };

  const skipOnboarding = () => {
    // Jump to camera slide (index 4) instead of completing onboarding
    const cameraSlideIndex = ONBOARDING_SLIDES.findIndex(
      (slide) => slide.type === 'permission' && slide.permission === 'camera'
    );
    if (cameraSlideIndex !== -1) {
      pagerRef.current?.setPage(cameraSlideIndex);
    }
  };

  const skipToNextPermission = () => {
    goToNextSlide();
  };

  const handleCompleteOnboarding = async () => {
    try {
      await completeOnboarding();
      router.replace('/auth/login');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      router.replace('/auth/login');
    }
  };

  const handleBottomPermissionRequest = async () => {
    const currentSlide = ONBOARDING_SLIDES[currentPage];
    if (currentSlide?.type === 'permission') {
      try {
        if (currentSlide.permission === 'camera') {
          await requestCameraPermission();
        } else if (currentSlide.permission === 'location') {
          await requestLocationPermission();
        }
        goToNextSlide();
      } catch (error) {
        console.error('Error requesting permission from bottom button:', error);
        goToNextSlide(); // Continue anyway
      }
    }
  };

  const isLastSlide = currentPage === ONBOARDING_SLIDES.length - 1;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#8B4513" />

      {/* Skip Button - only show on feature slides */}
      {ONBOARDING_SLIDES[currentPage]?.type === 'feature' && (
        <TouchableOpacity style={styles.skipButton} onPress={skipOnboarding}>
          <Text style={styles.skipText}>{t('onboarding.skip')}</Text>
        </TouchableOpacity>
      )}

      {/* Slides */}
      <PagerView
        ref={pagerRef}
        style={styles.pager}
        initialPage={0}
        onPageSelected={(e) => handlePageChange(e.nativeEvent.position)}
      >
        {ONBOARDING_SLIDES.map((slide, index) => (
          <View key={index} style={styles.slideContainer}>
            {slide.type === 'feature' ? (
              <OnboardingSlide
                title={slide.title}
                content={slide.content}
                iconName={slide.iconName}
              />
            ) : (
              <PermissionSlide
                type={slide.permission}
                onSkip={skipToNextPermission}
              />
            )}
          </View>
        ))}
      </PagerView>

      {/* Bottom Section */}
      <View style={styles.bottomContainer}>
        {/* Page Indicators */}
        <OnboardingIndicator
          totalSlides={ONBOARDING_SLIDES.length}
          scrollX={scrollX}
          width={width}
        />

        {/* Action Button */}
        <View style={styles.buttonContainer}>
          {ONBOARDING_SLIDES[currentPage]?.type === 'feature' ? (
            <Button
              title={
                isLastSlide ? t('onboarding.getStarted') : t('onboarding.next')
              }
              onPress={goToNextSlide}
              style={styles.actionButton}
              variant="floating"
            />
          ) : (
            ONBOARDING_SLIDES[currentPage]?.type === 'permission' && (
              <Button
                title={t('onboarding.next')}
                onPress={handleBottomPermissionRequest}
                style={styles.actionButton}
                variant="floating"
              />
            )
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8B4513',
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 1000,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    fontWeight: '500',
  },
  pager: {
    flex: 1,
  },
  slideContainer: {
    flex: 1,
  },
  bottomContainer: {
    paddingBottom: 50,
    paddingHorizontal: 40,
  },
  buttonContainer: {
    marginTop: 20,
  },
  actionButton: {
    backgroundColor: 'white',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
});
