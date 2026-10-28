import { GluestackUIProvider } from '@gluestack-ui/themed'
import { config } from '@gluestack-ui/config'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { useFonts } from 'expo-font'
import { colorScheme } from 'nativewind'
import { View } from 'react-native'
import {
  Exo2_400Regular,
  Exo2_500Medium,
  Exo2_600SemiBold,
  Exo2_700Bold,
} from '@expo-google-fonts/exo-2'
import { useEffect } from 'react'
import '../lib/theme/index.css'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Exo2_400Regular,
    Exo2_500Medium,
    Exo2_600SemiBold,
    Exo2_700Bold,
  })

  useEffect(() => {
    colorScheme.set('dark')
  }, [])

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded, fontError])

  if (!fontsLoaded && !fontError) {
    return null
  }

  return (
    <View className="flex-1 bg-background">
      <GluestackUIProvider config={config} colorMode="dark">
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#0a0a0a' },
          }}
        >
          <Stack.Screen name="(tabs)" />
        </Stack>
      </GluestackUIProvider>
    </View>
  )
}
