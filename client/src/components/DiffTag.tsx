import { cn, diffClass, diffLabel } from '../utils/helpers'
import { Difficulty } from '../types'

export default function DiffTag({ difficulty, className }: { difficulty: Difficulty; className?: string }) {
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold', diffClass(difficulty), className)}>
      {diffLabel(difficulty)}
    </span>
  )
}
