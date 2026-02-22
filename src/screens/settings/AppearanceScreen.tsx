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

import { useTheme } from '../../hooks/useTheme';
import type { ThemeColors, ThemeTime } from '../../types/theme';

// ── Time labels & icons ───────────────────────────────────────
const TIME_META: Record<ThemeTime, { label: string; icon: React.ComponentProps<typeof Feather>['name'] }> = {
  day: { label: 'Dia', icon: 'sun' },
  night: { label: 'Noite', icon: 'moon' },
  midnight: { label: 'Meia-noite', icon: 'star' },
};

// ── Animated selectable card ──────────────────────────────────
interface SelectableCardProps {
  selected: boolean;
  onPress: () => void;
  colors: ThemeColors;
  children: React.ReactNode;
}

const SelectableCard: React.FC<SelectableCardProps> = ({
  selected,
  onPress,
  colors,
  children,
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const selectedProgress = useRef(new Animated.Value(selected ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.timing(selectedProgress, {
      toValue: selected ? 1 : 0,
      duration: 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [selected, selectedProgress]);

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 30,
      bounciness: 0,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(scale, {
      toValue: 1,
      duration: 200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={{
        opacity: selectedProgress.interpolate({
          inputRange: [0, 1],
          outputRange: [0.96, 1],
        }),
        transform: [
          { scale },
          {
            scale: selectedProgress.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.012],
            }),
          },
          {
            translateY: selectedProgress.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -2],
            }),
          },
        ],
      }}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{
          backgroundColor: colors.card,
          borderColor: selected ? colors.primary : colors.cardBorder,
          borderWidth: selected ? 2 : 1,
          borderRadius: 12,
          padding: 16,
        }}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
};

// ── Import card (with dashed border and plus icon) ─────────────
interface ImportCardProps {
  colors: ThemeColors;
  onPress: () => void;
}

const ImportCard: React.FC<ImportCardProps> = ({ colors, onPress }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const iconPulse = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(iconPulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(iconPulse, {
          toValue: 0,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );

    pulseLoop.start();
    return () => pulseLoop.stop();
  }, [iconPulse]);

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 30,
      bounciness: 0,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(scale, {
      toValue: 1,
      duration: 200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
          borderWidth: 2,
          borderStyle: 'dashed',
          borderRadius: 12,
          padding: 16,
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 120,
        }}
      >
        <View
          style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Animated.View
            style={{
              opacity: iconPulse.interpolate({
                inputRange: [0, 1],
                outputRange: [0.9, 1],
              }),
              transform: [
                {
                  scale: iconPulse.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.06],
                  }),
                },
              ],
            }}
          >
            <Feather name="plus" size={32} color={colors.card} />
          </Animated.View>
        </View>
        <Text
          className="mt-3 text-sm font-medium"
          style={{ color: colors.textSecondary }}
        >
          Importar tema
        </Text>
      </Pressable>
    </Animated.View>
  );
};

interface AnimatedSelectionIconProps {
  visible: boolean;
  color: string;
}

const AnimatedSelectionIcon: React.FC<AnimatedSelectionIconProps> = ({
  visible,
  color,
}) => {
  const iconScale = useRef(new Animated.Value(visible ? 1 : 0.85)).current;
  const iconOpacity = useRef(new Animated.Value(visible ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(iconScale, {
        toValue: visible ? 1 : 0.85,
        duration: 150,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(iconOpacity, {
        toValue: visible ? 1 : 0,
        duration: 120,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible, iconOpacity, iconScale]);

  if (!visible) return null;

  return (
    <Animated.View style={{ opacity: iconOpacity, transform: [{ scale: iconScale }] }}>
      <Feather name="check-circle" size={24} color={color} />
    </Animated.View>
  );
};

interface TimeOptionCardProps {
  t: ThemeTime;
  selected: boolean;
  colors: ThemeColors;
  label: string;
  icon: React.ComponentProps<typeof Feather>['name'];
  onPress: () => void;
}

const TimeOptionCard: React.FC<TimeOptionCardProps> = ({
  t,
  selected,
  colors,
  label,
  icon,
  onPress,
}) => {
  const iconProgress = useRef(new Animated.Value(selected ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.timing(iconProgress, {
      toValue: selected ? 1 : 0,
      duration: 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [selected, iconProgress]);

  return (
    <View key={t} className="flex-1">
      <SelectableCard selected={selected} onPress={onPress} colors={colors}>
        <View className="items-center gap-2">
          <Animated.View
            style={{
              transform: [
                {
                  scale: iconProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.92, 1.02],
                  }),
                },
                {
                  rotate: iconProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['-6deg', '0deg'],
                  }),
                },
              ],
            }}
          >
            <Feather
              name={icon}
              size={24}
              color={selected ? colors.primary : colors.textSecondary}
            />
          </Animated.View>
          <Text
            className="text-sm font-medium"
            style={{
              color: selected ? colors.primary : colors.textSecondary,
            }}
          >
            {label}
          </Text>
        </View>
      </SelectableCard>
    </View>
  );
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
        Alert.alert('Erro', 'Não foi possível ler o ficheiro selecionado.');
        return;
      }

      const response = await fetch(asset.uri);
      const rawJson = await response.text();

      themesBeforeImportRef.current = new Set(availableThemes.map((t) => t.id));

      const importResult = importThemeFromJson(rawJson);

      if (!importResult.success) {
        Alert.alert('Tema inválido', importResult.error);
        return;
      }

      setPendingImportedThemeName(importResult.themeName);

      Alert.alert('Tema aplicado', `Tema "${importResult.themeName}" importado com sucesso.`);
    } catch {
      Alert.alert('Erro', 'Ocorreu um erro ao importar o tema.');
    }
  };

  const handleExplainRemoveCustomTheme = () => {
    didLongPressRemoveRef.current = true;

    const message = 'Remover tema importado';

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
      {/* ── Time selector ───────────────────────────────── */}
      <View className="mb-8">
        <Text className="mb-4 text-lg font-semibold" style={{ color: colors.text }}>
          Tempo
        </Text>
        <View className="flex-row gap-3">
          {availableTimes.map((t) => {
            const meta = TIME_META[t];
            const selected = t === optimisticTime;

            return (
              <TimeOptionCard
                key={t}
                t={t}
                selected={selected}
                colors={colors}
                label={meta.label}
                icon={meta.icon}
                onPress={() => handleSelectTime(t)}
              />
            );
          })}
        </View>
      </View>

      {/* ── Theme selector ──────────────────────────────── */}
      <View className="mb-8">
        <Text className="mb-4 text-lg font-semibold" style={{ color: colors.text }}>
          Tema
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
                    accessibilityLabel="Eliminar tema importado"
                    accessibilityHint="Remove o tema importado e volta para os temas padrão"
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
    </ScrollView>
  );
};

const CUSTOM_THEME_ID_STORAGE_KEY = '@prodexa/customThemeId';
const SELECTED_THEME_STORAGE_KEY = '@prodexa/selectedThemeId';
const SELECTED_TIME_STORAGE_KEY = '@prodexa/selectedThemeTime';
