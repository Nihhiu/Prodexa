// #region Imports
import React, { useCallback } from 'react';
import { View } from 'react-native';
import { Text } from '../../../components/ui';
import Slider from '@react-native-community/slider';
import type { ThemeColors } from '../../../types/theme';
// #endregion

// #region Constants
const FONT_SIZE_MIN = 0.8;
const FONT_SIZE_MAX = 1.2;
const FONT_SIZE_STEP = 0.05;

const FONT_SIZE_LABELS: Record<string, { en: string; pt: string }> = {
  '0.8': { en: 'Tiny', pt: 'Minúsculo' },
  '0.85': { en: 'Very Small', pt: 'Muito Pequeno' },
  '0.9': { en: 'Small', pt: 'Pequeno' },
  '0.95': { en: 'Slightly Small', pt: 'Ligeiramente Pequeno' },
  '1': { en: 'Default', pt: 'Padrão' },
  '1.05': { en: 'Slightly Large', pt: 'Ligeiramente Grande' },
  '1.1': { en: 'Large', pt: 'Grande' },
  '1.15': { en: 'Very Large', pt: 'Muito Grande' },
  '1.2': { en: 'Extra Large', pt: 'Extra Grande' },
};
// #endregion

// #region Types
interface FontSizeSliderProps {
  colors: ThemeColors;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  t: (key: string, options?: Record<string, string>) => string;
}
// #endregion

// #region Component
export const FontSizeSlider: React.FC<FontSizeSliderProps> = ({
  colors,
  fontSize,
  onFontSizeChange,
  t,
}) => {
  const handleValueChange = useCallback(
    (value: number) => {
      const rounded = Math.round(value * 20) / 20;
      onFontSizeChange(rounded);
    },
    [onFontSizeChange],
  );

  const sizeKey = (Math.round(fontSize * 20) / 20).toString();
  const currentLang = t('appearance.title') === 'Aparência' ? 'pt' : 'en';
  const sizeLabel =
    FONT_SIZE_LABELS[sizeKey]?.[currentLang] ??
    FONT_SIZE_LABELS['1']?.[currentLang] ??
    'Default';

  const percentage = Math.round(fontSize * 100);

  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
        }}
      >
        <Text
          className="text-sm font-l_regular"
          style={{ color: colors.textSecondary }}
        >
          {sizeLabel}
        </Text>
        <Text
          className="text-sm font-l_semibold"
          style={{ color: colors.primary }}
        >
          {percentage}%
        </Text>
      </View>

      <View
        style={{
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
          borderWidth: 1,
          borderRadius: 12,
          paddingVertical: 8,
          paddingHorizontal: 12,
        }}
      >
        <Slider
          minimumValue={FONT_SIZE_MIN}
          maximumValue={FONT_SIZE_MAX}
          step={FONT_SIZE_STEP}
          value={fontSize}
          onValueChange={handleValueChange}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.separator}
          thumbTintColor={colors.primary}
        />
      </View>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: 6,
          paddingHorizontal: 4,
        }}
      >
        <Text
          style={{
            fontSize: 11,
            color: colors.textSecondary,
            fontFamily: 'Lexend_400Regular',
          }}
        >
          A
        </Text>
        <Text
          style={{
            fontSize: 17,
            color: colors.textSecondary,
            fontFamily: 'Lexend_400Regular',
          }}
        >
          A
        </Text>
      </View>
    </View>
  );
};
// #endregion
