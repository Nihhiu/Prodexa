import React from 'react';
import { Text, TextInput, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

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
  const { colors } = useTheme();

  return (
    <View className="w-full gap-2">
      {label && <Text className="font-l_semibold" style={{ color: colors.text }}>{label}</Text>}
      <TextInput
        className="rounded-lg border-2 px-4 py-3 text-base"
        style={{
          color: colors.text,
          borderColor: error ? colors.accent : colors.surfaceBorder,
          backgroundColor: editable ? colors.surface : colors.background,
        }}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        editable={editable}
        multiline={multiline}
        numberOfLines={numberOfLines}
        placeholderTextColor={colors.textSecondary}
      />
      {error && <Text className="text-sm" style={{ color: colors.accent }}>{error}</Text>}
    </View>
  );
};
