import PageHero from '../../components/PageHero'
import { LoadState, Section } from '../../components/ui'
import ShowcaseAnswer from '../../components/ShowcaseAnswer'
import { useSupabaseRecord } from '../../lib/useSupabaseRecord'

const groupPrompts = [
  { key: 'meaningful_experience', label: 'Our most meaningful clinical learning experience', feature: true },
  { key: 'patients_caregivers', label: 'What we learned about working with patients and caregivers' },
  { key: 'healthcare_team', label: 'What we learned about working with the healthcare team' },
  { key: 'workflows', label: 'What we learned about hospital or community health workflows' },
  { key: 'clinical_reasoning', label: 'How our clinical reasoning skills improved' },
  { key: 'challenges', label: 'What challenged us as a group' },
  { key: 'task_management', label: 'How we managed group tasks and responsibilities' },
  { key: 'improvements', label: 'What we should improve before clerkship' },
]

export default function GroupReflections() {
  const { record, status, error } = useSupabaseRecord('group_reflections', 1)
  const hasContent = status === 'ready' && groupPrompts.some((p) => record[p.key])

  return (
    <div>
      <PageHero
        eyebrow="Group Reflections"
        title="Group Reflections"
        description="Structured reflections across the whole rotation."
      />

      <LoadState status={status} error={error}>
        {!hasContent ? (
          <p className="text-sm text-ink-400 italic">
            Group reflections will appear here once the group starts adding them.
          </p>
        ) : (
          <Section variant="showcase">
            <div className="space-y-7">
              {groupPrompts.map((p) => (
                <ShowcaseAnswer key={p.key} label={p.label} value={record[p.key]} feature={p.feature} />
              ))}
            </div>
          </Section>
        )}
      </LoadState>
    </div>
  )
}
