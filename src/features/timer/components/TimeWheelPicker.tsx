import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ScrollView, Text, View } from 'react-native'

interface TimeWheelPickerProps {
  label: string
  minutes: number
  seconds: number
  onChangeMinutes: (minutes: number) => void
  onChangeSeconds: (seconds: number) => void
  maxMinutes?: number
  maxSeconds?: number
}

const ITEM_HEIGHT = 36
const VISIBLE_ITEMS = 3
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS
const PADDING_VERTICAL = ITEM_HEIGHT * ((VISIBLE_ITEMS - 1) / 2)

function createRange(max: number): number[] {
  const result: number[] = []
  for (let i = 0; i <= max; i += 1) {
    result.push(i)
  }
  return result
}

function formatNumber(value: number): string {
  return value.toString().padStart(2, '0')
}

export function TimeWheelPicker({
  label,
  minutes,
  seconds,
  onChangeMinutes,
  onChangeSeconds,
  maxMinutes = 10,
  maxSeconds = 59,
}: TimeWheelPickerProps) {
  const minuteList = useMemo(() => createRange(maxMinutes), [maxMinutes])
  const secondList = useMemo(() => createRange(maxSeconds), [maxSeconds])

  const minuteScrollRef = useRef<any>(null)
  const secondScrollRef = useRef<any>(null)
  const [isInitializing, setIsInitializing] = useState(true)
  const lastMinuteIndex = useRef(0)
  const lastSecondIndex = useRef(0)

  const clampIndex = useCallback((index: number, listLength: number) => {
    if (listLength <= 0) return 0
    if (index < 0) return 0
    if (index >= listLength) return listLength - 1
    return index
  }, [])

  useEffect(() => {
    const minuteIndex = minuteList.indexOf(minutes)
    const secondIndex = secondList.indexOf(seconds)
    const safeMinuteIndex = minuteIndex >= 0 ? minuteIndex : 0
    const safeSecondIndex = secondIndex >= 0 ? secondIndex : 0

    const timeout = setTimeout(() => {
      minuteScrollRef.current?.scrollTo({
        y: safeMinuteIndex * ITEM_HEIGHT,
        animated: false,
      })
      secondScrollRef.current?.scrollTo({
        y: safeSecondIndex * ITEM_HEIGHT,
        animated: false,
      })
      lastMinuteIndex.current = safeMinuteIndex
      lastSecondIndex.current = safeSecondIndex
      setIsInitializing(false)
    }, 50)

    return () => clearTimeout(timeout)
  }, [minuteList, minutes, secondList, seconds])

  const handleMinuteMomentumEnd = useCallback(
    (event: any) => {
      if (isInitializing) return
      const offsetY = event.nativeEvent.contentOffset.y
      const index = Math.round(offsetY / ITEM_HEIGHT)
      const clamped = clampIndex(index, minuteList.length)

      if (clamped !== index) {
        minuteScrollRef.current?.scrollTo({
          y: clamped * ITEM_HEIGHT,
          animated: true,
        })
        return
      }

      if (clamped !== lastMinuteIndex.current) {
        lastMinuteIndex.current = clamped
        const value = minuteList[clamped]
        if (value !== undefined && value !== minutes) {
          onChangeMinutes(value)
        }
      }
    },
    [clampIndex, isInitializing, minuteList, minutes, onChangeMinutes],
  )

  const handleSecondMomentumEnd = useCallback(
    (event: any) => {
      if (isInitializing) return
      const offsetY = event.nativeEvent.contentOffset.y
      const index = Math.round(offsetY / ITEM_HEIGHT)
      const clamped = clampIndex(index, secondList.length)

      if (clamped !== index) {
        secondScrollRef.current?.scrollTo({
          y: clamped * ITEM_HEIGHT,
          animated: true,
        })
        return
      }

      if (clamped !== lastSecondIndex.current) {
        lastSecondIndex.current = clamped
        const value = secondList[clamped]
        if (value !== undefined && value !== seconds) {
          onChangeSeconds(value)
        }
      }
    },
    [clampIndex, isInitializing, onChangeSeconds, secondList, seconds],
  )

  return (
    <View className="gap-2">
      <Text className="font-sans text-xs text-muted-foreground">{label}</Text>
      <View className="relative flex-row items-center rounded-lg border border-border bg-background/40">
        <View
          pointerEvents="none"
          className="absolute left-0 right-0 top-1/2 -mt-5 h-10 border-y border-border/60"
        />
        <View className="flex-1 items-center">
          <Text className="mb-1 font-sans text-[10px] uppercase tracking-widest text-muted-foreground">
            Min
          </Text>
          <ScrollView
            ref={minuteScrollRef}
            showsVerticalScrollIndicator={false}
            snapToInterval={ITEM_HEIGHT}
            decelerationRate="fast"
            bounces={false}
            overScrollMode="never"
            onMomentumScrollEnd={handleMinuteMomentumEnd}
            contentContainerStyle={{ paddingVertical: PADDING_VERTICAL }}
            style={{ height: PICKER_HEIGHT, width: '100%' }}
            nestedScrollEnabled
          >
            {minuteList.map((item) => (
              <View
                key={`min-${item}`}
                style={{ height: ITEM_HEIGHT }}
                className="items-center justify-center"
              >
                <Text className="font-display text-2xl text-foreground">
                  {formatNumber(item)}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
        <Text className="font-display text-xl text-foreground">:</Text>
        <View className="flex-1 items-center">
          <Text className="mb-1 font-sans text-[10px] uppercase tracking-widest text-muted-foreground">
            Seg
          </Text>
          <ScrollView
            ref={secondScrollRef}
            showsVerticalScrollIndicator={false}
            snapToInterval={ITEM_HEIGHT}
            decelerationRate="fast"
            bounces={false}
            overScrollMode="never"
            onMomentumScrollEnd={handleSecondMomentumEnd}
            contentContainerStyle={{ paddingVertical: PADDING_VERTICAL }}
            style={{ height: PICKER_HEIGHT, width: '100%' }}
            nestedScrollEnabled
          >
            {secondList.map((item) => (
              <View
                key={`sec-${item}`}
                style={{ height: ITEM_HEIGHT }}
                className="items-center justify-center"
              >
                <Text className="font-display text-2xl text-foreground">
                  {formatNumber(item)}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </View>
  )
}
