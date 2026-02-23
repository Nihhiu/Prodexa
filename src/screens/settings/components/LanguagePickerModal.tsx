// #region Imports
import React from 'react';
import { Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import {
  LANGUAGE_PREFERENCES,
  type LanguagePreference,
} from '../../../i18n';
import type { ThemeColors } from '../../../types/theme';
import { AnimatedPressable } from './AnimatedPressable';
import { ThemedPopupModal } from './ThemedPopupModal';
// #endregion

// #region Types and constants
interface LanguagePickerModalProps {
  visible: boolean;
  colors: ThemeColors;
  selectedPreference: LanguagePreference;
  onSelect: (preference: LanguagePreference) => void;
  onClose: () => void;
  t: (key: string) => string;
}
// #endregion

// #region Component
export const LanguagePickerModal: React.FC<LanguagePickerModalProps> = ({
  visible,
  colors,
  selectedPreference,
  onSelect,
  onClose,
  t,
}) => {
  return (
    <ThemedPopupModal visible={visible} colors={colors} onClose={onClose}>
      <Text className="text-lg font-l_semibold" style={{ color: colors.text }}>
        {t('appearance.languagePickerTitle')}
      </Text>
      <Text className="mt-1 text-sm" style={{ color: colors.textSecondary }}>
        {t('appearance.languagePickerDescription')}
      </Text>

      <View className="mt-4 gap-2">
        {LANGUAGE_PREFERENCES.map((preference) => {
          const selected = selectedPreference === preference;

          return (
            <AnimatedPressable
              key={preference}
              onPress={() => onSelect(preference)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: colors.card,
                borderColor: selected ? colors.primary : colors.cardBorder,
                borderWidth: selected ? 2 : 1,
                borderRadius: 12,
                paddingHorizontal: 14,
                paddingVertical: 12,
              }}
            >
              <Text
                className="text-base font-l_medium"
                style={{ color: selected ? colors.primary : colors.text }}
              >
                {t(`appearance.languageOptions.${preference}`)}
              </Text>
              {selected && <Feather name="check-circle" size={20} color={colors.primary} />}
            </AnimatedPressable>
          );
        })}
      </View>
    </ThemedPopupModal>
  );
};
// #endregion
