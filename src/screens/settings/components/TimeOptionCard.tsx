// #region Imports
import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';

import type { ThemeColors, ThemeTime } from '../../../types/theme';
import { SelectableCard } from './SelectableCard';
// #endregion

// #region Types
interface TimeOptionCardProps {
  t: ThemeTime;
  selected: boolean;
  colors: ThemeColors;
  label: string;
  icon: React.ComponentProps<typeof Feather>['name'];
  onPress: () => void;
}
// #endregion

// #region Component
export const TimeOptionCard: React.FC<TimeOptionCardProps> = ({
  t,
  selected,
  colors,
  label,
  icon,
  onPress,
}) => {
  const iconProgress = useSharedValue(selected ? 1 : 0);

  // Realça o ícone quando o período fica selecionado.
  useEffect(() => {
    iconProgress.value = withTiming(selected ? 1 : 0, {
      duration: 180,
      easing: Easing.out(Easing.cubic),
    });
  }, [selected]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(iconProgress.value, [0, 1], [0.92, 1.02]),
      },
      {
        rotate: `${interpolate(iconProgress.value, [0, 1], [-6, 0])}deg`,
      },
    ],
  }));

  return (
    <View key={t} className="flex-1">
      <SelectableCard selected={selected} onPress={onPress} colors={colors}>
        <View className="items-center gap-2">
          <Animated.View style={iconStyle}>
            <Feather
              name={icon}
              size={24}
              color={selected ? colors.primary : colors.textSecondary}
            />
          </Animated.View>
          <Text
            className="text-sm font-l_medium"
            style={{
              color: selected ? colors.primary : colors.textSecondary,
            }}
          >
            {label}
          </Text>
        </View>
      </SelectableCard>
    </View>
  );
};
// #endregion
