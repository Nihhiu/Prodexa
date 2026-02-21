import React, { useRef } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

import { useTheme } from '../../hooks/useTheme';
import type { ThemeColors, ThemeDefinition, ThemeTime } from '../../types/theme';

// ── Time labels & icons ───────────────────────────────────────
const TIME_META: Record<ThemeTime, { label: string; icon: React.ComponentProps<typeof Feather>['name'] }> = {
  day: { label: 'Dia', icon: 'sun' },
  night: { label: 'Noite', icon: 'moon' },
  midnight: { label: 'Meia-noite', icon: 'star' },
};

// ── Animated selectable card ──────────────────────────────────
interface SelectableCardProps {
  selected: boolean;
  onPress: () => void;
  colors: ThemeColors;
  children: React.ReactNode;
}

const SelectableCard: React.FC<SelectableCardProps> = ({
  selected,
  onPress,
  colors,
  children,
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 30,
      bounciness: 0,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(scale, {
      toValue: 1,
      duration: 200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
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

// ── Main AppearanceScreen ─────────────────────────────────────
export const AppearanceScreen: React.FC = () => {
  const { colors, themeId, time, availableThemes, availableTimes, setTheme, setTime } = useTheme();

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{
        flexGrow: 1,
        backgroundColor: colors.background,
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 40,
      }}
    >
      {/* ── Time selector ───────────────────────────────── */}
      <View className="mb-8">
        <Text className="mb-4 text-lg font-semibold" style={{ color: colors.text }}>
          Tempo
        </Text>
        <View className="flex-row gap-3">
          {availableTimes.map((t) => {
            const meta = TIME_META[t];
            const selected = t === time;

            return (
              <View key={t} className="flex-1">
                <SelectableCard
                  selected={selected}
                  onPress={() => setTime(t)}
                  colors={colors}
                >
                  <View className="items-center gap-2">
                    <Feather
                      name={meta.icon}
                      size={24}
                      color={selected ? colors.primary : colors.textSecondary}
                    />
                    <Text
                      className="text-sm font-medium"
                      style={{
                        color: selected ? colors.primary : colors.textSecondary,
                      }}
                    >
                      {meta.label}
                    </Text>
                  </View>
                </SelectableCard>
              </View>
            );
          })}
        </View>
      </View>

      {/* ── Theme selector ──────────────────────────────── */}
      <View className="mb-8">
        <Text className="mb-4 text-lg font-semibold" style={{ color: colors.text }}>
          Tema
        </Text>
        <View className="gap-3">
          {availableThemes.map((theme) => {
            const selected = theme.id === themeId;

            return (
              <SelectableCard
                key={theme.id}
                selected={selected}
                onPress={() => setTheme(theme.id)}
                colors={colors}
              >
                <View className="gap-3">
                  <View className="flex-row items-center justify-between">
                    <Text
                      className="text-base font-semibold"
                      style={{ color: selected ? colors.primary : colors.text }}
                    >
                      {theme.name}
                    </Text>
                    {selected && (
                      <Feather name="check-circle" size={24} color={colors.primary} />
                    )}
                  </View>

                  {/* 6 color dots for current time */}
                  <View className="flex-row gap-2">
                    {[
                      theme.times[time].primary,
                      theme.times[time].accent,
                      theme.times[time].text,
                      theme.times[time].background,
                      theme.times[time].card,
                      theme.times[time].cardBorder,
                    ].map((color, i) => (
                      <View
                        key={i}
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 10,
                          backgroundColor: color,
                          borderWidth: 1,
                          borderColor: colors.separator,
                        }}
                      />
                    ))}
                  </View>
                </View>
              </SelectableCard>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
};
