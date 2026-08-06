import { useEffect, useState } from 'react'
import { Area, Button } from './ui'

export const REFLECTION_PROMPTS = [
  ['common_cases', 'Most common cases/conditions encountered'],
  ['skills_observed', 'Skills I was able to observe or practice'],
  ['lesson_learned', 'One clinical lesson I learned from this rotation'],
  ['area_to_improve', 'One area I need to improve before clerkship'],
]

export function hasDeptReflection(r, prompts = REFLECTION_PROMPTS) {
  return Boolean(r && prompts.some(([key]) => r[key]))
}

export function hasAnyReflection(reflections, prompts = REFLECTION_PROMPTS) {
  return reflections.some((r) => hasDeptReflection(r, prompts))
}

function emptyDraft(reflection, prompts) {
  return Object.fromEntries(prompts.map(([key]) => [key, reflection?.[key] || '']))
}

/** One department's slice of a reflection — collapsed to a clickable header
 * row (department name + answered/not-started status) until opened.
 * `editable` renders an inline save form instead of read-only text.
 * `prompts` defaults to the per-student REFLECTION_PROMPTS but any
 * [key, label] tuple list works, e.g. Group Reflections' own prompt set. */
export function DepartmentReflectionCard({ dept, reflection, prompts = REFLECTION_PROMPTS, editable, open, onToggle, onSave }) {
  const answered = hasDeptReflection(reflection, prompts)
  const [draft, setDraft] = useState(() => emptyDraft(reflection, prompts))
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)

  useEffect(() => {
    if (open) {
      setDraft(emptyDraft(reflection, prompts))
      setSaveError(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  async function handleSave() {
    setSaving(true)
    setSaveError(null)
    const { error } = await onSave(dept.slug, draft)
    setSaving(false)
    if (error) {
      setSaveError(error.message)
      return
    }
    onToggle()
  }

  return (
    <div className="rounded-xl border border-ink-200 overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-ink-50 transition-colors"
      >
        <span className="flex items-center gap-2 min-w-0 text-sm font-medium text-ink-800 truncate">
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${answered ? 'bg-emerald-500' : 'bg-ink-300'}`} />
          {dept.name}
        </span>
        <span className="text-xs text-ink-400 shrink-0">{answered ? 'Answered' : 'Not started'}</span>
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 space-y-3 border-t border-ink-100">
          {editable ? (
            <>
              {prompts.map(([key, label]) => (
                <Area
                  key={key}
                  label={label}
                  value={draft[key]}
                  onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                  minRows={2}
                />
              ))}
              {saveError && <p className="text-sm text-red-600">Failed to save: {saveError}</p>}
              <div className="flex gap-2 pt-1">
                <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
                <Button variant="outline" onClick={onToggle} disabled={saving}>Close</Button>
              </div>
            </>
          ) : answered ? (
            prompts.map(([key, label]) => reflection[key] && (
              <div key={key}>
                <p className="text-sm font-semibold text-ink-800">{label}</p>
                <p className="text-sm text-ink-600 whitespace-pre-line mt-0.5 break-words">{reflection[key]}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-ink-300 italic pt-1">No reflection recorded for this department yet.</p>
          )}
        </div>
      )}
    </div>
  )
}
