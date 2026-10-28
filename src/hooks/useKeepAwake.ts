import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake'
import { useEffect } from 'react'

export function useKeepAwake(enabled: boolean) {
  useEffect(() => {
    if (!enabled) {
      return
    }

    let disposed = false
    const activation = activateKeepAwakeAsync().catch(() => undefined)

    return () => {
      disposed = true
      activation.then(() => {
        if (disposed) {
          deactivateKeepAwake().catch(() => undefined)
        }
      })
    }
  }, [enabled])
}
