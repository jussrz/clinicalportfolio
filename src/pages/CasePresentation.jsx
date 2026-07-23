import { Area, LoadState, PageHeader, SaveStatus, Section } from '../components/ui'
import { useSupabaseRecord } from '../lib/useSupabaseRecord'

const prompts = [
  { key: 'qna_questions', label: 'What questions were raised during the Q&A?' },
  { key: 'strong_parts', label: 'Which parts of our presentation were strong?' },
  { key: 'needs_improvement', label: 'Which parts needed improvement?' },
  { key: 'corrections_learned', label: 'What corrections or additional learning points did we gain after faculty feedback?' },
  { key: 'next_improvements', label: 'How will we improve our next case presentation?' },
]

export default function CasePresentation() {
  const { record, status, saveState, setField } = useSupabaseRecord('case_presentation', 1)

  return (
    <div>
      <PageHeader
        eyebrow="Case Presentation"
        title="Case Presentation"
        description="Post-presentation reflection on the group's formal case presentation."
      />

      <Section>
        <LoadState status={status === 'error' ? 'error' : 'ready'} error="Couldn't load this page's data.">
          <div className="space-y-6">
            {prompts.map((p) => (
              <Area
                key={p.key}
                label={p.label}
                value={record[p.key] ?? ''}
                onChange={(e) => setField(p.key, e.target.value)}
                minRows={3}
              />
            ))}
            <div className="h-4"><SaveStatus state={saveState} /></div>
          </div>
        </LoadState>
      </Section>
    </div>
  )
}
