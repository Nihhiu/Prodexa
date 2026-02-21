import { useContext } from 'react';
import { ThemeContext, type ThemeContextValue } from '../context/ThemeContext';

/**
 * Access the current theme colors and helpers.
 *
 * Must be used inside a `<ThemeProvider>`.
 *
 * @example
 * ```tsx
 * const { colors, setTheme, setTime } = useTheme();
 * <View style={{ backgroundColor: colors.background }}>
 *   <Text style={{ color: colors.text }}>Hello</Text>
 * </View>
 * ```
 */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a <ThemeProvider>');
  }
  return ctx;
}
