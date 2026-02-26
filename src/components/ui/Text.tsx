// #region Imports
import React from 'react';
import {
  Text as RNText,
  type TextProps,
  type TextStyle,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
// #endregion

// #region Constants
/**
 * Tailwind text-size classes → base React Native fontSize / lineHeight.
 * Used to determine the base size when className drives the font size.
 */
const TW_TEXT_SIZES: Record<string, { fontSize: number; lineHeight: number }> = {
  'text-xs':   { fontSize: 12, lineHeight: 16 },
  'text-sm':   { fontSize: 14, lineHeight: 20 },
  'text-base': { fontSize: 16, lineHeight: 24 },
  'text-lg':   { fontSize: 18, lineHeight: 28 },
  'text-xl':   { fontSize: 20, lineHeight: 28 },
  'text-2xl':  { fontSize: 24, lineHeight: 32 },
  'text-3xl':  { fontSize: 30, lineHeight: 36 },
  'text-4xl':  { fontSize: 36, lineHeight: 40 },
};
// #endregion

// #region Component
/**
 * Drop-in replacement for React Native's `<Text>`.
 *
 * Reads the `fontSize` multiplier from ThemeContext and scales
 * the resolved font-size (from Tailwind className OR inline style)
 * accordingly. When the multiplier is 1 it passes through to
 * the native `<Text>` with zero overhead.
 */
export const Text: React.FC<TextProps & { className?: string }> = ({
  className,
  style,
  ...props
}) => {
  const { fontSize: fontScale } = useTheme();

  // Fast path – no scaling
  if (fontScale === 1) {
    return <RNText className={className} style={style} {...props} />;
  }

  // ── Resolve base sizes ────────────────────────────────────
  let baseFontSize: number | undefined;
  let baseLineHeight: number | undefined;

  // 1. Inline style has highest priority
  const flat = StyleSheet.flatten(style) as TextStyle | undefined;
  if (flat?.fontSize != null) {
    baseFontSize = flat.fontSize;
    baseLineHeight = flat.lineHeight;
  }

  // 2. Tailwind className (only when inline style didn't specify fontSize)
  if (baseFontSize == null && className) {
    const classes = className.split(/\s+/);
    for (const cls of classes) {
      const sizes = TW_TEXT_SIZES[cls];
      if (sizes) {
        baseFontSize = sizes.fontSize;
        baseLineHeight = sizes.lineHeight;
        break;
      }
    }
  }

  // 3. Default React Native text size
  if (baseFontSize == null) {
    baseFontSize = 14;
  }

  // ── Build scaled override ──────────────────────────────────
  const scaleOverride: TextStyle = {
    fontSize: Math.round(baseFontSize * fontScale * 10) / 10,
  };

  if (baseLineHeight != null) {
    scaleOverride.lineHeight =
      Math.round(baseLineHeight * fontScale * 10) / 10;
  }

  return (
    <RNText className={className} style={[style, scaleOverride]} {...props} />
  );
};
// #endregion
