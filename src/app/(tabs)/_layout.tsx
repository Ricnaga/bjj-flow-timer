import { Tabs } from 'expo-router'
import { Timer, Clock } from 'lucide-react-native'

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          flexDirection: 'row',
          height: 64,
          backgroundColor: '#0a0a0a',
          borderTopWidth: 0,
        },
        tabBarItemStyle: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarLabelStyle: {
          fontFamily: 'Exo2_500Medium',
        },
        tabBarActiveTintColor: '#38bdf8',
        tabBarInactiveTintColor: '#a1a1aa',
      }}
    >
      <Tabs.Screen
        name="cronometro"
        options={{
          title: 'Cronômetro',
          tabBarIcon: ({ color, size }) => <Clock color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="timer"
        options={{
          title: 'Timer',
          tabBarIcon: ({ color, size }) => <Timer color={color} size={size} />,
        }}
      />
    </Tabs>
  )
}
