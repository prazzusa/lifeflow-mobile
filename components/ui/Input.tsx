import React, { forwardRef, useState } from 'react';
import {
  TextInput,
  TextInputProps,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { colors, radii, spacing, typography } from '@/lib/theme';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, leftIcon, rightIcon, secureTextEntry, style, ...props }, ref) => {
    const [focused, setFocused] = useState(false);
    const [hidden, setHidden] = useState(secureTextEntry ?? false);

    return (
      <View style={styles.wrapper}>
        {label && <Text style={styles.label}>{label}</Text>}
        <View
          style={[
            styles.container,
            focused && styles.containerFocused,
            !!error && styles.containerError,
          ]}
        >
          {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
          <TextInput
            ref={ref}
            style={[
              styles.input,
              leftIcon ? styles.inputWithLeftIcon : undefined,
              (rightIcon || secureTextEntry) ? styles.inputWithRightIcon : undefined,
              style,
            ]}
            placeholderTextColor={colors.textSubtle}
            selectionColor={colors.primary}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            secureTextEntry={hidden}
            {...props}
          />
          {secureTextEntry ? (
            <TouchableOpacity
              onPress={() => setHidden((h) => !h)}
              style={styles.iconRight}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              {hidden ? (
                <EyeOff size={18} color={colors.textMuted} />
              ) : (
                <Eye size={18} color={colors.textMuted} />
              )}
            </TouchableOpacity>
          ) : rightIcon ? (
            <View style={styles.iconRight}>{rightIcon}</View>
          ) : null}
        </View>
        {error && <Text style={styles.error}>{error}</Text>}
      </View>
    );
  },
);

Input.displayName = 'Input';

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xs,
  },
  label: {
    fontSize: typography.sm,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 2,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.input,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    height: 48,
  },
  containerFocused: {
    borderColor: colors.inputFocused,
    backgroundColor: 'rgba(99,102,241,0.06)',
  },
  containerError: {
    borderColor: colors.destructive,
  },
  input: {
    flex: 1,
    paddingHorizontal: spacing.base,
    fontSize: typography.base,
    color: colors.text,
    height: '100%',
  },
  inputWithLeftIcon: {
    paddingLeft: spacing.xs,
  },
  inputWithRightIcon: {
    paddingRight: spacing.xs,
  },
  iconLeft: {
    paddingLeft: spacing.md,
  },
  iconRight: {
    paddingRight: spacing.md,
  },
  error: {
    fontSize: typography.xs,
    color: colors.destructive,
    marginTop: 2,
  },
});
