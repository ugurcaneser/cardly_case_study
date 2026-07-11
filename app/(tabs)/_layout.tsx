import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { CaptureTabButton } from '@/components/capture-tab-button';
import { HapticTab } from '@/components/haptic-tab';
import { TabIcon } from '@/components/ui/tab-icon';
import { Colors } from '@/constants/theme';

export default function TabLayout() {
  return (
    <View style={styles.root}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarShowLabel: true,
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.outline,
          tabBarLabelStyle: styles.tabLabel,
          tabBarIconStyle: styles.tabIcon,
          tabBarStyle: styles.tabBar,
          tabBarBackground: () => (
            <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
          ),
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ focused }) => <TabIcon name="house.fill" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: 'History',
            tabBarIcon: ({ focused }) => <TabIcon name="clock.fill" focused={focused} />,
          }}
        />
        {/* Not a visible tab — CaptureTabButton below is the only entry point
            to /capture. The route stays registered for scan.tsx's deep-link
            fallback redirect. */}
        <Tabs.Screen name="scan" options={{ href: null }} />
        <Tabs.Screen
          name="collections"
          options={{
            title: 'Collections',
            tabBarIcon: ({ focused }) => <TabIcon name="folder.fill" focused={focused} />,
          }}
        />
      </Tabs>
      <CaptureTabButton />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  // Deliberately not `position: 'absolute'` — that would stop React
  // Navigation from auto-reserving the bar's height in each screen's safe
  // content area, and every tab screen's bottom padding (insets.bottom-based)
  // already assumes that reservation. Explicit height keeps it predictable
  // for CaptureTabButton's own floating position above it (kept in sync
  // there via TAB_BAR_CONTENT_HEIGHT).
  tabBar: {
    height: 76,
    borderTopWidth: 0,
    backgroundColor: 'transparent',
  },
  tabIcon: {
    marginBottom: 6,
  },
  tabLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
  },
});
