import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Mail, Lock, Sparkles } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { z } from 'zod';
import { supabase } from '@/supabase/client';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { toast } from '@/lib/toast';
import { colors, spacing, typography, radii } from '@/lib/theme';

const emailSchema = z.string().trim().email({ message: 'Please enter a valid email' });
const passwordSchema = z.string().min(6, { message: 'Password must be at least 6 characters' });

type FormErrors = { email?: string; password?: string; confirmPassword?: string };

export default function AuthScreen() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // Redirect if already authenticated
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) return;
      const onboarded = await AsyncStorage.getItem('goals360_onboarded');
      if (onboarded === 'true') {
        router.replace('/(tabs)');
      } else {
        router.replace('/onboarding');
      }
    });
  }, []);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) newErrors.email = emailResult.error.errors[0].message;
    const passResult = passwordSchema.safeParse(password);
    if (!passResult.success) newErrors.password = passResult.error.errors[0].message;
    if (!isLogin && password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsLoading(true);
    setErrors({});

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        toast.success('Welcome back!');
      } else {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        toast.success('Account created! Check your email to verify.');
      }
    } catch (error: any) {
      const message: string = error.message || 'Something went wrong';
      if (message.includes('Invalid login credentials')) {
        setErrors({ email: 'Invalid email or password' });
      } else if (message.includes('User already registered')) {
        setErrors({ email: 'This email is already registered' });
      } else {
        toast.error(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'com.goals360.app://auth',
        skipBrowserRedirect: false,
      },
    });
    if (error) {
      toast.error(error.message);
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/welcome')}>
              <ArrowLeft size={20} color={colors.text} />
            </TouchableOpacity>
            <View style={styles.logo}>
              <View style={styles.logoIcon}>
                <Sparkles size={18} color="#fff" />
              </View>
              <Text style={styles.logoText}>GOALS360</Text>
            </View>
          </View>

          {/* Title */}
          <View style={styles.titleBlock}>
            <Text style={styles.title}>{isLogin ? 'Welcome Back' : 'Create Account'}</Text>
            <Text style={styles.subtitle}>
              {isLogin ? 'Sign in to continue your journey' : 'Start your wellness journey today'}
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Email"
              placeholder="Email address"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
              error={errors.email}
              leftIcon={<Mail size={18} color={colors.textSubtle} />}
              editable={!isLoading}
            />

            <Input
              label="Password"
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              error={errors.password}
              leftIcon={<Lock size={18} color={colors.textSubtle} />}
              editable={!isLoading}
            />

            {!isLogin && (
              <Input
                label="Confirm Password"
                placeholder="Confirm password"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                error={errors.confirmPassword}
                leftIcon={<Lock size={18} color={colors.textSubtle} />}
                editable={!isLoading}
              />
            )}

            {isLogin && (
              <TouchableOpacity
                style={styles.forgotBtn}
                onPress={() => router.push('/reset-password')}
              >
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>
            )}

            <Button
              variant="default"
              size="lg"
              loading={isLoading}
              onPress={handleSubmit}
              style={styles.submitBtn}
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </Button>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google Sign In */}
            <TouchableOpacity
              style={styles.googleBtn}
              onPress={handleGoogleSignIn}
              disabled={isLoading}
              activeOpacity={0.75}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={colors.textMuted} />
              ) : (
                <>
                  <GoogleIcon />
                  <Text style={styles.googleText}>Continue with Google</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Toggle */}
          <View style={styles.toggleRow}>
            <Text style={styles.togglePrompt}>
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
            </Text>
            <TouchableOpacity onPress={() => { setIsLogin(!isLogin); setErrors({}); }}>
              <Text style={styles.toggleLink}>{isLogin ? 'Sign Up' : 'Sign In'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function GoogleIcon() {
  return (
    <View style={{ width: 20, height: 20 }}>
      <Text style={{ fontSize: 16 }}>G</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['3xl'],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
    paddingTop: spacing.base,
    marginBottom: spacing['2xl'],
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
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: typography.md,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 0.5,
  },
  titleBlock: {
    marginBottom: spacing['2xl'],
    gap: spacing.xs,
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
  },
  form: {
    gap: spacing.base,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: -spacing.xs,
  },
  forgotText: {
    fontSize: typography.sm,
    color: colors.primary,
  },
  submitBtn: {
    marginTop: spacing.sm,
    borderRadius: radii.full,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
    marginVertical: spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontSize: typography.sm,
    color: colors.textSubtle,
  },
  googleBtn: {
    height: 52,
    borderRadius: radii.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: colors.border,
  },
  googleText: {
    fontSize: typography.base,
    fontWeight: '500',
    color: colors.text,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing['2xl'],
  },
  togglePrompt: {
    fontSize: typography.sm,
    color: colors.textMuted,
  },
  toggleLink: {
    fontSize: typography.sm,
    fontWeight: '600',
    color: colors.primary,
  },
});
