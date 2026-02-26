// #region Imports
import React, { useState, useEffect, useCallback } from 'react';
import { ActivityIndicator, Linking, ScrollView, Switch, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Card, Text } from '../../components/ui';
import { useTheme } from '../../hooks/useTheme';
import { AnimatedPressable, ScreenHeader, SectionSeparator } from './components';
import {
    checkForUpdate,
    autoCheckForUpdate,
    getAutoUpdateCheck,
    setAutoUpdateCheck,
    getGitHubRepoUrl,
    type UpdateCheckResult,
} from '../../services/updateCheck';
// #endregion

// #region Helpers
// eslint-disable-next-line @typescript-eslint/no-var-requires
const APP_VERSION: string = require('../../../app.json').expo.version ?? '1.0.0';
// #endregion

// #region Screen
export const AboutScreen: React.FC = () => {
    const { colors } = useTheme();
    const { t } = useTranslation();

    // ── State ──────────────────────────────────────────────────
    const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
    const [updateResult, setUpdateResult] = useState<UpdateCheckResult | null>(null);
    const [autoUpdate, setAutoUpdate] = useState(false);

    // ── Load persisted auto-update preference ──────────────────
    useEffect(() => {
        void (async () => {
            const enabled = await getAutoUpdateCheck();
            setAutoUpdate(enabled);
        })();
    }, []);

    // ── Automatic weekly check on mount ────────────────────────
    useEffect(() => {
        void (async () => {
            const result = await autoCheckForUpdate(APP_VERSION);
            if (result) setUpdateResult(result);
        })();
    }, []);

    // ── Manual update check ────────────────────────────────────
    const handleCheckForUpdate = useCallback(async () => {
        setIsCheckingUpdate(true);
        setUpdateResult(null);
        const result = await checkForUpdate(APP_VERSION);
        setUpdateResult(result);
        setIsCheckingUpdate(false);
    }, []);

    // ── Toggle auto-update ─────────────────────────────────────
    const handleToggleAutoUpdate = useCallback(async (value: boolean) => {
        setAutoUpdate(value);
        await setAutoUpdateCheck(value);
    }, []);

    // ── Open GitHub repo ───────────────────────────────────────
    const handleOpenSourceCode = useCallback(async () => {
        try {
            await Linking.openURL(getGitHubRepoUrl());
        } catch {
            // silently fail
        }
    }, []);

    // ── Update status text ─────────────────────────────────────
    const renderUpdateStatus = () => {
        if (isCheckingUpdate) {
            return (
                <View className="flex-row items-center gap-2 mt-1">
                    <ActivityIndicator size="small" color={colors.accent} />
                    <Text className="text-sm font-l_light" style={{ color: colors.textSecondary }}>
                        {t('about.checkingForUpdates')}
                    </Text>
                </View>
            );
        }

        if (!updateResult) return null;

        if (updateResult.error) {
            return (
                <Text className="text-sm font-l_light mt-1" style={{ color: colors.accent }}>
                    {t('about.updateCheckFailed')}
                </Text>
            );
        }

        if (updateResult.hasUpdate) {
            return (
                <Text className="text-sm font-l_light mt-1" style={{ color: colors.accent }}>
                    {t('about.updateAvailable', { version: updateResult.latestVersion })}
                </Text>
            );
        }

        return (
            <Text className="text-sm font-l_light mt-1" style={{ color: colors.textSecondary }}>
                {t('about.upToDate')}
            </Text>
        );
    };

    return (
        <View className="flex-1" style={{ backgroundColor: colors.background }}>
            {/* HEADER */}
            <ScreenHeader title={t('about.title')} isParent={false} />

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
                {/* ── App Version ─────────────────────────────── */}
                <View className="mb-5">
                    <Text className="mb-3 text-lg font-l_semibold" style={{ color: colors.text }}>
                        {t('about.appVersion')}
                    </Text>

                    <AnimatedPressable onPress={handleCheckForUpdate} disabled={isCheckingUpdate}>
                        <Card className="rounded-2xl" themeColors={colors}>
                            <View className="flex-row items-center justify-between">
                                <View className="flex-1">
                                    <Text className="text-base font-l_regular" style={{ color: colors.text }}>
                                        {t('about.currentVersion', { version: APP_VERSION })}
                                    </Text>
                                    {renderUpdateStatus()}
                                </View>
                                <Feather name="refresh-cw" size={20} color={colors.accent} />
                            </View>
                        </Card>
                    </AnimatedPressable>
                </View>

                {/* ── Auto Update Check ───────────────────────── */}
                <View className="mb-5">
                    <Card className="rounded-2xl" themeColors={colors}>
                        <View className="flex-row items-center justify-between">
                            <View className="flex-1 mr-3">
                                <Text className="text-base font-l_regular" style={{ color: colors.text }}>
                                    {t('about.autoUpdateCheck')}
                                </Text>
                                <Text className="text-sm font-l_light mt-1" style={{ color: colors.textSecondary }}>
                                    {t('about.autoUpdateCheckDescription')}
                                </Text>
                            </View>
                            <Switch
                                value={autoUpdate}
                                onValueChange={handleToggleAutoUpdate}
                                trackColor={{ true: colors.accent, false: colors.separator }}
                                thumbColor={autoUpdate ? colors.separator : colors.primaryText}
                            />
                        </View>
                    </Card>
                </View>

                <SectionSeparator colors={colors} />

                {/* ── User Manual (disabled) ──────────────────── */}
                <View className="mb-5">
                    <Card className="rounded-2xl" themeColors={colors}>
                        <View className="flex-row items-center justify-between opacity-40">
                            <View className="flex-1">
                                <Text className="text-base font-l_regular" style={{ color: colors.text }}>
                                    {t('about.userManual')}
                                </Text>
                                <Text className="text-sm font-l_light mt-1" style={{ color: colors.textSecondary }}>
                                    {t('about.userManualDisabled')}
                                </Text>
                            </View>
                            <Feather name="book-open" size={20} color={colors.textSecondary} />
                        </View>
                    </Card>
                </View>

                {/* ── Source Code ──────────────────────────────── */}
                <View className="mb-5">
                    <AnimatedPressable onPress={handleOpenSourceCode}>
                        <Card className="rounded-2xl" themeColors={colors}>
                            <View className="flex-row items-center justify-between">
                                <View className="flex-1">
                                    <Text className="text-base font-l_regular" style={{ color: colors.text }}>
                                        {t('about.sourceCode')}
                                    </Text>
                                    <Text className="text-sm font-l_light mt-1" style={{ color: colors.textSecondary }}>
                                        {t('about.sourceCodeDescription')}
                                    </Text>
                                </View>
                                <Feather name="github" size={20} color={colors.accent} />
                            </View>
                        </Card>
                    </AnimatedPressable>
                </View>
            </ScrollView>
        </View>
    );
};
// #endregion
