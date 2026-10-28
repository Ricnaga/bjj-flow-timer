import { useCallback, useEffect, useRef, useState } from 'react'

export function useStopwatch() {
  const [elapsedMs, setElapsedMs] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  const startTimeRef = useRef<number | null>(null)
  const accumulatedRef = useRef(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const start = useCallback(() => {
    if (isRunning) {
      return
    }

    startTimeRef.current = Date.now()
    setIsRunning(true)
    setIsPaused(false)

    clearTimer()
    intervalRef.current = setInterval(() => {
      if (startTimeRef.current === null) {
        return
      }
      const now = Date.now()
      const diff = now - startTimeRef.current
      setElapsedMs(accumulatedRef.current + diff)
    }, 10)
  }, [clearTimer, isRunning])

  const pause = useCallback(() => {
    if (!isRunning) {
      return
    }

    if (startTimeRef.current !== null) {
      accumulatedRef.current = accumulatedRef.current + (Date.now() - startTimeRef.current)
      startTimeRef.current = null
    }

    clearTimer()
    setIsRunning(false)
    setIsPaused(true)
  }, [clearTimer, isRunning])

  const reset = useCallback(() => {
    clearTimer()
    startTimeRef.current = null
    accumulatedRef.current = 0
    setElapsedMs(0)
    setIsRunning(false)
    setIsPaused(false)
  }, [clearTimer])

  useEffect(() => {
    return () => {
      clearTimer()
    }
  }, [clearTimer])

  return {
    elapsedMs,
    isRunning,
    isPaused,
    start,
    pause,
    reset,
  }
}
