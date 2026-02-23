import React from 'react';
import { Pressable, Text, View } from 'react-native';
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

  const styleByVariant: Record<ButtonVariant, { backgroundColor?: string; borderColor?: string; borderWidth?: number }> = {
    primary: { backgroundColor: colors.primary },
    secondary: { backgroundColor: colors.accent },
    danger: { backgroundColor: colors.accent },
    outline: { borderColor: colors.primary, borderWidth: 2, backgroundColor: 'transparent' },
  };

  const labelColor = variant === 'outline' ? colors.primary : colors.primaryText;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`flex-row items-center justify-center rounded-lg ${sizeStyles[size]} ${disabled ? 'opacity-50' : ''}`}
      style={styleByVariant[variant]}
    >
      <View className="flex-row items-center gap-2">
        {icon && icon}
        <Text className="font-l_semibold" style={{ color: labelColor }}>{label}</Text>
      </View>
    </Pressable>
  );
};
