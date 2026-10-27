import { GluestackUIProvider } from '@gluestack-ui/themed'
import { config } from '@gluestack-ui/config'
import { Stack } from 'expo-router'
import '../../global.css'

export default function RootLayout() {
  return (
    <GluestackUIProvider config={config}>
      <Stack screenOptions={{ headerShown: false }} />
    </GluestackUIProvider>
  )
}
