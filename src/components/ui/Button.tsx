import React from 'react';
import { Pressable, View } from 'react-native';
import { Text } from './Text';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '../../hooks/useTheme';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  onPress: () => void;
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  icon?: React.ReactNode;
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-2',
  md: 'px-4 py-2.5',
  lg: 'px-6 py-3',
};

export const Button = ({
  onPress,
  label,
  variant = 'primary',
  size = 'md',
  disabled = false,
  icon,
}: ButtonProps) => {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 20, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, {
      duration: 180,
      easing: Easing.out(Easing.cubic),
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const styleByVariant: Record<ButtonVariant, { backgroundColor?: string; borderColor?: string; borderWidth?: number; paddingVertical?: number; }> = {
    primary: { backgroundColor: colors.accent },
    secondary: { backgroundColor: colors.accent },
    danger: { backgroundColor: colors.accent },
    outline: { borderColor: colors.accent, borderWidth: 2, backgroundColor: 'transparent' },
  };

  const labelColor = variant === 'outline' ? colors.accent : colors.primaryText;

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        className={`flex-row items-center justify-center rounded-lg min-h-12 ${sizeStyles[size]} ${disabled ? 'opacity-50' : ''}`}
        style={styleByVariant[variant]}
      >
        <View className="flex-row items-center gap-2">
          {icon && icon}
          <Text className="font-l_semibold" style={{ color: labelColor }}>{label}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
};
