import React from 'react';
import { Feather } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { Card } from '../components/ui';

export const SettingsScreen: React.FC = () => {
  return (
    <View className="flex-1 bg-white px-6 py-8">
      <Text className="mb-4 text-3xl font-bold text-gray-900">Settings</Text>

      <View>
        <Text className="mb-3 text-base font-semibold text-gray-800">Aba</Text>

        <Card className="rounded-2xl p-0">
          <Pressable className="flex-row items-center justify-between px-4 py-4" disabled>
            <Text className="text-base text-gray-900">Nome da página</Text>
            <Feather name="chevron-right" size={20} color="#6B7280" />
          </Pressable>
        </Card>
      </View>
    </View>
  );
};
