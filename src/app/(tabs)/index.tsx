import { Text, View, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { CircularProgress } from '../../components/timer/CircularProgress'
import { TimerDisplay } from '../../components/timer/TimerDisplay'
import { TimerControls } from '../../components/timer/TimerControls'
import { ProfileDrawer } from '../../components/profiles/ProfileDrawer'
import { ProfileForm } from '../../components/profiles/ProfileForm'
import { useBjjTimer } from '../../hooks/useBjjTimer'
import { useProfiles } from '../../hooks/useProfiles'

export default function TimerScreen() {
  const {
    phase,
    fightSeconds,
    phaseSeconds,
    countdown,
    isWarning,
    phaseLabel,
    handleStart,
    handlePause,
    handleReset,
    applyProfile,
  } = useBjjTimer()

  const {
    profiles,
    drawerVisible,
    formVisible,
    openDrawer,
    closeDrawer,
    openForm,
    closeForm,
    openFormFromDrawer,
    handleCreateProfile,
    handleDeleteProfile,
  } = useProfiles()

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center gap-6">
        <Text className="font-sans text-muted-foreground">{phaseLabel}</Text>
        <View className="items-center justify-center">
          <CircularProgress
            size={280}
            strokeWidth={14}
            totalSeconds={phaseSeconds || 1}
            remainingSeconds={countdown.remainingSeconds}
            isWarning={isWarning}
            isPaused={countdown.status === 'paused'}
          />
          <View className="absolute">
            <TimerDisplay
              mode="countdown"
              seconds={
                phase === 'idle' ? fightSeconds : countdown.remainingSeconds
              }
            />
          </View>
        </View>
        <TimerControls
          status={countdown.status}
          onStart={handleStart}
          onPause={handlePause}
          onReset={handleReset}
        />
        <View className="flex-row gap-2">
          <Pressable
            className="rounded-lg bg-secondary px-4 py-2"
            onPress={openDrawer}
          >
            <Text className="font-sans text-secondary-foreground">Perfis</Text>
          </Pressable>
          <Pressable
            className="rounded-lg bg-secondary px-4 py-2"
            onPress={openForm}
          >
            <Text className="font-sans text-secondary-foreground">
              Adicionar timer
            </Text>
          </Pressable>
        </View>
      </View>
      <ProfileDrawer
        visible={drawerVisible}
        profiles={profiles}
        onClose={closeDrawer}
        onSelect={(profile) => {
          applyProfile(profile)
          closeDrawer()
        }}
        onCreate={openFormFromDrawer}
        onDelete={handleDeleteProfile}
      />
      <ProfileForm
        visible={formVisible}
        onClose={closeForm}
        onSave={handleCreateProfile}
      />
    </SafeAreaView>
  )
}
