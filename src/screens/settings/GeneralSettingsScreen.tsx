// #region Imports
import React from 'react';
import { ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Card, Input, Text } from '../../components/ui';
import { useTheme } from '../../hooks/useTheme';
import { useUser } from '../../hooks/useUser';
import { ScreenHeader } from './components';
// #endregion

// #region Screen
export const GeneralSettingsScreen: React.FC = () => {
  const { colors } = useTheme();
  const { name, setName } = useUser();
  const { t } = useTranslation();

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScreenHeader title={t('general.title')} />
      <ScrollView
        className="flex-1 px-4 pt-4 pb-10"
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={{
          flexGrow: 1,
          backgroundColor: colors.background,
        }}
        overScrollMode="always"
      >

      <View className="mb-5">
        <Text className="mb-3 text-lg font-l_semibold" style={{ color: colors.text }}>
          {t('general.profile')}
        </Text>

        <Card className="rounded-2xl" themeColors={colors}>
          <Input
            label={t('general.nameLabel')}
            placeholder={t('general.namePlaceholder')}
            value={name}
            onChangeText={setName}
            inputClassName="font-l_light"
            backgroundTone="background"
          />
        </Card>
      </View>
      </ScrollView>
    </View>
  );
};
// #endregion
