import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, Text } from 'react-native';

type IconName = keyof typeof Ionicons.glyphMap;
export type Variant = 'primary' | 'secondary' | 'floating' | 'social' | 'ghost';

export const Button = ({
  title,
  variant = 'primary',
  onPress,
  style,
  disabled = false,
  iconName,
  rounded = true,
}: {
  title: string;
  variant?: Variant;
  onPress: () => void;
  style?: object;
  disabled?: boolean;
  iconName?: IconName;
  rounded?: boolean;
}) => {
  const variantStyle = {
    primary: {
      backgroundColor: Colors.primary,
    },
    secondary: {
      borderStyle: 'solid',
      color: Colors.primary,
      borderWidth: 2,
      borderColor: Colors.primary,
      backgroundColor: 'transparent',
    },
    floating: {
      backgroundColor: 'white',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 8,
    },
    social: {
      backgroundColor: 'white',
      borderWidth: 1,
      borderColor: '#ddd',
      borderStyle: 'solid',
    },
    ghost: {
      backgroundColor: 'transparent',
    },
  }[variant];

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        variantStyle,
        {
          flexDirection: 'row',
          justifyContent: 'center',
          alignSelf: 'stretch',
          padding: 10,
          borderRadius: rounded ? 64 : 8,
          alignItems: 'center',
        },
        style,
      ]}
      disabled={disabled}
    >
      {iconName && (
        <Ionicons
          name={iconName}
          size={20}
          color={variant === 'primary' ? 'white' : (variant === 'floating' || variant === 'social') ? '#333' : variant === 'ghost' ? '#000' : Colors.primary}
          style={{ marginRight: 8 }}
        />
      )}
      <Text
        style={{
          color: variant === 'primary' ? 'white' : (variant === 'floating' || variant === 'social') ? '#333' : variant === 'ghost' ? '#000' : Colors.primary,
          fontWeight: 'bold',
          fontSize: 16,
        }}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};
