export const colors = {
  primary: '#6366f1',
  primaryForeground: '#ffffff',
  primaryHover: '#4f46e5',

  secondary: '#8b5cf6',
  secondaryForeground: '#ffffff',

  destructive: '#ef4444',
  destructiveForeground: '#ffffff',

  background: '#0f0f1a',
  card: '#1a1a2e',
  cardBorder: 'rgba(255,255,255,0.08)',

  border: 'rgba(255,255,255,0.12)',
  input: 'rgba(255,255,255,0.1)',
  inputFocused: '#6366f1',

  text: '#f1f5f9',
  textMuted: '#94a3b8',
  textSubtle: '#64748b',

  overlay: 'rgba(0,0,0,0.75)',
  surface: '#16213e',
  surfaceHover: 'rgba(99,102,241,0.12)',

  success: '#22c55e',
  warning: '#f59e0b',
  info: '#3b82f6',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
} as const;

export const radii = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

export const typography = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
} as const;
