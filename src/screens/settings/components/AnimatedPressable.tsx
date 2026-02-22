import React, { useRef } from 'react';
import { Animated, Easing, Pressable } from 'react-native';

interface AnimatedPressableProps {
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  style?: React.ComponentProps<typeof Pressable>['style'];
  children: React.ReactNode;
  pressedScale?: number;
}

export const AnimatedPressable: React.FC<AnimatedPressableProps> = ({
  onPress,
  onLongPress,
  disabled,
  style,
  children,
  pressedScale = 0.97,
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: pressedScale,
      useNativeDriver: true,
      speed: 30,
      bounciness: 0,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(scale, {
      toValue: 1,
      duration: 160,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        disabled={disabled}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={style}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
};
