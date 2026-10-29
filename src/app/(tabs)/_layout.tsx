import { Tabs } from 'expo-router'
import { Timer, TimerReset } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function TabsLayout() {
  const insets = useSafeAreaInsets()

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          flexDirection: 'row',
          height: 64 + insets.bottom,
          backgroundColor: '#0a0a0a',
          borderTopWidth: 1,
          borderTopColor: '#27272a',
          paddingTop: 6,
          paddingBottom: Math.max(insets.bottom, 6),
        },
        tabBarItemStyle: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarLabelStyle: {
          fontFamily: 'Exo2_500Medium',
          fontSize: 11,
        },
        tabBarActiveTintColor: '#38bdf8',
        tabBarInactiveTintColor: '#a1a1aa',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Timer',
          tabBarIcon: ({ color, size }) => <Timer color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="cronometro"
        options={{
          title: 'Cronômetro',
          tabBarIcon: ({ color, size }) => (
            <TimerReset color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  )
}
