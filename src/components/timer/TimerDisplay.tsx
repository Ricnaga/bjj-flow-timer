import { Text, View } from 'react-native'
import { formatCountdown, formatStopwatch } from '../../utils/time'

type TimerDisplayProps =
  | { mode: 'countdown'; seconds: number }
  | { mode: 'stopwatch'; elapsedMs: number }

export function TimerDisplay(props: TimerDisplayProps) {
  if (props.mode === 'stopwatch') {
    return (
      <View className="items-center justify-center">
        <Text className="font-display text-6xl tabular-nums text-foreground">
          {formatStopwatch(props.elapsedMs)}
        </Text>
      </View>
    )
  }

  return (
    <View className="items-center justify-center">
      <Text className="font-display text-7xl tabular-nums text-foreground">
        {formatCountdown(props.seconds)}
      </Text>
    </View>
  )
}
