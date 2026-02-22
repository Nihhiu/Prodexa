import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Animated as RNAnimated,
  Easing,
  InteractionManager,
  StyleSheet,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import themesConfig from '../config/themes.json';
import type {
  ThemeColors,
  ThemeDefinition,
  ThemesConfig,
  ThemeState,
  ThemeTime,
} from '../types/theme';

// ── Storage keys ──────────────────────────────────────────────
const STORAGE_KEY_THEME = '@prodexa/theme';
const STORAGE_KEY_TIME = '@prodexa/time';
const STORAGE_KEY_CUSTOM_THEME = '@prodexa/customTheme';

// ── Cast imported JSON to typed config ────────────────────────
const config = themesConfig as unknown as ThemesConfig;

// ── Context value shape ───────────────────────────────────────
export interface ThemeContextValue {
  /** Current resolved colors for the active theme + time. */
  colors: ThemeColors;
  /** Active theme id. */
  themeId: string;
  /** Active time variant. */
  time: ThemeTime;
  /** Full definition of the active theme (all 3 times). */
  themeDefinition: ThemeDefinition;
  /** All available themes (for the appearance picker). */
  availableThemes: ThemeDefinition[];
  /** All available time options. */
  availableTimes: ThemeTime[];
  /** Change the theme (persists to AsyncStorage). */
  setTheme: (themeId: string) => void;
  /** Change the time variant (persists to AsyncStorage). */
  setTime: (time: ThemeTime) => void;
  /** Whether the initial load from storage is still pending. */
  isLoading: boolean;
  /** Import and apply the first valid theme from a JSON file. */
  importThemeFromJson: (rawJson: string) =>
    | { success: true; themeName: string }
    | { success: false; error: string };
  /** Whether a custom theme is currently active. */
  hasCustomTheme: boolean;
  /** Remove the custom theme and revert to default only if it was selected. */
  removeCustomTheme: () => void;
}

// ── Defaults (used before AsyncStorage resolves) ──────────────
const fallbackState: ThemeState = {
  themeId: config.defaultTheme,
  time: config.defaultTime,
};

const REQUIRED_COLOR_KEYS: (keyof ThemeColors)[] = [
  'background',
  'surface',
  'surfaceBorder',
  'text',
  'textSecondary',
  'primary',
  'primaryText',
  'accent',
  'navBackground',
  'navBorder',
  'navActive',
  'navActiveBackground',
  'navInactive',
  'card',
  'cardBorder',
  'separator',
  'statusBarStyle',
];

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isValidThemeColors(value: unknown): value is ThemeColors {
  if (!isObjectRecord(value)) return false;

  for (const key of REQUIRED_COLOR_KEYS) {
    const keyValue = value[key];

    if (key === 'statusBarStyle') {
      if (keyValue !== 'dark' && keyValue !== 'light') return false;
      continue;
    }

    if (typeof keyValue !== 'string') return false;
  }

  return true;
}

function normalizeFirstThemeFromJson(input: unknown): ThemeDefinition | null {
  let candidate: unknown = null;

  if (Array.isArray(input)) {
    candidate = input[0];
  } else if (isObjectRecord(input)) {
    if (isObjectRecord(input.themes)) {
      candidate = Object.values(input.themes)[0];
    } else {
      candidate = input;
    }
  }

  if (!isObjectRecord(candidate)) return null;
  if (typeof candidate.id !== 'string' || !candidate.id.trim()) return null;
  if (typeof candidate.name !== 'string' || !candidate.name.trim()) return null;
  if (!isObjectRecord(candidate.times)) return null;

  const day = candidate.times.day;
  const night = candidate.times.night;
  const midnight = candidate.times.midnight;

  if (
    !isValidThemeColors(day) ||
    !isValidThemeColors(night) ||
    !isValidThemeColors(midnight)
  ) {
    return null;
  }

  return {
    id: candidate.id,
    name: candidate.name,
    preview: typeof candidate.preview === 'string' ? candidate.preview : '',
    times: {
      day,
      night,
      midnight,
    },
  };
}

// ── Context ───────────────────────────────────────────────────
export const ThemeContext = createContext<ThemeContextValue | undefined>(
  undefined,
);

// ── Provider ──────────────────────────────────────────────────
interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeId, setThemeIdState] = useState(fallbackState.themeId);
  const [time, setTimeState] = useState<ThemeTime>(fallbackState.time);
  const [customTheme, setCustomTheme] = useState<ThemeDefinition | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const themesMap = useMemo<Record<string, ThemeDefinition>>(() => {
    if (!customTheme) return config.themes;
    return {
      ...config.themes,
      [customTheme.id]: customTheme,
    };
  }, [customTheme]);

  // Load persisted preferences on mount
  useEffect(() => {
    (async () => {
      try {
        const [savedTheme, savedTime, savedCustomThemeJson] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY_THEME),
          AsyncStorage.getItem(STORAGE_KEY_TIME),
          AsyncStorage.getItem(STORAGE_KEY_CUSTOM_THEME),
        ]);

        if (savedCustomThemeJson) {
          try {
            const customThemeData = JSON.parse(savedCustomThemeJson) as ThemeDefinition;
            setCustomTheme(customThemeData);
            setThemeIdState(customThemeData.id);
          } catch {
            // Fallback silently if custom theme JSON is corrupted
          }
        } else if (savedTheme && config.themes[savedTheme]) {
          setThemeIdState(savedTheme);
        }

        if (savedTime && ['day', 'night', 'midnight'].includes(savedTime)) {
          setTimeState(savedTime as ThemeTime);
        }
      } catch {
        // Fallback silently to defaults
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const setTheme = useCallback((id: string) => {
    if (!themesMap[id]) return;
    InteractionManager.runAfterInteractions(() => {
      requestAnimationFrame(() => {
        setThemeIdState(id);
      });
    });
    AsyncStorage.setItem(STORAGE_KEY_THEME, id).catch(() => {});
  }, [themesMap]);

  const setTime = useCallback((t: ThemeTime) => {
    InteractionManager.runAfterInteractions(() => {
      requestAnimationFrame(() => {
        setTimeState(t);
      });
    });
    AsyncStorage.setItem(STORAGE_KEY_TIME, t).catch(() => {});
  }, []);

  const importThemeFromJson = useCallback(
    (rawJson: string) => {
      try {
        const parsed = JSON.parse(rawJson) as unknown;
        const importedTheme = normalizeFirstThemeFromJson(parsed);

        if (!importedTheme) {
          return {
            success: false as const,
            error:
              'JSON inválido. É necessário um tema com id, name e times (day/night/midnight).',
          };
        }

        setCustomTheme(importedTheme);
        setThemeIdState(importedTheme.id);
        AsyncStorage.setItem(STORAGE_KEY_THEME, importedTheme.id).catch(() => {});
        AsyncStorage.setItem(STORAGE_KEY_CUSTOM_THEME, JSON.stringify(importedTheme)).catch(() => {});

        return {
          success: true as const,
          themeName: importedTheme.name,
        };
      } catch {
        return {
          success: false as const,
          error: 'Não foi possível ler o JSON do tema.',
        };
      }
    },
    [],
  );

  const removeCustomTheme = useCallback(() => {
    const removedThemeId = customTheme?.id;
    const isRemovedThemeSelected = !!removedThemeId && themeId === removedThemeId;

    setCustomTheme(null);

    if (isRemovedThemeSelected) {
      const defaultThemeId = config.defaultTheme;
      const fallbackThemeId =
        config.themes[defaultThemeId]?.id ?? Object.values(config.themes)[0]?.id;

      if (fallbackThemeId) {
        setThemeIdState(fallbackThemeId);
        AsyncStorage.setItem(STORAGE_KEY_THEME, fallbackThemeId).catch(() => {});
      }
    }

    AsyncStorage.removeItem(STORAGE_KEY_CUSTOM_THEME).catch(() => {});
  }, [customTheme, themeId]);

  // ── Computed theme values (extracted for overlay tracking) ──
  const activeTheme = useMemo(
    () => themesMap[themeId] ?? themesMap[config.defaultTheme],
    [themesMap, themeId],
  );

  const colors = useMemo(
    () => activeTheme.times[time] ?? activeTheme.times[config.defaultTime],
    [activeTheme, time],
  );

  // ── Crossfade overlay for smooth theme transitions ──────────
  const [overlayBg, setOverlayBg] = useState<string | null>(null);
  const overlayOpacity = useRef(new RNAnimated.Value(0)).current;
  const prevBgRef = useRef<string | null>(null);

  useEffect(() => {
    // Skip on initial mount
    if (prevBgRef.current === null) {
      prevBgRef.current = colors.background;
      return;
    }

    if (prevBgRef.current !== colors.background) {
      const prevBg = prevBgRef.current;
      prevBgRef.current = colors.background;

      setOverlayBg(prevBg);
      overlayOpacity.setValue(1);
      RNAnimated.timing(overlayOpacity, {
        toValue: 0,
        duration: 350,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        setOverlayBg(null);
      });
    }
  }, [colors.background, overlayOpacity]);

  const value = useMemo<ThemeContextValue>(() => {
    const availableThemes = Object.values(themesMap);
    const availableTimes: ThemeTime[] = ['day', 'night', 'midnight'];

    return {
      colors,
      themeId,
      time,
      themeDefinition: activeTheme,
      availableThemes,
      availableTimes,
      setTheme,
      setTime,
      isLoading,
      importThemeFromJson,
      hasCustomTheme: customTheme !== null,
      removeCustomTheme,
    };
  }, [
    colors,
    activeTheme,
    themeId,
    time,
    isLoading,
    setTheme,
    setTime,
    themesMap,
    importThemeFromJson,
    customTheme,
    removeCustomTheme,
  ]);

  return (
    <ThemeContext.Provider value={value}>
      <View style={providerStyles.container}>
        {children}
        {overlayBg != null && (
          <RNAnimated.View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: overlayBg,
                opacity: overlayOpacity,
              },
            ]}
          />
        )}
      </View>
    </ThemeContext.Provider>
  );
};

const providerStyles = StyleSheet.create({
  container: { flex: 1 },
});
