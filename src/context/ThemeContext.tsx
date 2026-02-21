import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
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

// ── Cast imported JSON to typed config ────────────────────────
const config = themesConfig as ThemesConfig;

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
}

// ── Defaults (used before AsyncStorage resolves) ──────────────
const fallbackState: ThemeState = {
  themeId: config.defaultTheme,
  time: config.defaultTime,
};

function resolveColors(themeId: string, time: ThemeTime): ThemeColors {
  const theme = config.themes[themeId] ?? config.themes[config.defaultTheme];
  return theme.times[time] ?? theme.times[config.defaultTime];
}

function resolveDefinition(themeId: string): ThemeDefinition {
  return config.themes[themeId] ?? config.themes[config.defaultTheme];
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
  const [isLoading, setIsLoading] = useState(true);

  // Load persisted preferences on mount
  useEffect(() => {
    (async () => {
      try {
        const [savedTheme, savedTime] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY_THEME),
          AsyncStorage.getItem(STORAGE_KEY_TIME),
        ]);
        if (savedTheme && config.themes[savedTheme]) {
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
    if (!config.themes[id]) return;
    setThemeIdState(id);
    AsyncStorage.setItem(STORAGE_KEY_THEME, id).catch(() => {});
  }, []);

  const setTime = useCallback((t: ThemeTime) => {
    setTimeState(t);
    AsyncStorage.setItem(STORAGE_KEY_TIME, t).catch(() => {});
  }, []);

  const value = useMemo<ThemeContextValue>(() => {
    const colors = resolveColors(themeId, time);
    const themeDefinition = resolveDefinition(themeId);
    const availableThemes = Object.values(config.themes);
    const availableTimes: ThemeTime[] = ['day', 'night', 'midnight'];

    return {
      colors,
      themeId,
      time,
      themeDefinition,
      availableThemes,
      availableTimes,
      setTheme,
      setTime,
      isLoading,
    };
  }, [themeId, time, isLoading, setTheme, setTime]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
