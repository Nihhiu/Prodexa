import React from 'react';
import { Text, TextInput, View } from 'react-native';

interface InputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  secureTextEntry?: boolean;
  editable?: boolean;
  error?: string;
  multiline?: boolean;
  numberOfLines?: number;
}

export const Input = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  editable = true,
  error,
  multiline = false,
  numberOfLines = 1,
}: InputProps) => {
  return (
    <View className="w-full gap-2">
      {label && <Text className="font-semibold text-gray-700">{label}</Text>}
      <TextInput
        className={`rounded-lg border-2 px-4 py-3 text-base ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${!editable ? 'bg-gray-100' : 'bg-white'}`}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        editable={editable}
        multiline={multiline}
        numberOfLines={numberOfLines}
        placeholderTextColor="#999"
      />
      {error && <Text className="text-sm text-red-600">{error}</Text>}
    </View>
  );
};
