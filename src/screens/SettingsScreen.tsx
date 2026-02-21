import React, { useRef } from 'react';
import { Feather } from '@expo/vector-icons';
import { Animated, Pressable, Text, View } from 'react-native';

import { Card } from '../components/ui';

interface SectionData {
  title: string;
  items: { 
    label: string,
    onPress?: () => void
  }[];
}

interface AnimatedSettingsItemProps {
  label: string;
}

const settingsSections: SectionData[] = [
  {
    title: 'Configurações',
    items: [
      { label: 'Geral' },
      { label: 'Aparência' },
      { label: 'Notificações' },
    ],
  },
  {
    title: 'Apoiar',
    items: [
      { label: 'Assistir Publicidade' },
      { label: 'Ouvir Música' },
      { label: 'Outros Links' },
    ],
  },
  {
    title: 'Privacidade',
    items: [
      { label: 'Política de Privacidade' },
      { label: 'Armazenamento' },
    ],
  },
];

const AnimatedSettingsItem: React.FC<AnimatedSettingsItemProps> = ({
  label
}) => {
  const buttonScale = useRef(new Animated.Value(1)).current;

  const animatePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.98,
      useNativeDriver: true,
      speed: 30,
      bounciness: 0,
    }).start();
  };

  const animatePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 6,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
      <Pressable
        className={`flex-row items-center justify-between px-4 py-4`}
        onPress={() => {}}
        onPressIn={animatePressIn}
        onPressOut={animatePressOut}
      >
        <Text className="text-base text-gray-900">{label}</Text>
        <Feather name="chevron-right" size={20} color="#6B7280" />
      </Pressable>
    </Animated.View>
  );
};

export const SettingsScreen: React.FC = () => {
  return (
    <View className="flex-1 bg-white px-6 py-8">
      <Text className="mb-4 text-3xl font-bold text-gray-900">Settings</Text>

      {settingsSections.map((section) => (
        <View key={section.title} className="mb-5">
          <Text className="mb-3 text-base font-semibold text-gray-800">{section.title}</Text>

          <Card className="rounded-2xl p-0">
            {section.items.map((item) => (
              <AnimatedSettingsItem
                key={item.label}
                label={item.label}
              />
            ))}
          </Card>
        </View>
      ))}
    </View>
  );
};
