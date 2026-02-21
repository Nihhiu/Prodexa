import React from 'react';
import { Text, View } from 'react-native';
import type { ThemeColors } from '../../types/theme';

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
  const cardStyle = themeColors
    ? {
        backgroundColor: themeColors.card,
        borderColor: themeColors.cardBorder,
        borderWidth: variant === 'outlined' ? 2 : 1,
      }
    : undefined;

  const variantClass = themeColors
    ? ''
    : variant === 'default'
      ? 'bg-white border border-gray-200'
      : variant === 'outlined'
        ? 'bg-transparent border-2 border-gray-300'
        : 'bg-white shadow-lg';

  return (
    <View
      className={`rounded-xl p-4 ${variantClass} ${className}`}
      style={cardStyle}
    >
      {title && (
        <>
          <Text
            className="mb-3 text-lg font-bold"
            style={themeColors ? { color: themeColors.text } : { color: '#1f2937' }}
          >
            {title}
          </Text>
          <View
            className="mb-4 h-[1px]"
            style={{ backgroundColor: themeColors?.separator ?? '#e5e7eb' }}
          />
        </>
      )}
      {children}
    </View>
  );
};
