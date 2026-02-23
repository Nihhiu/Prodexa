// #region Imports
import React from 'react';
import { Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import type { ThemeColors } from '../../../types/theme';
import { AnimatedPressable } from './AnimatedPressable';
import { ThemedPopupModal } from './ThemedPopupModal';
// #endregion

// #region Types and constants
interface ImportFeedbackModalProps {
  visible: boolean;
  colors: ThemeColors;
  title: string;
  message: string;
  variant: 'success' | 'error' | 'info';
  onClose: () => void;
  t: (key: string) => string;
}
// #endregion

// #region Component
export const ImportFeedbackModal: React.FC<ImportFeedbackModalProps> = ({
  visible,
  colors,
  title,
  message,
  variant,
  onClose,
  t,
}) => {
  const iconName = variant === 'success'
    ? 'check-circle'
    : variant === 'info'
      ? 'info'
      : 'alert-circle';

  return (
    <ThemedPopupModal visible={visible} colors={colors} onClose={onClose} cardStyle={{ gap: 12 }}>
      <View className="flex-row items-center" style={{ gap: 10 }}>
        <Feather name={iconName} size={22} color={colors.primary} />
        <Text className="text-lg font-l_semibold" style={{ color: colors.text, flexShrink: 1 }}>
          {title}
        </Text>
      </View>

      <Text className="text-sm" style={{ color: colors.textSecondary }}>
        {message}
      </Text>

      <AnimatedPressable
        onPress={onClose}
        style={{
          marginTop: 6,
          alignSelf: 'flex-end',
          backgroundColor: colors.primary,
          borderRadius: 10,
          paddingHorizontal: 14,
          paddingVertical: 10,
        }}
      >
        <Text className="text-sm font-l_medium" style={{ color: colors.primaryText }}>
          {t('common.confirm')}
        </Text>
      </AnimatedPressable>
    </ThemedPopupModal>
  );
};
// #endregion