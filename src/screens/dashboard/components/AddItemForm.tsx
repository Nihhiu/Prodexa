// #region Imports
import React from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  FadeInDown,
  FadeOutDown,
  FadeOutUp,
  Layout,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { Button, Card, Input, Text } from '../../../components/ui';
import { useTheme } from '../../../hooks/useTheme';
// #endregion

// #region Types
interface AddItemFormProps {
  name: string;
  quantity: string;
  store: string;
  price: string;
  onNameChange: (text: string) => void;
  onQuantityChange: (text: string) => void;
  onStoreChange: (text: string) => void;
  onPriceChange: (text: string) => void;
  onAdd: () => void;
  onCancel: () => void;
}
// #endregion

// #region Component
export const AddItemForm: React.FC<AddItemFormProps> = ({
  name,
  quantity,
  store,
  price,
  onNameChange,
  onQuantityChange,
  onStoreChange,
  onPriceChange,
  onAdd,
  onCancel,
}) => {
  const { t } = useTranslation();
  const { colors, compactMode } = useTheme();
  const [showOptionalFields, setShowOptionalFields] = React.useState(!compactMode);

  // Sync the default state when compactMode preference changes
  React.useEffect(() => {
    setShowOptionalFields(!compactMode);
  }, [compactMode]);

  return (
    <Animated.View
      entering={FadeInDown.duration(250)}
      exiting={FadeOutDown.duration(200)}
    >
      <Card className="mb-4" title={t('shoppingList.addItem')}>
        <Animated.View
          className="gap-3"
          layout={Layout.springify().damping(16).stiffness(180)}
        >
          <Input
            label={t('shoppingList.name') + '(*)'}
            placeholder={t('shoppingList.namePlaceholder')}
            value={name}
            onChangeText={onNameChange}
            backgroundTone="background"
          />

          <Pressable
            onPress={() => setShowOptionalFields(prev => !prev)}
            className="self-start"
            hitSlop={8}
          >
            <Text
              className="font-l_semibold text-sm"
              style={{ color: colors.accent }}
            >
              {showOptionalFields
                ? t('common.showLess', { defaultValue: 'Show less' })
                : t('common.showMore', { defaultValue: 'Show more' })}
            </Text>
          </Pressable>

          {showOptionalFields && (
            <Animated.View
              entering={FadeInDown.duration(220)}
              exiting={FadeOutUp.duration(180)}
              layout={Layout.springify().damping(16).stiffness(180)}
              className="gap-3"
            >
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Input
                    label={t('shoppingList.quantity')}
                    placeholder={t('shoppingList.quantityPlaceholder')}
                    value={quantity}
                    onChangeText={onQuantityChange}
                    backgroundTone="background"
                  />
                </View>
                <View className="flex-1">
                  <Input
                    label={t('shoppingList.price')}
                    placeholder={t('shoppingList.pricePlaceholder')}
                    value={price}
                    onChangeText={onPriceChange}
                    backgroundTone="background"
                  />
                </View>
              </View>
              <Input
                label={t('shoppingList.store')}
                placeholder={t('shoppingList.storePlaceholder')}
                value={store}
                onChangeText={onStoreChange}
                backgroundTone="background"
              />
            </Animated.View>
          )}

          <View className="flex-row gap-3 mt-2">
            <View className="flex-1">
              <Button
                label={t('common.cancel')}
                onPress={onCancel}
                variant="outline"
              />
            </View>
            <View className="flex-1">
              <Button
                label={t('shoppingList.add')}
                onPress={onAdd}
                disabled={!name.trim()}
              />
            </View>
          </View>
        </Animated.View>
      </Card>
    </Animated.View>
  );
};
// #endregion
