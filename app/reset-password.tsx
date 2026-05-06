import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Mail } from 'lucide-react-native';
import { z } from 'zod';
import { supabase } from '@/supabase/client';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { toast } from '@/lib/toast';
import { colors, spacing, typography, radii } from '@/lib/theme';

const emailSchema = z.string().trim().email({ message: 'Please enter a valid email' });

export default function ResetPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async () => {
    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setEmailError(result.error.errors[0].message);
      return;
    }
    setEmailError('');
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: 'com.goals360.app://reset-password',
      });
      if (error) throw error;
      setSent(true);
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.container}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft size={20} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.titleBlock}>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>
              Enter your email and we'll send you a link to reset your password.
            </Text>
          </View>

          {sent ? (
            <View style={styles.successBlock}>
              <Text style={styles.successIcon}>📬</Text>
              <Text style={styles.successTitle}>Check your email</Text>
              <Text style={styles.successText}>
                We sent a reset link to {email}. It may take a few minutes to arrive.
              </Text>
              <Button
                variant="outline"
                size="default"
                onPress={() => router.replace('/auth')}
                style={{ marginTop: spacing.xl }}
              >
                Back to Sign In
              </Button>
            </View>
          ) : (
            <View style={styles.form}>
              <Input
                label="Email"
                placeholder="Email address"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
                error={emailError}
                leftIcon={<Mail size={18} color={colors.textSubtle} />}
                editable={!isLoading}
              />
              <Button
                variant="default"
                size="lg"
                loading={isLoading}
                onPress={handleReset}
                style={styles.submitBtn}
              >
                Send Reset Link
              </Button>
              <TouchableOpacity style={styles.backToSignIn} onPress={() => router.back()}>
                <Text style={styles.backToSignInText}>Back to Sign In</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.base,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing['2xl'],
  },
  titleBlock: {
    gap: spacing.sm,
    marginBottom: spacing['2xl'],
  },
  title: {
    fontSize: typography['3xl'],
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: typography.base,
    color: colors.textMuted,
    lineHeight: 24,
  },
  form: {
    gap: spacing.base,
  },
  submitBtn: {
    borderRadius: radii.full,
    marginTop: spacing.sm,
  },
  backToSignIn: {
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  backToSignInText: {
    fontSize: typography.sm,
    color: colors.primary,
    fontWeight: '500',
  },
  successBlock: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing['2xl'],
  },
  successIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  successTitle: {
    fontSize: typography['2xl'],
    fontWeight: '700',
    color: colors.text,
  },
  successText: {
    fontSize: typography.base,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
  },
});
