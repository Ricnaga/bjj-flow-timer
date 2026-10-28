import { SafeAreaView, Text, View, Pressable } from 'react-native'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useCountdown } from '../../hooks/useCountdown'
import { useKeepAwake } from '../../hooks/useKeepAwake'
import { CircularProgress } from '../../components/timer/CircularProgress'
import { TimerDisplay } from '../../components/timer/TimerDisplay'
import { TimerControls } from '../../components/timer/TimerControls'
import { loadSounds, playBeep, playFight } from '../../lib/audio/sounds'
import { deleteProfile, getProfiles, saveProfile, TimerProfile } from '../../lib/storage/profiles'
import { ProfileDrawer } from '../../components/profiles/ProfileDrawer'
import { ProfileForm } from '../../components/profiles/ProfileForm'

type Phase = 'idle' | 'prep' | 'fight' | 'rest' | 'finished'

export default function TimerScreen() {
  const [prepSeconds, setPrepSeconds] = useState(10)
  const [fightSeconds, setFightSeconds] = useState(300)
  const [restSeconds, setRestSeconds] = useState(60)
  const [rounds, setRounds] = useState(3)
  const [isInfinite, setIsInfinite] = useState(false)
  const [phase, setPhase] = useState<Phase>('idle')
  const [currentRound, setCurrentRound] = useState(1)
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [formVisible, setFormVisible] = useState(false)
  const [profiles, setProfiles] = useState<TimerProfile[]>([])

  const transitionRef = useRef(false)

  const phaseSeconds = useMemo(() => {
    if (phase === 'prep') return prepSeconds
    if (phase === 'fight') return fightSeconds
    if (phase === 'rest') return restSeconds
    return 0
  }, [fightSeconds, phase, prepSeconds, restSeconds])

  const handleFinish = useCallback(() => {
    if (transitionRef.current) {
      return
    }
    transitionRef.current = true

    if (phase === 'prep') {
      setPhase('fight')
      playFight()
      transitionRef.current = false
      return
    }

    if (phase === 'fight') {
      if (isInfinite) {
        setPhase('rest')
        transitionRef.current = false
        return
      }
      if (currentRound >= rounds) {
        setPhase('finished')
        transitionRef.current = false
        return
      }
      setPhase('rest')
      transitionRef.current = false
      return
    }

    if (phase === 'rest') {
      setCurrentRound((prev) => prev + 1)
      setPhase('fight')
      playFight()
      transitionRef.current = false
      return
    }

    transitionRef.current = false
  }, [currentRound, isInfinite, phase, rounds])

  const handleLastFive = useCallback(() => {
    playBeep()
  }, [])

  const countdown = useCountdown(phaseSeconds, {
    onFinish: handleFinish,
    onLastFive: handleLastFive,
  })

  useKeepAwake(countdown.isRunning && phase !== 'idle' && phase !== 'finished')

  useEffect(() => {
    loadSounds()
  }, [])

  useEffect(() => {
    if (phase === 'idle') {
      countdown.reset(0)
      return
    }
    if (phase === 'finished') {
      countdown.reset(0)
      return
    }
    transitionRef.current = false
    countdown.setTime(phaseSeconds)
    countdown.start()
  }, [phase, phaseSeconds, countdown])

  const isWarning = useMemo(() => {
    if (!countdown.isRunning) {
      return false
    }
    if (countdown.seconds <= 5 && countdown.seconds > 0) {
      return true
    }
    return false
  }, [countdown.isRunning, countdown.seconds])

  const handleStart = useCallback(() => {
    if (phase === 'idle') {
      setCurrentRound(1)
      setPhase('prep')
      return
    }
    countdown.start()
  }, [countdown, phase])

  const handlePause = useCallback(() => {
    countdown.pause()
  }, [countdown])

  const handleReset = useCallback(() => {
    setPhase('idle')
    setCurrentRound(1)
    transitionRef.current = false
    countdown.reset(0)
  }, [countdown])

  const loadProfiles = useCallback(async () => {
    const list = await getProfiles()
    setProfiles(list)
  }, [])

  useEffect(() => {
    loadProfiles()
  }, [loadProfiles])

  const handleSelectProfile = useCallback((profile: TimerProfile) => {
    setPrepSeconds(profile.prepTimeSeconds)
    setFightSeconds(profile.fightTimeSeconds)
    setRestSeconds(profile.restTimeSeconds)
    setRounds(profile.rounds)
    setIsInfinite(profile.isInfinite)
    setPhase('idle')
    setCurrentRound(1)
    setDrawerVisible(false)
  }, [])

  const handleCreateProfile = useCallback(
    async (data: {
      name: string
      prepTimeSeconds: number
      fightTimeSeconds: number
      restTimeSeconds: number
      rounds: number
      isInfinite: boolean
    }) => {
      const profile: TimerProfile = {
        id: `${Date.now()}`,
        name: data.name,
        prepTimeSeconds: data.prepTimeSeconds,
        fightTimeSeconds: data.fightTimeSeconds,
        restTimeSeconds: data.restTimeSeconds,
        rounds: data.rounds,
        isInfinite: data.isInfinite,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      await saveProfile(profile)
      await loadProfiles()
    },
    [loadProfiles]
  )

  const handleDeleteProfile = useCallback(
    async (id: string) => {
      await deleteProfile(id)
      await loadProfiles()
    },
    [loadProfiles]
  )

  const phaseLabel = useMemo(() => {
    if (phase === 'prep') return 'Tempo inicial'
    if (phase === 'fight') return `Round ${currentRound}${isInfinite ? ' (∞)' : ''}`
    if (phase === 'rest') return 'Descanso'
    if (phase === 'finished') return 'Finalizado'
    return 'Configurado'
  }, [currentRound, isInfinite, phase])

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center gap-6">
        <Text className="text-muted-foreground font-sans">{phaseLabel}</Text>
        <View className="items-center justify-center">
          <CircularProgress
            size={280}
            strokeWidth={14}
            totalSeconds={phaseSeconds || 1}
            remainingSeconds={countdown.seconds}
            isWarning={isWarning}
            isPaused={!countdown.isRunning && countdown.isPaused}
          />
          <View className="absolute">
            <TimerDisplay mode="countdown" seconds={phase === 'idle' ? fightSeconds : countdown.seconds} />
          </View>
        </View>
        <TimerControls
          isRunning={countdown.isRunning}
          isPaused={countdown.isPaused}
          onStart={handleStart}
          onPause={handlePause}
          onReset={handleReset}
        />
        <View className="flex-row gap-2">
          <Pressable className="rounded-lg bg-card px-4 py-2" onPress={() => setDrawerVisible(true)}>
            <Text className="text-foreground font-sans">Perfis</Text>
          </Pressable>
          <Pressable className="rounded-lg bg-card px-4 py-2" onPress={() => setFormVisible(true)}>
            <Text className="text-foreground font-sans">Adicionar timer</Text>
          </Pressable>
        </View>
      </View>
      <ProfileDrawer
        visible={drawerVisible}
        profiles={profiles}
        onClose={() => setDrawerVisible(false)}
        onSelect={handleSelectProfile}
        onCreate={() => {
          setDrawerVisible(false)
          setFormVisible(true)
        }}
        onDelete={handleDeleteProfile}
      />
      <ProfileForm visible={formVisible} onClose={() => setFormVisible(false)} onSave={handleCreateProfile} />
    </SafeAreaView>
  )
}
