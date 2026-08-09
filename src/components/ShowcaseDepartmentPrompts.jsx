import { useState } from 'react'
import ShowcaseAnswer from './ShowcaseAnswer'
import { departments } from '../data/departments'
import { useAllDepartmentNotes } from '../lib/useAllDepartmentNotes'

/** Read-only counterpart to DepartmentPromptCards.jsx: a collapsed dropdown
 * per department, always shown even with nothing answered yet — but only
 * one department's answers are open at a time, so pressing a department
 * shows just that department's answers and closes whichever was open. */
export default function ShowcaseDepartmentPrompts({ prompts }) {
  const sections = prompts.map((p) => p.key)
  const { byDept, status } = useAllDepartmentNotes(sections)
  const [openSlug, setOpenSlug] = useState(null)

  if (status === 'loading') {
    return <p className="text-sm text-ink-400 animate-pulse">Loading…</p>
  }

  return (
    <div className="space-y-4">
      {departments.map((dept) => {
        const hasContent = prompts.some((p) => byDept[dept.slug]?.[p.key])
        const open = openSlug === dept.slug
        return (
          <div key={dept.slug} className="bg-white border border-ink-200/60 rounded-2xl card-shadow-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setOpenSlug(open ? null : dept.slug)}
              className="w-full flex items-center justify-between gap-3 px-6 sm:px-9 py-5 text-left"
            >
              <span className="flex items-center gap-2.5 min-w-0">
                <span className={`w-2 h-2 rounded-full shrink-0 ${hasContent ? 'bg-emerald-500' : 'bg-ink-200'}`} />
                <span className="font-display text-lg font-semibold text-ink-900 truncate">{dept.name}</span>
              </span>
              <svg
                width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                className={`shrink-0 text-ink-400 transition-transform ${open ? 'rotate-180' : ''}`}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            {open && (
              <div className="px-6 sm:px-9 pb-8 pt-1 border-t border-ink-100 space-y-6">
                {prompts.map((p) => (
                  <ShowcaseAnswer key={p.key} label={p.label} value={byDept[dept.slug]?.[p.key]} feature={p.feature} />
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
