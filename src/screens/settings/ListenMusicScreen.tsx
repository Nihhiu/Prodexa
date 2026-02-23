// #region Imports
import React from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../hooks/useTheme';
// #endregion

// #region Screen
export const ListenMusicScreen: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <View className="flex-1 items-center justify-center px-6 py-8" style={{ backgroundColor: colors.background }}>
      <Text className="text-3xl font-l_bold" style={{ color: colors.text }}>{t('listenMusic.title')}</Text>
    </View>
  );
};
// #endregion
