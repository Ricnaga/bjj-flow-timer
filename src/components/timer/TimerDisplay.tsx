import { Text, View } from 'react-native'
import { formatCountdown, formatStopwatch } from '../../utils/time'

interface TimerDisplayProps {
  mode: 'countdown' | 'stopwatch'
  seconds?: number
  elapsedMs?: number
}

export function TimerDisplay({ mode, seconds = 0, elapsedMs = 0 }: TimerDisplayProps) {
  if (mode === 'stopwatch') {
    return (
      <View className="items-center justify-center">
        <Text className="font-display text-6xl text-foreground tabular-nums">
          {formatStopwatch(elapsedMs)}
        </Text>
      </View>
    )
  }

  return (
    <View className="items-center justify-center">
      <Text className="font-display text-7xl text-foreground tabular-nums">
        {formatCountdown(seconds)}
      </Text>
    </View>
  )
}
