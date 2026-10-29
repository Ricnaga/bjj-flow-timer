import { useCallback, useEffect, useReducer, useRef } from 'react'
import type {
  StopwatchResult,
  StopwatchRuntime,
  StopwatchState,
} from './stopwatch.types'

type StopwatchAction =
  { type: 'pause' | 'tick'; elapsedMs: number } | { type: 'start' | 'reset' }

const initialState: StopwatchState = {
  status: 'idle',
  elapsedMs: 0,
}

function stopwatchReducer(
  state: StopwatchState,
  action: StopwatchAction,
): StopwatchState {
  switch (action.type) {
    case 'start':
      if (state.status === 'running') {
        return state
      }

      return { ...state, status: 'running' }

    case 'pause':
      if (state.status !== 'running') {
        return state
      }

      return {
        ...state,
        status: 'paused',
        elapsedMs: action.elapsedMs,
      }

    case 'tick':
      if (state.status !== 'running') {
        return state
      }

      return { ...state, elapsedMs: action.elapsedMs }

    case 'reset':
      return initialState
  }
}

export function useStopwatch(): StopwatchResult {
  const [state, dispatch] = useReducer(stopwatchReducer, initialState)
  const runtimeRef = useRef<StopwatchRuntime>({
    intervalId: null,
    startedAt: null,
    accumulatedMs: 0,
  })

  const clearTimer = useCallback(() => {
    if (runtimeRef.current.intervalId) {
      clearInterval(runtimeRef.current.intervalId)
      runtimeRef.current.intervalId = null
    }
  }, [])

  const start = useCallback(() => {
    if (state.status === 'running') {
      return
    }

    runtimeRef.current.startedAt = Date.now()
    dispatch({ type: 'start' })
  }, [state.status])

  const pause = useCallback(() => {
    if (state.status !== 'running' || runtimeRef.current.startedAt === null) {
      return
    }

    const elapsedMs =
      runtimeRef.current.accumulatedMs +
      (Date.now() - runtimeRef.current.startedAt)
    runtimeRef.current.accumulatedMs = elapsedMs
    runtimeRef.current.startedAt = null
    dispatch({ type: 'pause', elapsedMs })
  }, [state.status])

  const reset = useCallback(() => {
    clearTimer()
    runtimeRef.current.startedAt = null
    runtimeRef.current.accumulatedMs = 0
    dispatch({ type: 'reset' })
  }, [clearTimer])

  useEffect(() => {
    if (state.status !== 'running') {
      clearTimer()
      return
    }

    clearTimer()
    runtimeRef.current.intervalId = setInterval(() => {
      const { startedAt, accumulatedMs } = runtimeRef.current

      if (startedAt === null) {
        return
      }

      dispatch({
        type: 'tick',
        elapsedMs: accumulatedMs + (Date.now() - startedAt),
      })
    }, 10)

    return clearTimer
  }, [clearTimer, state.status])

  return {
    ...state,
    isRunning: state.status === 'running',
    isPaused: state.status === 'paused',
    start,
    pause,
    reset,
  }
}
