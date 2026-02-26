// #region Imports
import React from 'react';
import { ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '../../components/ui';
import { useTheme } from '../../hooks/useTheme';
import { ScreenHeader } from './components';
// #endregion

// #region Screen
export const WatchAdsScreen: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* HEADER */}
      <ScreenHeader title={t('watchAds.title')} isParent={false} />

      {/* CONTENT */}
      <ScrollView
        className="flex-1 px-4 pt-4 pb-12"
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={{
          flexGrow: 1,
          backgroundColor: colors.background,
          paddingBottom: 120
        }}
        overScrollMode="always"
      >
        <Text className="text-3xl font-l_bold" style={{ color: colors.text }}>{t('watchAds.title')}</Text>
      </ScrollView>
    </View>
  );
};
// #endregion
