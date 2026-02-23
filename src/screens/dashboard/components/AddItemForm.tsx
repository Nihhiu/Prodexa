// #region Imports
import React from 'react';
import { View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { Button, Card, Input } from '../../../components/ui';
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

  return (
    <Animated.View
      entering={FadeInDown.duration(250)}
      exiting={FadeOutDown.duration(200)}
    >
      <Card className="mb-4" title={t('shoppingList.addItem')}>
        <View className="gap-3">
          <Input
            label={t('shoppingList.name') + '(*)'}
            placeholder={t('shoppingList.namePlaceholder')}
            value={name}
            onChangeText={onNameChange}
            backgroundTone="background"
          />
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
        </View>
      </Card>
    </Animated.View>
  );
};
// #endregion
