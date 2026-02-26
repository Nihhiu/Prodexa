import React from 'react';
import { View, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../hooks/useTheme';
import { ScreenHeader } from './settings/components';

export const HomeScreen: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* HEADER */}
      <ScreenHeader title={t('common.home')} isParent={true} />

      {/* CONTENT */}
      <ScrollView
        className="flex-1 px-4"
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={{
          backgroundColor: colors.background,
          paddingBottom: 120,
        }}
        overScrollMode="always"
      />
    </View>
  );
};
