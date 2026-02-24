// #region Imports
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, View, useWindowDimensions } from 'react-native';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import {
  createStackNavigator,
  CardStyleInterpolators,
} from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import {
  HomeScreen,
  DashboardScreen,
  SettingsScreen,
  GeneralSettingsScreen,
  AppearanceScreen,
  NotificationsScreen,
  WatchAdsScreen,
  AboutScreen,
  PrivacyPolicyScreen,
  StorageScreen,
  ShoppingListScreen,
} from '../screens';
import { BottomNavigationBar, TabKey } from '../components/common/BottomNavigationBar';
import { RootStackParamList } from './types';
import { useTheme } from '../hooks/useTheme';
// #endregion

// #region Constants
const tabs: TabKey[] = ['home', 'dashboard', 'settings'];
const Stack = createStackNavigator<RootStackParamList>();
// #endregion

// #region Main tabs
const MainTabsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const scrollRef = useRef<ScrollView>(null);
  const { width } = useWindowDimensions();
  const { colors } = useTheme();

  // Resolve o índice atual da tab para navegação horizontal por página.
  const getTabIndex = (tab: TabKey) => tabs.indexOf(tab);

  // Ref para controlar se a mudança de tab foi feita pelo utilizador (via press)
  // e evitar que o useEffect interfira com a animação.
  const isUserNavigation = useRef(false);

  // Atualiza tab ativa e desloca o ScrollView para a página correspondente.
  const handleTabChange = useCallback((tab: TabKey) => {
    const targetIndex = getTabIndex(tab);

    isUserNavigation.current = true;
    setActiveTab(tab);
    scrollRef.current?.scrollTo({
      x: targetIndex * width,
      animated: true,
    });
  }, [width]);

  const handleMomentumScrollEnd = (event: {
    nativeEvent: { contentOffset: { x: number } };
  }) => {
    // Sincroniza a tab ativa após gesto de swipe horizontal.
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    const nextTab = tabs[index];

    if (nextTab && nextTab !== activeTab) {
      setActiveTab(nextTab);
    }
  };

  useEffect(() => {
    // Reposiciona o conteúdo quando a largura muda (ex.: rotação).
    // Não reage a mudanças de activeTab — a animação é feita por handleTabChange.
    if (isUserNavigation.current) {
      isUserNavigation.current = false;
      return;
    }
    const activeIndex = getTabIndex(activeTab);
    scrollRef.current?.scrollTo({ x: activeIndex * width, animated: false });
  }, [activeTab, width]);

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumScrollEnd}
      >
        <View style={{ width }} className="flex-1">
          <HomeScreen />
        </View>
        <View style={{ width }} className="flex-1">
          <DashboardScreen />
        </View>
        <View style={{ width }} className="flex-1">
          <SettingsScreen />
        </View>
      </ScrollView>
      <View className="absolute bottom-0 left-0 right-0" pointerEvents="box-none">
        <BottomNavigationBar activeTab={activeTab} onTabChange={handleTabChange} />
      </View>
    </View>
  );
};
// #endregion

// #region Root navigator
export const MainNavigator: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  // Mapeia tokens de tema interno para o tema esperado pelo React Navigation.
  const navigationTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.surfaceBorder,
      notification: colors.accent,
    },
  };

  const screenOptions = {
    headerStyle: { backgroundColor: colors.surface },
    headerTintColor: colors.text,
    headerTitleStyle: {
      color: colors.text,
      fontFamily: 'Lexend_600SemiBold',
    },
    cardStyle: { backgroundColor: colors.background },
    detachPreviousScreen: false,
    cardOverlayEnabled: true,
  };

  const settingsDetailScreenOptions = {
    cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
    gestureEnabled: true,
    cardStyle: { backgroundColor: colors.background },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator screenOptions={screenOptions}>
        <Stack.Screen name="MainTabs" component={MainTabsScreen} options={{ headerShown: false }} />
        <Stack.Screen
          name="GeneralSettings"
          component={GeneralSettingsScreen}
          options={{ headerShown: false, ...settingsDetailScreenOptions }}
        />
        <Stack.Screen
          name="Appearance"
          component={AppearanceScreen}
          options={{ headerShown: false, ...settingsDetailScreenOptions }}
        />
        <Stack.Screen
          name="Notifications"
          component={NotificationsScreen}
          options={{ headerShown: false, ...settingsDetailScreenOptions }}
        />
        <Stack.Screen
          name="WatchAds"
          component={WatchAdsScreen}
          options={{ headerShown: false, ...settingsDetailScreenOptions }}
        />
        <Stack.Screen
          name="About"
          component={AboutScreen}
          options={{ headerShown: false, ...settingsDetailScreenOptions }}
        />
        <Stack.Screen
          name="PrivacyPolicy"
          component={PrivacyPolicyScreen}
          options={{ headerShown: false, ...settingsDetailScreenOptions }}
        />
        <Stack.Screen
          name="Storage"
          component={StorageScreen}
          options={{ headerShown: false, ...settingsDetailScreenOptions }}
        />
        <Stack.Screen
          name="ShoppingList"
          component={ShoppingListScreen}
          options={{ headerShown: false, ...settingsDetailScreenOptions }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
// #endregion
