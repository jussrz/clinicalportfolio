import PageHero from '../../components/PageHero'
import { LoadState, Section } from '../../components/ui'
import ShowcaseAnswer from '../../components/ShowcaseAnswer'
import { useSupabaseRecord } from '../../lib/useSupabaseRecord'

const skillsPrompts = [
  { key: 'confident_skills', label: 'Skills our group is becoming confident in' },
  { key: 'skills_to_practice', label: 'Skills our group needs to practice more before clerkship' },
  { key: 'improvement_plan', label: 'Plan to improve these skills', feature: true },
]

export default function ClinicalSkills() {
  const { record, status, error } = useSupabaseRecord('clinical_skills', 1)
  const hasContent = status === 'ready' && skillsPrompts.some((p) => record[p.key])

  return (
    <div>
      <PageHero
        eyebrow="Clinical Skills & Readiness"
        title="Clinical Skills & Clerkship Readiness"
        description="How our clinical skills developed across the rotation, and what we still need to practice."
      />

      <LoadState status={status} error={error}>
        {!hasContent ? (
          <p className="text-sm text-ink-400 italic">
            Our clinical skills synthesis will appear here once the group adds it.
          </p>
        ) : (
          <Section variant="showcase">
            <div className="space-y-6">
              {skillsPrompts.map((p) => (
                <ShowcaseAnswer key={p.key} label={p.label} value={record[p.key]} feature={p.feature} />
              ))}
            </div>
          </Section>
        )}
      </LoadState>
    </div>
  )
}
