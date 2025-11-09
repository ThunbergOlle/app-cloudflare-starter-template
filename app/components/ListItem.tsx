import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { Image, ImageSource } from 'expo-image';
import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';

type IconName = keyof typeof Ionicons.glyphMap;

export interface ListItemProps {
  title: string;
  subtitle?: string;
  iconName?: IconName;
  imageSource?: ImageSource | string;
  onPress?: () => void;
  showChevron?: boolean;
  showExternal?: boolean;
  style?: object;
  disabled?: boolean;
}

export const ListItem = ({
  title,
  subtitle,
  iconName,
  imageSource,
  onPress,
  showChevron = true,
  showExternal = false,
  style,
  disabled = false,
}: ListItemProps) => {
  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      style={[styles.container, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      {imageSource ? (
        <Image
          source={imageSource}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />
      ) : iconName ? (
        <View style={styles.iconContainer}>
          <Ionicons name={iconName} size={24} color={Colors.icon} />
        </View>
      ) : null}

      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>

      {showChevron && onPress && (
        <Ionicons
          name="chevron-forward"
          size={20}
          color={Colors.icon}
          style={styles.chevron}
        />
      )}
      {showExternal && (
        <Ionicons
          name="open-outline"
          size={20}
          color={Colors.icon}
          style={styles.chevron}
        />
      )}
    </Component>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    minHeight: 60,
  },
  iconContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  image: {
    width: 60,
    height: 60,
    marginRight: 16,
    borderRadius: 2,
    backgroundColor: '#f0f0f0',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  chevron: {
    marginLeft: 8,
  },
});

