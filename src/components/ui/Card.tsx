import React from 'react';
import { Text, View } from 'react-native';

type CardVariant = 'default' | 'outlined' | 'elevated';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  variant?: CardVariant;
  className?: string;
}

const variantStyles: Record<CardVariant, string> = {
  default: 'bg-white border border-gray-200',
  outlined: 'bg-transparent border-2 border-gray-300',
  elevated: 'bg-white shadow-lg',
};

export const Card = ({
  children,
  title,
  variant = 'default',
  className = '',
}: CardProps) => {
  return (
    <View className={`rounded-xl p-4 ${variantStyles[variant]} ${className}`}>
      {title && (
        <>
          <Text className="mb-3 text-lg font-bold text-gray-800">{title}</Text>
          <View className="mb-4 h-[1px] bg-gray-200" />
        </>
      )}
      {children}
    </View>
  );
};
