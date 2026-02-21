import React from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

export const StorageScreen: React.FC = () => {
  const { colors } = useTheme();

  return (
    <View className="flex-1 items-center justify-center px-6 py-8" style={{ backgroundColor: colors.background }}>
      <Text className="text-3xl font-bold" style={{ color: colors.text }}>Armazenamento</Text>
    </View>
  );
};
