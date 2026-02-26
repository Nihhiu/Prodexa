// #region Imports
import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { Directory } from 'expo-file-system';
import { useTranslation } from 'react-i18next';
import { Text } from '../../components/ui';
import { useTheme } from '../../hooks/useTheme';
import {
  AnimatedPressable,
  ScreenHeader,
  SectionSeparator,
  StatusModal,
} from './components';
import {
  getDefaultBaseUri,
  getStoragePathForFeature,
  setStoragePathForFeature,
  clearStoragePathForFeature,
} from '../../config/storage';
// #endregion

// #region Screen
export const StorageScreen: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  // #region State
  const [shoppingPath, setShoppingPath] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    visible: boolean;
    title: string;
    message: string;
    variant: 'success' | 'error' | 'info';
  }>({
    visible: false,
    title: '',
    message: '',
    variant: 'success',
  });
  // #endregion

  const loadStorageData = useCallback(async () => {
    try {
      const savedPath = await getStoragePathForFeature('shoppingList');
      setShoppingPath(savedPath);
    } catch (error) {
      console.warn('[StorageScreen] Failed to load storage data:', error);
    }
  }, []);

  // #region Load persisted settings
  useEffect(() => {
    void loadStorageData();
  }, [loadStorageData]);
  // #endregion

  // #region Handlers
  const handleSelectShoppingPath = useCallback(async () => {
    try {
      const dir = await Directory.pickDirectoryAsync();

      if (dir && dir.uri) {
        await setStoragePathForFeature('shoppingList', dir.uri);
        setShoppingPath(dir.uri);

        setFeedback({
          visible: true,
          title: t('storageScreen.pathUpdated'),
          message: t('storageScreen.pathUpdatedMessage'),
          variant: 'success',
        });
      }
    } catch (error) {
      console.warn('[StorageScreen] Failed to pick feature folder:', error);
      setFeedback({
        visible: true,
        title: t('common.error'),
        message: t('common.unexpectedError'),
        variant: 'error',
      });
    }
  }, [t]);

  const handleResetShoppingPath = useCallback(async () => {
    await clearStoragePathForFeature('shoppingList');
    setShoppingPath(null);

    setFeedback({
      visible: true,
      title: t('storageScreen.pathUpdated'),
      message: t('storageScreen.pathResetMessage'),
      variant: 'info',
    });
  }, [t]);

  const handleCloseFeedback = useCallback(() => {
    setFeedback(prev => ({ ...prev, visible: false }));
  }, []);
  // #endregion

  // #region Helpers
  const truncatePath = (path: string): string => {
    if (path.length <= 50) return path;
    const parts = path.split('/');
    if (parts.length <= 3) return path;
    return `.../${parts.slice(-3).join('/')}`;
  };

  const currentShoppingPath = shoppingPath ?? getDefaultBaseUri();
  // #endregion

  // #region Render
  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* HEADER */}
      <ScreenHeader title={t('storageScreen.title')} isParent={false} />

      {/* CONTENT */}
      <ScrollView
        className="flex-1 px-4 pt-4 pb-12"
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={{
          flexGrow: 1,
          backgroundColor: colors.background,
          paddingBottom: 120,
        }}
        overScrollMode="always"
      >
        {/* ═══════════════════════════════════════════════════
            SECTION 1: Feature Storage
            ═══════════════════════════════════════════════════ */}
        <View className="mb-8">
          <Text className="mb-2 text-lg font-l_semibold" style={{ color: colors.text }}>
            {t('storageScreen.featureStorage')}
          </Text>
          <Text className="mb-4 text-sm font-l_regular" style={{ color: colors.textSecondary }}>
            {t('storageScreen.featureStorageDescription')}
          </Text>

          <Animated.View entering={FadeIn.duration(300)}>
            <View
              style={{
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
                borderWidth: 1,
                borderRadius: 16,
                padding: 16,
                gap: 14,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    backgroundColor: colors.primary + '15',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Feather name="shopping-cart" size={20} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text className="text-base font-l_semibold" style={{ color: colors.text }}>
                    {t('storageScreen.shoppingFeature')}
                  </Text>
                  <Text className="text-xs font-l_regular" style={{ color: colors.textSecondary }}>
                    {t('storageScreen.shoppingFeatureDescription')}
                  </Text>
                </View>
              </View>

              <View style={{ gap: 4 }}>
                <Text className="text-xs font-l_regular" style={{ color: colors.textSecondary }}>
                  {t('storageScreen.currentPath')}
                </Text>
                <Text className="text-sm font-l_medium" style={{ color: colors.text }} numberOfLines={2}>
                  {truncatePath(currentShoppingPath)}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <AnimatedPressable
                    onPress={handleSelectShoppingPath}
                    style={{
                      backgroundColor: colors.primary,
                      borderRadius: 10,
                      paddingVertical: 10,
                      paddingHorizontal: 14,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                    }}
                  >
                    <Feather
                      name={shoppingPath ? 'refresh-cw' : 'folder-plus'}
                      size={14}
                      color={colors.primaryText}
                    />
                    <Text className="text-sm font-l_medium" style={{ color: colors.primaryText }}>
                      {shoppingPath
                        ? t('storageScreen.changeFolder')
                        : t('storageScreen.selectFolder')}
                    </Text>
                  </AnimatedPressable>
                </View>

                {shoppingPath && (
                  <AnimatedPressable
                    onPress={handleResetShoppingPath}
                    style={{
                      backgroundColor: colors.card,
                      borderColor: colors.cardBorder,
                      borderWidth: 1,
                      borderRadius: 10,
                      paddingVertical: 10,
                      paddingHorizontal: 14,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                    }}
                  >
                    <Feather name="rotate-ccw" size={14} color={colors.textSecondary} />
                  </AnimatedPressable>
                )}
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  gap: 10,
                  backgroundColor: colors.accent + '10',
                  borderRadius: 12,
                  padding: 12,
                }}
              >
                <Feather name="info" size={16} color={colors.accent} style={{ marginTop: 1 }} />
                <View style={{ flex: 1 }}>
                  <Text className="text-xs font-l_semibold mb-1" style={{ color: colors.accent }}>
                    {t('storageScreen.dataMigration')}
                  </Text>
                  <Text className="text-xs font-l_regular" style={{ color: colors.textSecondary }}>
                    {t('storageScreen.dataMigrationDescription')}
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>
        </View>

        {/* ── Modals ────────────────────────────────────── */}
        <StatusModal
          visible={feedback.visible}
          colors={colors}
          title={feedback.title}
          message={feedback.message}
          variant={feedback.variant}
          onClose={handleCloseFeedback}
          t={t}
        />
      </ScrollView>
    </View>
  );
};
// #endregion
