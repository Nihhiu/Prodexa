import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, View, useWindowDimensions } from 'react-native';
import { HomeScreen, DashboardScreen, SettingsScreen } from '../screens';
import { BottomNavigationBar, TabKey } from '../components/common/BottomNavigationBar';

const tabs: TabKey[] = ['home', 'dashboard', 'settings'];

export const MainNavigator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const scrollRef = useRef<ScrollView>(null);
  const { width } = useWindowDimensions();

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
    <View className="flex-1 bg-white">
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
