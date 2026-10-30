import { View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { TimerControls } from '../../components/timer/TimerControls'
import { TimerDisplay } from '../../components/timer/TimerDisplay'
import { useStopwatch } from '../../hooks/stopwatch/useStopwatch'
import { useKeepAwake } from '../../hooks/useKeepAwake'

export default function CronometroScreen() {
  const { elapsedMs, status, start, pause, reset } = useStopwatch()
  useKeepAwake(status === 'running')

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center gap-8">
        <TimerDisplay mode="stopwatch" elapsedMs={elapsedMs} />
        <TimerControls
          status={status}
          onStart={start}
          onPause={pause}
          onReset={reset}
        />
      </View>
    </SafeAreaView>
  )
}
