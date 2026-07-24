import { useMemo, useState } from 'react'
import { Button, LoadState, Notice, Section, Table } from '../components/ui'
import PageHero from '../components/PageHero'
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
    <tr>
      <td className="text-ink-400">{index + 1}</td>
      <td className="whitespace-nowrap">{entry.date_seen || '—'}</td>
      <td>{entry.department || '—'}</td>
      <td>{entry.clinical_area || '—'}</td>
      <td>{entry.patient_code || '—'}</td>
      <td>{entry.age_sex || '—'}</td>
      <td>{entry.chief_complaint || '—'}</td>
      <td>{entry.working_diagnosis || '—'}</td>
      <td>{roleLabel(entry) || '—'}</td>
      <td>{entry.student_assigned || '—'}</td>
      <td>
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
      <PageHero
        size="compact"
        eyebrow="Selected Case Reflections"
        title="Selected Case Reflections"
        description="Pick cases from the group's Case Log Census for deeper group discussion. Case details auto-fill from the log and stay locked — only the reflection content is editable."
      />

      <div className="space-y-6">
        <Notice>
          Keep reflections non-identifying — describe cases and conditions in general
          terms only, never patient names or other identifying information.
        </Notice>

        <Section
          title="Select a Case from the Log"
          subtitle="Suggested minimum: at least 1 reflection per major department, or 3–5 per rotation cycle."
        >
          <LoadState status={caseLogStatus} error={caseLogError}>
            {selectableEntries.length === 0 ? (
              <p className="text-sm text-ink-400 italic py-2">
                {caseLogRows.length === 0
                  ? 'No case log entries yet — add cases in Case Log Census first.'
                  : 'Every logged case already has a reflection.'}
              </p>
            ) : (
              <Table minWidth="960px">
                <thead>
                  <tr>
                    <th>No.</th>
                    <th>Date Seen</th>
                    <th>Department</th>
                    <th>Clinical Area</th>
                    <th>Patient Code</th>
                    <th>Age/Sex</th>
                    <th>Chief Complaint</th>
                    <th>Working Diagnosis</th>
                    <th>Student Role</th>
                    <th>Student Assigned</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {selectableEntries.map((entry, i) => (
                    <SelectCaseRow key={entry.id} entry={entry} index={i} onSelect={handleSelect} />
                  ))}
                </tbody>
              </Table>
            )}
          </LoadState>
        </Section>

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
