import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FlatList, Text, View } from 'react-native'

type ViewTokenType = {
  item: number
  key: string
  index: number | null
  isViewable: boolean
}

interface TimeWheelPickerProps {
  label: string
  minutes: number
  seconds: number
  onChangeMinutes: (minutes: number) => void
  onChangeSeconds: (seconds: number) => void
  maxMinutes?: number
  maxSeconds?: number
}

const ITEM_HEIGHT = 40
const VISIBLE_ITEMS = 5
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS

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

  const minuteListRef = useRef<FlatList<number>>(null)
  const secondListRef = useRef<FlatList<number>>(null)
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    const minuteIndex = minuteList.indexOf(minutes)
    const secondIndex = secondList.indexOf(seconds)
    const safeMinuteIndex = minuteIndex >= 0 ? minuteIndex : 0
    const safeSecondIndex = secondIndex >= 0 ? secondIndex : 0

    const timeout = setTimeout(() => {
      minuteListRef.current?.scrollToIndex({
        index: safeMinuteIndex,
        animated: false,
      })
      secondListRef.current?.scrollToIndex({
        index: safeSecondIndex,
        animated: false,
      })
      setIsInitializing(false)
    }, 50)

    return () => clearTimeout(timeout)
  }, [minuteList, minutes, secondList, seconds])

  const onMinuteViewableItemsChanged = useCallback(
    (info: any) => {
      if (isInitializing) return
      const viewableItems = info.viewableItems as ViewTokenType[]
      const centerItem = viewableItems.find(
        (item) => item.index !== null && item.index !== undefined,
      )
      if (!centerItem || centerItem.index == null) return
      const value = minuteList[centerItem.index]
      if (value === undefined || value === minutes) return
      onChangeMinutes(value)
    },
    [isInitializing, minuteList, minutes, onChangeMinutes],
  )

  const onSecondViewableItemsChanged = useCallback(
    (info: any) => {
      if (isInitializing) return
      const viewableItems = info.viewableItems as ViewTokenType[]
      const centerItem = viewableItems.find(
        (item) => item.index !== null && item.index !== undefined,
      )
      if (!centerItem || centerItem.index == null) return
      const value = secondList[centerItem.index]
      if (value === undefined || value === seconds) return
      onChangeSeconds(value)
    },
    [isInitializing, onChangeSeconds, secondList, seconds],
  )

  const renderItem = useCallback(
    ({ item }: { item: number }) => (
      <View
        style={{ height: ITEM_HEIGHT }}
        className="items-center justify-center"
      >
        <Text className="font-display text-2xl text-foreground">
          {formatNumber(item)}
        </Text>
      </View>
    ),
    [],
  )

  const getItemLayout = useCallback(
    (_: ArrayLike<number> | null | undefined, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    [],
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
          <FlatList
            ref={minuteListRef}
            data={minuteList}
            keyExtractor={(item) => `min-${item}`}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            snapToInterval={ITEM_HEIGHT}
            decelerationRate="fast"
            getItemLayout={getItemLayout}
            onViewableItemsChanged={onMinuteViewableItemsChanged}
            viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
            contentContainerStyle={{
              paddingVertical: ITEM_HEIGHT * 2,
            }}
            style={{ height: PICKER_HEIGHT, width: '100%' }}
          />
        </View>
        <Text className="font-display text-xl text-foreground">:</Text>
        <View className="flex-1 items-center">
          <Text className="mb-1 font-sans text-[10px] uppercase tracking-widest text-muted-foreground">
            Seg
          </Text>
          <FlatList
            ref={secondListRef}
            data={secondList}
            keyExtractor={(item) => `sec-${item}`}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            snapToInterval={ITEM_HEIGHT}
            decelerationRate="fast"
            getItemLayout={getItemLayout}
            onViewableItemsChanged={onSecondViewableItemsChanged}
            viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
            contentContainerStyle={{
              paddingVertical: ITEM_HEIGHT * 2,
            }}
            style={{ height: PICKER_HEIGHT, width: '100%' }}
          />
        </View>
      </View>
    </View>
  )
}
