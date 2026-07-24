import { Area } from './ui'

/** Renders a set of {key, label} prompts as read-only answer text, or, when
 * `editing`, as editable textareas bound to `values` — the whole group edits
 * and saves as one unit rather than each prompt having its own lock. */
export default function PromptGroup({ prompts, values, editing, onChange }) {
  return (
    <div className="space-y-6">
      {prompts.map((p) => (
        <div key={p.key}>
          <p className="font-display text-[15px] font-semibold text-ink-900 mb-2.5">{p.label}</p>
          {editing ? (
            <Area
              value={values[p.key] ?? ''}
              onChange={(e) => onChange(p.key, e.target.value)}
              minRows={p.minRows ?? 3}
            />
          ) : values[p.key] ? (
            <p className="max-w-2xl text-[15px] leading-relaxed text-ink-700 whitespace-pre-line">{values[p.key]}</p>
          ) : (
            <p className="text-sm text-ink-300 italic">Not answered yet.</p>
          )}
        </div>
      ))}
    </div>
  )
}
