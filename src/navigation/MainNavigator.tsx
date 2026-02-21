import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, View, useWindowDimensions } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  HomeScreen,
  DashboardScreen,
  SettingsScreen,
  GeneralSettingsScreen,
  AppearanceScreen,
  NotificationsScreen,
  WatchAdsScreen,
  ListenMusicScreen,
  OtherLinksScreen,
  PrivacyPolicyScreen,
  StorageScreen,
} from '../screens';
import { BottomNavigationBar, TabKey } from '../components/common/BottomNavigationBar';
import { RootStackParamList } from './types';
import { useTheme } from '../hooks/useTheme';

const tabs: TabKey[] = ['home', 'dashboard', 'settings'];
const Stack = createNativeStackNavigator<RootStackParamList>();

const MainTabsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const scrollRef = useRef<ScrollView>(null);
  const { width } = useWindowDimensions();
  const { colors } = useTheme();

  const getTabIndex = (tab: TabKey) => tabs.indexOf(tab);

  const handleTabChange = (tab: TabKey) => {
    const targetIndex = getTabIndex(tab);

    setActiveTab(tab);
    scrollRef.current?.scrollTo({
      x: targetIndex * width,
      animated: true,
    });
  };

  const handleMomentumScrollEnd = (event: {
    nativeEvent: { contentOffset: { x: number } };
  }) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    const nextTab = tabs[index];

    if (nextTab && nextTab !== activeTab) {
      setActiveTab(nextTab);
    }
  };

  useEffect(() => {
    const activeIndex = getTabIndex(activeTab);
    scrollRef.current?.scrollTo({ x: activeIndex * width, animated: false });
  }, [activeTab, width]);

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <View className="flex-1">
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          bounces={false}
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          contentOffset={{ x: getTabIndex(activeTab) * width, y: 0 }}
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
      </View>
      <BottomNavigationBar activeTab={activeTab} onTabChange={handleTabChange} />
    </View>
  );
};

export const MainNavigator: React.FC = () => {
  const { colors } = useTheme();

  const screenOptions = {
    headerStyle: { backgroundColor: colors.surface },
    headerTintColor: colors.text,
    headerTitleStyle: { color: colors.text },
    contentStyle: { backgroundColor: colors.background },
  };

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={screenOptions}>
        <Stack.Screen name="MainTabs" component={MainTabsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="GeneralSettings" component={GeneralSettingsScreen} options={{ title: 'Geral' }} />
        <Stack.Screen name="Appearance" component={AppearanceScreen} options={{ title: 'Aparência' }} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notificações' }} />
        <Stack.Screen name="WatchAds" component={WatchAdsScreen} options={{ title: 'Assistir Publicidade' }} />
        <Stack.Screen name="ListenMusic" component={ListenMusicScreen} options={{ title: 'Ouvir Música' }} />
        <Stack.Screen name="OtherLinks" component={OtherLinksScreen} options={{ title: 'Outros Links' }} />
        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} options={{ title: 'Política de Privacidade' }} />
        <Stack.Screen name="Storage" component={StorageScreen} options={{ title: 'Armazenamento' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
