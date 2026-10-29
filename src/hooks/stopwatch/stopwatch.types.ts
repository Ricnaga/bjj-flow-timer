import type { TimerStatus } from '../timer.types'

export type StopwatchStatus = Exclude<TimerStatus, 'finished'>

export interface StopwatchState {
  status: StopwatchStatus
  elapsedMs: number
}

export interface StopwatchRuntime {
  intervalId: ReturnType<typeof setInterval> | null
  startedAt: number | null
  accumulatedMs: number
}

export interface StopwatchResult extends StopwatchState {
  isRunning: boolean
  isPaused: boolean
  start: () => void
  pause: () => void
  reset: () => void
}
