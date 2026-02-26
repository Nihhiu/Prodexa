// #region Imports
import React from 'react';
import { View } from 'react-native';
import type { ThemeColors } from '../../../types/theme';
// #endregion

// #region Types
interface SectionSeparatorProps {
  colors: ThemeColors;
}
// #endregion

// #region Component
export const SectionSeparator: React.FC<SectionSeparatorProps> = ({ colors }) => (
  <View
    style={{
      marginVertical: 24,
      marginHorizontal: 4,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    }}
  >
    <View
      style={{
        flex: 1,
        height: 1,
        backgroundColor: colors.separator,
        opacity: 0.5,
        borderRadius: 1,
      }}
    />
    <View
      style={{
        width: 5,
        height: 5,
        borderRadius: 3,
        backgroundColor: colors.accent,
        opacity: 0.6,
      }}
    />
    <View
      style={{
        flex: 1,
        height: 1,
        backgroundColor: colors.separator,
        opacity: 0.5,
        borderRadius: 1,
      }}
    />
  </View>
);
// #endregion
