// #region Imports
import React from 'react';
import { Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
// #endregion

// #region Types
interface AnimatedPressableProps {
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  style?: React.ComponentProps<typeof Pressable>['style'];
  children: React.ReactNode;
  pressedScale?: number;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: React.ComponentProps<typeof Pressable>['accessibilityRole'];
  accessibilityState?: React.ComponentProps<typeof Pressable>['accessibilityState'];
}
// #endregion

// #region Component
export const AnimatedPressable: React.FC<AnimatedPressableProps> = ({
  onPress,
  onLongPress,
  disabled,
  style,
  children,
  pressedScale = 0.97,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole,
  accessibilityState,
}) => {
  const scale = useSharedValue(1);

  // Aplica redução de escala durante o toque para feedback tátil.
  const handlePressIn = () => {
    scale.value = withSpring(pressedScale, { damping: 20, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, {
      duration: 160,
      easing: Easing.out(Easing.cubic),
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        disabled={disabled}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityRole={accessibilityRole}
        accessibilityState={accessibilityState}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={style}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
};
// #endregion
