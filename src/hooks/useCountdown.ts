import { useCallback, useEffect, useRef, useState } from 'react'

interface UseCountdownOptions {
  onTick?: (seconds: number) => void
  onFinish?: () => void
  onLastFive?: (seconds: number) => void
}

export function useCountdown(initialSeconds: number, options: UseCountdownOptions = {}) {
  const { onTick, onFinish, onLastFive } = options

  const [seconds, setSeconds] = useState(initialSeconds)
  const [totalSeconds, setTotalSeconds] = useState(initialSeconds)
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isFinished, setIsFinished] = useState(false)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const onTickRef = useRef(onTick)
  const onFinishRef = useRef(onFinish)
  const onLastFiveRef = useRef(onLastFive)

  useEffect(() => {
    onTickRef.current = onTick
  }, [onTick])

  useEffect(() => {
    onFinishRef.current = onFinish
  }, [onFinish])

  useEffect(() => {
    onLastFiveRef.current = onLastFive
  }, [onLastFive])

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

    if (seconds <= 0) {
      return
    }

    setIsRunning(true)
    setIsPaused(false)
    setIsFinished(false)
  }, [isRunning, seconds])

  const pause = useCallback(() => {
    if (!isRunning) {
      return
    }
    setIsRunning(false)
    setIsPaused(true)
  }, [isRunning])

  const reset = useCallback(
    (nextSeconds?: number) => {
      clearTimer()
      const value = typeof nextSeconds === 'number' ? nextSeconds : initialSeconds
      setSeconds(value)
      setTotalSeconds(value)
      setIsRunning(false)
      setIsPaused(false)
      setIsFinished(false)
    },
    [clearTimer, initialSeconds]
  )

  const restart = useCallback(() => {
    clearTimer()
    setSeconds(totalSeconds)
    setIsRunning(true)
    setIsPaused(false)
    setIsFinished(false)
  }, [clearTimer, totalSeconds])

  const setTime = useCallback((nextSeconds: number) => {
    clearTimer()
    setSeconds(nextSeconds)
    setTotalSeconds(nextSeconds)
    setIsRunning(false)
    setIsPaused(false)
    setIsFinished(false)
  }, [clearTimer])

  useEffect(() => {
    if (!isRunning) {
      clearTimer()
      return
    }

    clearTimer()
    intervalRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearTimer()
          setIsRunning(false)
          setIsFinished(true)
          if (onFinishRef.current) {
            onFinishRef.current()
          }
          if (onTickRef.current) {
            onTickRef.current(0)
          }
          return 0
        }

        const next = prev - 1
        if (next <= 5 && next > 0) {
          if (onLastFiveRef.current) {
            onLastFiveRef.current(next)
          }
        }
        if (onTickRef.current) {
          onTickRef.current(next)
        }
        return next
      })
    }, 1000)

    return () => {
      clearTimer()
    }
  }, [clearTimer, isRunning])

  useEffect(() => {
    return () => {
      clearTimer()
    }
  }, [clearTimer])

  return {
    seconds,
    totalSeconds,
    isRunning,
    isPaused,
    isFinished,
    start,
    pause,
    reset,
    restart,
    setTime,
  }
}
