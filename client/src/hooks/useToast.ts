import { useCallback, useState } from 'react'
import { ToastItem } from '../types'

function createId() {
  return Math.random().toString(36).slice(2, 10)
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const toast = useCallback((message: string, tone: ToastItem['tone'] = 'info') => {
    const id = createId()
    setToasts((current) => [...current, { id, message, tone }])
    window.setTimeout(() => dismiss(id), 3200)
  }, [dismiss])

  return { toasts, toast, dismiss }
}
