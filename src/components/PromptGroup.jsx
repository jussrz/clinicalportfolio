import { Area } from './ui'
import Pullquote from './Pullquote'

/** Renders a set of {key, label} prompts as read-only answer text, or, when
 * `editing`, as editable textareas bound to `values` — the whole group edits
 * and saves as one unit rather than each prompt having its own lock. Mark a
 * prompt `feature: true` to render its answer as a Pullquote instead of a
 * plain paragraph in read mode, for the one answer per page worth calling
 * out (see CaseReflectionCard's identical Pullquote treatment). */
export default function PromptGroup({ prompts, values, editing, onChange }) {
  return (
    <div className="space-y-6">
      {prompts.map((p) => (
        <div key={p.key}>
          <p className="flex items-baseline gap-2 font-display text-[15px] font-semibold text-ink-900 mb-2.5">
            <span className="w-4 h-[3px] shrink-0 rounded-full bg-brand-500 translate-y-[-3px]" />
            {p.label}
          </p>
          {editing ? (
            <Area
              value={values[p.key] ?? ''}
              onChange={(e) => onChange(p.key, e.target.value)}
              minRows={p.minRows ?? 3}
            />
          ) : values[p.key] ? (
            p.feature ? (
              <Pullquote>{values[p.key]}</Pullquote>
            ) : (
              <p className="max-w-2xl text-[15px] leading-relaxed text-ink-700 whitespace-pre-line">{values[p.key]}</p>
            )
          ) : (
            <p className="text-sm text-ink-300 italic">Not answered yet.</p>
          )}
        </div>
      ))}
    </div>
  )
}
