// #region Imports
import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { MainNavigator } from 'src/navigation';
import { ThemeProvider } from 'src/context/ThemeContext';
import { LanguageProvider } from 'src/context/LanguageContext';
import { UserProvider } from 'src/context/UserContext';
import { useTheme } from 'src/hooks/useTheme';
import {
  useFonts,
  Lexend_100Thin,
  Lexend_200ExtraLight,
  Lexend_300Light,
  Lexend_400Regular,
  Lexend_500Medium,
  Lexend_600SemiBold,
  Lexend_700Bold,
  Lexend_800ExtraBold,
  Lexend_900Black,
} from '@expo-google-fonts/lexend';

import './global.css';
// #endregion

// Mantém o splash nativo visível até a app ficar pronta.
SplashScreen.preventAutoHideAsync().catch(() => { });

// #region UI helpers
// Mantém o estilo da status bar sincronizado com o tema ativo.
function ThemedStatusBar() {
  const { colors } = useTheme();
  return <StatusBar style={colors.statusBarStyle === 'light' ? 'light' : 'dark'} />;
}

function LaunchAnimationOverlay() {
  const { colors } = useTheme();
  const [visible, setVisible] = useState(true);
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(0.96)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 1,
        duration: 450,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 320,
        delay: 260,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        setVisible(false);
      }
    });
  }, [opacity, scale]);

  if (!visible) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFillObject,
        styles.launchOverlay,
        { backgroundColor: colors.background, opacity },
      ]}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <Text style={[styles.launchTitle, { color: colors.primary }]}>Prodexa</Text>
      </Animated.View>
    </Animated.View>
  );
}

function AppShell() {
  return (
    <View style={styles.appShell}>
      <MainNavigator />
      <LaunchAnimationOverlay />
      <ThemedStatusBar />
    </View>
  );
}

function AppBootstrap({ fontsLoaded }: { fontsLoaded: boolean }) {
  const { isLoading } = useTheme();
  const isReady = fontsLoaded && !isLoading;

  useEffect(() => {
    if (!isReady) return;

    SplashScreen.hideAsync().catch(() => { });
  }, [isReady]);

  if (!isReady) {
    return null;
  }

  return <AppShell />;
}
// #endregion

// #region Root component
export default function App() {
  // Carrega todas as variações da fonte antes de montar a navegação.
  const [fontsLoaded] = useFonts({
    Lexend_100Thin,
    Lexend_200ExtraLight,
    Lexend_300Light,
    Lexend_400Regular,
    Lexend_500Medium,
    Lexend_600SemiBold,
    Lexend_700Bold,
    Lexend_800ExtraBold,
    Lexend_900Black,
  });

  return (
    <ThemeProvider>
      <LanguageProvider>
        <UserProvider>
          <SafeAreaProvider>
            <AppBootstrap fontsLoaded={fontsLoaded} />
          </SafeAreaProvider>
        </UserProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
// #endregion

const styles = StyleSheet.create({
  appShell: {
    flex: 1,
  },
  launchOverlay: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  launchTitle: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 34,
    letterSpacing: 1.2,
  },
});
