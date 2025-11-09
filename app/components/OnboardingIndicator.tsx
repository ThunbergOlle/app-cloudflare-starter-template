import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  interpolate, 
  Extrapolation 
} from 'react-native-reanimated';

interface OnboardingIndicatorProps {
  totalSlides: number;
  scrollX: Animated.SharedValue<number>;
  width: number;
}

function AnimatedDot({ 
  index, 
  scrollX, 
  width 
}: { 
  index: number; 
  scrollX: Animated.SharedValue<number>; 
  width: number; 
}) {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width,
    ];

    const dotWidth = interpolate(
      scrollX.value,
      inputRange,
      [8, 24, 8],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.4, 1, 0.4],
      Extrapolation.CLAMP
    );

    return {
      width: dotWidth,
      opacity,
    };
  });

  return <Animated.View style={[styles.dot, animatedStyle]} />;
}

export function OnboardingIndicator({ 
  totalSlides, 
  scrollX, 
  width 
}: OnboardingIndicatorProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: totalSlides }).map((_, index) => (
        <AnimatedDot
          key={index}
          index={index}
          scrollX={scrollX}
          width={width}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
    marginHorizontal: 4,
  },
});