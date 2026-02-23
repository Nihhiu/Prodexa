import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../hooks/useTheme';

export const HomeScreen: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <ScrollView
      className="flex-1 px-4 pt-12"
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{
        backgroundColor: colors.background,
        paddingBottom: 120
      }}
      overScrollMode="always"
    >
      <View className="mb-4 text-3xl font-l_semibold" style={{ backgroundColor: colors.background }}>
        <Text className="text-3xl font-l_bold" style={{ color: colors.text }}>{t('common.home')}</Text>
      </View>
    </ScrollView>
  );
};
