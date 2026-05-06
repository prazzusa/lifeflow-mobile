import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedProps,
  Easing,
} from 'react-native-reanimated';
import { colors, typography } from '@/lib/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface RingConfig {
  value: number;
  color: string;
  radius: number;
  label: string;
}

function AnimatedRing({
  ring,
  center,
  strokeWidth,
  delay,
}: {
  ring: RingConfig;
  center: number;
  strokeWidth: number;
  delay: number;
}) {
  const circumference = 2 * Math.PI * ring.radius;
  const progress = useSharedValue(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      progress.value = withTiming(ring.value / 100, {
        duration: 1200,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
      });
    }, delay);
    return () => clearTimeout(timer);
  }, [ring.value, delay]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  return (
    <>
      {/* Background track */}
      <Circle
        cx={center}
        cy={center}
        r={ring.radius}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {/* Animated progress */}
      <AnimatedCircle
        cx={center}
        cy={center}
        r={ring.radius}
        fill="none"
        stroke={ring.color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        animatedProps={animatedProps}
      />
    </>
  );
}

interface LifeRingProps {
  habits: number;
  fitness: number;
  focus: number;
  size?: number;
}

export function LifeRing({ habits, fitness, focus, size = 180 }: LifeRingProps) {
  const strokeWidth = 14;
  const gap = 5;
  const center = size / 2;

  const rings: RingConfig[] = [
    {
      value: habits,
      color: '#6366f1',
      label: 'Habits',
      radius: center - strokeWidth,
    },
    {
      value: fitness,
      color: '#22c55e',
      label: 'Fitness',
      radius: center - strokeWidth * 2 - gap,
    },
    {
      value: focus,
      color: '#a855f7',
      label: 'Focus',
      radius: center - strokeWidth * 3 - gap * 2,
    },
  ];

  const totalProgress = Math.round((habits + fitness + focus) / 3);

  return (
    <View style={{ width: size, height: size }}>
      {/* SVG rotated -90° so progress starts at top */}
      <Svg
        width={size}
        height={size}
        style={{ transform: [{ rotate: '-90deg' }] }}
      >
        {rings.map((ring, i) => (
          <AnimatedRing
            key={ring.label}
            ring={ring}
            center={center}
            strokeWidth={strokeWidth}
            delay={i * 150}
          />
        ))}
      </Svg>

      {/* Center label */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={styles.centerContent}>
          <Text style={styles.percentage}>{totalProgress}%</Text>
          <Text style={styles.label}>Today's{'\n'}Activity</Text>
        </View>
      </View>
    </View>
  );
}

export function LifeRingLegend() {
  const items = [
    { color: '#6366f1', label: 'Habits' },
    { color: '#22c55e', label: 'Fitness' },
    { color: '#a855f7', label: 'Focus' },
  ];

  return (
    <View style={styles.legend}>
      {items.map((item) => (
        <View key={item.label} style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: item.color }]} />
          <Text style={styles.legendText}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentage: {
    color: colors.text,
    fontSize: typography['2xl'],
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  label: {
    color: colors.textMuted,
    fontSize: typography.xs,
    textAlign: 'center',
    lineHeight: 14,
    marginTop: 2,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    color: colors.text,
    fontSize: typography.xs,
    opacity: 0.8,
  },
});
