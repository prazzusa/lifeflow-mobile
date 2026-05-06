import React from 'react';
import { View, Text, StyleSheet, ViewProps } from 'react-native';
import { colors, radii, spacing, typography } from '@/lib/theme';

export type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';

export interface BadgeProps extends ViewProps {
  variant?: BadgeVariant;
  label: string;
}

const variantStyles: Record<BadgeVariant, { container: object; text: object }> = {
  default: {
    container: { backgroundColor: colors.primary },
    text: { color: '#fff' },
  },
  secondary: {
    container: { backgroundColor: colors.secondary },
    text: { color: '#fff' },
  },
  destructive: {
    container: { backgroundColor: colors.destructive },
    text: { color: '#fff' },
  },
  outline: {
    container: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border },
    text: { color: colors.text },
  },
  success: {
    container: { backgroundColor: 'rgba(34,197,94,0.15)' },
    text: { color: colors.success },
  },
  warning: {
    container: { backgroundColor: 'rgba(245,158,11,0.15)' },
    text: { color: colors.warning },
  },
};

export function Badge({ variant = 'default', label, style, ...props }: BadgeProps) {
  const v = variantStyles[variant];
  return (
    <View style={[styles.base, v.container, style]} {...props}>
      <Text style={[styles.text, v.text]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: radii.full,
  },
  text: {
    fontSize: typography.xs,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
