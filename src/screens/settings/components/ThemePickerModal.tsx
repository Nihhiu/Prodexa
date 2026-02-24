// #region Imports
import React, { useEffect } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';

import type { ThemeColors, ThemeDefinition, ThemeTime } from '../../../types/theme';
import { AnimatedPressable } from './AnimatedPressable';
import { ThemedPopupModal } from './ThemedPopupModal';
// #endregion

// #region Types
interface ThemePickerModalProps {
  visible: boolean;
  colors: ThemeColors;
  selectedThemeId: string;
  time: ThemeTime;
  builtInThemes: ThemeDefinition[];
  customTheme?: ThemeDefinition;
  onSelectTheme: (themeId: string) => void;
  onImportTheme: () => void;
  onRemoveCustomTheme: () => void;
  onClose: () => void;
  t: (key: string, options?: Record<string, string>) => string;
}
// #endregion

// #region Sub-components
const ThemeOption: React.FC<{
  theme: ThemeDefinition;
  selected: boolean;
  time: ThemeTime;
  colors: ThemeColors;
  onPress: () => void;
}> = ({ theme, selected, time, colors, onPress }) => {
  const previewColors = [
    theme.times[time].primary,
    theme.times[time].accent,
    theme.times[time].text,
    theme.times[time].background,
    theme.times[time].card,
    theme.times[time].cardBorder,
  ];

  return (
    <AnimatedPressable
      onPress={onPress}
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
      <View style={{ flex: 1, gap: 8 }}>
        <Text
          className="text-base font-l_medium"
          style={{ color: selected ? colors.primary : colors.text }}
        >
          {theme.name}
        </Text>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {previewColors.map((color, i) => (
            <View
              key={i}
              style={{
                width: 18,
                height: 18,
                borderRadius: 9,
                backgroundColor: color,
                borderWidth: 1,
                borderColor: colors.separator,
              }}
            />
          ))}
        </View>
      </View>
      {selected && <Feather name="check-circle" size={20} color={colors.primary} />}
    </AnimatedPressable>
  );
};

const ImportButton: React.FC<{
  colors: ThemeColors;
  onPress: () => void;
  label: string;
}> = ({ colors, onPress, label }) => {
  const iconPulse = useSharedValue(0);

  useEffect(() => {
    iconPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 900, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false,
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: interpolate(iconPulse.value, [0, 1], [0.9, 1]),
    transform: [{ scale: interpolate(iconPulse.value, [0, 1], [1, 1.06]) }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: colors.card,
        borderColor: colors.cardBorder,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 14,
      }}
    >
      <Animated.View style={pulseStyle}>
        <Feather name="plus-circle" size={20} color={colors.primary} />
      </Animated.View>
      <Text className="text-sm font-l_medium" style={{ color: colors.textSecondary }}>
        {label}
      </Text>
    </AnimatedPressable>
  );
};
// #endregion

// #region Component
export const ThemePickerModal: React.FC<ThemePickerModalProps> = ({
  visible,
  colors,
  selectedThemeId,
  time,
  builtInThemes,
  customTheme,
  onSelectTheme,
  onImportTheme,
  onRemoveCustomTheme,
  onClose,
  t,
}) => {
  return (
    <ThemedPopupModal
      visible={visible}
      colors={colors}
      onClose={onClose}
      cardStyle={{ maxHeight: '80%' }}
    >
      <Text className="text-lg font-l_semibold" style={{ color: colors.text }}>
        {t('appearance.themePickerTitle')}
      </Text>
      <Text className="mt-1 text-sm" style={{ color: colors.textSecondary }}>
        {t('appearance.themePickerDescription')}
      </Text>

      <ScrollView
        style={{ marginTop: 16 }}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={{ gap: 8 }}>
          {/* Built-in themes */}
          {builtInThemes.map((theme) => (
            <ThemeOption
              key={theme.id}
              theme={theme}
              selected={theme.id === selectedThemeId}
              time={time}
              colors={colors}
              onPress={() => {
                onSelectTheme(theme.id);
                onClose();
              }}
            />
          ))}

          {/* Custom theme (if imported) */}
          {customTheme && (
            <View style={{ position: 'relative' }}>
              <ThemeOption
                theme={customTheme}
                selected={customTheme.id === selectedThemeId}
                time={time}
                colors={colors}
                onPress={() => {
                  onSelectTheme(customTheme.id);
                  onClose();
                }}
              />
              <Pressable
                onPress={onRemoveCustomTheme}
                accessibilityRole="button"
                accessibilityLabel={t('appearance.removeImportedTheme')}
                style={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  padding: 6,
                  borderRadius: 8,
                  backgroundColor: 'rgba(220, 38, 38, 0.1)',
                }}
              >
                <Feather name="trash-2" size={16} color="#DC2626" />
              </Pressable>
            </View>
          )}

          {/* Import button */}
          <ImportButton
            colors={colors}
            onPress={onImportTheme}
            label={t('appearance.importTheme')}
          />
        </View>
      </ScrollView>
    </ThemedPopupModal>
  );
};
// #endregion
