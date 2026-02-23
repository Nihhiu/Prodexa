// #region Imports
import React from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

import {
  LANGUAGE_PREFERENCES,
  type LanguagePreference,
} from '../../../i18n';
import type { ThemeColors } from '../../../types/theme';
import { AnimatedPressable } from './AnimatedPressable';
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

const POPUP_ANIMATION_DURATION_MS = 200;
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
  const [shouldRender, setShouldRender] = React.useState(visible);
  const overlayOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.98);
  const cardOpacity = useSharedValue(0);

  // Controla desmontagem apenas após animação de fechamento terminar.
  React.useEffect(() => {
    if (visible) {
      setShouldRender(true);
      return;
    }

    const timingConfig = {
      duration: POPUP_ANIMATION_DURATION_MS,
      easing: Easing.out(Easing.cubic),
    };

    overlayOpacity.value = withTiming(0, timingConfig);
    cardOpacity.value = withTiming(0, timingConfig);
    cardScale.value = withTiming(0.98, timingConfig, (finished) => {
      if (finished) {
        runOnJS(setShouldRender)(false);
      }
    });
  }, [visible]);

  React.useEffect(() => {
    // Inicializa estado visual e executa animação de entrada do modal.
    if (!visible || !shouldRender) return;

    overlayOpacity.value = 0;
    cardOpacity.value = 0;
    cardScale.value = 0.98;

    const timer = setTimeout(() => {
      const timingConfig = {
        duration: POPUP_ANIMATION_DURATION_MS,
        easing: Easing.out(Easing.cubic),
      };

      overlayOpacity.value = withTiming(1, timingConfig);
      cardOpacity.value = withTiming(1, timingConfig);
      cardScale.value = withTiming(1, timingConfig);
    }, 0);

    return () => clearTimeout(timer);
  }, [visible, shouldRender]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value }],
  }));

  if (!shouldRender) return null;

  return (
    <Modal
      visible={shouldRender}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Animated.View
        style={[
          {
            flex: 1,
            justifyContent: 'center',
            paddingHorizontal: 20,
          },
          overlayStyle,
        ]}
      >
        <BlurView
          intensity={22}
          tint="dark"
          experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
          style={StyleSheet.absoluteFillObject}
          pointerEvents="none"
        />
        <View
          pointerEvents="none"
          style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0, 0, 0, 0.16)' }]}
        />
        <Pressable onPress={onClose} style={StyleSheet.absoluteFillObject} />

        <Animated.View style={cardStyle}>
          <Pressable
            onPress={(event) => event.stopPropagation()}
            style={{
              backgroundColor: colors.background,
              borderColor: colors.cardBorder,
              borderWidth: 1,
              borderRadius: 16,
              padding: 16,
            }}
          >
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
          </Pressable>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};
// #endregion
