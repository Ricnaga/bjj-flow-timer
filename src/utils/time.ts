export function formatStopwatch(ms: number): string {
  if (ms < 0) {
    return '00:00:000'
  }

  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const milliseconds = ms % 1000

  const mm = String(minutes).padStart(2, '0')
  const ss = String(seconds).padStart(2, '0')
  const mmm = String(milliseconds).padStart(3, '0')

  return `${mm}:${ss}:${mmm}`
}

export function formatCountdown(totalSeconds: number): string {
  if (totalSeconds < 0) {
    return '00:00'
  }

  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  const mm = String(minutes).padStart(2, '0')
  const ss = String(seconds).padStart(2, '0')

  return `${mm}:${ss}`
}

export function secondsToMs(seconds: number): number {
  if (seconds < 0) {
    return 0
  }
  return seconds * 1000
}

export function msToSeconds(ms: number): number {
  if (ms < 0) {
    return 0
  }
  return Math.floor(ms / 1000)
}
