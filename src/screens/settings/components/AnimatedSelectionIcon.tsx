// #region Imports
import React, { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
// #endregion

// #region Types
interface AnimatedSelectionIconProps {
  visible: boolean;
  color: string;
}
// #endregion

// #region Component
export const AnimatedSelectionIcon: React.FC<AnimatedSelectionIconProps> = ({
  visible,
  color,
}) => {
  const iconScale = useSharedValue(visible ? 1 : 0.85);
  const iconOpacity = useSharedValue(visible ? 1 : 0);

  // Sincroniza escala/opacidade com o estado de seleção.
  useEffect(() => {
    iconScale.value = withTiming(visible ? 1 : 0.85, {
      duration: 150,
      easing: Easing.out(Easing.cubic),
    });
    iconOpacity.value = withTiming(visible ? 1 : 0, {
      duration: 120,
      easing: Easing.out(Easing.quad),
    });
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: iconOpacity.value,
    transform: [{ scale: iconScale.value }],
  }));

  if (!visible) return null;

  return (
    <Animated.View style={animatedStyle}>
      <Feather name="check-circle" size={24} color={color} />
    </Animated.View>
  );
};
// #endregion
