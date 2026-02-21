import React from 'react';
import { Pressable, Text, View } from 'react-native';

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

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-blue-600 active:bg-blue-700',
  secondary: 'bg-green-600 active:bg-green-700',
  danger: 'bg-red-600 active:bg-red-700',
  outline: 'border-2 border-blue-600 active:bg-blue-50',
};

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
  const textColor = variant === 'outline' ? 'text-blue-600' : 'text-white';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`flex-row items-center justify-center rounded-lg ${sizeStyles[size]} ${
        disabled ? 'opacity-50' : ''
      } ${variantStyles[variant]}`}
    >
      <View className="flex-row items-center gap-2">
        {icon && icon}
        <Text className={`font-semibold ${textColor}`}>{label}</Text>
      </View>
    </Pressable>
  );
};
