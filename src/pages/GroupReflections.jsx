import { Area, LoadState, PageHeader, SaveStatus, Section } from '../components/ui'
import { useSupabaseRecord } from '../lib/useSupabaseRecord'

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

export default function GroupReflections() {
  const { record, status, saveState, setField } = useSupabaseRecord('group_reflections', 1)

  return (
    <div>
      <PageHeader
        eyebrow="Group Reflections"
        title="Group Reflections"
        description="Structured reflections across the rotation, answered by the group as a whole."
      />

      <Section>
        <LoadState status={status === 'error' ? 'error' : 'ready'} error="Couldn't load this page's data.">
          <div className="space-y-6">
            {prompts.map((p, i) => (
              <Area
                key={p.key}
                label={`${i + 1}. ${p.label}`}
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
