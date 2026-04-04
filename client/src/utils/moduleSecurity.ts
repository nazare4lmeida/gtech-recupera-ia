import { useEffect } from 'react'

export function useAntiCheat(active: boolean, message: string) {
  useEffect(() => {
    if (!active) return

    const block = (event: Event) => event.preventDefault()
    const handleKeydown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      const isClipboardShortcut = (event.ctrlKey || event.metaKey) && ['c', 'v', 'x', 'a', 'p'].includes(key)
      const isPrintScreen = event.key === 'PrintScreen'

      if (isClipboardShortcut || isPrintScreen) {
        event.preventDefault()
        window.alert(message)
      }
    }

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        window.alert(message)
      }
    }

    document.addEventListener('copy', block)
    document.addEventListener('paste', block)
    document.addEventListener('cut', block)
    document.addEventListener('contextmenu', block)
    document.addEventListener('selectstart', block)
    document.addEventListener('dragstart', block)
    document.addEventListener('keydown', handleKeydown)
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      document.removeEventListener('copy', block)
      document.removeEventListener('paste', block)
      document.removeEventListener('cut', block)
      document.removeEventListener('contextmenu', block)
      document.removeEventListener('selectstart', block)
      document.removeEventListener('dragstart', block)
      document.removeEventListener('keydown', handleKeydown)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [active, message])
}
