import { useMemo } from 'react'
import { View } from 'react-native'
import Animated, {
  useAnimatedProps,
  useDerivedValue,
  withTiming,
} from 'react-native-reanimated'
import Svg, { Circle, G } from 'react-native-svg'

const AnimatedCircle = Animated.createAnimatedComponent(Circle)

interface CircularProgressProps {
  size: number
  strokeWidth: number
  totalSeconds: number
  remainingSeconds: number
  isWarning: boolean
  isPaused: boolean
}

export function CircularProgress({
  size,
  strokeWidth,
  totalSeconds,
  remainingSeconds,
  isWarning,
  isPaused,
}: CircularProgressProps) {
  const radius = useMemo(() => (size - strokeWidth) / 2, [size, strokeWidth])
  const circumference = useMemo(() => 2 * Math.PI * radius, [radius])
  const center = useMemo(() => size / 2, [size])

  const progress = useDerivedValue(() => {
    if (totalSeconds <= 0) {
      return 0
    }
    const value = remainingSeconds / totalSeconds
    if (value < 0) {
      return 0
    }
    if (value > 1) {
      return 1
    }
    return value
  }, [remainingSeconds, totalSeconds])

  const animatedProps = useAnimatedProps(() => {
    const p = progress.value
    const dashOffset = circumference * (1 - p)
    return {
      strokeDashoffset: withTiming(dashOffset, { duration: 250 }),
    }
  })

  const strokeColor = isWarning
    ? 'hsl(var(--progress-warning))'
    : 'hsl(var(--progress))'
  const opacity = isPaused ? 0.6 : 1

  return (
    <View style={{ width: size, height: size, opacity }}>
      <Svg width={size} height={size}>
        <G transform={`rotate(-90 ${center} ${center})`}>
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke="hsl(var(--border))"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <AnimatedCircle
            cx={center}
            cy={center}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={`${circumference}, ${circumference}`}
            strokeLinecap="round"
            animatedProps={animatedProps}
          />
        </G>
      </Svg>
    </View>
  )
}
