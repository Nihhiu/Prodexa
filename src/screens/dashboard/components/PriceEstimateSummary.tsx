// #region Imports
import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
  Layout,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../hooks/useTheme';
import type { ShoppingItem } from './ShoppingListItem';
// #endregion

// #region Types
interface PriceEstimateSummaryProps {
  items: ShoppingItem[];
  checkedItemIds: Set<string>;
}
// #endregion

// #region Component
export const PriceEstimateSummary: React.FC<PriceEstimateSummaryProps> = ({
  items,
  checkedItemIds,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const { totalPrice, checkedCount, withoutPriceCount } = useMemo(() => {
    let total = 0;
    let withPrice = 0;
    let withoutPrice = 0;

    for (const item of items) {
      if (!checkedItemIds.has(item.id)) continue;

      const parsed = parseFloat(item.price?.replace(',', '.'));
      const qty = parseFloat(item.quantity?.replace(',', '.')) || 1;

      if (!isNaN(parsed) && parsed > 0) {
        total += parsed * qty;
        withPrice++;
      } else {
        withoutPrice++;
      }
    }

    return {
      totalPrice: total,
      checkedCount: withPrice + withoutPrice,
      withoutPriceCount: withoutPrice,
    };
  }, [items, checkedItemIds]);

  if (checkedCount === 0) return null;

  const formattedPrice = totalPrice.toFixed(2).replace('.', ',');

  return (
    <Animated.View
      entering={FadeIn.duration(280).springify().damping(18).stiffness(200)}
      exiting={FadeOut.duration(200)}
      layout={Layout.springify().damping(18).stiffness(200)}
    >
      <View
        className="mx-4 mb-3 rounded-xl overflow-hidden"
        style={{
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.cardBorder,
        }}
      >
        {/* Main price row */}
        <View className="flex-row items-center justify-between px-4 py-3">
          <View className="flex-row items-center gap-2.5">
            <View
              className="rounded-lg p-2"
              style={{ backgroundColor: colors.primary + '15' }}
            >
              <Feather name="shopping-bag" size={18} color={colors.primary} />
            </View>
            <View>
              <Text
                className="text-xs font-l_regular"
                style={{ color: colors.textSecondary }}
              >
                {t('shoppingList.estimatedTotal')}
              </Text>
              <Text
                className="text-xl font-l_bold"
                style={{ color: colors.text }}
              >
                {formattedPrice}€
              </Text>
            </View>
          </View>

          <View
            className="px-3 py-1 rounded-full"
            style={{ backgroundColor: colors.primary + '15' }}
          >
            <Text
              className="text-xs font-l_semibold"
              style={{ color: colors.primary }}
            >
              {checkedCount} {checkedCount === 1
                ? t('shoppingList.itemSingular')
                : t('shoppingList.itemPlural')}
            </Text>
          </View>
        </View>

        {/* Warning: items without price */}
        {withoutPriceCount > 0 && (
          <Animated.View
            entering={FadeIn.duration(220)}
            exiting={FadeOut.duration(160)}
          >
            <View
              className="flex-row items-center gap-2 px-4 py-2.5"
              style={{
                backgroundColor: colors.accent + '10',
                borderTopWidth: 1,
                borderTopColor: colors.cardBorder,
              }}
            >
              <Feather name="alert-circle" size={13} color={colors.accent} />
              <Text
                className="text-xs font-l_regular flex-1"
                style={{ color: colors.accent }}
              >
                {withoutPriceCount === 1
                  ? t('shoppingList.itemWithoutPriceSingular')
                  : t('shoppingList.itemWithoutPricePlural', { count: withoutPriceCount })}
              </Text>
            </View>
          </Animated.View>
        )}
      </View>
    </Animated.View>
  );
};
// #endregion
