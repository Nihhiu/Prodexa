// #region Imports
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
  FadeIn,
  type SharedValue,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../hooks/useTheme';
import { useUser } from '../../hooks/useUser';
import { Button } from '../../components/ui';
import {
  ShoppingListItem,
  AddItemForm,
  ConfirmationModal,
  PriceEstimateSummary,
  type ShoppingItem,
} from './components';
// #endregion

// #region Screen
export const ShoppingListScreen: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { name: userName } = useUser();
  const navigation = useNavigation();

  // #region State
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [isShoppingMode, setIsShoppingMode] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [showAddForm, setShowAddForm] = useState(false);

  // Modal state
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showNoItemsInfo, setShowNoItemsInfo] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [store, setStore] = useState('');
  const [price, setPrice] = useState('');
  // #endregion

  // #region Handlers
  const addItem = useCallback(() => {
    if (!name.trim()) return;
    const newItem: ShoppingItem = {
      id: Date.now().toString(),
      name: name.trim(),
      quantity: quantity.trim() || '1',
      store: store.trim(),
      price: price.trim(),
      addedBy: userName.trim(),
    };
    setItems(prev => [...prev, newItem]);
    setName('');
    setQuantity('');
    setStore('');
    setPrice('');
    setShowAddForm(false);
  }, [name, quantity, store, price]);

  const requestRemoveItem = useCallback((id: string) => {
    setDeleteItemId(id);
  }, []);

  const confirmRemoveItem = useCallback(() => {
    if (deleteItemId) {
      setItems(prev => prev.filter(item => item.id !== deleteItemId));
      setDeleteItemId(null);
    }
  }, [deleteItemId]);

  const toggleCheck = useCallback((id: string) => {
    setCheckedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const enterShoppingMode = useCallback(() => {
    if (items.length === 0) {
      setShowNoItemsInfo(true);
      return;
    }
    setCheckedItems(new Set());
    setIsShoppingMode(true);
    setShowAddForm(false);
  }, [items.length]);

  const exitShoppingMode = useCallback(() => {
    if (checkedItems.size > 0) {
      setShowExitConfirm(true);
    } else {
      setIsShoppingMode(false);
    }
  }, [checkedItems]);

  const confirmExitShoppingMode = useCallback(() => {
    setItems(prev => prev.filter(item => !checkedItems.has(item.id)));
    setCheckedItems(new Set());
    setIsShoppingMode(false);
    setShowExitConfirm(false);
  }, [checkedItems]);

  const cancelAddForm = useCallback(() => {
    setShowAddForm(false);
    setName('');
    setQuantity('');
    setStore('');
    setPrice('');
  }, []);
  // #endregion

  // #region Animations
  const fabScale = useSharedValue(1);
  const backBtnScale = useSharedValue(1);
  const cartBtnScale = useSharedValue(1);

  const fabAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fabScale.value }],
  }));
  const backBtnAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: backBtnScale.value }],
  }));
  const cartBtnAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cartBtnScale.value }],
  }));

  const makePressIn = (sv: SharedValue<number>, target = 0.9) => () => {
    sv.value = withSpring(target, { damping: 15, stiffness: 400 });
  };
  const makePressOut = (sv: SharedValue<number>) => () => {
    sv.value = withTiming(1, {
      duration: 200,
      easing: Easing.out(Easing.cubic),
    });
  };
  // #endregion

  const checkedCount = checkedItems.size;

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* #region Header */}
      <View
        className="flex-row items-center justify-between px-4 pt-14 pb-4"
        style={{ backgroundColor: colors.background }}
      >
        <View className="flex-row items-center gap-3">
          <Animated.View style={backBtnAnimatedStyle}>
            <Pressable
              onPress={() => {
                if (isShoppingMode) {
                  exitShoppingMode();
                } else {
                  navigation.goBack();
                }
              }}
              onPressIn={makePressIn(backBtnScale)}
              onPressOut={makePressOut(backBtnScale)}
              className="p-2 rounded-lg"
              style={{
                backgroundColor: colors.card,
                borderWidth: 1,
                borderColor: colors.cardBorder,
              }}
              hitSlop={8}
            >
              <Feather
                name={isShoppingMode ? 'x' : 'arrow-left'}
                size={20}
                color={colors.text}
              />
            </Pressable>
          </Animated.View>
          <Text className="text-2xl font-l_bold" style={{ color: colors.text }}>
            {isShoppingMode
              ? t('shoppingList.shoppingMode')
              : t('shoppingList.title')}
          </Text>
        </View>

        {!isShoppingMode ? (
          <Animated.View style={cartBtnAnimatedStyle}>
            <Pressable
              onPress={enterShoppingMode}
              onPressIn={makePressIn(cartBtnScale)}
              onPressOut={makePressOut(cartBtnScale)}
              className="p-2.5 rounded-lg"
              style={{ backgroundColor: colors.primary }}
              hitSlop={8}
            >
              <Feather name="shopping-cart" size={20} color={colors.primaryText} />
            </Pressable>
          </Animated.View>
        ) : (
          checkedCount > 0 && (
            <Animated.View entering={FadeIn.duration(200)}>
              <View
                className="px-3 py-1.5 rounded-full"
                style={{ backgroundColor: colors.primary + '20' }}
              >
                <Text
                  className="text-sm font-l_semibold"
                  style={{ color: colors.primary }}
                >
                  {checkedCount} ✓
                </Text>
              </View>
            </Animated.View>
          )
        )}
      </View>
      {/* #endregion */}

      {/* #region Shopping mode banner */}
      {isShoppingMode && (
        <Animated.View entering={FadeIn.duration(300)} className="px-4 mb-3">
          <View
            className="flex-row items-center gap-3 px-4 py-3 rounded-xl"
            style={{ backgroundColor: colors.primary + '15' }}
          >
            <Feather name="shopping-bag" size={20} color={colors.primary} />
            <Text
              className="text-sm font-l_regular flex-1"
              style={{ color: colors.primary }}
            >
              {t('shoppingList.shoppingModeHint')}
            </Text>
          </View>
        </Animated.View>
      )}
      {/* #endregion */}

      {/* #region Content */}
      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Add item form */}
        {showAddForm && !isShoppingMode && (
          <AddItemForm
            name={name}
            quantity={quantity}
            store={store}
            price={price}
            onNameChange={setName}
            onQuantityChange={setQuantity}
            onStoreChange={setStore}
            onPriceChange={setPrice}
            onAdd={addItem}
            onCancel={cancelAddForm}
          />
        )}

        {/* Empty state */}
        {items.length === 0 && !showAddForm && (
          <Animated.View
            entering={FadeIn.duration(300)}
            className="items-center justify-center py-20"
          >
            <Feather name="shopping-bag" size={48} color={colors.textSecondary} />
            <Text
              className="text-lg font-l_semibold mt-4"
              style={{ color: colors.textSecondary }}
            >
              {t('shoppingList.emptyList')}
            </Text>
            <Text
              className="text-sm font-l_regular mt-1 text-center px-8"
              style={{ color: colors.textSecondary }}
            >
              {t('shoppingList.emptyListDescription')}
            </Text>
          </Animated.View>
        )}

        {/* Items list */}
        {items.map(item => (
          <ShoppingListItem
            key={item.id}
            item={item}
            isShoppingMode={isShoppingMode}
            isChecked={checkedItems.has(item.id)}
            onToggleCheck={toggleCheck}
            onRemove={requestRemoveItem}
          />
        ))}
      </ScrollView>
      {/* #endregion */}

      {/* #region Bottom actions */}
      {!isShoppingMode && !showAddForm && (
        <Animated.View
          style={fabAnimatedStyle}
          className="absolute bottom-12 right-6"
        >
          <Pressable
            onPress={() => setShowAddForm(true)}
            onPressIn={makePressIn(fabScale)}
            onPressOut={makePressOut(fabScale)}
            className="rounded-full px-4 py-4 items-center justify-center shadow-lg"
            style={{
              backgroundColor: colors.primary,
              elevation: 6,
            }}
          >
            <Feather name="plus" size={32} color={colors.primaryText} />
          </Pressable>
        </Animated.View>
      )}

      {isShoppingMode && (
        <View
          className="pb-6 pt-2"
          style={{ backgroundColor: colors.background }}
        >
          <PriceEstimateSummary
            items={items}
            checkedItemIds={checkedItems}
          />
          <View className="px-4">
            <Button
              label={t('shoppingList.exitShoppingMode')}
              onPress={exitShoppingMode}
              variant="primary"
              size="lg"
              icon={<Feather name="check" size={18} color={colors.primaryText} />}
            />
          </View>
        </View>
      )}
      {/* #endregion */}

      {/* #region Modals */}
      <ConfirmationModal
        visible={deleteItemId !== null}
        colors={colors}
        icon="trash-2"
        variant="danger"
        title={t('shoppingList.deleteItem')}
        message={t('shoppingList.deleteItemDescription')}
        confirmLabel={t('shoppingList.delete')}
        cancelLabel={t('common.cancel')}
        onConfirm={confirmRemoveItem}
        onCancel={() => setDeleteItemId(null)}
      />

      <ConfirmationModal
        visible={showExitConfirm}
        colors={colors}
        icon="shopping-cart"
        title={t('shoppingList.removeChecked')}
        message={t('shoppingList.removeCheckedDescription')}
        confirmLabel={t('common.confirm')}
        cancelLabel={t('common.cancel')}
        onConfirm={confirmExitShoppingMode}
        onCancel={() => setShowExitConfirm(false)}
      />

      <ConfirmationModal
        visible={showNoItemsInfo}
        colors={colors}
        icon="info"
        title={t('shoppingList.noItemsToShop')}
        message={t('shoppingList.noItemsToShopDescription')}
        confirmLabel={t('common.confirm')}
        cancelLabel={t('common.cancel')}
        onConfirm={() => setShowNoItemsInfo(false)}
        onCancel={() => setShowNoItemsInfo(false)}
      />
      {/* #endregion */}
    </View>
  );
};
// #endregion
