import { Pressable, Text, View } from 'react-native'
import type { TimerStatus } from '../../hooks/timer.types'

interface TimerControlsProps {
  status: TimerStatus
  onStart: VoidFunction
  onPause: VoidFunction
  onReset: VoidFunction
}

export function TimerControls({
  status,
  onStart,
  onPause,
  onReset,
}: TimerControlsProps) {
  if (status === 'running') {
    return (
      <View className="flex-row gap-3">
        <Pressable
          className="rounded-lg bg-secondary px-6 py-3"
          onPress={onPause}
        >
          <Text className="font-sans text-secondary-foreground">Pausar</Text>
        </Pressable>
        <Pressable
          className="rounded-lg bg-tertiary px-6 py-3"
          onPress={onReset}
        >
          <Text className="font-sans text-tertiary-foreground">Resetar</Text>
        </Pressable>
      </View>
    )
  }

  if (status === 'paused') {
    return (
      <View className="flex-row gap-3">
        <Pressable
          className="rounded-lg bg-primary px-6 py-3"
          onPress={onStart}
        >
          <Text className="font-sans text-primary-foreground">Continuar</Text>
        </Pressable>
        <Pressable
          className="rounded-lg bg-tertiary px-6 py-3"
          onPress={onReset}
        >
          <Text className="font-sans text-tertiary-foreground">Resetar</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <View className="flex-row gap-3">
      <Pressable className="rounded-lg bg-primary px-6 py-3" onPress={onStart}>
        <Text className="font-sans text-primary-foreground">Iniciar</Text>
      </Pressable>
      <Pressable className="rounded-lg bg-tertiary px-6 py-3" onPress={onReset}>
        <Text className="font-sans text-tertiary-foreground">Resetar</Text>
      </Pressable>
    </View>
  )
}
