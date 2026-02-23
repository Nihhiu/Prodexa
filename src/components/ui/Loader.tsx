import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

type LoaderSize = 'small' | 'large';
type LoaderColor = 'primary' | 'secondary' | 'white';

interface LoaderProps {
  size?: LoaderSize;
  color?: LoaderColor;
  message?: string;
}

export const Loader = ({
  size = 'large',
  color = 'primary',
  message,
}: LoaderProps) => {
  const { colors } = useTheme();

  const colorMap: Record<LoaderColor, string> = {
    primary: colors.primary,
    secondary: colors.accent,
    white: colors.primaryText,
  };

  return (
    <View className="flex-1 items-center justify-center gap-4" style={{ backgroundColor: colors.background }}>
      <ActivityIndicator
        size={size}
        color={colorMap[color]}
        testID="loader-indicator"
      />
      {message && <Text className="text-center" style={{ color: colors.textSecondary }}>{message}</Text>}
    </View>
  );
};
