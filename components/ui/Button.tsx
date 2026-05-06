import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  View,
  TouchableOpacityProps,
} from 'react-native';
import { colors, radii, spacing, typography } from '@/lib/theme';

export type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

export interface ButtonProps extends TouchableOpacityProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, { container: object; text: object }> = {
  default: {
    container: { backgroundColor: colors.primary },
    text: { color: colors.primaryForeground },
  },
  destructive: {
    container: { backgroundColor: colors.destructive },
    text: { color: colors.destructiveForeground },
  },
  outline: {
    container: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.border,
    },
    text: { color: colors.text },
  },
  secondary: {
    container: { backgroundColor: colors.secondary },
    text: { color: colors.secondaryForeground },
  },
  ghost: {
    container: { backgroundColor: 'transparent' },
    text: { color: colors.text },
  },
  link: {
    container: { backgroundColor: 'transparent' },
    text: { color: colors.primary, textDecorationLine: 'underline' },
  },
};

const sizeStyles: Record<ButtonSize, { container: object; text: object }> = {
  default: {
    container: { height: 44, paddingHorizontal: spacing.lg },
    text: { fontSize: typography.base },
  },
  sm: {
    container: { height: 36, paddingHorizontal: spacing.md },
    text: { fontSize: typography.sm },
  },
  lg: {
    container: { height: 52, paddingHorizontal: spacing['2xl'] },
    text: { fontSize: typography.md },
  },
  icon: {
    container: { height: 44, width: 44, paddingHorizontal: 0 },
    text: { fontSize: typography.base },
  },
};

export function Button({
  variant = 'default',
  size = 'default',
  loading = false,
  disabled,
  children,
  style,
  ...props
}: ButtonProps) {
  const v = variantStyles[variant];
  const s = sizeStyles[size];

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      disabled={disabled || loading}
      style={[
        styles.base,
        v.container,
        s.container,
        (disabled || loading) && styles.disabled,
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' || variant === 'link' ? colors.primary : '#fff'}
        />
      ) : typeof children === 'string' ? (
        <Text style={[styles.baseText, v.text, s.text]} numberOfLines={1}>
          {children}
        </Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md,
    gap: spacing.sm,
  },
  baseText: {
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  disabled: {
    opacity: 0.5,
  },
});
