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
      height: 1,
      marginVertical: 24,
      marginHorizontal: 4,
      backgroundColor: colors.separator,
      opacity: 0.5,
      borderRadius: 1,
    }}
  />
);
// #endregion
