import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import { useCountdown } from './countdown/useCountdown'
import { useKeepAwake } from './useKeepAwake'
import { loadSounds, playBeep, playFight } from '../lib/audio/sounds'

export type TimerPhase = 'idle' | 'prep' | 'fight' | 'rest' | 'finished'

export interface TimerSettings {
  prepSeconds: number
  fightSeconds: number
  restSeconds: number
  rounds: number
  isInfinite: boolean
}

interface TimerState extends TimerSettings {
  phase: TimerPhase
  currentRound: number
}

type TimerAction =
  | { type: 'setSettings'; settings: Partial<TimerSettings> }
  | { type: 'start' }
  | { type: 'nextPhase' }
  | { type: 'reset' }
  | { type: 'finishRound' }
  | { type: 'startRest' }

const initialState: TimerState = {
  prepSeconds: 10,
  fightSeconds: 300,
  restSeconds: 60,
  rounds: 3,
  isInfinite: false,
  phase: 'idle',
  currentRound: 1,
}

function timerReducer(state: TimerState, action: TimerAction): TimerState {
  switch (action.type) {
    case 'setSettings':
      return {
        ...state,
        ...action.settings,
        phase: 'idle',
        currentRound: 1,
      }

    case 'start':
      if (state.phase === 'idle') {
        return { ...state, phase: 'prep', currentRound: 1 }
      }
      return state

    case 'nextPhase':
      if (state.phase === 'prep') {
        return { ...state, phase: 'fight' }
      }

      if (state.phase === 'rest') {
        return {
          ...state,
          phase: 'fight',
          currentRound: state.currentRound + 1,
        }
      }

      return state

    case 'finishRound':
      if (state.phase !== 'fight') {
        return state
      }

      if (state.isInfinite) {
        return { ...state, phase: 'rest' }
      }

      if (state.currentRound >= state.rounds) {
        return { ...state, phase: 'finished' }
      }

      return { ...state, phase: 'rest' }

    case 'reset':
      return { ...state, phase: 'idle', currentRound: 1 }

    default:
      return state
  }
}

export function useBjjTimer() {
  const [state, dispatch] = useReducer(timerReducer, initialState)
  const transitionRef = useRef(false)

  useEffect(() => {
    loadSounds()
  }, [])

  const phaseSeconds = useMemo(() => {
    if (state.phase === 'prep') return state.prepSeconds
    if (state.phase === 'fight') return state.fightSeconds
    if (state.phase === 'rest') return state.restSeconds
    return 0
  }, [state.fightSeconds, state.phase, state.prepSeconds, state.restSeconds])

  const handleFinish = useCallback(() => {
    if (transitionRef.current) {
      return
    }
    transitionRef.current = true

    if (state.phase === 'prep') {
      dispatch({ type: 'nextPhase' })
      playFight()
      transitionRef.current = false
      return
    }

    if (state.phase === 'fight') {
      dispatch({ type: 'finishRound' })
      if (state.isInfinite || state.currentRound < state.rounds) {
        playFight()
      }
      transitionRef.current = false
      return
    }

    if (state.phase === 'rest') {
      dispatch({ type: 'nextPhase' })
      playFight()
      transitionRef.current = false
      return
    }

    transitionRef.current = false
  }, [state.currentRound, state.isInfinite, state.phase, state.rounds])

  const handleLastFive = useCallback(() => {
    playBeep()
  }, [])

  const countdown = useCountdown(phaseSeconds, {
    onFinish: handleFinish,
    onLastFive: handleLastFive,
  })

  useKeepAwake(countdown.status === 'running')

  const resetCountdown = countdown.reset
  const startCountdown = countdown.startFrom

  useEffect(() => {
    if (state.phase === 'idle' || state.phase === 'finished') {
      resetCountdown(0)
      return
    }
    transitionRef.current = false
    startCountdown(phaseSeconds)
  }, [phaseSeconds, resetCountdown, startCountdown, state.phase])

  const isWarning = useMemo(() => {
    if (countdown.status !== 'running') {
      return false
    }
    if (countdown.remainingSeconds <= 5 && countdown.remainingSeconds > 0) {
      return true
    }
    return false
  }, [countdown.remainingSeconds, countdown.status])

  const handleStart = useCallback(() => {
    if (state.phase === 'idle') {
      dispatch({ type: 'start' })
      return
    }
    countdown.start()
  }, [countdown, state.phase])

  const handlePause = useCallback(() => {
    countdown.pause()
  }, [countdown])

  const handleReset = useCallback(() => {
    transitionRef.current = false
    dispatch({ type: 'reset' })
    countdown.reset(0)
  }, [countdown])

  const applyProfile = useCallback(
    (profile: {
      prepTimeSeconds: number
      fightTimeSeconds: number
      restTimeSeconds: number
      rounds: number
      isInfinite: boolean
    }) => {
      dispatch({ type: 'setSettings', settings: profile })
      countdown.reset(0)
    },
    [countdown],
  )

  const phaseLabel = useMemo(() => {
    if (state.phase === 'prep') return 'Tempo inicial'
    if (state.phase === 'fight')
      return `Round ${state.currentRound}${state.isInfinite ? ' (∞)' : ''}`
    if (state.phase === 'rest') return 'Descanso'
    if (state.phase === 'finished') return 'Finalizado'
    return 'Configurado'
  }, [state.currentRound, state.isInfinite, state.phase])

  return {
    ...state,
    phaseSeconds,
    countdown,
    isWarning,
    phaseLabel,
    handleStart,
    handlePause,
    handleReset,
    applyProfile,
  }
}
