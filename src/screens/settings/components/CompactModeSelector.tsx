// #region Imports
import React from 'react';
import { View } from 'react-native';
import { Text } from '../../../components/ui';
import { Feather } from '@expo/vector-icons';
import type { ThemeColors } from '../../../types/theme';
import { SelectableCard } from './SelectableCard';
// #endregion

// #region Types
interface CompactModeSelectorProps {
  colors: ThemeColors;
  compactMode: boolean;
  onCompactModeChange: (compact: boolean) => void;
  t: (key: string, options?: Record<string, string>) => string;
}
// #endregion

// #region Component
export const CompactModeSelector: React.FC<CompactModeSelectorProps> = ({
  colors,
  compactMode,
  onCompactModeChange,
  t,
}) => {
  return (
    <View className="flex-row gap-3">
      {/* Compact option */}
      <View className="flex-1">
        <SelectableCard
          selected={compactMode}
          onPress={() => onCompactModeChange(true)}
          colors={colors}
        >
          <View style={{ alignItems: 'center', gap: 8, paddingVertical: 4 }}>
            <Feather
              name="minimize-2"
              size={22}
              color={compactMode ? colors.primary : colors.textSecondary}
            />
            <Text
              className="text-sm font-l_semibold text-center"
              style={{
                color: compactMode ? colors.primary : colors.text,
              }}
            >
              {t('appearance.compactMode')}
            </Text>
            <Text
              className="text-xs font-l_regular text-center"
              style={{ color: colors.textSecondary }}
              numberOfLines={2}
            >
              {t('appearance.compactDescription')}
            </Text>
          </View>
        </SelectableCard>
      </View>

      {/* "Want to Write!" option */}
      <View className="flex-1">
        <SelectableCard
          selected={!compactMode}
          onPress={() => onCompactModeChange(false)}
          colors={colors}
        >
          <View style={{ alignItems: 'center', gap: 8, paddingVertical: 4 }}>
            <Feather
              name="edit-3"
              size={22}
              color={!compactMode ? colors.primary : colors.textSecondary}
            />
            <Text
              className="text-sm font-l_semibold text-center"
              style={{
                color: !compactMode ? colors.primary : colors.text,
              }}
            >
              {t('appearance.wantToWrite')}
            </Text>
            <Text
              className="text-xs font-l_regular text-center"
              style={{ color: colors.textSecondary }}
              numberOfLines={2}
            >
              {t('appearance.wantToWriteDescription')}
            </Text>
          </View>
        </SelectableCard>
      </View>
    </View>
  );
};
// #endregion
