/**
 * Theme type definitions.
 *
 * These types mirror the structure of themes.json and are used
 * throughout the app to ensure type-safe theme access.
 */

/** The set of semantic color tokens every theme/time must provide. */
export interface ThemeColors {
  background: string;
  surface: string;
  surfaceBorder: string;
  text: string;
  textSecondary: string;
  primary: string;
  primaryText: string;
  accent: string;
  navBackground: string;
  navBorder: string;
  navActive: string;
  navActiveBackground: string;
  navInactive: string;
  card: string;
  cardBorder: string;
  separator: string;
  statusBarStyle: 'dark' | 'light';
}

/** Time variants available for each theme. */
export type ThemeTime = 'day' | 'night' | 'midnight';

/** A single theme definition with its three time variants. */
export interface ThemeDefinition {
  id: string;
  name: string;
  preview: string;
  times: Record<ThemeTime, ThemeColors>;
}

/** Root structure of themes.json. */
export interface ThemesConfig {
  themes: Record<string, ThemeDefinition>;
  defaultTheme: string;
  defaultTime: ThemeTime;
}

/** Resolved theme state (current selection). */
export interface ThemeState {
  themeId: string;
  time: ThemeTime;
}
