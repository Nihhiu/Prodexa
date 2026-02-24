// #region Imports
import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
  type SharedValue,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../hooks/useTheme';
// #endregion

// #region Types
interface ScreenHeaderProps {
  title: string;
}
// #endregion

// #region Component
export const ScreenHeader: React.FC<ScreenHeaderProps> = ({ title }) => {
  const { colors } = useTheme();
  const navigation = useNavigation();

  // #region Animations
  const backBtnScale = useSharedValue(1);

  const backBtnAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: backBtnScale.value }],
  }));

  const handlePressIn = () => {
    backBtnScale.value = withSpring(0.9, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    backBtnScale.value = withTiming(1, {
      duration: 200,
      easing: Easing.out(Easing.cubic),
    });
  };
  // #endregion

  return (
    <View
      className="flex-row items-center justify-between px-4 pt-14 pb-4"
      style={{ backgroundColor: colors.background }}
    >
      <View className="flex-row items-center gap-3">
        <Animated.View style={backBtnAnimatedStyle}>
          <Pressable
            onPress={() => navigation.goBack()}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            className="p-2 rounded-lg"
            style={{
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.cardBorder,
            }}
            hitSlop={8}
          >
            <Feather name="arrow-left" size={20} color={colors.text} />
          </Pressable>
        </Animated.View>
        <Text className="text-2xl font-l_bold" style={{ color: colors.text }}>
          {title}
        </Text>
      </View>
    </View>
  );
};
// #endregion
