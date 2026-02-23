import React, { useEffect, useMemo } from 'react';
import {
  Alert,
  Platform,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../hooks/useTheme';

export type TabKey = 'home' | 'dashboard' | 'settings';

interface BottomNavigationBarProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

interface TabItemProps {
  tabKey: TabKey;
  label: string;
  icon: React.ComponentProps<typeof Feather>['name'];
  isActive: boolean;
  onPress: (tab: TabKey) => void;
  activeColor: string;
  inactiveColor: string;
}

const TAB_SIZE = 48;
const TAB_GAP = 10;
const NAV_HORIZONTAL_PADDING = 8;

const TabItem: React.FC<TabItemProps> = ({
  tabKey,
  label,
  icon,
  isActive,
  onPress,
  activeColor,
  inactiveColor,
}) => {
  const activeProgress = useSharedValue(isActive ? 1 : 0);
  const pressProgress = useSharedValue(0);

  useEffect(() => {
    activeProgress.value = withTiming(isActive ? 1 : 0, {
      duration: 140,
      easing: Easing.out(Easing.cubic),
    });
  }, [isActive]);

  const handlePressIn = () => {
    pressProgress.value = withTiming(1, {
      duration: 70,
      easing: Easing.out(Easing.quad),
    });
  };

  const handlePressOut = () => {
    pressProgress.value = withTiming(0, {
      duration: 110,
      easing: Easing.out(Easing.quad),
    });
  };

  const animatedStyle = useAnimatedStyle(() => {
    const activeScale = interpolate(activeProgress.value, [0, 1], [1, 1.06]);
    const pressScale = interpolate(pressProgress.value, [0, 1], [1, 0.94]);
    const opacity = interpolate(activeProgress.value, [0, 1], [0.78, 1]);

    return {
      opacity,
      transform: [{ scale: activeScale * pressScale }],
    };
  });

  const handleLongPress = () => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(label, ToastAndroid.SHORT);
      return;
    }

    Alert.alert(label);
  };

  return (
    <TouchableOpacity
      onPress={() => onPress(tabKey)}
      onLongPress={handleLongPress}
      delayLongPress={350}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.8}
      className="items-center justify-center rounded-md"
      style={{ width: TAB_SIZE, height: TAB_SIZE }}
    >
      <Animated.View style={animatedStyle}>
        <Feather
          name={icon}
          size={24}
          strokeWidth={2.5}
          color={isActive ? activeColor : inactiveColor}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

export const BottomNavigationBar: React.FC<BottomNavigationBarProps> = ({
  activeTab,
  onTabChange,
}) => {
  const translateX = useSharedValue(0);
  const highlightScale = useSharedValue(1);
  const { colors } = useTheme();
  const { t } = useTranslation();

  const tabOrder: TabKey[] = useMemo(
    () => ['home', 'dashboard', 'settings'],
    [],
  );

  const tabIcons: Record<TabKey, React.ComponentProps<typeof Feather>['name']> = {
    home: 'home',
    dashboard: 'grid',
    settings: 'settings',
  };

  const tabLabels: Record<TabKey, string> = {
    home: t('common.home'),
    dashboard: t('common.dashboard'),
    settings: t('common.settings'),
  };

  const activeIndex = tabOrder.indexOf(activeTab);
  const navWidth =
    tabOrder.length * TAB_SIZE +
    (tabOrder.length - 1) * TAB_GAP +
    NAV_HORIZONTAL_PADDING * 2;

  useEffect(() => {
    translateX.value = withTiming(activeIndex * (TAB_SIZE + TAB_GAP), {
      duration: 180,
      easing: Easing.out(Easing.cubic),
    });
    highlightScale.value = withSequence(
      withTiming(0.96, {
        duration: 80,
        easing: Easing.out(Easing.quad),
      }),
      withTiming(1, {
        duration: 100,
        easing: Easing.out(Easing.quad),
      }),
    );
  }, [activeIndex]);

  const highlightStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { scale: highlightScale.value },
    ],
  }));

  return (
    <View style={{ backgroundColor: colors.background }} className="px-4 pb-4 pt-2">
      <View
        className="self-center rounded-2xl py-2 shadow-md"
        style={{
          width: navWidth,
          paddingHorizontal: NAV_HORIZONTAL_PADDING,
          backgroundColor: colors.navBackground,
          borderWidth: 1,
          borderColor: colors.navBorder,
        }}
      >
        <View className="relative flex-row items-center">
          <Animated.View
            pointerEvents="none"
            style={[
              {
                position: 'absolute',
                left: 0,
                top: 0,
                width: TAB_SIZE,
                height: TAB_SIZE,
                borderRadius: 8,
                backgroundColor: colors.navActiveBackground,
              },
              highlightStyle,
            ]}
          />
          {tabOrder.map((tabKey, index) => (
            <View
              key={tabKey}
              style={{ marginRight: index < tabOrder.length - 1 ? TAB_GAP : 0 }}
            >
              <TabItem
                tabKey={tabKey}
                label={tabLabels[tabKey]}
                icon={tabIcons[tabKey]}
                isActive={activeTab === tabKey}
                onPress={onTabChange}
                activeColor={colors.navActive}
                inactiveColor={colors.navInactive}
              />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};