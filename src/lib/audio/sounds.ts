import {
  createAudioPlayer,
  setAudioModeAsync,
  type AudioPlayer,
} from 'expo-audio'

let beepSound: AudioPlayer | null = null
let fightSound: AudioPlayer | null = null
let loaded = false

export async function loadSounds() {
  if (loaded) {
    return
  }

  try {
    await setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      interruptionMode: 'duckOthers',
    })

    beepSound = createAudioPlayer(require('../../../assets/beep.wav'))
    fightSound = createAudioPlayer(require('../../../assets/fight_sound.wav'))

    loaded = true
  } catch (error) {
    console.warn('Erro ao carregar sons:', error)
  }
}

async function replay(player: AudioPlayer | null) {
  if (!player) {
    return
  }
  await player.seekTo(0)
  player.play()
}

export async function playBeep() {
  try {
    await replay(beepSound)
  } catch (error) {
    console.warn('Erro ao tocar beep:', error)
  }
}

export async function playFight() {
  try {
    await replay(fightSound)
  } catch (error) {
    console.warn('Erro ao tocar fight sound:', error)
  }
}

export async function unloadSounds() {
  try {
    beepSound?.remove()
    fightSound?.remove()
    beepSound = null
    fightSound = null
    loaded = false
  } catch (error) {
    console.warn('Erro ao descarregar sons:', error)
  }
}
