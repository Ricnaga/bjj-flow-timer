import { View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useStopwatch } from '../../hooks/useStopwatch'
import { useKeepAwake } from '../../hooks/useKeepAwake'
import { TimerDisplay } from '../../components/timer/TimerDisplay'
import { TimerControls } from '../../components/timer/TimerControls'

export default function CronometroScreen() {
  const { elapsedMs, isRunning, isPaused, start, pause, reset } = useStopwatch()
  useKeepAwake(isRunning)

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center gap-8">
        <TimerDisplay mode="stopwatch" elapsedMs={elapsedMs} />
        <TimerControls
          isRunning={isRunning}
          isPaused={isPaused}
          onStart={start}
          onPause={pause}
          onReset={reset}
        />
      </View>
    </SafeAreaView>
  )
}
