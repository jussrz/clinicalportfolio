import { useState } from 'react'
import { EditBar, LoadState, PageActions, Section } from '../components/ui'
import PageHero from '../components/PageHero'
import PromptGroup from '../components/PromptGroup'
import { useSupabaseRecord } from '../lib/useSupabaseRecord'
import { useEditableFields } from '../lib/useEditableFields'
import { exportPromptsPdf } from '../lib/pdf'
import { GROUP_NAME } from '../data/group'

const prompts = [
  { key: 'meaningful_experience', label: 'What was our most meaningful clinical learning experience?' },
  { key: 'patients_caregivers', label: 'What did we learn about working with patients and caregivers?' },
  { key: 'healthcare_team', label: 'What did we learn about working with the healthcare team?' },
  { key: 'workflows', label: 'What did we learn about hospital or community health workflows?' },
  { key: 'clinical_reasoning', label: 'What clinical reasoning skills improved in our group?' },
  { key: 'challenges', label: 'What challenged us as a group?' },
  { key: 'task_management', label: 'How did we manage group tasks and responsibilities?' },
  { key: 'improvements', label: 'What should we improve before clerkship?' },
]
const numberedPrompts = prompts.map((p, i) => ({ ...p, label: `${i + 1}. ${p.label}` }))

export default function GroupReflections() {
  const { record, status, saveState, setField, flush } = useSupabaseRecord('group_reflections', 1)
  const { editing, draft, start, cancel, set, save, saving } = useEditableFields(record, setField, flush)
  const [exporting, setExporting] = useState(false)

  async function handleExport() {
    setExporting(true)
    try {
      await exportPromptsPdf({
        title: `${GROUP_NAME} Group Reflections`,
        prompts: prompts.map((p) => ({ label: p.label, value: record[p.key] })), // exportPromptsPdf numbers these itself
        filename: 'group_reflections.pdf',
      })
    } finally {
      setExporting(false)
    }
  }

  return (
    <div>
      <PageHero
        compact
        eyebrow="Group Reflections"
        title="Group Reflections"
        description="Structured reflections across the rotation, answered by the group as a whole."
        actions={<PageActions editing={editing} onEdit={start} onExport={handleExport} exporting={exporting} />}
      />

      <Section variant="showcase">
        <LoadState status={status} error="Couldn't load this page's data.">
          <div className="space-y-8">
            <PromptGroup prompts={numberedPrompts} values={editing ? draft : record} editing={editing} onChange={set} />
            <EditBar editing={editing} onCancel={cancel} onSave={save} saving={saving} saveState={saveState} />
          </div>
        </LoadState>
      </Section>
    </div>
  )
}
