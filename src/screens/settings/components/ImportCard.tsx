import React, { useRef } from 'react';
import { Animated, Easing, Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import type { ThemeColors } from '../../../types/theme';

interface ImportCardProps {
  colors: ThemeColors;
  onPress: () => void;
}

export const ImportCard: React.FC<ImportCardProps> = ({ colors, onPress }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const iconPulse = useRef(new Animated.Value(0)).current;
  const { t } = useTranslation();

  React.useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(iconPulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(iconPulse, {
          toValue: 0,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );

    pulseLoop.start();
    return () => pulseLoop.stop();
  }, [iconPulse]);

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 30,
      bounciness: 0,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(scale, {
      toValue: 1,
      duration: 200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
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
          <Animated.View
            style={{
              opacity: iconPulse.interpolate({
                inputRange: [0, 1],
                outputRange: [0.9, 1],
              }),
              transform: [
                {
                  scale: iconPulse.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.06],
                  }),
                },
              ],
            }}
          >
            <Feather name="plus" size={32} color={colors.card} />
          </Animated.View>
        </View>
        <Text className="mt-3 text-sm font-medium" style={{ color: colors.textSecondary }}>
          {t('appearance.importTheme')}
        </Text>
      </Pressable>
    </Animated.View>
  );
};
