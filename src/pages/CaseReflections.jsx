import { useMemo, useState } from 'react'
import { Button, LoadState, Notice, PageHeader } from '../components/ui'
import CaseReflectionCard from '../components/CaseReflectionCard'
import { useSupabaseTable } from '../lib/useSupabaseTable'
import { roleLabel } from '../lib/caseLog'

function SelectCaseRow({ entry, index, onSelect }) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  async function handleSelect() {
    setSaving(true)
    setError(null)
    const { error: selectError } = await onSelect(entry)
    setSaving(false)
    if (selectError) setError(selectError.message)
  }

  return (
    <tr className="border-b border-ink-100 last:border-0 align-top">
      <td className="py-2 pr-2 text-xs text-ink-500">{index + 1}</td>
      <td className="py-2 pr-2 text-xs text-ink-700 whitespace-nowrap">{entry.date_seen || '—'}</td>
      <td className="py-2 pr-2 text-xs text-ink-700">{entry.department || '—'}</td>
      <td className="py-2 pr-2 text-xs text-ink-700">{entry.clinical_area || '—'}</td>
      <td className="py-2 pr-2 text-xs text-ink-700">{entry.patient_code || '—'}</td>
      <td className="py-2 pr-2 text-xs text-ink-700">{entry.age_sex || '—'}</td>
      <td className="py-2 pr-2 text-xs text-ink-700">{entry.chief_complaint || '—'}</td>
      <td className="py-2 pr-2 text-xs text-ink-700">{entry.working_diagnosis || '—'}</td>
      <td className="py-2 pr-2 text-xs text-ink-700">{roleLabel(entry) || '—'}</td>
      <td className="py-2 pr-2 text-xs text-ink-700">{entry.student_assigned || '—'}</td>
      <td className="py-2 pr-1">
        <Button variant="outline" onClick={handleSelect} disabled={saving}>
          {saving ? 'Selecting…' : 'Select'}
        </Button>
        {error && <p className="text-xs text-red-600 mt-1">Failed: {error}</p>}
      </td>
    </tr>
  )
}

export default function CaseReflections() {
  const { rows: caseLogRows, status: caseLogStatus, error: caseLogError } = useSupabaseTable('case_log_entries', { orderBy: 'date_seen', ascending: false })
  const { rows: reflections, status, error, update, remove, insert } = useSupabaseTable('case_reflections', { orderBy: 'reflection_no', ascending: true })
  const [justSelectedEntryId, setJustSelectedEntryId] = useState(null)

  const reflectedEntryIds = useMemo(
    () => new Set(reflections.map((r) => r.case_log_entry_id).filter(Boolean)),
    [reflections]
  )
  const selectableEntries = useMemo(
    () => caseLogRows.filter((e) => !reflectedEntryIds.has(e.id)),
    [caseLogRows, reflectedEntryIds]
  )
  const caseLogById = useMemo(
    () => Object.fromEntries(caseLogRows.map((e) => [e.id, e])),
    [caseLogRows]
  )

  async function handleSelect(entry) {
    const result = await insert({ case_log_entry_id: entry.id })
    if (!result.error) setJustSelectedEntryId(entry.id)
    return result
  }

  return (
    <div>
      <PageHeader
        eyebrow="Selected Case Reflections"
        title="Selected Case Reflections"
        description="Pick cases from the group's Case Log Census for deeper group discussion. Case details auto-fill from the log and stay locked — only the reflection content is editable."
      />

      <div className="space-y-6">
        <Notice>
          Keep reflections non-identifying — describe cases and conditions in general
          terms only, never patient names or other identifying information.
        </Notice>

        <div className="bg-white border border-ink-200 rounded-2xl shadow-sm p-5 sm:p-7">
          <h2 className="text-base font-semibold text-ink-900 mb-1">Select a Case from the Log</h2>
          <p className="text-sm text-ink-500 mb-4">
            Suggested minimum: at least 1 reflection per major department, or 3–5 per rotation cycle.
          </p>
          <LoadState status={caseLogStatus} error={caseLogError}>
            {selectableEntries.length === 0 ? (
              <p className="text-sm text-ink-400 italic py-2">
                {caseLogRows.length === 0
                  ? 'No case log entries yet — add cases in Case Log Census first.'
                  : 'Every logged case already has a reflection.'}
              </p>
            ) : (
              <div className="overflow-x-auto -mx-5 sm:-mx-7 px-5 sm:px-7">
                <table className="w-full border-collapse min-w-[960px]">
                  <thead>
                    <tr>
                      <th className="text-left text-xs font-bold uppercase tracking-wide text-ink-700 border-b border-ink-200 pb-2 pr-2">No.</th>
                      <th className="text-left text-xs font-bold uppercase tracking-wide text-ink-700 border-b border-ink-200 pb-2 pr-2">Date Seen</th>
                      <th className="text-left text-xs font-bold uppercase tracking-wide text-ink-700 border-b border-ink-200 pb-2 pr-2">Department</th>
                      <th className="text-left text-xs font-bold uppercase tracking-wide text-ink-700 border-b border-ink-200 pb-2 pr-2">Clinical Area</th>
                      <th className="text-left text-xs font-bold uppercase tracking-wide text-ink-700 border-b border-ink-200 pb-2 pr-2">Patient Code</th>
                      <th className="text-left text-xs font-bold uppercase tracking-wide text-ink-700 border-b border-ink-200 pb-2 pr-2">Age/Sex</th>
                      <th className="text-left text-xs font-bold uppercase tracking-wide text-ink-700 border-b border-ink-200 pb-2 pr-2">Chief Complaint</th>
                      <th className="text-left text-xs font-bold uppercase tracking-wide text-ink-700 border-b border-ink-200 pb-2 pr-2">Working Diagnosis</th>
                      <th className="text-left text-xs font-bold uppercase tracking-wide text-ink-700 border-b border-ink-200 pb-2 pr-2">Student Role</th>
                      <th className="text-left text-xs font-bold uppercase tracking-wide text-ink-700 border-b border-ink-200 pb-2 pr-2">Student Assigned</th>
                      <th className="text-left text-xs font-bold uppercase tracking-wide text-ink-700 border-b border-ink-200 pb-2 pr-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectableEntries.map((entry, i) => (
                      <SelectCaseRow key={entry.id} entry={entry} index={i} onSelect={handleSelect} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </LoadState>
        </div>

        <LoadState status={status} error={error}>
          <div className="space-y-6">
            {reflections.map((r) => (
              <CaseReflectionCard
                key={r.id}
                reflection={r}
                caseEntry={caseLogById[r.case_log_entry_id]}
                defaultEditing={r.case_log_entry_id === justSelectedEntryId}
                onSave={(values) => update(r.id, values)}
                onDelete={() => remove(r.id)}
              />
            ))}

            {reflections.length === 0 && (
              <div className="text-center py-10 border border-dashed border-ink-300 rounded-2xl">
                <p className="text-sm text-ink-500">No case reflections yet — select a case above to start one.</p>
              </div>
            )}
          </div>
        </LoadState>
      </div>
    </div>
  )
}
