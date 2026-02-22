import React, { useMemo, useRef } from 'react';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Animated, Easing, Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../hooks/useTheme';
import type { ThemeColors } from '../types/theme';

import { Card } from '../components/ui';
import { RootStackParamList } from '../navigation';

interface SectionData {
  title: string;
  items: { 
    label: string,
    onPress?: () => void;
  }[];
}

interface AnimatedSettingsItemProps {
  label: string;
  onPress?: () => void;
  colors: ThemeColors;
}

const AnimatedSettingsItem: React.FC<AnimatedSettingsItemProps> = ({
  label,
  onPress,
  colors,
}) => {
  const buttonScale = useRef(new Animated.Value(1)).current;

  const animatePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.98,
      useNativeDriver: true,
      speed: 30,
      bounciness: 0,
    }).start();
  };

  const animatePressOut = () => {
    Animated.timing(buttonScale, {
      toValue: 1,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
      <Pressable
        className={`flex-row items-center justify-between px-4 py-4`}
        onPress={() => onPress?.()}
        onPressIn={animatePressIn}
        onPressOut={animatePressOut}
      >
        <Text className="text-base" style={{ color: colors.text }}>{label}</Text>
        <Feather name="chevron-right" size={20} color={colors.textSecondary} />
      </Pressable>
    </Animated.View>
  );
};

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();
  const { t } = useTranslation();

  const settingsSections: SectionData[] = useMemo(
    () => [
      {
        title: t('settings.sections.settings'),
        items: [
          { label: t('settings.general'), onPress: () => navigation.navigate('GeneralSettings') },
          { label: t('settings.appearance'), onPress: () => navigation.navigate('Appearance') },
          { label: t('settings.notifications'), onPress: () => navigation.navigate('Notifications') },
        ],
      },
      {
        title: t('settings.sections.support'),
        items: [
          { label: t('settings.watchAds'), onPress: () => navigation.navigate('WatchAds') },
          { label: t('settings.listenMusic'), onPress: () => navigation.navigate('ListenMusic') },
          { label: t('settings.otherLinks'), onPress: () => navigation.navigate('OtherLinks') },
        ],
      },
      {
        title: t('settings.sections.privacy'),
        items: [
          { label: t('settings.privacyPolicy'), onPress: () => navigation.navigate('PrivacyPolicy') },
          { label: t('settings.storage'), onPress: () => navigation.navigate('Storage') },
        ],
      },
    ],
    [navigation, t],
  );

  return (
    <View className="flex-1 px-6 py-8 overflow-y-auto" style={{ backgroundColor: colors.background }}>
      <Text className="mb-4 text-3xl font-bold" style={{ color: colors.text }}>{t('settings.title')}</Text>

      {settingsSections.map((section) => (
        <View key={section.title} className="mb-5">
          <Text className="mb-3 text-base font-semibold" style={{ color: colors.textSecondary }}>{section.title}</Text>

          <Card className="rounded-2xl p-0" themeColors={colors}>
            {section.items.map((item) => (
              <AnimatedSettingsItem
                key={item.label}
                label={item.label}
                onPress={item.onPress}
                colors={colors}
              />
            ))}
          </Card>
        </View>
      ))}
    </View>
  );
};
