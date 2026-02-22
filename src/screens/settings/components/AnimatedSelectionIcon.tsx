import React, { useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface AnimatedSelectionIconProps {
  visible: boolean;
  color: string;
}

export const AnimatedSelectionIcon: React.FC<AnimatedSelectionIconProps> = ({
  visible,
  color,
}) => {
  const iconScale = useRef(new Animated.Value(visible ? 1 : 0.85)).current;
  const iconOpacity = useRef(new Animated.Value(visible ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(iconScale, {
        toValue: visible ? 1 : 0.85,
        duration: 150,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(iconOpacity, {
        toValue: visible ? 1 : 0,
        duration: 120,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible, iconOpacity, iconScale]);

  if (!visible) return null;

  return (
    <Animated.View style={{ opacity: iconOpacity, transform: [{ scale: iconScale }] }}>
      <Feather name="check-circle" size={24} color={color} />
    </Animated.View>
  );
};
