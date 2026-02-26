// #region Imports
import React, { useState, useEffect, useCallback } from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';
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
  StorageLocationCard,
} from './components';
import {
  type StorageMode,
  getDefaultBaseUri,
  getStoragePathForFeature,
  setStoragePathForFeature,
  clearStoragePathForFeature,
  getStorageModeForFeature,
  setStorageModeForFeature,
  getCloudFileNameForFeature,
} from '../../config/storage';
import {
  setupCloudFile,
  disconnectCloudFile,
  syncFromCloud,
} from '../../services/cloudSync';
import { invalidateItemsCache } from '../../services/csvStorage';
// #endregion

// #region Screen
export const StorageScreen: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  // #region State
  const [storageMode, setStorageMode] = useState<StorageMode>('local');
  const [shoppingPath, setShoppingPath] = useState<string | null>(null);
  const [cloudFileName, setCloudFileName] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
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
      const [savedPath, savedMode, savedCloudName] = await Promise.all([
        getStoragePathForFeature('shoppingList'),
        getStorageModeForFeature('shoppingList'),
        getCloudFileNameForFeature('shoppingList'),
      ]);
      setShoppingPath(savedPath);
      setStorageMode(savedMode);
      setCloudFileName(savedCloudName);
    } catch (error) {
      console.warn('[StorageScreen] Failed to load storage data:', error);
    }
  }, []);

  // #region Load persisted settings
  useEffect(() => {
    void loadStorageData();
  }, [loadStorageData]);
  // #endregion

  // #region Mode Handlers
  const handleSelectLocalMode = useCallback(async () => {
    if (storageMode === 'local') return;

    try {
      await setStorageModeForFeature('shoppingList', 'local');
      await disconnectCloudFile('shoppingList');
      setStorageMode('local');
      setCloudFileName(null);
      invalidateItemsCache();

      setFeedback({
        visible: true,
        title: t('storageScreen.modeChanged'),
        message: t('storageScreen.localModeEnabled'),
        variant: 'success',
      });
    } catch (error) {
      console.warn('[StorageScreen] Failed to switch to local mode:', error);
      setFeedback({
        visible: true,
        title: t('common.error'),
        message: t('common.unexpectedError'),
        variant: 'error',
      });
    }
  }, [storageMode, t]);

  const handleSelectCloudMode = useCallback(async () => {
    try {
      const result = await setupCloudFile('shoppingList');
      if (!result.success) {
        if (result.error) {
          setFeedback({
            visible: true,
            title: t('common.error'),
            message: result.error,
            variant: 'error',
          });
        }
        return;
      }

      await setStorageModeForFeature('shoppingList', 'cloudFile');
      setStorageMode('cloudFile');
      setCloudFileName(result.fileName ?? null);
      invalidateItemsCache();

      setFeedback({
        visible: true,
        title: t('storageScreen.cloudConnected'),
        message: t('storageScreen.cloudConnectedMessage', { fileName: result.fileName }),
        variant: 'success',
      });
    } catch (error) {
      console.warn('[StorageScreen] Failed to switch to cloud mode:', error);
      setFeedback({
        visible: true,
        title: t('common.error'),
        message: t('common.unexpectedError'),
        variant: 'error',
      });
    }
  }, [t]);
  // #endregion

  // #region Local Folder Handlers
  const handleSelectShoppingPath = useCallback(async () => {
    try {
      const dir = await Directory.pickDirectoryAsync();

      if (dir && dir.uri) {
        await setStoragePathForFeature('shoppingList', dir.uri);
        setShoppingPath(dir.uri);
        invalidateItemsCache();

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
    invalidateItemsCache();

    setFeedback({
      visible: true,
      title: t('storageScreen.pathUpdated'),
      message: t('storageScreen.pathResetMessage'),
      variant: 'info',
    });
  }, [t]);
  // #endregion

  // #region Cloud Handlers
  const handleChangeCloudFile = useCallback(async () => {
    try {
      const result = await setupCloudFile('shoppingList');
      if (!result.success) {
        if (result.error) {
          setFeedback({
            visible: true,
            title: t('common.error'),
            message: result.error,
            variant: 'error',
          });
        }
        return;
      }

      setCloudFileName(result.fileName ?? null);
      invalidateItemsCache();

      setFeedback({
        visible: true,
        title: t('storageScreen.cloudConnected'),
        message: t('storageScreen.cloudConnectedMessage', { fileName: result.fileName }),
        variant: 'success',
      });
    } catch (error) {
      console.warn('[StorageScreen] Failed to change cloud file:', error);
      setFeedback({
        visible: true,
        title: t('common.error'),
        message: t('common.unexpectedError'),
        variant: 'error',
      });
    }
  }, [t]);

  const handleSyncFromCloud = useCallback(async () => {
    setIsSyncing(true);
    try {
      const synced = await syncFromCloud('shoppingList');
      invalidateItemsCache();

      setFeedback({
        visible: true,
        title: synced ? t('storageScreen.syncSuccess') : t('storageScreen.syncSkipped'),
        message: synced
          ? t('storageScreen.syncSuccessMessage')
          : t('storageScreen.syncSkippedMessage'),
        variant: synced ? 'success' : 'info',
      });
    } catch (error) {
      console.warn('[StorageScreen] Failed to sync from cloud:', error);
      setFeedback({
        visible: true,
        title: t('common.error'),
        message: t('storageScreen.syncErrorMessage'),
        variant: 'error',
      });
    } finally {
      setIsSyncing(false);
    }
  }, [t]);

  const handleDisconnectCloud = useCallback(async () => {
    await setStorageModeForFeature('shoppingList', 'local');
    await disconnectCloudFile('shoppingList');
    setStorageMode('local');
    setCloudFileName(null);
    invalidateItemsCache();

    setFeedback({
      visible: true,
      title: t('storageScreen.cloudDisconnected'),
      message: t('storageScreen.cloudDisconnectedMessage'),
      variant: 'info',
    });
  }, [t]);
  // #endregion

  // #region Generic Handlers
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
            SECTION 1: Storage Mode
            ═══════════════════════════════════════════════════ */}
        <View className="mb-6">
          <Text className="mb-2 text-lg font-l_semibold" style={{ color: colors.text }}>
            {t('storageScreen.storageMode')}
          </Text>
          <Text className="mb-4 text-sm font-l_regular" style={{ color: colors.textSecondary }}>
            {t('storageScreen.storageModeDescription')}
          </Text>

          <Animated.View entering={FadeIn.duration(300)}>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <StorageLocationCard
                selected={storageMode === 'local'}
                onPress={handleSelectLocalMode}
                colors={colors}
                icon="smartphone"
                title={t('storageScreen.localMode')}
                description={t('storageScreen.localModeDescription')}
                accessibilityLabel={t('storageScreen.localMode')}
                accessibilityHint={t('storageScreen.localModeEnabled')}
              />
              <StorageLocationCard
                selected={storageMode === 'cloudFile'}
                onPress={handleSelectCloudMode}
                colors={colors}
                icon="cloud"
                title={t('storageScreen.cloudMode')}
                description={t('storageScreen.cloudModeDescription')}
                accessibilityLabel={t('storageScreen.cloudMode')}
                accessibilityHint={t('storageScreen.cloudConnectedMessage', {
                  fileName: cloudFileName ?? t('storageScreen.noCloudFile'),
                })}
              />
            </View>
          </Animated.View>
        </View>

        <SectionSeparator colors={colors} />

        {/* ═══════════════════════════════════════════════════
            SECTION 2: Configuration
            ═══════════════════════════════════════════════════ */}
        <View className="mt-6 mb-8">
          {storageMode === 'local' ? (
            /* ── Local Folder Config ─────────────────────── */
            <Animated.View entering={FadeIn.duration(300)}>
              <Text className="mb-2 text-lg font-l_semibold" style={{ color: colors.text }}>
                {t('storageScreen.featureStorage')}
              </Text>
              <Text className="mb-4 text-sm font-l_regular" style={{ color: colors.textSecondary }}>
                {t('storageScreen.featureStorageDescription')}
              </Text>

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
                      accessibilityRole="button"
                      accessibilityLabel={
                        shoppingPath
                          ? t('storageScreen.changeFolder')
                          : t('storageScreen.selectFolder')
                      }
                      accessibilityHint={t('storageScreen.pathUpdatedMessage')}
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
                      accessibilityRole="button"
                      accessibilityLabel={t('storageScreen.pathUpdated')}
                      accessibilityHint={t('storageScreen.pathResetMessage')}
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

                {/* Data migration info */}
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
          ) : (
            /* ── Cloud File Config ───────────────────────── */
            <Animated.View entering={FadeIn.duration(300)}>
              <Text className="mb-2 text-lg font-l_semibold" style={{ color: colors.text }}>
                {t('storageScreen.cloudConfig')}
              </Text>
              <Text className="mb-4 text-sm font-l_regular" style={{ color: colors.textSecondary }}>
                {t('storageScreen.cloudConfigDescription')}
              </Text>

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
                {/* Cloud file info */}
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
                    <Feather name="file-text" size={20} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text className="text-base font-l_semibold" style={{ color: colors.text }}>
                      {cloudFileName ?? t('storageScreen.noCloudFile')}
                    </Text>
                    <Text className="text-xs font-l_regular" style={{ color: colors.textSecondary }}>
                      {t('storageScreen.cloudFileDescription')}
                    </Text>
                  </View>
                </View>

                {/* Action buttons */}
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  {/* Sync button */}
                  <View style={{ flex: 1 }}>
                    <AnimatedPressable
                      onPress={handleSyncFromCloud}
                      disabled={isSyncing}
                      accessibilityRole="button"
                      accessibilityLabel={t('storageScreen.syncNow')}
                      accessibilityHint={t('storageScreen.syncSuccessMessage')}
                      accessibilityState={{ disabled: isSyncing, busy: isSyncing }}
                      style={{
                        backgroundColor: colors.primary,
                        borderRadius: 10,
                        paddingVertical: 10,
                        paddingHorizontal: 14,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        opacity: isSyncing ? 0.6 : 1,
                      }}
                    >
                      {isSyncing ? (
                        <ActivityIndicator size="small" color={colors.primaryText} />
                      ) : (
                        <Feather name="refresh-cw" size={14} color={colors.primaryText} />
                      )}
                      <Text className="text-sm font-l_medium" style={{ color: colors.primaryText }}>
                        {isSyncing
                          ? t('storageScreen.syncing')
                          : t('storageScreen.syncNow')}
                      </Text>
                    </AnimatedPressable>
                  </View>

                  {/* Change file button */}
                  <AnimatedPressable
                    onPress={handleChangeCloudFile}
                    accessibilityRole="button"
                    accessibilityLabel={t('storageScreen.cloudConnected')}
                    accessibilityHint={t('storageScreen.cloudConnectedMessage', {
                      fileName: cloudFileName ?? t('storageScreen.noCloudFile'),
                    })}
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
                    <Feather name="file-plus" size={14} color={colors.textSecondary} />
                  </AnimatedPressable>

                  {/* Disconnect button */}
                  <AnimatedPressable
                    onPress={handleDisconnectCloud}
                    accessibilityRole="button"
                    accessibilityLabel={t('storageScreen.cloudDisconnected')}
                    accessibilityHint={t('storageScreen.cloudDisconnectedMessage')}
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
                    <Feather name="link-2" size={14} color={colors.textSecondary} />
                  </AnimatedPressable>
                </View>

                {/* Cloud workflow info */}
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
                      {t('storageScreen.cloudWorkflow')}
                    </Text>
                    <Text className="text-xs font-l_regular" style={{ color: colors.textSecondary }}>
                      {t('storageScreen.cloudWorkflowDescription')}
                    </Text>
                  </View>
                </View>
              </View>
            </Animated.View>
          )}
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