// #region Imports
import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '../../components/ui';
import { useTheme } from '../../hooks/useTheme';
import { ScreenHeader } from './components';
// #endregion

// #region Screen
export const AboutScreen: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScreenHeader title={t('about.title')} />
      <View className="flex-1 items-center justify-center px-6 py-8">
        <Text className="text-3xl font-l_bold" style={{ color: colors.text }}>{t('about.title')}</Text>
      </View>
    </View>
  );
};
// #endregion
