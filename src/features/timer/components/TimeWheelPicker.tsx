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

const ITEM_HEIGHT = 36
const VISIBLE_ITEMS = 3
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
  const lastMinuteIndex = useRef(0)
  const lastSecondIndex = useRef(0)

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
      lastMinuteIndex.current = safeMinuteIndex
      lastSecondIndex.current = safeSecondIndex
      setIsInitializing(false)
    }, 50)

    return () => clearTimeout(timeout)
  }, [minuteList, minutes, secondList, seconds])

  const clampIndex = useCallback((index: number, listLength: number) => {
    if (index < 0) return 0
    if (index >= listLength) return listLength - 1
    return index
  }, [])

  const onMinuteMomentumScrollEnd = useCallback(
    (event: any) => {
      if (isInitializing) return
      const offsetY = event.nativeEvent.contentOffset.y
      const index = Math.round(offsetY / ITEM_HEIGHT)
      const clamped = clampIndex(index, minuteList.length)

      if (clamped !== index) {
        minuteListRef.current?.scrollToIndex({
          index: clamped,
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

  const onSecondMomentumScrollEnd = useCallback(
    (event: any) => {
      if (isInitializing) return
      const offsetY = event.nativeEvent.contentOffset.y
      const index = Math.round(offsetY / ITEM_HEIGHT)
      const clamped = clampIndex(index, secondList.length)

      if (clamped !== index) {
        secondListRef.current?.scrollToIndex({
          index: clamped,
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

  const onMinuteViewableItemsChanged = useCallback(
    (info: any) => {
      if (isInitializing) return
      const viewableItems = info.viewableItems as ViewTokenType[]
      const centerItem = viewableItems.find(
        (item) => item.index !== null && item.index !== undefined,
      )
      if (!centerItem || centerItem.index == null) return
      lastMinuteIndex.current = centerItem.index
    },
    [isInitializing],
  )

  const onSecondViewableItemsChanged = useCallback(
    (info: any) => {
      if (isInitializing) return
      const viewableItems = info.viewableItems as ViewTokenType[]
      const centerItem = viewableItems.find(
        (item) => item.index !== null && item.index !== undefined,
      )
      if (!centerItem || centerItem.index == null) return
      lastSecondIndex.current = centerItem.index
    },
    [isInitializing],
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
            bounces={false}
            overScrollMode="never"
            getItemLayout={getItemLayout}
            onViewableItemsChanged={onMinuteViewableItemsChanged}
            onMomentumScrollEnd={onMinuteMomentumScrollEnd}
            viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
            contentContainerStyle={{
              paddingVertical: (ITEM_HEIGHT * (VISIBLE_ITEMS - 1)) / 2,
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
            bounces={false}
            overScrollMode="never"
            getItemLayout={getItemLayout}
            onViewableItemsChanged={onSecondViewableItemsChanged}
            onMomentumScrollEnd={onSecondMomentumScrollEnd}
            viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
            contentContainerStyle={{
              paddingVertical: (ITEM_HEIGHT * (VISIBLE_ITEMS - 1)) / 2,
            }}
            style={{ height: PICKER_HEIGHT, width: '100%' }}
          />
        </View>
      </View>
    </View>
  )
}
