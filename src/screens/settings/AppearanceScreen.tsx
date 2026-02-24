// #region Imports
import React from 'react';
import {
  ScrollView,
  Text,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useTranslation } from 'react-i18next';

import { type LanguagePreference } from '../../i18n';
import { useLanguage } from '../../hooks/useLanguage';
import { useTheme } from '../../hooks/useTheme';
import type { ThemeTime } from '../../types/theme';
import {
  AnimatedPressable,
  ImportFeedbackModal,
  LanguagePickerModal,
  ScreenHeader,
  ThemePickerModal,
  TimeOptionCard,
} from './components';
// #endregion

// #region Constants
// ── Time labels & icons ───────────────────────────────────────
const TIME_ICONS: Record<ThemeTime, React.ComponentProps<typeof Feather>['name']> = {
  day: 'sun',
  night: 'moon',
  midnight: 'star',
};
// #endregion

// #region Screen
// ── Main AppearanceScreen ─────────────────────────────────────
export const AppearanceScreen: React.FC = () => {
  const {
    colors,
    themeId,
    time,
    themeDefinition,
    availableThemes,
    availableTimes,
    setTheme,
    setTime,
    importThemeFromJson,
    hasCustomTheme,
    customThemeId,
    removeCustomTheme,
  } = useTheme();
  const { languagePreference, setLanguagePreference } = useLanguage();
  const { t } = useTranslation();
  const [isLanguagePickerOpen, setIsLanguagePickerOpen] = React.useState(false);
  const [isThemePickerOpen, setIsThemePickerOpen] = React.useState(false);
  const [importFeedback, setImportFeedback] = React.useState<{
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

  const handleSelectLanguagePreference = React.useCallback(
    (preference: LanguagePreference) => {
      setLanguagePreference(preference);
      setIsLanguagePickerOpen(false);
    },
    [setLanguagePreference],
  );

  const handleSelectTime = React.useCallback(
    (t: ThemeTime) => {
      setTime(t);
    },
    [setTime],
  );

  const handleImportTheme = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) return;

      const asset = result.assets[0];
      if (!asset?.uri) {
        setImportFeedback({
          visible: true,
          title: t('common.error'),
          message: t('appearance.cannotReadFile'),
          variant: 'error',
        });
        return;
      }

      const response = await fetch(asset.uri);
      const rawJson = await response.text();

      const importResult = importThemeFromJson(rawJson);

      if (!importResult.success) {
        setImportFeedback({
          visible: true,
          title: t('appearance.invalidTheme'),
          message: importResult.error,
          variant: 'error',
        });
        return;
      }

      setImportFeedback({
        visible: true,
        title: t('appearance.importSuccess'),
        message: t('appearance.importSuccessMessage', { name: importResult.themeName }),
        variant: 'success',
      });
    } catch {
      setImportFeedback({
        visible: true,
        title: t('common.error'),
        message: t('appearance.importError'),
        variant: 'error',
      });
    }
  };

  const handleCloseImportFeedback = React.useCallback(() => {
    setImportFeedback((current) => ({
      ...current,
      visible: false,
    }));
  }, []);

  const handleRemoveCustomTheme = React.useCallback(() => {
    removeCustomTheme();
  }, [removeCustomTheme]);

  // Filter to get only built-in themes and exclude custom theme from the list
  const builtInThemes = availableThemes.filter((th) => th.id !== customThemeId);
  const customTheme = customThemeId
    ? availableThemes.find((th) => th.id === customThemeId)
    : undefined;

  // Preview colors for the currently selected theme
  const previewColors = [
    themeDefinition.times[time].primary,
    themeDefinition.times[time].accent,
    themeDefinition.times[time].text,
    themeDefinition.times[time].background,
    themeDefinition.times[time].card,
    themeDefinition.times[time].cardBorder,
  ];

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScreenHeader title={t('appearance.title')} />
      <ScrollView
        className="flex-1 px-4 pt-4 pb-12"
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={{
          flexGrow: 1,
          backgroundColor: colors.background
        }}
        overScrollMode="always"
      >
        {/* ── Language selector ─────────────────────────── */}
      <View className="mb-8">
        <Text className="mb-2 text-lg font-l_semibold" style={{ color: colors.text }}>
          {t('appearance.language')}
        </Text>
        <Text className="mb-4 text-sm font-l_regular" style={{ color: colors.textSecondary }}>
          {t('appearance.languageDescription')}
        </Text>

        <AnimatedPressable
          onPress={() => setIsLanguagePickerOpen(true)}
          style={{
            backgroundColor: colors.card,
            borderColor: colors.cardBorder,
            borderWidth: 1,
            borderRadius: 12,
            paddingVertical: 14,
            paddingHorizontal: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Text className="text-base font-l_medium" style={{ color: colors.text }}>
            {t(`appearance.languageOptions.${languagePreference}`)}
          </Text>
          <Feather name="chevron-down" size={20} color={colors.textSecondary} />
        </AnimatedPressable>
      </View>

      {/* ── Time selector ───────────────────────────────── */}
      <View className="mb-8">
        <Text className="mb-2 text-lg font-l_semibold" style={{ color: colors.text }}>
          {t('appearance.time')}
        </Text>
        <Text className="mb-4 text-sm font-l_regular" style={{ color: colors.textSecondary }}>
          {t('appearance.timeDescription')}
        </Text>
        <View className="flex-row gap-3">
          {availableTimes.map((timeKey) => {
            const icon = TIME_ICONS[timeKey];
            const selected = timeKey === time;

            return (
              <TimeOptionCard
                key={timeKey}
                t={timeKey}
                selected={selected}
                colors={colors}
                label={t(`appearance.timeLabels.${timeKey}`)}
                icon={icon}
                onPress={() => handleSelectTime(timeKey)}
              />
            );
          })}
        </View>
      </View>

      {/* ── Theme selector (card → popup) ───────────────── */}
      <View className="mb-8">
        <Text className="mb-2 text-lg font-l_semibold" style={{ color: colors.text }}>
          {t('appearance.theme')}
        </Text>
        <Text className="mb-4 text-sm font-l_regular" style={{ color: colors.textSecondary }}>
          {t('appearance.themeDescription')}
        </Text>

        <AnimatedPressable
          onPress={() => setIsThemePickerOpen(true)}
          style={{
            backgroundColor: colors.card,
            borderColor: colors.cardBorder,
            borderWidth: 1,
            borderRadius: 12,
            paddingVertical: 14,
            paddingHorizontal: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View style={{ flex: 1, gap: 8 }}>
            <Text className="text-base font-l_medium" style={{ color: colors.text }}>
              {themeDefinition.name}
            </Text>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {previewColors.map((color, i) => (
                <View
                  key={i}
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 9,
                    backgroundColor: color,
                    borderWidth: 1,
                    borderColor: colors.separator,
                  }}
                />
              ))}
            </View>
          </View>
          <Feather name="chevron-down" size={20} color={colors.textSecondary} />
        </AnimatedPressable>
      </View>

      <LanguagePickerModal
        visible={isLanguagePickerOpen}
        colors={colors}
        selectedPreference={languagePreference}
        onSelect={handleSelectLanguagePreference}
        onClose={() => setIsLanguagePickerOpen(false)}
        t={t}
      />

      <ThemePickerModal
        visible={isThemePickerOpen}
        colors={colors}
        selectedThemeId={themeId}
        time={time}
        builtInThemes={builtInThemes}
        customTheme={customTheme}
        onSelectTheme={setTheme}
        onImportTheme={handleImportTheme}
        onRemoveCustomTheme={handleRemoveCustomTheme}
        onClose={() => setIsThemePickerOpen(false)}
        t={t}
      />

      <ImportFeedbackModal
        visible={importFeedback.visible}
        colors={colors}
        title={importFeedback.title}
        message={importFeedback.message}
        variant={importFeedback.variant}
        onClose={handleCloseImportFeedback}
        t={t}
      />
      </ScrollView>
    </View>
  );
};
// #endregion
