import { useCallback, useEffect, useState } from 'react'
import {
  deleteProfile,
  getProfiles,
  saveProfile,
  type TimerProfile,
} from '../lib/storage/profiles'

interface CreateProfileData {
  name: string
  prepTimeSeconds: number
  fightTimeSeconds: number
  restTimeSeconds: number
  rounds: number
  isInfinite: boolean
}

export function useProfiles() {
  const [profiles, setProfiles] = useState<TimerProfile[]>([])
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [formVisible, setFormVisible] = useState(false)

  const loadProfiles = useCallback(async () => {
    const list = await getProfiles()
    setProfiles(list)
  }, [])

  useEffect(() => {
    void loadProfiles()
  }, [loadProfiles])

  const handleCreateProfile = useCallback(
    async (data: CreateProfileData) => {
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
    [loadProfiles],
  )

  const handleDeleteProfile = useCallback(
    async (id: string) => {
      await deleteProfile(id)
      await loadProfiles()
    },
    [loadProfiles],
  )

  const openDrawer = useCallback(() => setDrawerVisible(true), [])
  const closeDrawer = useCallback(() => setDrawerVisible(false), [])
  const openForm = useCallback(() => setFormVisible(true), [])
  const closeForm = useCallback(() => setFormVisible(false), [])
  const openFormFromDrawer = useCallback(() => {
    setDrawerVisible(false)
    setFormVisible(true)
  }, [])

  return {
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
  }
}
