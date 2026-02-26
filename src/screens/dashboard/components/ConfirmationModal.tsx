// #region Imports
import React from 'react';
import { View } from 'react-native';
import { Text } from '../../../components/ui';
import { Feather } from '@expo/vector-icons';

import type { ThemeColors } from '../../../types/theme';
import { AnimatedPressable, ThemedPopupModal } from '../../settings/components';
// #endregion

// #region Types
interface ConfirmationModalProps {
  visible: boolean;
  colors: ThemeColors;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  icon?: React.ComponentProps<typeof Feather>['name'];
  variant?: 'default' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
}
// #endregion

// #region Component
export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  colors,
  title,
  message,
  confirmLabel,
  cancelLabel,
  icon = 'alert-circle',
  variant = 'default',
  onConfirm,
  onCancel,
}) => {
  const iconColor = variant === 'danger' ? colors.accent : colors.primary;
  const confirmBg = variant === 'danger' ? colors.accent : colors.primary;

  return (
    <ThemedPopupModal visible={visible} colors={colors} onClose={onCancel} cardStyle={{ gap: 12 }}>
      <View className="flex-row items-center" style={{ gap: 10 }}>
        <Feather name={icon} size={22} color={iconColor} />
        <Text className="text-lg font-l_semibold" style={{ color: colors.text, flexShrink: 1 }}>
          {title}
        </Text>
      </View>

      <Text className="text-sm" style={{ color: colors.textSecondary }}>
        {message}
      </Text>

      <View className="flex-row justify-end" style={{ marginTop: 6, gap: 10 }}>
        <AnimatedPressable
          onPress={onCancel}
          style={{
            borderRadius: 10,
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderWidth: 1.5,
            borderColor: colors.cardBorder,
          }}
        >
          <Text className="text-sm font-l_medium" style={{ color: colors.text }}>
            {cancelLabel}
          </Text>
        </AnimatedPressable>

        <AnimatedPressable
          onPress={onConfirm}
          style={{
            backgroundColor: confirmBg,
            borderRadius: 10,
            paddingHorizontal: 14,
            paddingVertical: 10,
          }}
        >
          <Text className="text-sm font-l_medium" style={{ color: colors.primaryText }}>
            {confirmLabel}
          </Text>
        </AnimatedPressable>
      </View>
    </ThemedPopupModal>
  );
};
// #endregion
