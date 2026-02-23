// #region Imports
import React, { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
  Easing,
} from 'react-native-reanimated';

import type { ThemeColors } from '../../../types/theme';
// #endregion

// #region Types
interface SelectableCardProps {
  selected: boolean;
  onPress: () => void;
  colors: ThemeColors;
  children: React.ReactNode;
}
// #endregion

// #region Component
export const SelectableCard: React.FC<SelectableCardProps> = ({
  selected,
  onPress,
  colors,
  children,
}) => {
  const scale = useSharedValue(1);
  const selectedProgress = useSharedValue(selected ? 1 : 0);

  // Progresso visual para estado selecionado (borda/escala/opacidade).
  useEffect(() => {
    selectedProgress.value = withTiming(selected ? 1 : 0, {
      duration: 180,
      easing: Easing.out(Easing.cubic),
    });
  }, [selected]);

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 20, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, {
      duration: 200,
      easing: Easing.out(Easing.cubic),
    });
  };

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(selectedProgress.value, [0, 1], [0.96, 1]);
    const selectedScale = interpolate(selectedProgress.value, [0, 1], [1, 1.012]);
    const translateY = interpolate(selectedProgress.value, [0, 1], [0, -2]);

    return {
      opacity,
      transform: [
        { scale: scale.value * selectedScale },
        { translateY },
      ],
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{
          backgroundColor: colors.card,
          borderColor: selected ? colors.primary : colors.cardBorder,
          borderWidth: selected ? 2 : 1,
          borderRadius: 12,
          padding: 16,
        }}
      >
        <View>{children}</View>
      </Pressable>
    </Animated.View>
  );
};
// #endregion
