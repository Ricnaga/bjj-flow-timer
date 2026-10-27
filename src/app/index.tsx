import { StatusBar } from 'expo-status-bar'
import { Box, Button, ButtonText, Text } from '@gluestack-ui/themed'

export default function HomeScreen() {
  return (
    <Box
      flex={1}
      justifyContent="center"
      alignItems="center"
      bg="$backgroundLight0"
      $dark-bg="$backgroundDark950"
    >
      <Text size="lg" mb="$4">
        BJJ Flow Timer
      </Text>
      <Button>
        <ButtonText>Iniciar</ButtonText>
      </Button>
      <StatusBar style="auto" />
    </Box>
  )
}
