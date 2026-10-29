import { useCallback, useEffect, useReducer, useRef } from 'react'
import type {
  CountdownOptions,
  CountdownResult,
  CountdownRuntime,
  CountdownState,
} from './countdown.types'

const COUNTDOWN_TYPE = {
  RESET: 'RESET',
  SET_TIME: 'SET_TIME',
  START_FROM: 'START_FROM',
  START: 'START',
  PAUSE: 'PAUSE',
  RESTART: 'RESTART',
  TICK: 'TICK',
} as const

type CountdownAction =
  | {
      type:
        | typeof COUNTDOWN_TYPE.RESET
        | typeof COUNTDOWN_TYPE.SET_TIME
        | typeof COUNTDOWN_TYPE.START_FROM
      seconds: number
    }
  | {
      type:
        | typeof COUNTDOWN_TYPE.START
        | typeof COUNTDOWN_TYPE.PAUSE
        | typeof COUNTDOWN_TYPE.RESTART
        | typeof COUNTDOWN_TYPE.TICK
    }
function createInitialState(seconds: number): CountdownState {
  return {
    status: 'idle',
    remainingSeconds: seconds,
    totalSeconds: seconds,
  }
}

function countdownReducer(
  state: CountdownState,
  action: CountdownAction,
): CountdownState {
  switch (action.type) {
    case COUNTDOWN_TYPE.START:
      if (state.status === 'running' || state.remainingSeconds <= 0) {
        return state
      }

      return { ...state, status: 'running' }

    case COUNTDOWN_TYPE.PAUSE:
      if (state.status !== 'running') {
        return state
      }

      return { ...state, status: 'paused' }

    case COUNTDOWN_TYPE.RESET:
      return createInitialState(action.seconds)

    case COUNTDOWN_TYPE.RESTART:
      if (state.totalSeconds <= 0) {
        return state
      }

      return {
        ...state,
        status: 'running',
        remainingSeconds: state.totalSeconds,
      }

    case COUNTDOWN_TYPE.SET_TIME:
      return createInitialState(action.seconds)

    case COUNTDOWN_TYPE.START_FROM:
      if (action.seconds <= 0) {
        return state
      }

      return {
        status: 'running',
        remainingSeconds: action.seconds,
        totalSeconds: action.seconds,
      }

    case COUNTDOWN_TYPE.TICK:
      if (state.status !== 'running') {
        return state
      }

      if (state.remainingSeconds <= 1) {
        return { ...state, status: 'finished', remainingSeconds: 0 }
      }

      return {
        ...state,
        remainingSeconds: state.remainingSeconds - 1,
      }
  }
}

export function useCountdown(
  initialSeconds: number,
  options: CountdownOptions = {},
): CountdownResult {
  const { onTick, onFinish, onLastFive } = options
  const [state, dispatch] = useReducer(
    countdownReducer,
    initialSeconds,
    createInitialState,
  )
  const runtimeRef = useRef<CountdownRuntime>({
    intervalId: null,
    remainingSeconds: initialSeconds,
    callbacks: {},
  })

  const clearTimer = useCallback(() => {
    if (runtimeRef.current.intervalId) {
      clearInterval(runtimeRef.current.intervalId)
      runtimeRef.current.intervalId = null
    }
  }, [])

  useEffect(() => {
    runtimeRef.current.callbacks = { onTick, onFinish, onLastFive }
  }, [onFinish, onLastFive, onTick])

  useEffect(() => {
    runtimeRef.current.remainingSeconds = state.remainingSeconds
  }, [state.remainingSeconds])

  useEffect(() => {
    if (state.status !== 'running') {
      clearTimer()
      return
    }

    clearTimer()
    runtimeRef.current.intervalId = setInterval(() => {
      const current = runtimeRef.current.remainingSeconds

      if (current <= 1) {
        runtimeRef.current.remainingSeconds = 0
        dispatch({ type: COUNTDOWN_TYPE.TICK })
        runtimeRef.current.callbacks.onFinish?.()
        runtimeRef.current.callbacks.onTick?.(0)
        return
      }

      const next = current - 1
      runtimeRef.current.remainingSeconds = next
      dispatch({ type: COUNTDOWN_TYPE.TICK })

      if (next <= 5) {
        runtimeRef.current.callbacks.onLastFive?.(next)
      }

      runtimeRef.current.callbacks.onTick?.(next)
    }, 1000)

    return clearTimer
  }, [clearTimer, state.status])

  const start = useCallback(() => {
    dispatch({ type: COUNTDOWN_TYPE.START })
  }, [])

  const pause = useCallback(() => {
    dispatch({ type: COUNTDOWN_TYPE.PAUSE })
  }, [])

  const reset = useCallback(
    (seconds?: number) => {
      dispatch({
        type: COUNTDOWN_TYPE.RESET,
        seconds: typeof seconds === 'number' ? seconds : initialSeconds,
      })
    },
    [initialSeconds],
  )

  const restart = useCallback(() => {
    dispatch({ type: COUNTDOWN_TYPE.RESTART })
  }, [])

  const startFrom = useCallback((seconds: number) => {
    dispatch({ type: COUNTDOWN_TYPE.START_FROM, seconds })
  }, [])

  const setTime = useCallback((seconds: number) => {
    dispatch({ type: COUNTDOWN_TYPE.SET_TIME, seconds })
  }, [])

  return {
    ...state,
    isRunning: state.status === 'running',
    isPaused: state.status === 'paused',
    isFinished: state.status === 'finished',
    start,
    pause,
    reset,
    restart,
    startFrom,
    setTime,
  }
}
