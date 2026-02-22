import React, { useRef } from 'react';
import { Animated, Easing, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import type { ThemeColors, ThemeTime } from '../../../types/theme';
import { SelectableCard } from './SelectableCard';

interface TimeOptionCardProps {
  t: ThemeTime;
  selected: boolean;
  colors: ThemeColors;
  label: string;
  icon: React.ComponentProps<typeof Feather>['name'];
  onPress: () => void;
}

export const TimeOptionCard: React.FC<TimeOptionCardProps> = ({
  t,
  selected,
  colors,
  label,
  icon,
  onPress,
}) => {
  const iconProgress = useRef(new Animated.Value(selected ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.timing(iconProgress, {
      toValue: selected ? 1 : 0,
      duration: 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [selected, iconProgress]);

  return (
    <View key={t} className="flex-1">
      <SelectableCard selected={selected} onPress={onPress} colors={colors}>
        <View className="items-center gap-2">
          <Animated.View
            style={{
              transform: [
                {
                  scale: iconProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.92, 1.02],
                  }),
                },
                {
                  rotate: iconProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['-6deg', '0deg'],
                  }),
                },
              ],
            }}
          >
            <Feather
              name={icon}
              size={24}
              color={selected ? colors.primary : colors.textSecondary}
            />
          </Animated.View>
          <Text
            className="text-sm font-medium"
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
