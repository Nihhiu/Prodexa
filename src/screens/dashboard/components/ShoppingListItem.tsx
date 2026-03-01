// #region Imports
import React from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '../../../components/ui';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
  FadeInDown,
  FadeOut,
  Layout,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../../hooks/useTheme';
// #endregion

// #region Types
export interface ShoppingItem {
  id: string;
  name: string;
  quantity: string;
  store: string;
  price: string;
  addedBy: string;
}

interface ShoppingListItemProps {
  item: ShoppingItem;
  index?: number;
  isShoppingMode: boolean;
  isChecked: boolean;
  onToggleCheck: (id: string) => void;
  onRemove: (id: string) => void;
}
// #endregion

// #region Component
export const ShoppingListItem: React.FC<ShoppingListItemProps> = ({
  item,
  index = 0,
  isShoppingMode,
  isChecked,
  onToggleCheck,
  onRemove,
}) => {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 20, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    if (isShoppingMode) {
      onToggleCheck(item.id);
    }
  };

  const enteringAnimation = FadeInDown
    .duration(180)
    .delay(Math.min(index * 32, 224))
    .easing(Easing.out(Easing.cubic));

  return (
    <Animated.View
      entering={enteringAnimation}
      exiting={FadeOut.duration(160)}
      layout={Layout.duration(180).easing(Easing.out(Easing.cubic))}
    >
      <Animated.View style={animatedStyle}>
        <Pressable
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={!isShoppingMode}
          className="mb-3 rounded-xl p-4"
          style={{
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: isChecked ? colors.primary : colors.cardBorder,
            opacity: isChecked ? 0.65 : 1,
          }}
        >
          <View className="flex-row items-center">
            {/* Checkbox in shopping mode */}
            {isShoppingMode && (
              <View className="mr-3">
                <Feather
                  name={isChecked ? 'check-circle' : 'circle'}
                  size={24}
                  color={isChecked ? colors.primary : colors.textSecondary}
                />
              </View>
            )}

            {/* Item info */}
            <View className="flex-1">
              <Text
                className="text-base font-l_semibold"
                style={{
                  color: colors.text,
                  textDecorationLine: isChecked ? 'line-through' : 'none',
                }}
              >
                {item.name}
              </Text>
              <View className="flex-row flex-wrap items-center mt-1 gap-3">
                {!!item.quantity && (
                  <View className="flex-row items-center gap-1">
                    <Feather name="hash" size={12} color={colors.textSecondary} />
                    <Text className="text-sm font-l_regular" style={{ color: colors.textSecondary }}>
                      {item.quantity}
                    </Text>
                  </View>
                )}
                {!!item.store && (
                  <View className="flex-row items-center gap-1">
                    <Feather name="map-pin" size={12} color={colors.textSecondary} />
                    <Text className="text-sm font-l_regular" style={{ color: colors.textSecondary }}>
                      {item.store}
                    </Text>
                  </View>
                )}
                {!!item.price && (
                  <View className="flex-row items-center gap-1">
                    <Feather name="tag" size={12} color={colors.textSecondary} />
                    <Text className="text-sm font-l_regular" style={{ color: colors.textSecondary }}>
                      {item.price}€
                    </Text>
                  </View>
                )}
                {!!item.addedBy && (
                  <View className="flex-row items-center gap-1">
                    <Feather name="user" size={12} color={colors.textSecondary} />
                    <Text className="text-sm font-l_regular" style={{ color: colors.textSecondary }}>
                      {item.addedBy}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Delete button (normal mode only) */}
            {!isShoppingMode && (
              <Pressable
                onPress={() => onRemove(item.id)}
                className="p-2 rounded-lg"
                hitSlop={8}
              >
                <Feather name="trash-2" size={18} color={colors.accent} />
              </Pressable>
            )}
          </View>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
};
// #endregion
