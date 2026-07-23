import { Area, LoadState, PageHeader, SaveStatus, Section } from '../components/ui'
import { useSupabaseRecord } from '../lib/useSupabaseRecord'

export default function ClinicalSkills() {
  const { record, status, saveState, setField } = useSupabaseRecord('clinical_skills', 1)

  return (
    <div>
      <PageHeader
        eyebrow="Clinical Skills and Clerkship Readiness"
        title="Clinical Skills & Clerkship Readiness"
        description="Group synthesis of exposure to core clinical skills across the rotation."
      />

      <Section>
        <LoadState status={status === 'error' ? 'error' : 'ready'} error="Couldn't load this page's data.">
          <div className="space-y-6">
            <Area
              label="Skills our group is becoming confident in"
              value={record.confident_skills ?? ''}
              onChange={(e) => setField('confident_skills', e.target.value)}
              minRows={3}
            />
            <Area
              label="Skills our group needs to practice more before clerkship"
              value={record.skills_to_practice ?? ''}
              onChange={(e) => setField('skills_to_practice', e.target.value)}
              minRows={3}
            />
            <Area
              label="Plan to improve these skills"
              value={record.improvement_plan ?? ''}
              onChange={(e) => setField('improvement_plan', e.target.value)}
              minRows={3}
            />
            <div className="h-4"><SaveStatus state={saveState} /></div>
          </div>
        </LoadState>
      </Section>
    </div>
  )
}
