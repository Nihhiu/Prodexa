// #region Imports
import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ActivityIndicator, View } from 'react-native';
import { MainNavigator } from 'src/navigation';
import { ThemeProvider } from 'src/context/ThemeContext';
import { LanguageProvider } from 'src/context/LanguageContext';
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

// #region UI helpers
// Mantém o estilo da status bar sincronizado com o tema ativo.
function ThemedStatusBar() {
  const { colors } = useTheme();
  return <StatusBar style={colors.statusBarStyle === 'light' ? 'light' : 'dark'} />;
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

  // Evita flash visual enquanto assets tipográficos ainda não estão prontos.
  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <LanguageProvider>
        <SafeAreaProvider>
          <MainNavigator />
          <ThemedStatusBar />
        </SafeAreaProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
// #endregion
