import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../hooks/useTheme';

export const DashboardScreen: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.background }}>
      <Text className="text-3xl font-bold" style={{ color: colors.text }}>{t('common.dashboard')}</Text>
    </View>
  );
};
