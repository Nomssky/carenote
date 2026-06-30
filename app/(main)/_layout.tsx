import { Tabs } from 'expo-router'
import { Text } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useColors } from '../../hooks/useColors'

export default function MainLayout() {
  const { COLORS } = useColors()
  const insets = useSafeAreaInsets()

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          borderTopColor: COLORS.line,
          backgroundColor: COLORS.white,
          paddingBottom: insets.bottom + 8,
          height: insets.bottom + 60,
        },
        tabBarActiveTintColor: COLORS.roseDark,
        tabBarInactiveTintColor: COLORS.muted,
        tabBarLabelStyle: { fontSize: 10, fontFamily: 'DMSans_600SemiBold' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Buat',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>➕</Text>,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Riwayat',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>📋</Text>,
        }}
      />
      <Tabs.Screen
        name="gallery"
        options={{
          title: 'Galeri',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🖼</Text>,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Setelan',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>⚙️</Text>,
        }}
      />
      <Tabs.Screen
        name="pair"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="notif"
        options={{
          href: null,
        }}
      />
    </Tabs>
  )
}
