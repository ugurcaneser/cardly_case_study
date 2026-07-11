import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/haptic-tab';
import { TabIcon } from '@/components/ui/tab-icon';
import { Colors } from '@/constants/theme';

const TAB_BAR_CONTENT_HEIGHT = 76;

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarShowLabel: true,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.outline,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIconStyle: styles.tabIcon,
        // Height/padding include insets.bottom explicitly — overriding the
        // default tabBarStyle (as we do here for background/border) opts out
        // of React Navigation's own automatic safe-area handling, so without
        // this the bar renders too short on Android and the system nav
        // buttons/gesture bar sit on top of our tab icons (edgeToEdgeEnabled
        // in app.json means nothing reserves that space for us otherwise).
        tabBarStyle: [
          styles.tabBar,
          { height: TAB_BAR_CONTENT_HEIGHT + insets.bottom, paddingBottom: insets.bottom },
        ],
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
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scan',
          tabBarIcon: ({ focused }) => <TabIcon name="camera.fill" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="collections"
        options={{
          title: 'Collections',
          tabBarIcon: ({ focused }) => <TabIcon name="folder.fill" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ focused }) => <TabIcon name="gearshape.fill" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
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
