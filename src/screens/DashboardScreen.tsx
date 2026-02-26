import React from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../hooks/useTheme';
import { Card, Text } from '../components/ui';
import { RootStackParamList } from '../navigation';
import { ScreenHeader } from './settings/components';

// #region Feature Card
interface FeatureCardProps {
  icon: React.ComponentProps<typeof Feather>['name'];
  title: string;
  description: string;
  onPress: () => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  onPress,
}) => {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 20, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
    });
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
      >
        <Card>
          <View className="flex-row items-center gap-4">
            <View
              className="p-3 rounded-xl"
              style={{ backgroundColor: colors.accent + '15' }}
            >
              <Feather name={icon} size={24} color={colors.accent} />
            </View>
            <View className="flex-1">
              <Text
                className="text-base font-l_semibold"
                style={{ color: colors.text }}
              >
                {title}
              </Text>
              <Text
                className="text-sm font-l_regular mt-0.5"
                style={{ color: colors.textSecondary }}
              >
                {description}
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.accent} />
          </View>
        </Card>
      </Pressable>
    </Animated.View>
  );
};
// #endregion

export const DashboardScreen: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* HEADER */}
      <ScreenHeader title={t('common.dashboard')} isParent={true} />

      {/* CONTENT */}
      <ScrollView
        className="flex-1 px-4"
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={{
          backgroundColor: colors.background,
          paddingBottom: 120,
        }}
        overScrollMode="always"
      >
        <FeatureCard
          icon="shopping-cart"
          title={t('dashboard.shoppingList')}
          description={t('dashboard.shoppingListDescription')}
          onPress={() => navigation.navigate('ShoppingList')}
        />
      </ScrollView>
    </View>
  );
};
