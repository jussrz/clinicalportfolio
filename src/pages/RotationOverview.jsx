import { PageHeader, Section } from '../components/ui'
import { departments } from '../data/departments'
import { rotationOverview } from '../data/rotationOverview'

export default function RotationOverview() {
  return (
    <div>
      <PageHeader
        eyebrow="Rotation Overview"
        title="Rotation Overview"
        description="Context for the group portfolio — objectives, schedule, and assigned topics as set by the clinical rotation program."
      />

      <div className="space-y-6">
        <Section title="General Objectives of the Clinical Rotation">
          <p className="text-[15px] leading-relaxed text-ink-500 italic whitespace-pre-line">
            {rotationOverview.generalObjectives}
          </p>
        </Section>

        <Section title="Rotation-Specific Objectives per Department">
          <div className="space-y-5">
            {departments.map((d) => (
              <div key={d.slug}>
                <p className="text-sm font-semibold text-ink-800 mb-1.5">{d.name}</p>
                <p className="text-[15px] leading-relaxed text-ink-500 italic whitespace-pre-line">
                  {rotationOverview.departmentObjectives[d.slug]}
                </p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Clinical Rotation Schedule / Timeline">
          <p className="text-[15px] leading-relaxed text-ink-500 italic whitespace-pre-line">
            {rotationOverview.schedule}
          </p>
        </Section>

        <Section title="Assigned Case Topics per Rotation Cycle">
          <p className="text-[15px] leading-relaxed text-ink-500 italic whitespace-pre-line">
            {rotationOverview.caseTopics}
          </p>
        </Section>

        <Section title="Group Learning Goals">
          <p className="text-[15px] leading-relaxed text-ink-500 italic whitespace-pre-line">
            {rotationOverview.learningGoals}
          </p>
        </Section>
      </div>
    </div>
  )
}
