import { FontAwesome } from '@expo/vector-icons';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { withLayoutContext } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColor } from '../../hooks/use-theme-color';

const MaterialTopTabs = createMaterialTopTabNavigator().Navigator;
const SwipeTabs = withLayoutContext(MaterialTopTabs);

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const backgroundColor = useThemeColor({}, 'background');
  const activeTintColor = useThemeColor({ light: '#007bff', dark: '#4da3ff' }, 'text');
  const inactiveTintColor = useThemeColor({ light: '#888', dark: '#666' }, 'text');

  return (
    <SwipeTabs
      tabBarPosition="bottom"
      screenOptions={{
        tabBarActiveTintColor: activeTintColor,
        tabBarInactiveTintColor: inactiveTintColor,
        tabBarIndicatorStyle: {
          backgroundColor: activeTintColor,
          height: 3,
        },
        tabBarStyle: {
          paddingBottom: Platform.OS === 'ios' ? insets.bottom : 5,
          paddingTop: 8,
          height: Platform.OS === 'ios' ? 55 + insets.bottom : 60,
          backgroundColor: backgroundColor,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          textTransform: 'none',
          marginTop: 0,
          marginBottom: 0,
        },
        tabBarItemStyle: {
          paddingHorizontal: 0,
          paddingVertical: 0,
        },
        tabBarIconStyle: {
          width: 24,
          height: 24,
        },
        swipeEnabled: true,
      }}
    >
      <SwipeTabs.Screen
        name="shop"
        options={{
          title: 'Головна',
          tabBarIcon: ({ color }) => <FontAwesome name="home" size={24} color={color} />,
        }}
      />
      <SwipeTabs.Screen
        name="chat"
        options={{
          title: 'Чат',
          tabBarIcon: ({ color }) => <FontAwesome name="comments" size={24} color={color} />,
        }}
      />
      <SwipeTabs.Screen
        name="friends"
        options={{
          title: 'Друзі',
          tabBarIcon: ({ color }) => <FontAwesome name="users" size={24} color={color} />,
        }}
      />
      <SwipeTabs.Screen
        name="profile"
        options={{
          title: 'Профіль',
          tabBarIcon: ({ color }) => <FontAwesome name="user" size={24} color={color} />,
        }}
      />
      <SwipeTabs.Screen
        name="rankings"
        options={{
          title: 'Топ',
          tabBarIcon: ({ color }) => <FontAwesome name="trophy" size={24} color={color} />,
        }}
      />
    </SwipeTabs>
  );
}
