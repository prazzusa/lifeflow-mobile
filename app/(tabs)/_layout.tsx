import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Home, BarChart3, Compass, BookOpen, MoreHorizontal } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { LucideIcon } from 'lucide-react-native';

const ACTIVE_COLOR = '#6366f1';
const INACTIVE_COLOR = '#94a3b8';
const TAB_BG = '#1a1a2e';

type TabIconProps = {
  Icon: LucideIcon;
  label: string;
  focused: boolean;
};

function TabIcon({ Icon, label, focused }: TabIconProps) {
  return (
    <View style={styles.tabItem}>
      <Icon size={22} color={focused ? ACTIVE_COLOR : INACTIVE_COLOR} strokeWidth={focused ? 2.2 : 1.8} />
      <Text style={[styles.tabLabel, { color: focused ? ACTIVE_COLOR : INACTIVE_COLOR, fontWeight: focused ? '600' : '400' }]}>
        {label}
      </Text>
      {focused && <View style={styles.activeIndicator} />}
    </View>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: TAB_BG,
          borderTopWidth: 0,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 8,
          elevation: 0,
          shadowOpacity: 0,
          position: 'absolute',
        },
        tabBarShowLabel: false,
        tabBarActiveTintColor: ACTIVE_COLOR,
        tabBarInactiveTintColor: INACTIVE_COLOR,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon Icon={Home} label="Today" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon Icon={BarChart3} label="Insights" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon Icon={BookOpen} label="Journal" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="glow"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon Icon={Compass} label="Glow" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon Icon={MoreHorizontal} label="More" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    minWidth: 50,
  },
  tabLabel: {
    fontSize: 10,
    letterSpacing: 0.2,
  },
  activeIndicator: {
    position: 'absolute',
    top: -8,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: ACTIVE_COLOR,
  },
});
