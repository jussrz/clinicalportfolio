import { useState } from 'react'
import { Button, EditBar, LoadState } from './ui'
import PromptGroup from './PromptGroup'
import { departments } from '../data/departments'
import { useDepartmentNotes } from '../lib/useDepartmentNotes'
import { useEditableFields } from '../lib/useEditableFields'
import { exportPromptsPdf } from '../lib/pdf'

function DepartmentPromptCard({ dept, prompts, pdfTitle, filenamePrefix }) {
  const sections = prompts.map((p) => p.key)
  const { values, status, saveState, setSection, flush } = useDepartmentNotes(dept.slug, sections)
  const { editing, draft, start, cancel, set, save, saving } = useEditableFields(values, setSection, flush)
  const [expanded, setExpanded] = useState(false)
  const [exporting, setExporting] = useState(false)
  const hasContent = prompts.some((p) => values[p.key])

  async function handleExport() {
    setExporting(true)
    try {
      await exportPromptsPdf({
        title: pdfTitle(dept.name),
        prompts: prompts.map((p) => ({ label: p.label, value: values[p.key] })),
        filename: `${filenamePrefix}_${dept.slug}.pdf`,
      })
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="bg-white border border-ink-200 rounded-2xl shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-5 sm:px-7 py-4 text-left"
      >
        <span className="flex items-center gap-2.5 min-w-0">
          <span className={`w-2 h-2 rounded-full shrink-0 ${hasContent ? 'bg-emerald-500' : 'bg-ink-200'}`} />
          <span className="font-display text-[15px] font-semibold text-ink-800 truncate">{dept.name}</span>
        </span>
        <span className="text-xs font-medium text-ink-400 shrink-0">{hasContent ? 'Answered' : 'Not started'}</span>
      </button>

      {expanded && (
        <div className="px-5 sm:px-7 pb-6 pt-1 border-t border-ink-100 space-y-6">
          <LoadState status={status} error="Couldn't load this department's notes.">
            <PromptGroup prompts={prompts} values={editing ? draft : values} editing={editing} onChange={set} />
            {!editing && (
              <div className="flex items-center gap-2 flex-wrap">
                <Button variant="outline" onClick={start}>Edit</Button>
                {hasContent && (
                  <Button variant="ghost" onClick={handleExport} disabled={exporting}>
                    {exporting ? 'Exporting…' : 'Export PDF'}
                  </Button>
                )}
              </div>
            )}
            <EditBar editing={editing} onCancel={cancel} onSave={save} saving={saving} saveState={saveState} />
          </LoadState>
        </div>
      )}
    </div>
  )
}

/** Same prompts, answered separately per department — used by Case
 * Presentation, Clinical Skills, Feedback & Action Plan, and Group
 * Reflections. Content is stored in department_notes (the same table
 * DepartmentPage.jsx uses for its own objectives/conditions/etc. fields),
 * under prompt keys namespaced per page so they don't collide. */
export default function DepartmentPromptCards({ prompts, pdfTitle, filenamePrefix }) {
  return (
    <div className="space-y-4">
      {departments.map((dept) => (
        <DepartmentPromptCard key={dept.slug} dept={dept} prompts={prompts} pdfTitle={pdfTitle} filenamePrefix={filenamePrefix} />
      ))}
    </div>
  )
}
