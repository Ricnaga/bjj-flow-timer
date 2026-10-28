import { Audio } from 'expo-av'
import { Asset } from 'expo-asset'

let beepSound: Audio.Sound | null = null
let fightSound: Audio.Sound | null = null
let loaded = false

export async function loadSounds() {
  if (loaded) {
    return
  }

  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    })

    const beepAsset = Asset.fromModule(require('../../../assets/beep.wav'))
    const fightAsset = Asset.fromModule(require('../../../assets/fight_sound.wav'))

    await beepAsset.downloadAsync()
    await fightAsset.downloadAsync()

    const beepResult = await Audio.Sound.createAsync(beepAsset, { shouldPlay: false })
    const fightResult = await Audio.Sound.createAsync(fightAsset, { shouldPlay: false })

    beepSound = beepResult.sound
    fightSound = fightResult.sound
    loaded = true
  } catch (error) {
    console.warn('Erro ao carregar sons:', error)
  }
}

export async function playBeep() {
  try {
    if (!beepSound) {
      return
    }
    await beepSound.setPositionAsync(0)
    await beepSound.playAsync()
  } catch (error) {
    console.warn('Erro ao tocar beep:', error)
  }
}

export async function playFight() {
  try {
    if (!fightSound) {
      return
    }
    await fightSound.setPositionAsync(0)
    await fightSound.playAsync()
  } catch (error) {
    console.warn('Erro ao tocar fight sound:', error)
  }
}

export async function unloadSounds() {
  try {
    if (beepSound) {
      await beepSound.unloadAsync()
      beepSound = null
    }
    if (fightSound) {
      await fightSound.unloadAsync()
      fightSound = null
    }
    loaded = false
  } catch (error) {
    console.warn('Erro ao descarregar sons:', error)
  }
}
