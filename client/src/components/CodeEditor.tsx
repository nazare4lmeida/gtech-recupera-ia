import { ChangeEvent } from 'react'

export default function CodeEditor({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="overflow-hidden rounded-card border border-border bg-[#0f172a] shadow-card">
      <div className="flex items-center justify-between border-b border-slate-700 px-4 py-2">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">Editor JavaScript</span>
        <span className="font-mono text-xs text-slate-400">solution.js</span>
      </div>
      <textarea
        className="code-textarea"
        spellCheck={false}
        value={value}
        onChange={(event: ChangeEvent<HTMLTextAreaElement>) => onChange(event.target.value)}
      />
    </div>
  )
}
