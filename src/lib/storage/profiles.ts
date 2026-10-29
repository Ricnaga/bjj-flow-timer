import AsyncStorage from '@react-native-async-storage/async-storage'
import { z } from 'zod'
import { STORAGE_KEYS } from './keys'

export interface TimerProfile {
  id: string
  name: string
  prepTimeSeconds: number
  fightTimeSeconds: number
  restTimeSeconds: number
  rounds: number
  isInfinite: boolean
  createdAt: number
  updatedAt: number
}

const timerProfileSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  prepTimeSeconds: z.number().int().min(0).max(600),
  fightTimeSeconds: z.number().int().min(1).max(3600),
  restTimeSeconds: z.number().int().min(0).max(600),
  rounds: z.number().int().min(0).max(99),
  isInfinite: z.boolean(),
  createdAt: z.number(),
  updatedAt: z.number(),
})

export async function getProfiles(): Promise<TimerProfile[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.TIMER_PROFILES)
    if (!raw) {
      return []
    }
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return []
    }
    const result = z.array(timerProfileSchema).safeParse(parsed)
    if (!result.success) {
      console.warn('Perfis com formato inválido, descartando.')
      return []
    }
    return result.data
  } catch (error) {
    console.warn('Erro ao carregar perfis:', error)
    return []
  }
}

export async function saveProfile(
  profile: TimerProfile,
): Promise<TimerProfile[]> {
  try {
    const profiles = await getProfiles()
    const existingIndex = profiles.findIndex((item) => item.id === profile.id)

    if (existingIndex >= 0) {
      const updated = [...profiles]
      updated[existingIndex] = {
        ...profile,
        updatedAt: Date.now(),
      }
      await AsyncStorage.setItem(
        STORAGE_KEYS.TIMER_PROFILES,
        JSON.stringify(updated),
      )
      return updated
    }

    const created: TimerProfile = {
      ...profile,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    const updated = [...profiles, created]
    await AsyncStorage.setItem(
      STORAGE_KEYS.TIMER_PROFILES,
      JSON.stringify(updated),
    )
    return updated
  } catch (error) {
    console.warn('Erro ao salvar perfil:', error)
    return []
  }
}

export async function deleteProfile(id: string): Promise<TimerProfile[]> {
  try {
    const profiles = await getProfiles()
    const updated = profiles.filter((item) => item.id !== id)
    await AsyncStorage.setItem(
      STORAGE_KEYS.TIMER_PROFILES,
      JSON.stringify(updated),
    )
    return updated
  } catch (error) {
    console.warn('Erro ao deletar perfil:', error)
    return []
  }
}

export async function setActiveProfileId(id: string | null): Promise<void> {
  try {
    if (!id) {
      await AsyncStorage.removeItem(STORAGE_KEYS.ACTIVE_PROFILE)
      return
    }
    await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_PROFILE, id)
  } catch (error) {
    console.warn('Erro ao salvar perfil ativo:', error)
  }
}

export async function getActiveProfileId(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_PROFILE)
  } catch (error) {
    console.warn('Erro ao carregar perfil ativo:', error)
    return null
  }
}
