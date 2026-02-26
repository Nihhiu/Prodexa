import React from 'react';
import { View } from 'react-native';
import { Text } from './Text';
import type { ThemeColors } from '../../types/theme';
import { useTheme } from '../../hooks/useTheme';

type CardVariant = 'default' | 'outlined' | 'elevated';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  variant?: CardVariant;
  className?: string;
  /** When provided, card uses theme colors instead of hardcoded ones. */
  themeColors?: ThemeColors;
}

export const Card = ({
  children,
  title,
  variant = 'default',
  className = '',
  themeColors,
}: CardProps) => {
  const { colors } = useTheme();
  const resolvedThemeColors = themeColors ?? colors;

  const cardStyle = themeColors
    ? {
        backgroundColor: themeColors.card,
        borderColor: themeColors.cardBorder,
        borderWidth: variant === 'outlined' ? 2 : 1,
      }
    : {
        backgroundColor: resolvedThemeColors.card,
        borderColor: resolvedThemeColors.cardBorder,
        borderWidth: variant === 'outlined' ? 2 : 1,
      };

  const variantClass = variant === 'elevated' ? 'shadow-lg' : '';

  return (
    <View
      className={`rounded-xl p-4 ${variantClass} ${className}`}
      style={cardStyle}
    >
      {title && (
        <>
          <Text
            className="mb-3 text-lg font-l_bold"
            style={{ color: resolvedThemeColors.text }}
          >
            {title}
          </Text>
          <View
            className="mb-4 h-[1px]"
            style={{ backgroundColor: resolvedThemeColors.separator }}
          />
        </>
      )}
      {children}
    </View>
  );
};
