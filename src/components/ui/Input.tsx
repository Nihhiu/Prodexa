import React from 'react';
import { TextInput, View } from 'react-native';
import { Text } from './Text';
import { useTheme } from '../../hooks/useTheme';
import { getEffectiveFontScale } from '../../utils/fontScale';

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
  inputClassName?: string;
  backgroundTone?: 'surface' | 'background';
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
  inputClassName = '',
  backgroundTone = 'surface',
}: InputProps) => {
  const { colors, fontSize: selectedFontScale } = useTheme();
  const fontScale = getEffectiveFontScale(selectedFontScale);
  const editableBackgroundColor =
    backgroundTone === 'background' ? colors.background : colors.surface;

  // Scale TextInput font size consistently for all values, including 100%
  const scaledInputStyle = {
    fontSize: Math.round(16 * fontScale * 10) / 10,
    lineHeight: Math.round(24 * fontScale * 10) / 10,
  };

  return (
    <View className="w-full gap-2">
      {label && <Text className="font-l_semibold" style={{ color: colors.text }}>{label}</Text>}
      <TextInput
        className={`rounded-lg border px-4 py-3 text-base  ${inputClassName}`}
        style={[
          {
            color: colors.text,
            borderColor: error ? colors.accent : colors.surfaceBorder,
            backgroundColor: editable ? editableBackgroundColor + '80' : colors.background + '80',
          },
          scaledInputStyle,
        ]}
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
