import { useState } from 'react'
import { EditBar, LoadState, PageActions, Section } from '../components/ui'
import PageHero from '../components/PageHero'
import PromptGroup from '../components/PromptGroup'
import { useSupabaseRecord } from '../lib/useSupabaseRecord'
import { useEditableFields } from '../lib/useEditableFields'
import { exportPromptsPdf } from '../lib/pdf'
import { GROUP_NAME } from '../data/group'

const prompts = [
  { key: 'qna_questions', label: 'What questions were raised during the Q&A?' },
  { key: 'strong_parts', label: 'Which parts of our presentation were strong?' },
  { key: 'needs_improvement', label: 'Which parts needed improvement?' },
  { key: 'corrections_learned', label: 'What corrections or additional learning points did we gain after faculty feedback?' },
  { key: 'next_improvements', label: 'How will we improve our next case presentation?' },
]

export default function CasePresentation() {
  const { record, status, saveState, setField, flush } = useSupabaseRecord('case_presentation', 1)
  const { editing, draft, start, cancel, set, save, saving } = useEditableFields(record, setField, flush)
  const [exporting, setExporting] = useState(false)

  async function handleExport() {
    setExporting(true)
    try {
      await exportPromptsPdf({
        title: `${GROUP_NAME} Case Presentation`,
        prompts: prompts.map((p) => ({ label: p.label, value: record[p.key] })),
        filename: 'group_case_presentation.pdf',
      })
    } finally {
      setExporting(false)
    }
  }

  return (
    <div>
      <PageHero
        compact
        eyebrow="Case Presentation"
        title="Case Presentation"
        description="Post-presentation reflection on the group's formal case presentation."
        actions={<PageActions editing={editing} onEdit={start} onExport={handleExport} exporting={exporting} />}
      />

      <Section variant="showcase">
        <LoadState status={status} error="Couldn't load this page's data.">
          <div className="space-y-8">
            <PromptGroup prompts={prompts} values={editing ? draft : record} editing={editing} onChange={set} />
            <EditBar editing={editing} onCancel={cancel} onSave={save} saving={saving} saveState={saveState} />
          </div>
        </LoadState>
      </Section>
    </div>
  )
}
