import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface OnboardingSlideProps {
  title: string;
  content: string;
  iconName: keyof typeof Ionicons.glyphMap;
  backgroundColor?: string;
}

export function OnboardingSlide({
  title,
  content,
  iconName,
  backgroundColor = '#8B4513',
}: OnboardingSlideProps) {
  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <View style={styles.iconBackground}>
            <Ionicons name={iconName} size={80} color="white" />
          </View>
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{content}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: 320,
  },
  iconContainer: {
    marginBottom: 60,
    alignItems: 'center',
  },
  iconBackground: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 38,
  },
  description: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 26,
    fontWeight: '400',
  },
});

