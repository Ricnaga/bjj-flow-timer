import { Pressable, Text, View } from 'react-native'

interface TimerControlsProps {
  isRunning: boolean
  isPaused: boolean
  onStart: () => void
  onPause: () => void
  onReset: () => void
}

export function TimerControls({ isRunning, isPaused, onStart, onPause, onReset }: TimerControlsProps) {
  if (isRunning) {
    return (
      <View className="flex-row gap-3">
        <Pressable className="rounded-lg bg-secondary px-6 py-3" onPress={onPause}>
          <Text className="text-secondary-foreground font-sans">Pausar</Text>
        </Pressable>
        <Pressable className="rounded-lg bg-tertiary px-6 py-3" onPress={onReset}>
          <Text className="text-tertiary-foreground font-sans">Resetar</Text>
        </Pressable>
      </View>
    )
  }

  if (isPaused) {
    return (
      <View className="flex-row gap-3">
        <Pressable className="rounded-lg bg-primary px-6 py-3" onPress={onStart}>
          <Text className="text-primary-foreground font-sans">Continuar</Text>
        </Pressable>
        <Pressable className="rounded-lg bg-tertiary px-6 py-3" onPress={onReset}>
          <Text className="text-tertiary-foreground font-sans">Resetar</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <View className="flex-row gap-3">
      <Pressable className="rounded-lg bg-primary px-6 py-3" onPress={onStart}>
        <Text className="text-primary-foreground font-sans">Iniciar</Text>
      </Pressable>
      <Pressable className="rounded-lg bg-tertiary px-6 py-3" onPress={onReset}>
        <Text className="text-tertiary-foreground font-sans">Resetar</Text>
      </Pressable>
    </View>
  )
}
