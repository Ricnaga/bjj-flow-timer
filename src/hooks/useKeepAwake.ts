import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake'
import { useEffect } from 'react'

export function useKeepAwake(enabled: boolean) {
  useEffect(() => {
    if (!enabled) {
      deactivateKeepAwake()
      return
    }

    activateKeepAwakeAsync()

    return () => {
      deactivateKeepAwake()
    }
  }, [enabled])
}
