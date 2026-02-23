import React, { useMemo } from 'react';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable, Text, View, ScrollView, Alert } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../hooks/useTheme';
import type { ThemeColors } from '../types/theme';
import { Linking } from 'react-native';

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
  const buttonScale = useSharedValue(1);

  const animatePressIn = () => {
    buttonScale.value = withSpring(0.98, { damping: 20, stiffness: 400 });
  };

  const animatePressOut = () => {
    buttonScale.value = withTiming(1, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        className={`flex-row items-center justify-between px-4 py-4`}
        onPress={() => onPress?.()}
        onPressIn={animatePressIn}
        onPressOut={animatePressOut}
      >
        <Text className="text-base font-l_regular" style={{ color: colors.text }}>{label}</Text>
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
          { label: t('settings.listenMusic'), onPress: async () => {
                try {
                  const artistId = '4ubtVII1pwoqVC5DuVPUPT';
                  await Linking.openURL(`spotify:artist:${artistId}`);
                } catch (error) {
                  Alert.alert(t('common.error'), t('common.unexpectedError'));
                }
              },
          },
          { label: t('settings.otherLinks'), onPress: async () => {
                try {
                  const linktreeUrl = 'https://linktr.ee/nihhiu';
                  await Linking.openURL(linktreeUrl);
                } catch (error) {
                  Alert.alert(t('common.error'), t('common.unexpectedError'));
                }
              },
          },
        ],
      },
      {
        title: t('settings.sections.privacy'),
        items: [
          { label: t('settings.privacyPolicy'), onPress: () => navigation.navigate('PrivacyPolicy') },
          { label: t('settings.storage'), onPress: () => navigation.navigate('Storage') },
        ],
      },
      {
        title: t('settings.sections.about'),
        items: [
          { label: t('settings.about'), onPress: () => navigation.navigate('About') },
        ],
      },
    ],
    [navigation, t],
  );

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
      <Text className="mb-4 text-3xl font-l_semibold" style={{ color: colors.text }}>{t('settings.title')}</Text>

      {settingsSections.map((section) => (
        <View key={section.title} className="mb-5">
          <Text className="mb-3 text-base font-l_semibold" style={{ color: colors.textSecondary }}>{section.title}</Text>

          <Card className="rounded-2xl ml-4 p-0" themeColors={colors}>
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
    </ScrollView>
  );
};
