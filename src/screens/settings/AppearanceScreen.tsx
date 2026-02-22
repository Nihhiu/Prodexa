import React, { useRef } from 'react';
import {
  Alert,
  Animated,
  Easing,
  Platform,
  Pressable,
  ScrollView,
  Text,
  ToastAndroid,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

import { type LanguagePreference } from '../../i18n';
import { useLanguage } from '../../hooks/useLanguage';
import { useTheme } from '../../hooks/useTheme';
import type { ThemeTime } from '../../types/theme';
import {
  AnimatedPressable,
  AnimatedSelectionIcon,
  ImportCard,
  LanguagePickerModal,
  SelectableCard,
  TimeOptionCard,
} from './components';

// ── Time labels & icons ───────────────────────────────────────
const TIME_ICONS: Record<ThemeTime, React.ComponentProps<typeof Feather>['name']> = {
  day: 'sun',
  night: 'moon',
  midnight: 'star',
};

// ── Main AppearanceScreen ─────────────────────────────────────
export const AppearanceScreen: React.FC = () => {
  const {
    colors,
    themeId,
    time,
    availableThemes,
    availableTimes,
    setTheme,
    setTime,
    importThemeFromJson,
    hasCustomTheme,
    removeCustomTheme,
  } = useTheme();
  const { languagePreference, setLanguagePreference } = useLanguage();
  const { t } = useTranslation();
  const [isLanguagePickerOpen, setIsLanguagePickerOpen] = React.useState(false);

  // ── Optimistic selection state (instant visual feedback) ──
  const [optimisticThemeId, setOptimisticThemeId] = React.useState(themeId);
  const [optimisticTime, setOptimisticTime] = React.useState(time);

  React.useEffect(() => {
    setOptimisticThemeId(themeId);
  }, [themeId]);

  React.useEffect(() => {
    setOptimisticTime(time);
  }, [time]);

  const handleSelectTheme = React.useCallback(
    (id: string) => {
      setOptimisticThemeId(id);
      setTheme(id);
    },
    [setTheme],
  );

  const handleSelectTime = React.useCallback(
    (t: ThemeTime) => {
      setOptimisticTime(t);
      setTime(t);
    },
    [setTime],
  );

  const handleSelectLanguagePreference = React.useCallback(
    (preference: LanguagePreference) => {
      setLanguagePreference(preference);
      setIsLanguagePickerOpen(false);
    },
    [setLanguagePreference],
  );

  const [customThemeId, setCustomThemeId] = React.useState<string | null>(null);
  const [pendingImportedThemeName, setPendingImportedThemeName] = React.useState<string | null>(null);
  const [isRemovingCustomTheme, setIsRemovingCustomTheme] = React.useState(false);
  const themesBeforeImportRef = useRef<Set<string> | null>(null);
  const didHydratePreferencesRef = useRef(false);
  const didLongPressRemoveRef = useRef(false);

  React.useEffect(() => {
    if (didHydratePreferencesRef.current) return;
    if (availableThemes.length === 0 || availableTimes.length === 0) return;

    let active = true;

    const hydratePreferences = async () => {
      try {
        const [savedThemeId, savedTime] = await Promise.all([
          AsyncStorage.getItem(SELECTED_THEME_STORAGE_KEY),
          AsyncStorage.getItem(SELECTED_TIME_STORAGE_KEY),
        ]);

        if (!active) return;

        if (savedTime && availableTimes.includes(savedTime as ThemeTime)) {
          setTime(savedTime as ThemeTime);
        }

        if (savedThemeId) {
          const exists = availableThemes.some((t) => t.id === savedThemeId);
          if (exists) {
            setTheme(savedThemeId);
          }
        }
      } catch {
        // no-op
      } finally {
        if (active) didHydratePreferencesRef.current = true;
      }
    };

    hydratePreferences();

    return () => {
      active = false;
    };
  }, [availableThemes, availableTimes, setTheme, setTime]);

  React.useEffect(() => {
    if (!didHydratePreferencesRef.current) return;

    AsyncStorage.setItem(SELECTED_THEME_STORAGE_KEY, themeId).catch(() => {});
    AsyncStorage.setItem(SELECTED_TIME_STORAGE_KEY, time).catch(() => {});
  }, [themeId, time]);

  React.useEffect(() => {
    let active = true;

    const loadCustomThemeId = async () => {
      try {
        const savedId = await AsyncStorage.getItem(CUSTOM_THEME_ID_STORAGE_KEY);
        if (!active) return;

        if (savedId) {
          const exists = availableThemes.some((t) => t.id === savedId);
          if (exists) {
            setCustomThemeId(savedId);
          }
        }
      } catch {
        // no-op
      }
    };

    loadCustomThemeId();

    return () => {
      active = false;
    };
  }, []);

  const customThemeVisibility = useRef(new Animated.Value(hasCustomTheme ? 1 : 0)).current;
  const importCardVisibility = useRef(new Animated.Value(hasCustomTheme ? 0 : 1)).current;
  const customCardScale = useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.timing(customThemeVisibility, {
      toValue: hasCustomTheme ? 1 : 0,
      duration: 260,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [hasCustomTheme, customThemeVisibility]);

  React.useEffect(() => {
    if (!hasCustomTheme && !isRemovingCustomTheme) {
      importCardVisibility.setValue(1);
      return;
    }

    Animated.timing(importCardVisibility, {
      toValue: 0,
      duration: 160,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [hasCustomTheme, importCardVisibility, isRemovingCustomTheme]);

  const handleCustomCardPressIn = () => {
    Animated.spring(customCardScale, {
      toValue: 0.98,
      useNativeDriver: true,
      speed: 26,
      bounciness: 0,
    }).start();
  };

  const handleCustomCardPressOut = () => {
    Animated.timing(customCardScale, {
      toValue: 1,
      duration: 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  React.useEffect(() => {
    if (!hasCustomTheme) {
      setCustomThemeId(null);
      setPendingImportedThemeName(null);
      themesBeforeImportRef.current = null;
      AsyncStorage.removeItem(CUSTOM_THEME_ID_STORAGE_KEY).catch(() => {});
      return;
    }

    if (!pendingImportedThemeName) return;

    const before = themesBeforeImportRef.current;
    let importedTheme =
      before ? availableThemes.find((t) => !before.has(t.id)) : undefined;

    if (!importedTheme) {
      importedTheme = availableThemes.find((t) => t.name === pendingImportedThemeName);
    }

    if (importedTheme) {
      setCustomThemeId(importedTheme.id);
      AsyncStorage.setItem(CUSTOM_THEME_ID_STORAGE_KEY, importedTheme.id).catch(() => {});
      setPendingImportedThemeName(null);
      themesBeforeImportRef.current = null;
    }
  }, [availableThemes, hasCustomTheme, pendingImportedThemeName]);

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
        Alert.alert(t('common.error'), t('appearance.cannotReadFile'));
        return;
      }

      const response = await fetch(asset.uri);
      const rawJson = await response.text();

      themesBeforeImportRef.current = new Set(availableThemes.map((t) => t.id));

      const importResult = importThemeFromJson(rawJson);

      if (!importResult.success) {
        Alert.alert(t('appearance.invalidTheme'), importResult.error);
        return;
      }

      setPendingImportedThemeName(importResult.themeName);

      Alert.alert(t('appearance.importSuccess'), t('appearance.importSuccessMessage', { name: importResult.themeName }));
    } catch {
      Alert.alert(t('common.error'), t('appearance.importError'));
    }
  };

  const handleExplainRemoveCustomTheme = () => {
    didLongPressRemoveRef.current = true;

    const message = t('appearance.removeImportedTheme');

    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
      return;
    }

    Alert.alert(message);
  };

  const handlePressRemoveCustomTheme = () => {
    if (didLongPressRemoveRef.current) {
      didLongPressRemoveRef.current = false;
      return;
    }

    handleRemoveCustomTheme();
  };

  const handleRemoveCustomTheme = () => {
    if (isRemovingCustomTheme) return;

    setIsRemovingCustomTheme(true);

    Animated.parallel([
      Animated.timing(customThemeVisibility, {
        toValue: 0,
        duration: 200,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(customCardScale, {
        toValue: 0.96,
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (!finished) {
        setIsRemovingCustomTheme(false);
        return;
      }

      removeCustomTheme();
      setCustomThemeId(null);
      setPendingImportedThemeName(null);
      themesBeforeImportRef.current = null;
      AsyncStorage.removeItem(CUSTOM_THEME_ID_STORAGE_KEY).catch(() => {});

      customCardScale.setValue(1);
      setIsRemovingCustomTheme(false);

      importCardVisibility.setValue(0);
      Animated.timing(importCardVisibility, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    });
  };

  // Filter to get only built-in themes and exclude custom theme from the list
  const builtInThemes = availableThemes.filter((t) => t.id !== customThemeId);
  const customTheme = customThemeId
    ? availableThemes.find((t) => t.id === customThemeId)
    : undefined;
  const customThemeSelected = customThemeId != null && optimisticThemeId === customThemeId;

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{
        flexGrow: 1,
        backgroundColor: colors.background,
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 40,
      }}
    >
      {/* ── Language selector ─────────────────────────── */}
      <View className="mb-8">
        <Text className="mb-2 text-lg font-semibold" style={{ color: colors.text }}>
          {t('appearance.language')}
        </Text>
        <Text className="mb-4 text-sm" style={{ color: colors.textSecondary }}>
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
          <Text className="text-base font-medium" style={{ color: colors.text }}>
            {t(`appearance.languageOptions.${languagePreference}`)}
          </Text>
          <Feather name="chevron-down" size={20} color={colors.textSecondary} />
        </AnimatedPressable>
      </View>

      {/* ── Time selector ───────────────────────────────── */}
      <View className="mb-8">
        <Text className="mb-4 text-lg font-semibold" style={{ color: colors.text }}>
          {t('appearance.time')}
        </Text>
        <View className="flex-row gap-3">
          {availableTimes.map((timeKey) => {
            const icon = TIME_ICONS[timeKey];
            const selected = timeKey === optimisticTime;

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

      {/* ── Theme selector ──────────────────────────────── */}
      <View className="mb-8">
        <Text className="mb-4 text-lg font-semibold" style={{ color: colors.text }}>
          {t('appearance.theme')}
        </Text>
        <View className="gap-3">
          {/* Built-in themes */}
          {builtInThemes.map((theme) => {
            const selected = theme.id === optimisticThemeId;

            return (
              <SelectableCard
                key={theme.id}
                selected={selected}
                onPress={() => handleSelectTheme(theme.id)}
                colors={colors}
              >
                <View className="gap-3">
                  <View className="flex-row items-center justify-between">
                    <Text
                      className="text-base font-semibold"
                      style={{ color: selected ? colors.primary : colors.text }}
                    >
                      {theme.name}
                    </Text>
                    <AnimatedSelectionIcon visible={selected} color={colors.primary} />
                  </View>

                  {/* 6 color dots for current time */}
                  <View className="flex-row gap-2">
                    {[
                      theme.times[optimisticTime].primary,
                      theme.times[optimisticTime].accent,
                      theme.times[optimisticTime].text,
                      theme.times[optimisticTime].background,
                      theme.times[optimisticTime].card,
                      theme.times[optimisticTime].cardBorder,
                    ].map((color, i) => (
                      <View
                        key={i}
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 10,
                          backgroundColor: color,
                          borderWidth: 1,
                          borderColor: colors.separator,
                        }}
                      />
                    ))}
                  </View>
                </View>
              </SelectableCard>
            );
          })}

          {/* Custom Theme Card (with fade transition) */}
          <Animated.View
            style={{
              opacity: customThemeVisibility,
              transform: [
                {
                  translateY: customThemeVisibility.interpolate({
                    inputRange: [0, 1],
                    outputRange: [6, 0],
                  }),
                },
                { scale: customCardScale },
              ],
            }}
          >
            {customTheme && (
              <Pressable
                onPress={() => handleSelectTheme(customTheme.id)}
                disabled={isRemovingCustomTheme}
                onPressIn={handleCustomCardPressIn}
                onPressOut={handleCustomCardPressOut}
                style={{
                  backgroundColor: colors.card,
                  borderColor: customThemeSelected ? colors.primary : colors.cardBorder,
                  borderWidth: customThemeSelected ? 2 : 1,
                  borderRadius: 12,
                  padding: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <View style={{ flex: 1 }}>
                  <View className="gap-3">
                    <View className="flex-row items-center justify-between">
                      <Text
                        className="flex-1 text-base font-semibold"
                        style={{ color: customThemeSelected ? colors.primary : colors.text }}
                      >
                        {customTheme.name}
                      </Text>
                    </View>

                    <View className="flex-row gap-2">
                      {[
                        customTheme.times[optimisticTime].primary,
                        customTheme.times[optimisticTime].accent,
                        customTheme.times[optimisticTime].text,
                        customTheme.times[optimisticTime].background,
                        customTheme.times[optimisticTime].card,
                        customTheme.times[optimisticTime].cardBorder,
                      ].map((color, i) => (
                        <View
                          key={i}
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: 10,
                            backgroundColor: color,
                            borderWidth: 1,
                            borderColor: colors.separator,
                          }}
                        />
                      ))}
                    </View>
                  </View>
                </View>

                <View style={{ marginLeft: 16, flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <AnimatedSelectionIcon visible={customThemeSelected} color={colors.primary} />
                  <Pressable
                    onPress={handlePressRemoveCustomTheme}
                    onLongPress={handleExplainRemoveCustomTheme}
                    delayLongPress={450}
                    accessibilityRole="button"
                    accessibilityLabel={t('appearance.removeImportedTheme')}
                    accessibilityHint={t('appearance.removeImportedHint')}
                    style={{
                      padding: 8,
                      borderRadius: 8,
                      backgroundColor: 'rgba(220, 38, 38, 0.1)',
                    }}
                  >
                    <Feather name="trash-2" size={20} color="#DC2626" />
                  </Pressable>
                </View>
              </Pressable>
            )}
          </Animated.View>

          {/* Import Card (with fade transition) */}
          {!customTheme && (
            <Animated.View
              style={{
                opacity: importCardVisibility,
                transform: [
                  {
                    translateY: importCardVisibility.interpolate({
                      inputRange: [0, 1],
                      outputRange: [6, 0],
                    }),
                  },
                ],
              }}
            >
              <ImportCard colors={colors} onPress={handleImportTheme} />
            </Animated.View>
          )}
        </View>
      </View>

      <LanguagePickerModal
        visible={isLanguagePickerOpen}
        colors={colors}
        selectedPreference={languagePreference}
        onSelect={handleSelectLanguagePreference}
        onClose={() => setIsLanguagePickerOpen(false)}
        t={t}
      />
    </ScrollView>
  );
};

const CUSTOM_THEME_ID_STORAGE_KEY = '@prodexa/customThemeId';
const SELECTED_THEME_STORAGE_KEY = '@prodexa/selectedThemeId';
const SELECTED_TIME_STORAGE_KEY = '@prodexa/selectedThemeTime';
