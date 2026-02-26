// #region Imports
import React, { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '../../../components/ui';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
  interpolateColor,
  Easing,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';

import type { ThemeColors } from '../../../types/theme';
// #endregion

// #region Types
interface StorageLocationCardProps {
  selected: boolean;
  onPress: () => void;
  colors: ThemeColors;
  icon: React.ComponentProps<typeof Feather>['name'];
  title: string;
  description: string;
  badge?: string;
}
// #endregion

// #region Component
export const StorageLocationCard: React.FC<StorageLocationCardProps> = ({
  selected,
  onPress,
  colors,
  icon,
  title,
  description,
  badge,
}) => {
  const scale = useSharedValue(1);
  const selectedProgress = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    selectedProgress.value = withTiming(selected ? 1 : 0, {
      duration: 220,
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

  const animatedContainerStyle = useAnimatedStyle(() => {
    const translateY = interpolate(selectedProgress.value, [0, 1], [0, -2]);
    return {
      opacity: interpolate(selectedProgress.value, [0, 1], [0.85, 1]),
      transform: [
        { scale: scale.value },
        { translateY },
      ],
    };
  });

  const animatedIconBgStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      selectedProgress.value,
      [0, 1],
      [colors.card, colors.primary + '20'],
    ),
  }));

  const animatedCheckStyle = useAnimatedStyle(() => ({
    opacity: selectedProgress.value,
    transform: [
      { scale: interpolate(selectedProgress.value, [0, 1], [0.5, 1]) },
    ],
  }));

  return (
    <Animated.View style={animatedContainerStyle} className="flex-1">
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{
          backgroundColor: colors.card,
          borderColor: selected ? colors.primary : colors.cardBorder,
          borderWidth: selected ? 2 : 1,
          borderRadius: 16,
          padding: 16,
          gap: 12,
        }}
      >
        {/* Icon + check */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Animated.View
            style={[
              animatedIconBgStyle,
              {
                width: 44,
                height: 44,
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
              },
            ]}
          >
            <Feather
              name={icon}
              size={22}
              color={selected ? colors.primary : colors.textSecondary}
            />
          </Animated.View>

          <Animated.View style={animatedCheckStyle}>
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Feather name="check" size={14} color={colors.primaryText} />
            </View>
          </Animated.View>
        </View>

        {/* Text */}
        <View style={{ gap: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text className="text-base font-l_semibold" style={{ color: colors.text }}>
              {title}
            </Text>
            {badge && (
              <View
                style={{
                  backgroundColor: colors.accent + '20',
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 6,
                }}
              >
                <Text className="text-xs font-l_medium" style={{ color: colors.accent }}>
                  {badge}
                </Text>
              </View>
            )}
          </View>
          <Text className="text-xs font-l_regular" style={{ color: colors.textSecondary }}>
            {description}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
};
// #endregion
