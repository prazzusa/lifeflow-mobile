import React, { forwardRef, useState } from 'react';
import { TextInput, TextInputProps, View, Text, StyleSheet } from 'react-native';
import { colors, radii, spacing, typography } from '@/lib/theme';

export interface TextareaProps extends TextInputProps {
  label?: string;
  error?: string;
  minHeight?: number;
}

export const Textarea = forwardRef<TextInput, TextareaProps>(
  ({ label, error, minHeight = 100, style, ...props }, ref) => {
    const [focused, setFocused] = useState(false);

    return (
      <View style={styles.wrapper}>
        {label && <Text style={styles.label}>{label}</Text>}
        <TextInput
          ref={ref}
          multiline
          textAlignVertical="top"
          placeholderTextColor={colors.textSubtle}
          selectionColor={colors.primary}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[
            styles.textarea,
            { minHeight },
            focused && styles.focused,
            !!error && styles.error,
            style,
          ]}
          {...props}
        />
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    );
  },
);

Textarea.displayName = 'Textarea';

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xs,
  },
  label: {
    fontSize: typography.sm,
    fontWeight: '500',
    color: colors.text,
  },
  textarea: {
    backgroundColor: colors.input,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    fontSize: typography.base,
    color: colors.text,
    lineHeight: 22,
  },
  focused: {
    borderColor: colors.inputFocused,
    backgroundColor: 'rgba(99,102,241,0.06)',
  },
  error: {
    borderColor: colors.destructive,
  },
  errorText: {
    fontSize: typography.xs,
    color: colors.destructive,
  },
});
