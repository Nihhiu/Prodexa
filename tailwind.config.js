/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,ts,tsx}',
    './components/**/*.{js,ts,tsx}',
    './src/**/*.{js,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        l_thin: ['Lexend_100Thin'],
        l_extralight: ['Lexend_200ExtraLight'],
        l_light: ['Lexend_300Light'],
        l_regular: ['Lexend_400Regular'],
        l_medium: ['Lexend_500Medium'],
        l_semibold: ['Lexend_600SemiBold'],
        l_bold: ['Lexend_700Bold'],
        l_extrabold: ['Lexend_800ExtraBold'],
        l_black: ['Lexend_900Black'],
      },
      colors: {
        primary: '#3B82F6',
        secondary: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
        success: '#10B981',
      },
    },
  },
  plugins: [],
};
