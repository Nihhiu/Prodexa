import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

type LoaderSize = 'small' | 'large';
type LoaderColor = 'primary' | 'secondary' | 'white';

interface LoaderProps {
  size?: LoaderSize;
  color?: LoaderColor;
  message?: string;
}

const colorMap: Record<LoaderColor, string> = {
  primary: '#3B82F6',
  secondary: '#10B981',
  white: '#FFFFFF',
};

export const Loader = ({
  size = 'large',
  color = 'primary',
  message,
}: LoaderProps) => {
  return (
    <View className="flex-1 items-center justify-center gap-4 bg-white">
      <ActivityIndicator
        size={size}
        color={colorMap[color]}
        testID="loader-indicator"
      />
      {message && <Text className="text-center text-gray-600">{message}</Text>}
    </View>
  );
};
