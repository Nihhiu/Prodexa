// #region Imports
import React from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';

import type { ThemeColors } from '../../../types/theme';
// #endregion

// #region Types and constants
interface ThemedPopupModalProps {
  visible: boolean;
  colors: ThemeColors;
  onClose: () => void;
  children: React.ReactNode;
  cardStyle?: ViewStyle;
}

const POPUP_ANIMATION_DURATION_MS = 200;
// #endregion

// #region Component
export const ThemedPopupModal: React.FC<ThemedPopupModalProps> = ({
  visible,
  colors,
  onClose,
  children,
  cardStyle,
}) => {
  const [shouldRender, setShouldRender] = React.useState(visible);
  const overlayOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.98);
  const cardOpacity = useSharedValue(0);

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

  const popupCardStyle = useAnimatedStyle(() => ({
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

        <Animated.View style={popupCardStyle}>
          <Pressable
            onPress={(event) => event.stopPropagation()}
            style={[
              {
                backgroundColor: colors.background,
                borderColor: colors.cardBorder,
                borderWidth: 1,
                borderRadius: 16,
                padding: 16,
              },
              cardStyle,
            ]}
          >
            {children}
          </Pressable>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};
// #endregion