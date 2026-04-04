import { ToastItem } from '../types'
import { cn } from '../utils/helpers'

export default function ToastContainer({
  toasts,
}: {
  toasts: ToastItem[]
}) {
  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-50 flex w-[min(92vw,360px)] flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'pointer-events-auto animate-scale-in rounded-card border px-4 py-3 shadow-card',
            toast.tone === 'success' && 'border-green-bdr bg-green-bg text-green',
            toast.tone === 'error' && 'border-red-bdr bg-red-bg text-red',
            toast.tone === 'info' && 'border-border bg-surface text-text',
          )}
        >
          <p className="text-sm font-semibold">{toast.message}</p>
        </div>
      ))}
    </div>
  )
}
