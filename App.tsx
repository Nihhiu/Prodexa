import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MainNavigator } from 'src/navigation';
import { ThemeProvider } from 'src/context/ThemeContext';
import { useTheme } from 'src/hooks/useTheme';

import './global.css';

function ThemedStatusBar() {
  const { colors } = useTheme();
  return <StatusBar style={colors.statusBarStyle === 'light' ? 'light' : 'dark'} />;
}

export default function App() {
  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <MainNavigator />
        <ThemedStatusBar />
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
