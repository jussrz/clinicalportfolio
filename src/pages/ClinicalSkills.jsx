import { useState } from 'react'
import { EditBar, LoadState, PageActions, Section } from '../components/ui'
import PageHero from '../components/PageHero'
import Reveal from '../components/Reveal'
import PromptGroup from '../components/PromptGroup'
import { useSupabaseRecord } from '../lib/useSupabaseRecord'
import { useEditableFields } from '../lib/useEditableFields'
import { exportPromptsPdf } from '../lib/pdf'
import { GROUP_NAME } from '../data/group'

const prompts = [
  { key: 'confident_skills', label: 'Skills our group is becoming confident in' },
  { key: 'skills_to_practice', label: 'Skills our group needs to practice more before clerkship' },
  { key: 'improvement_plan', label: 'Plan to improve these skills', feature: true },
]

export default function ClinicalSkills() {
  const { record, status, saveState, setField, flush } = useSupabaseRecord('clinical_skills', 1)
  const { editing, draft, start, cancel, set, save, saving } = useEditableFields(record, setField, flush)
  const [exporting, setExporting] = useState(false)

  async function handleExport() {
    setExporting(true)
    try {
      await exportPromptsPdf({
        title: `${GROUP_NAME} Clinical Skills & Clerkship Readiness`,
        prompts: prompts.map((p) => ({ label: p.label, value: record[p.key] })),
        filename: 'group_clinical_skills.pdf',
      })
    } finally {
      setExporting(false)
    }
  }

  return (
    <div>
      <PageHero
        size="compact"
        eyebrow="Clinical Skills and Clerkship Readiness"
        title="Clinical Skills & Clerkship Readiness"
        description="Group synthesis of exposure to core clinical skills across the rotation."
        actions={<PageActions editing={editing} onEdit={start} onExport={handleExport} exporting={exporting} />}
      />

      <Reveal>
        <Section variant="showcase">
          <LoadState status={status} error="Couldn't load this page's data.">
            <div className="space-y-8">
              <PromptGroup prompts={prompts} values={editing ? draft : record} editing={editing} onChange={set} />
              <EditBar editing={editing} onCancel={cancel} onSave={save} saving={saving} saveState={saveState} />
            </div>
          </LoadState>
        </Section>
      </Reveal>
    </div>
  )
}
