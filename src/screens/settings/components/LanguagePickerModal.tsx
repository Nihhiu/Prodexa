import React, { useRef } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

import {
  LANGUAGE_PREFERENCES,
  type LanguagePreference,
} from '../../../i18n';
import type { ThemeColors } from '../../../types/theme';
import { AnimatedPressable } from './AnimatedPressable';

interface LanguagePickerModalProps {
  visible: boolean;
  colors: ThemeColors;
  selectedPreference: LanguagePreference;
  onSelect: (preference: LanguagePreference) => void;
  onClose: () => void;
  t: (key: string) => string;
}

const POPUP_ANIMATION_DURATION_MS = 200;

export const LanguagePickerModal: React.FC<LanguagePickerModalProps> = ({
  visible,
  colors,
  selectedPreference,
  onSelect,
  onClose,
  t,
}) => {
  const [shouldRender, setShouldRender] = React.useState(visible);
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.98)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      setShouldRender(true);
      return;
    }

    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: POPUP_ANIMATION_DURATION_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 0,
        duration: POPUP_ANIMATION_DURATION_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(cardScale, {
        toValue: 0.98,
        duration: POPUP_ANIMATION_DURATION_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) setShouldRender(false);
    });
  }, [visible, overlayOpacity, cardOpacity, cardScale]);

  React.useEffect(() => {
    if (!visible || !shouldRender) return;

    overlayOpacity.setValue(0);
    cardOpacity.setValue(0);
    cardScale.setValue(0.98);

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: POPUP_ANIMATION_DURATION_MS,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: POPUP_ANIMATION_DURATION_MS,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(cardScale, {
          toValue: 1,
          duration: POPUP_ANIMATION_DURATION_MS,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }, 0);

    return () => clearTimeout(timer);
  }, [visible, shouldRender, overlayOpacity, cardOpacity, cardScale]);

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
        style={{
          flex: 1,
          justifyContent: 'center',
          paddingHorizontal: 20,
          opacity: overlayOpacity,
        }}
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

        <Animated.View
          style={{
            opacity: cardOpacity,
            transform: [{ scale: cardScale }],
          }}
        >
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
            <Text className="text-lg font-semibold" style={{ color: colors.text }}>
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
                      className="text-base font-medium"
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
