import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

type IconName = keyof typeof Ionicons.glyphMap;

export interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  showBackText?: boolean;
  onBackPress?: () => void;
  rightIcon?: IconName;
  onRightPress?: () => void;
  backgroundColor?: string;
  textColor?: string;
  style?: object;
}

export const Header = ({
  title,
  showBackButton = true,
  showBackText = false,
  onBackPress,
  rightIcon,
  onRightPress,
  backgroundColor = Colors.background,
  textColor = Colors.text,
  style,
}: HeaderProps) => {
  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView style={[{ backgroundColor }, style]}>
      <View style={[styles.header, { backgroundColor }]}>
        {showBackButton ? (
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackPress}
          >
            <Ionicons name="arrow-back" size={24} color={textColor} />
            {showBackText && (
              <Text style={[styles.backText, { color: textColor }]}>Back</Text>
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}

        <Text style={[styles.title, { color: textColor }]}>{title}</Text>

        {rightIcon && onRightPress ? (
          <TouchableOpacity style={styles.rightButton} onPress={onRightPress}>
            <Ionicons name={rightIcon} size={24} color={textColor} />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  backText: {
    fontSize: 16,
    fontWeight: '400',
    marginLeft: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
  },
  placeholder: {
    width: 40,
  },
  rightButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

