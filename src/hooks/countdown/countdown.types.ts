import type { TimerStatus } from '../timer.types'

export interface CountdownOptions {
  onTick?: (seconds: number) => void
  onFinish?: () => void
  onLastFive?: (seconds: number) => void
}

export interface CountdownState {
  status: TimerStatus
  remainingSeconds: number
  totalSeconds: number
}

export interface CountdownRuntime {
  intervalId: ReturnType<typeof setInterval> | null
  remainingSeconds: number
  callbacks: CountdownOptions
}

export interface CountdownResult extends CountdownState {
  isRunning: boolean
  isPaused: boolean
  isFinished: boolean
  start: () => void
  pause: () => void
  reset: (seconds?: number) => void
  restart: () => void
  startFrom: (seconds: number) => void
  setTime: (seconds: number) => void
}
