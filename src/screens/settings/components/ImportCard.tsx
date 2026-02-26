// #region Imports
import React, { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '../../../components/ui';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import type { ThemeColors } from '../../../types/theme';
// #endregion

// #region Types
interface ImportCardProps {
  colors: ThemeColors;
  onPress: () => void;
}
// #endregion

// #region Component
export const ImportCard: React.FC<ImportCardProps> = ({ colors, onPress }) => {
  const scale = useSharedValue(1);
  const iconPulse = useSharedValue(0);
  const { t } = useTranslation();

  // Pulso contínuo no ícone para destacar ação de importação.
  useEffect(() => {
    iconPulse.value = withRepeat(
      withSequence(
        withTiming(1, {
          duration: 900,
          easing: Easing.inOut(Easing.quad),
        }),
        withTiming(0, {
          duration: 900,
          easing: Easing.inOut(Easing.quad),
        }),
      ),
      -1,
      false,
    );
  }, []);

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 20, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, {
      duration: 200,
      easing: Easing.out(Easing.cubic),
    });
  };

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: interpolate(iconPulse.value, [0, 1], [0.9, 1]),
    transform: [
      { scale: interpolate(iconPulse.value, [0, 1], [1, 1.06]) },
    ],
  }));

  return (
    <Animated.View style={containerStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
          borderWidth: 2,
          borderStyle: 'dashed',
          borderRadius: 12,
          padding: 16,
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 120,
        }}
      >
        <View
          style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Animated.View style={pulseStyle}>
            <Feather name="plus" size={32} color={colors.card} />
          </Animated.View>
        </View>
        <Text className="mt-3 text-sm font-l_medium" style={{ color: colors.textSecondary }}>
          {t('appearance.importTheme')}
        </Text>
      </Pressable>
    </Animated.View>
  );
};
// #endregion
