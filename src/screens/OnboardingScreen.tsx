// #region Imports
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useTranslation } from 'react-i18next';

import { Text } from '../components/ui';
import { useTheme } from '../hooks/useTheme';
import { useUser } from '../hooks/useUser';
import type { ThemeColors, ThemeTime } from '../types/theme';
import { getEffectiveFontScale } from '../utils/fontScale';
// #endregion

// #region Constants
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const STORAGE_KEY_ONBOARDING = '@prodexa/onboardingComplete';

const FONT_SIZE_MIN = 0.8;
const FONT_SIZE_MAX = 1.2;
const FONT_SIZE_STEP = 0.05;

const FONT_SIZE_LABELS: Record<string, { en: string; pt: string }> = {
  '0.8': { en: 'Tiny', pt: 'Minúsculo' },
  '0.85': { en: 'Very Small', pt: 'Muito Pequeno' },
  '0.9': { en: 'Small', pt: 'Pequeno' },
  '0.95': { en: 'Slightly Small', pt: 'Ligeiramente Pequeno' },
  '1': { en: 'Default', pt: 'Padrão' },
  '1.05': { en: 'Slightly Large', pt: 'Ligeiramente Grande' },
  '1.1': { en: 'Large', pt: 'Grande' },
  '1.15': { en: 'Very Large', pt: 'Muito Grande' },
  '1.2': { en: 'Extra Large', pt: 'Extra Grande' },
};

const TIME_ICONS: Record<ThemeTime, React.ComponentProps<typeof Feather>['name']> = {
  day: 'sun',
  night: 'moon',
  midnight: 'star',
};
// #endregion

// #region Sub-components

// ── Animated dots indicator ──────────────────────────────────
const PageDots: React.FC<{ total: number; active: number; colors: ThemeColors }> = ({
  total,
  active,
  colors,
}) => {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
      {Array.from({ length: total }).map((_, i) => {
        const isActive = i === active;
        return (
          <DotIndicator key={i} active={isActive} colors={colors} />
        );
      })}
    </View>
  );
};

const DotIndicator: React.FC<{ active: boolean; colors: ThemeColors }> = ({
  active,
  colors,
}) => {
  const progress = useSharedValue(active ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(active ? 1 : 0, {
      duration: 300,
      easing: Easing.out(Easing.cubic),
    });
  }, [active]);

  const dotStyle = useAnimatedStyle(() => ({
    width: interpolate(progress.value, [0, 1], [8, 28]),
    height: 8,
    borderRadius: 4,
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [colors.textSecondary + '40', colors.primary],
    ),
  }));

  return <Animated.View style={dotStyle} />;
};

// ── Pulsing welcome icon ─────────────────────────────────────
const PulsingIcon: React.FC<{
  name: React.ComponentProps<typeof Feather>['name'];
  colors: ThemeColors;
  size?: number;
}> = ({ name, colors, size = 48 }) => {
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          width: size + 32,
          height: size + 32,
          borderRadius: (size + 32) / 2,
          backgroundColor: colors.primary + '15',
          justifyContent: 'center',
          alignItems: 'center',
        },
      ]}
    >
      <Feather name={name} size={size} color={colors.primary} />
    </Animated.View>
  );
};

// ── Mini theme preview card ──────────────────────────────────
const ThemePreviewDemo: React.FC<{ previewColors: ThemeColors }> = ({
  previewColors,
}) => {
  const fadeIn = useSharedValue(0);

  useEffect(() => {
    fadeIn.value = withDelay(
      200,
      withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) }),
    );
  }, [previewColors.background]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
    transform: [{ scale: interpolate(fadeIn.value, [0, 1], [0.95, 1]) }],
  }));

  return (
    <Animated.View
      style={[
        containerStyle,
        {
          borderRadius: 16,
          backgroundColor: previewColors.background,
          borderWidth: 2,
          borderColor: previewColors.surfaceBorder,
          padding: 16,
          gap: 12,
        },
      ]}
    >
      {/* Mini card 1 */}
      <View
        style={{
          backgroundColor: previewColors.card,
          borderColor: previewColors.cardBorder,
          borderWidth: 1,
          borderRadius: 12,
          padding: 12,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            backgroundColor: previewColors.primary + '20',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Feather name="shopping-bag" size={18} color={previewColors.primary} />
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <View
            style={{
              height: 8,
              width: '60%',
              borderRadius: 4,
              backgroundColor: previewColors.text + '30',
            }}
          />
          <View
            style={{
              height: 6,
              width: '40%',
              borderRadius: 3,
              backgroundColor: previewColors.textSecondary + '30',
            }}
          />
        </View>
      </View>

      {/* Mini card 2 */}
      <View
        style={{
          backgroundColor: previewColors.card,
          borderColor: previewColors.cardBorder,
          borderWidth: 1,
          borderRadius: 12,
          padding: 12,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            backgroundColor: previewColors.accent + '20',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Feather name="settings" size={18} color={previewColors.accent} />
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <View
            style={{
              height: 8,
              width: '50%',
              borderRadius: 4,
              backgroundColor: previewColors.text + '30',
            }}
          />
          <View
            style={{
              height: 6,
              width: '35%',
              borderRadius: 3,
              backgroundColor: previewColors.textSecondary + '30',
            }}
          />
        </View>
      </View>

      {/* Accent button demo */}
      <View
        style={{
          backgroundColor: previewColors.accent,
          borderRadius: 10,
          paddingVertical: 10,
          paddingHorizontal: 16,
          alignItems: 'center',
        }}
      >
        <View
          style={{
            height: 8,
            width: 60,
            borderRadius: 4,
            backgroundColor: previewColors.primaryText + '80',
          }}
        />
      </View>
    </Animated.View>
  );
};

// ── Animated next / finish button ────────────────────────────
const OnboardingButton: React.FC<{
  onPress: () => void;
  label: string;
  colors: ThemeColors;
  icon?: React.ComponentProps<typeof Feather>['name'];
  variant?: 'primary' | 'accent';
}> = ({ onPress, label, colors, icon = 'arrow-right', variant = 'primary' }) => {
  const scale = useSharedValue(1);
  const bg = variant === 'accent' ? colors.accent : colors.primary;

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 20, stiffness: 400 });
  };
  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.cubic) });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          backgroundColor: bg,
          borderRadius: 14,
          paddingVertical: 14,
          paddingHorizontal: 28,
        }}
      >
        <Text
          className="text-base font-l_semibold"
          style={{ color: colors.primaryText }}
        >
          {label}
        </Text>
        <Feather name={icon} size={18} color={colors.primaryText} />
      </Pressable>
    </Animated.View>
  );
};

// ── Selectable card (local) ──────────────────────────────────
const OnboardingSelectableCard: React.FC<{
  selected: boolean;
  onPress: () => void;
  colors: ThemeColors;
  children: React.ReactNode;
}> = ({ selected, onPress, colors, children }) => {
  const scale = useSharedValue(1);
  const selectedProgress = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    selectedProgress.value = withTiming(selected ? 1 : 0, {
      duration: 200,
      easing: Easing.out(Easing.cubic),
    });
  }, [selected]);

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 20, stiffness: 400 });
  };
  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.cubic) });
  };

  const animatedStyle = useAnimatedStyle(() => {
    const selectedScale = interpolate(selectedProgress.value, [0, 1], [1, 1.01]);
    return {
      transform: [{ scale: scale.value * selectedScale }],
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{
          backgroundColor: colors.card,
          borderColor: selected ? colors.primary : colors.cardBorder,
          borderWidth: selected ? 2 : 1,
          borderRadius: 12,
          padding: 16,
        }}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
};
// #endregion

// #region Step components

// ════════════════════════════════════════════════════════════════
// STEP 1: Name
// ════════════════════════════════════════════════════════════════
const StepName: React.FC<{
  name: string;
  onNameChange: (n: string) => void;
  colors: ThemeColors;
  t: (key: string) => string;
  onNext: () => void;
}> = ({ name, onNameChange, colors, t, onNext }) => {
  const inputRef = useRef<TextInput>(null);

  return (
    <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 32 }}>
      {/* Icon */}
      <Animated.View
        entering={FadeInDown.duration(600).delay(100)}
        style={{ alignItems: 'center', marginBottom: 32 }}
      >
        <PulsingIcon name="user" colors={colors} size={44} />
      </Animated.View>

      {/* Title */}
      <Animated.View entering={FadeInDown.duration(500).delay(250)}>
        <Text
          className="text-3xl font-l_bold text-center"
          style={{ color: colors.text, marginBottom: 8 }}
        >
          {t('onboarding.nameTitle')}
        </Text>
      </Animated.View>

      {/* Subtitle */}
      <Animated.View entering={FadeInDown.duration(500).delay(400)}>
        <Text
          className="text-base font-l_regular text-center"
          style={{ color: colors.textSecondary, marginBottom: 36 }}
        >
          {t('onboarding.nameSubtitle')}
        </Text>
      </Animated.View>

      {/* Input */}
      <Animated.View entering={FadeInUp.duration(500).delay(550)}>
        <TextInput
          ref={inputRef}
          value={name}
          onChangeText={onNameChange}
          placeholder={t('onboarding.namePlaceholder')}
          placeholderTextColor={colors.textSecondary}
          onSubmitEditing={onNext}
          returnKeyType="next"
          style={{
            backgroundColor: colors.surface + '80',
            borderColor: colors.surfaceBorder,
            borderWidth: 2,
            borderRadius: 14,
            paddingVertical: 16,
            paddingHorizontal: 20,
            fontFamily: 'Lexend_400Regular',
            fontSize: 18,
            color: colors.text,
            textAlign: 'center',
          }}
        />
      </Animated.View>
    </View>
  );
};

// ════════════════════════════════════════════════════════════════
// STEP 2: Theme & Time
// ════════════════════════════════════════════════════════════════
const StepThemeTime: React.FC<{
  colors: ThemeColors;
  themeId: string;
  time: ThemeTime;
  availableThemes: { id: string; name: string; times: Record<ThemeTime, ThemeColors> }[];
  availableTimes: ThemeTime[];
  setTheme: (id: string) => void;
  setTime: (t: ThemeTime) => void;
  t: (key: string) => string;
}> = ({ colors, themeId, time, availableThemes, availableTimes, setTheme, setTime, t }) => {
  // Current preview colors
  const previewColors = useMemo(() => {
    const theme = availableThemes.find((th) => th.id === themeId);
    return theme?.times[time] ?? colors;
  }, [availableThemes, themeId, time, colors]);

  return (
    <View style={{ flex: 1, paddingHorizontal: 24 }}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          paddingVertical: 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Icon */}
        <Animated.View
          entering={FadeInDown.duration(600).delay(100)}
          style={{ alignItems: 'center', marginBottom: 24 }}
        >
          <PulsingIcon name="droplet" colors={colors} size={40} />
        </Animated.View>

        {/* Title */}
        <Animated.View entering={FadeInDown.duration(500).delay(250)}>
          <Text
            className="text-2xl font-l_bold text-center"
            style={{ color: colors.text, marginBottom: 6 }}
          >
            {t('onboarding.themeTitle')}
          </Text>
        </Animated.View>

        {/* Subtitle */}
        <Animated.View entering={FadeInDown.duration(500).delay(350)}>
          <Text
            className="text-sm font-l_regular text-center"
            style={{ color: colors.textSecondary, marginBottom: 20 }}
          >
            {t('onboarding.themeSubtitle')}
          </Text>
        </Animated.View>

        {/* Theme selector */}
        <Animated.View entering={FadeInDown.duration(500).delay(450)}>
          <Text
            className="text-sm font-l_semibold"
            style={{ color: colors.textSecondary, marginBottom: 8 }}
          >
            {t('appearance.theme')}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 10, paddingBottom: 4 }}
          >
            {availableThemes.map((theme) => {
              const isSelected = theme.id === themeId;
              const themePreview = theme.times[time];
              return (
                <ThemeChip
                  key={theme.id}
                  name={theme.name}
                  selected={isSelected}
                  previewColors={[
                    themePreview.primary,
                    themePreview.accent,
                    themePreview.background,
                  ]}
                  colors={colors}
                  onPress={() => setTheme(theme.id)}
                />
              );
            })}
          </ScrollView>
        </Animated.View>

        {/* Time selector */}
        <Animated.View
          entering={FadeInDown.duration(500).delay(550)}
          style={{ marginTop: 18 }}
        >
          <Text
            className="text-sm font-l_semibold"
            style={{ color: colors.textSecondary, marginBottom: 8 }}
          >
            {t('appearance.time')}
          </Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {availableTimes.map((timeKey) => {
              const selected = timeKey === time;
              return (
                <View key={timeKey} style={{ flex: 1 }}>
                  <OnboardingSelectableCard
                    selected={selected}
                    onPress={() => setTime(timeKey)}
                    colors={colors}
                  >
                    <View style={{ alignItems: 'center', gap: 6 }}>
                      <Feather
                        name={TIME_ICONS[timeKey]}
                        size={20}
                        color={selected ? colors.primary : colors.textSecondary}
                      />
                      <Text
                        className="text-xs font-l_medium"
                        style={{ color: selected ? colors.primary : colors.textSecondary }}
                      >
                        {t(`appearance.timeLabels.${timeKey}`)}
                      </Text>
                    </View>
                  </OnboardingSelectableCard>
                </View>
              );
            })}
          </View>
        </Animated.View>

        {/* Live preview */}
        <Animated.View
          entering={FadeInUp.duration(600).delay(650)}
          style={{ marginTop: 20 }}
        >
          <Text
            className="text-xs font-l_regular text-center"
            style={{ color: colors.textSecondary, marginBottom: 8 }}
          >
            {t('onboarding.preview')}
          </Text>
          <ThemePreviewDemo previewColors={previewColors} />
        </Animated.View>
      </ScrollView>
    </View>
  );
};

// ── Theme chip ───────────────────────────────────────────────
const ThemeChip: React.FC<{
  name: string;
  selected: boolean;
  previewColors: string[];
  colors: ThemeColors;
  onPress: () => void;
}> = ({ name, selected, previewColors, colors, onPress }) => {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 20, stiffness: 400 });
  };
  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 160, easing: Easing.out(Easing.cubic) });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{
          backgroundColor: colors.card,
          borderColor: selected ? colors.primary : colors.cardBorder,
          borderWidth: selected ? 2 : 1,
          borderRadius: 12,
          paddingVertical: 10,
          paddingHorizontal: 14,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <View style={{ flexDirection: 'row', gap: 4 }}>
          {previewColors.map((c, i) => (
            <View
              key={i}
              style={{
                width: 14,
                height: 14,
                borderRadius: 7,
                backgroundColor: c,
                borderWidth: 1,
                borderColor: colors.separator,
              }}
            />
          ))}
        </View>
        <Text
          className="text-sm font-l_medium"
          style={{ color: selected ? colors.primary : colors.text }}
        >
          {name}
        </Text>
      </Pressable>
    </Animated.View>
  );
};

// ════════════════════════════════════════════════════════════════
// STEP 3: Font Size & Compact Mode
// ════════════════════════════════════════════════════════════════
const StepFontCompact: React.FC<{
  colors: ThemeColors;
  fontSize: number;
  compactMode: boolean;
  setFontSize: (s: number) => void;
  setCompactMode: (c: boolean) => void;
  t: (key: string) => string;
}> = ({ colors, fontSize, compactMode, setFontSize, setCompactMode, t }) => {
  const effectiveFontScale = getEffectiveFontScale(fontSize);
  const sizeKey = (Math.round(fontSize * 20) / 20).toString();
  const currentLang = t('appearance.title') === 'Aparência' ? 'pt' : 'en';
  const sizeLabel =
    FONT_SIZE_LABELS[sizeKey]?.[currentLang] ??
    FONT_SIZE_LABELS['1']?.[currentLang] ?? 'Default';
  const percentage = Math.round(fontSize * 100);

  const handleSliderChange = useCallback(
    (value: number) => {
      const rounded = Math.round(value * 20) / 20;
      setFontSize(rounded);
    },
    [setFontSize],
  );

  return (
    <View style={{ flex: 1, paddingHorizontal: 24 }}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          paddingVertical: 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Icon */}
        <Animated.View
          entering={FadeInDown.duration(600).delay(100)}
          style={{ alignItems: 'center', marginBottom: 24 }}
        >
          <PulsingIcon name="type" colors={colors} size={40} />
        </Animated.View>

        {/* Title */}
        <Animated.View entering={FadeInDown.duration(500).delay(250)}>
          <Text
            className="text-2xl font-l_bold text-center"
            style={{ color: colors.text, marginBottom: 6 }}
          >
            {t('onboarding.fontTitle')}
          </Text>
        </Animated.View>

        {/* Subtitle */}
        <Animated.View entering={FadeInDown.duration(500).delay(350)}>
          <Text
            className="text-sm font-l_regular text-center"
            style={{ color: colors.textSecondary, marginBottom: 24 }}
          >
            {t('onboarding.fontSubtitle')}
          </Text>
        </Animated.View>

        {/* Font size slider */}
        <Animated.View entering={FadeInDown.duration(500).delay(450)}>
          <Text
            className="text-sm font-l_semibold"
            style={{ color: colors.textSecondary, marginBottom: 8 }}
          >
            {t('appearance.fontSize')}
          </Text>

          {/* Label + percentage */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 8,
            }}
          >
            <Text className="text-sm font-l_regular" style={{ color: colors.textSecondary }}>
              {sizeLabel}
            </Text>
            <Text className="text-sm font-l_semibold" style={{ color: colors.primary }}>
              {percentage}%
            </Text>
          </View>

          <View
            style={{
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
              borderWidth: 1,
              borderRadius: 12,
              paddingVertical: 8,
              paddingHorizontal: 12,
            }}
          >
            <Slider
              minimumValue={FONT_SIZE_MIN}
              maximumValue={FONT_SIZE_MAX}
              step={FONT_SIZE_STEP}
              value={fontSize}
              onValueChange={handleSliderChange}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.surfaceBorder}
              thumbTintColor={colors.primary}
            />
          </View>

          {/* Preview text line */}
          <View style={{ marginTop: 10, alignItems: 'center' }}>
            <Text
              className="font-l_regular text-center"
              style={{
                color: colors.text,
                fontSize: Math.round(16 * effectiveFontScale * 10) / 10,
              }}
            >
              {t('onboarding.fontPreviewText')}
            </Text>
          </View>
        </Animated.View>

        {/* Section separator */}
        <Animated.View
          entering={FadeIn.duration(400).delay(550)}
          style={{
            marginVertical: 24,
            marginHorizontal: 4,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <View style={{ flex: 1, height: 1, backgroundColor: colors.separator, opacity: 0.5, borderRadius: 1 }} />
          <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: colors.accent, opacity: 0.6 }} />
          <View style={{ flex: 1, height: 1, backgroundColor: colors.separator, opacity: 0.5, borderRadius: 1 }} />
        </Animated.View>

        {/* Compact mode */}
        <Animated.View entering={FadeInUp.duration(500).delay(650)}>
          <Text
            className="text-sm font-l_semibold"
            style={{ color: colors.textSecondary, marginBottom: 8 }}
          >
            {t('appearance.layoutMode')}
          </Text>
          <Text
            className="text-xs font-l_regular"
            style={{ color: colors.textSecondary, marginBottom: 12 }}
          >
            {t('appearance.layoutModeDescription')}
          </Text>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            {/* Compact */}
            <View style={{ flex: 1 }}>
              <OnboardingSelectableCard
                selected={compactMode}
                onPress={() => setCompactMode(true)}
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
                    style={{ color: compactMode ? colors.primary : colors.text }}
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
              </OnboardingSelectableCard>
            </View>

            {/* Want to Write */}
            <View style={{ flex: 1 }}>
              <OnboardingSelectableCard
                selected={!compactMode}
                onPress={() => setCompactMode(false)}
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
                    style={{ color: !compactMode ? colors.primary : colors.text }}
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
              </OnboardingSelectableCard>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

// #endregion

// #region Main screen
interface OnboardingScreenProps {
  onComplete: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  onComplete,
}) => {
  const {
    colors,
    themeId,
    time,
    availableThemes,
    availableTimes,
    setTheme,
    setTime,
    fontSize,
    setFontSize,
    compactMode,
    setCompactMode,
  } = useTheme();
  const { name, setName } = useUser();
  const { t } = useTranslation();

  const TOTAL_STEPS = 3;
  const STEP_TRANSITION_OUT_MS = 280;
  const STEP_TRANSITION_IN_MS = 350;
  const [currentStep, setCurrentStep] = useState(0);
  const [localName, setLocalName] = useState(name);

  // ── Section transition animation ──────────────────────────
  const slideProgress = useSharedValue(0);
  const [displayedStep, setDisplayedStep] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const outTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (outTimerRef.current) clearTimeout(outTimerRef.current);
      if (inTimerRef.current) clearTimeout(inTimerRef.current);
    };
  }, []);

  const goToStep = useCallback(
    (nextStep: number) => {
      if (isTransitioning) return;
      setIsTransitioning(true);

      // Save name when leaving step 0
      if (currentStep === 0 && localName.trim().length > 0) {
        setName(localName.trim());
      }

      if (outTimerRef.current) clearTimeout(outTimerRef.current);
      if (inTimerRef.current) clearTimeout(inTimerRef.current);

      // Slide out
      const direction = nextStep > currentStep ? -1 : 1;

      slideProgress.value = withTiming(direction, {
        duration: STEP_TRANSITION_OUT_MS,
        easing: Easing.in(Easing.cubic),
      });

      outTimerRef.current = setTimeout(() => {
        // Position the container off‑screen on the opposite side FIRST,
        // so neither old nor new content is visible during the React render.
        slideProgress.value = -direction;

        // Swap the displayed content (queues a React re‑render).
        setDisplayedStep(nextStep);
        setCurrentStep(nextStep);

        // Wait two frames so React commits the new content while it's
        // still fully transparent (slideProgress = ±1 → opacity 0).
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            // Now slide the new content in.
            slideProgress.value = withTiming(0, {
              duration: STEP_TRANSITION_IN_MS,
              easing: Easing.out(Easing.cubic),
            });

            inTimerRef.current = setTimeout(() => {
              setIsTransitioning(false);
            }, STEP_TRANSITION_IN_MS);
          });
        });
      }, STEP_TRANSITION_OUT_MS);
    },
    [
      STEP_TRANSITION_IN_MS,
      STEP_TRANSITION_OUT_MS,
      currentStep,
      isTransitioning,
      localName,
      setName,
      slideProgress,
    ],
  );

  const handleNext = useCallback(() => {
    if (currentStep < TOTAL_STEPS - 1) {
      goToStep(currentStep + 1);
    } else {
      // Save name before finishing
      if (localName.trim().length > 0) {
        setName(localName.trim());
      }
      // Mark onboarding done
      AsyncStorage.setItem(STORAGE_KEY_ONBOARDING, 'true').then(() => {
        onComplete();
      });
    }
  }, [currentStep, goToStep, localName, onComplete, setName]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      goToStep(currentStep - 1);
    }
  }, [currentStep, goToStep]);

  // ── Animated container ────────────────────────────────────
  const contentStyle = useAnimatedStyle(() => ({
    flex: 1,
    opacity: interpolate(
      Math.abs(slideProgress.value),
      [0, 0.5, 1],
      [1, 0.3, 0],
    ),
    transform: [
      {
        translateX: interpolate(
          slideProgress.value,
          [-1, 0, 1],
          [-SCREEN_WIDTH * 0.35, 0, SCREEN_WIDTH * 0.35],
        ),
      },
      {
        scale: interpolate(
          Math.abs(slideProgress.value),
          [0, 1],
          [1, 0.92],
        ),
      },
    ],
  }));

  // ── Render current step ───────────────────────────────────
  const renderStep = () => {
    switch (displayedStep) {
      case 0:
        return (
          <StepName
            name={localName}
            onNameChange={setLocalName}
            colors={colors}
            t={t}
            onNext={handleNext}
          />
        );
      case 1:
        return (
          <StepThemeTime
            colors={colors}
            themeId={themeId}
            time={time}
            availableThemes={availableThemes}
            availableTimes={availableTimes}
            setTheme={setTheme}
            setTime={setTime}
            t={t}
          />
        );
      case 2:
        return (
          <StepFontCompact
            colors={colors}
            fontSize={fontSize}
            compactMode={compactMode}
            setFontSize={setFontSize}
            setCompactMode={setCompactMode}
            t={t}
          />
        );
      default:
        return null;
    }
  };

  // ── Button labels ─────────────────────────────────────────
  const isLastStep = currentStep === TOTAL_STEPS - 1;
  const nextLabel = isLastStep
    ? t('onboarding.finish')
    : t('onboarding.next');
  const nextIcon = isLastStep ? 'check' : 'arrow-right';

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
    >
      {/* Top area with dots */}
      <Animated.View
        entering={FadeInDown.duration(400).delay(100)}
        style={{
          paddingTop: 60,
          paddingBottom: 12,
          alignItems: 'center',
        }}
      >
        <PageDots total={TOTAL_STEPS} active={currentStep} colors={colors} />
      </Animated.View>

      {/* Step content */}
      <Animated.View style={contentStyle}>
        {renderStep()}
      </Animated.View>

      {/* Bottom navigation */}
      <Animated.View
        entering={FadeInUp.duration(400).delay(200)}
        style={{
          paddingHorizontal: 24,
          paddingBottom: 40,
          paddingTop: 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: currentStep > 0 ? 'space-between' : 'center',
          gap: 12,
        }}
      >
        {currentStep > 0 && (
          <Pressable
            onPress={handleBack}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              paddingVertical: 14,
              paddingHorizontal: 20,
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
              borderWidth: 1,
              borderRadius: 14,
            }}
          >
            <Feather name="arrow-left" size={18} color={colors.textSecondary} />
            <Text
              className="text-base font-l_medium"
              style={{ color: colors.textSecondary }}
            >
              {t('onboarding.back')}
            </Text>
          </Pressable>
        )}

        <OnboardingButton
          onPress={handleNext}
          label={nextLabel}
          colors={colors}
          icon={nextIcon as React.ComponentProps<typeof Feather>['name']}
          variant={isLastStep ? 'accent' : 'primary'}
        />
      </Animated.View>
    </View>
  );
};
// #endregion
