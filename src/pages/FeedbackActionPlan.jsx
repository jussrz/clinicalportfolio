import { useState } from 'react'
import { EditBar, LoadState, PageActions, Section } from '../components/ui'
import PageHero from '../components/PageHero'
import Reveal from '../components/Reveal'
import PromptGroup from '../components/PromptGroup'
import { useSupabaseRecord } from '../lib/useSupabaseRecord'
import { useEditableFields } from '../lib/useEditableFields'
import { exportPromptsPdf } from '../lib/pdf'
import { GROUP_NAME } from '../data/group'

const promptLabel = 'What feedback was most helpful to our group, and what specific changes did we make after receiving it?'
const prompts = [{ key: 'reflection', label: promptLabel, feature: true }]

export default function FeedbackActionPlan() {
  const { record, status, saveState, setField, flush } = useSupabaseRecord('feedback_action_plan', 1)
  const { editing, draft, start, cancel, set, save, saving } = useEditableFields(record, setField, flush)
  const [exporting, setExporting] = useState(false)

  async function handleExport() {
    setExporting(true)
    try {
      await exportPromptsPdf({
        title: `${GROUP_NAME} Feedback & Action Plan`,
        prompts: [{ label: promptLabel, value: record.reflection }],
        filename: 'group_feedback_action_plan.pdf',
      })
    } finally {
      setExporting(false)
    }
  }

  return (
    <div>
      <PageHero
        size="compact"
        eyebrow="Feedback and Action Plan"
        title="Feedback & Action Plan"
        description="Feedback received by the group and the group's response."
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
