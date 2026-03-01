// #region Imports
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  RefreshControl,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  Easing,
  FadeIn,
  cancelAnimation,
  type SharedValue,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../hooks/useTheme';
import { useUser } from '../../hooks/useUser';
import { Button, Text } from '../../components/ui';
import {
  ShoppingListItem,
  AddItemForm,
  ConfirmationModal,
  PriceEstimateSummary,
  type ShoppingItem,
} from './components';
import {
  readAllItems,
  addItemToCSV,
  removeItemFromCSV,
  removeItemsFromCSV,
} from '../../services/csvStorage';
import { syncFromCloud } from '../../services/cloudSync';
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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasFinishedInitialRefresh, setHasFinishedInitialRefresh] = useState(false);
  const [listAnimationSeed, setListAnimationSeed] = useState(0);

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

  // #region Load items from CSV on mount
  const loadItems = useCallback(async (forceRefresh = false) => {
    const refreshStartedAt = Date.now();
    setIsRefreshing(true);
    let loadedItems: ShoppingItem[] | null = null;
    try {
      // In cloud mode, sync latest from cloud to local cache on refresh
      if (forceRefresh) {
        try {
          await syncFromCloud('shoppingList');
        } catch (syncError) {
          console.warn('[ShoppingList] Cloud sync failed (using local cache):', syncError);
        }
      }

      const savedItems = await readAllItems({ forceRefresh });
      loadedItems = savedItems;
    } catch (error) {
      console.warn('[ShoppingList] Failed to load items from CSV:', error);
    } finally {
      const elapsed = Date.now() - refreshStartedAt;
      const remaining = 1000 - elapsed;
      if (remaining > 0) {
        await new Promise(resolve => setTimeout(resolve, remaining));
      }

      setIsRefreshing(false);

      if (loadedItems) {
        if (forceRefresh) {
          setItems([]);
          await new Promise(resolve => setTimeout(resolve, 200));
          setListAnimationSeed(prev => prev + 1);
        }
        setItems(loadedItems);
      }

      setHasFinishedInitialRefresh(true);

    }
  }, []);

  useEffect(() => {
    loadItems(false);
  }, [loadItems]);
  // #endregion

  // #region Handlers
  const addItem = useCallback(async () => {
    if (!name.trim()) return;
    const newItem: ShoppingItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
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

    // Persist to CSV
    try {
      await addItemToCSV(newItem);
    } catch (error) {
      console.warn('[ShoppingList] Failed to save item to CSV:', error);
    }
  }, [name, quantity, store, price, userName]);

  const requestRemoveItem = useCallback((id: string) => {
    setDeleteItemId(id);
  }, []);

  const confirmRemoveItem = useCallback(async () => {
    if (deleteItemId) {
      setItems(prev => prev.filter(item => item.id !== deleteItemId));
      setDeleteItemId(null);

      // Remove from CSV
      try {
        await removeItemFromCSV(deleteItemId);
      } catch (error) {
        console.warn('[ShoppingList] Failed to remove item from CSV:', error);
      }
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

  const confirmExitShoppingMode = useCallback(async () => {
    setItems(prev => prev.filter(item => !checkedItems.has(item.id)));
    setCheckedItems(new Set());
    setIsShoppingMode(false);
    setShowExitConfirm(false);

    // Remove purchased items from CSV
    try {
      await removeItemsFromCSV(checkedItems);
    } catch (error) {
      console.warn('[ShoppingList] Failed to remove purchased items from CSV:', error);
    }
  }, [checkedItems]);

  const cancelAddForm = useCallback(() => {
    setShowAddForm(false);
    setName('');
    setQuantity('');
    setStore('');
    setPrice('');
  }, []);

  const handleRefresh = useCallback(() => {
    loadItems(true);
  }, [loadItems]);
  // #endregion

  // #region Animations
  const fabScale = useSharedValue(1);
  const backBtnScale = useSharedValue(1);
  const cartBtnScale = useSharedValue(1);
  const refreshRotation = useSharedValue(0);
  const refreshingBannerOpacity = useSharedValue(1);

  useEffect(() => {
    if (isRefreshing) {
      refreshRotation.value = 0;
      refreshRotation.value = withRepeat(
        withTiming(360, {
          duration: 900,
          easing: Easing.linear,
        }),
        -1,
        false,
      );

      refreshingBannerOpacity.value = withRepeat(
        withTiming(0.45, { duration: 750, easing: Easing.inOut(Easing.quad) }),
        -1,
        true,
      );
      return;
    }

    cancelAnimation(refreshRotation);
    refreshRotation.value = withTiming(0, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
    });

    cancelAnimation(refreshingBannerOpacity);
    refreshingBannerOpacity.value = withTiming(1, {
      duration: 180,
      easing: Easing.out(Easing.cubic),
    });
  }, [isRefreshing, refreshRotation, refreshingBannerOpacity]);

  const fabAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fabScale.value }],
  }));
  const backBtnAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: backBtnScale.value }],
  }));
  const cartBtnAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cartBtnScale.value }],
  }));
  const refreshingBannerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: refreshingBannerOpacity.value,
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

  // #region Render
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
                color={colors.textSecondary}
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
              style={{ backgroundColor: colors.accent }}
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

      {isRefreshing && (
        <Animated.View entering={FadeIn.duration(180)} className="px-4 mb-3">
          <Animated.View style={refreshingBannerAnimatedStyle}>
            <View
              className="flex-row items-center gap-2 px-3 py-2 rounded-xl"
              style={{ backgroundColor: colors.card }}
            >
              <Feather name="refresh-cw" size={14} color={colors.textSecondary} />
              <Text className="text-xs font-l_semibold" style={{ color: colors.textSecondary }}>
                {t('common.updating', { defaultValue: 'Updating list...' })}
              </Text>
            </View>
          </Animated.View>
        </Animated.View>
      )}

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
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={(
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
            progressBackgroundColor={colors.card}
            progressViewOffset={32}
          />
        )}
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
        {hasFinishedInitialRefresh && items.length === 0 && !showAddForm && (
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
        {hasFinishedInitialRefresh && items.map((item, index) => (
          <ShoppingListItem
            key={`${item.id}-${listAnimationSeed}`}
            item={item}
            index={index}
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
              backgroundColor: colors.accent,
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
