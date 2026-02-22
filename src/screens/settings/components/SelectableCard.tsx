import React, { useRef } from 'react';
import { Animated, Easing, Pressable, View } from 'react-native';

import type { ThemeColors } from '../../../types/theme';

interface SelectableCardProps {
  selected: boolean;
  onPress: () => void;
  colors: ThemeColors;
  children: React.ReactNode;
}

export const SelectableCard: React.FC<SelectableCardProps> = ({
  selected,
  onPress,
  colors,
  children,
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const selectedProgress = useRef(new Animated.Value(selected ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.timing(selectedProgress, {
      toValue: selected ? 1 : 0,
      duration: 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [selected, selectedProgress]);

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
    <Animated.View
      style={{
        opacity: selectedProgress.interpolate({
          inputRange: [0, 1],
          outputRange: [0.96, 1],
        }),
        transform: [
          { scale },
          {
            scale: selectedProgress.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.012],
            }),
          },
          {
            translateY: selectedProgress.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -2],
            }),
          },
        ],
      }}
    >
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
