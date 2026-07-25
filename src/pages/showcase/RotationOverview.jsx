import PageHero from '../../components/PageHero'
import Reveal from '../../components/Reveal'
import { Section } from '../../components/ui'
import ShowcaseAnswer from '../../components/ShowcaseAnswer'
import { useSupabaseRecord } from '../../lib/useSupabaseRecord'
import { departments } from '../../data/departments'

const deptColumn = (slug) => `obj_${slug.replace(/-/g, '_')}`

export default function RotationOverview() {
  const { record, status } = useSupabaseRecord('rotation_overview', 1)
  const hasContent =
    status === 'ready' &&
    (record.general_objectives || record.schedule || record.case_topics || record.learning_goals ||
      departments.some((d) => record[deptColumn(d.slug)]))

  return (
    <div>
      <PageHero
        eyebrow="Rotation Overview"
        title="Rotation Overview"
        description="What we set out to learn, and how our time was structured across the clinical rotation."
      />

      {hasContent ? (
        <div className="space-y-6">
          {record.general_objectives && (
            <Reveal>
              <Section variant="showcase" title="General Objectives">
                <ShowcaseAnswer value={record.general_objectives} />
              </Section>
            </Reveal>
          )}

          {departments.some((d) => record[deptColumn(d.slug)]) && (
            <Reveal>
              <Section variant="showcase" title="Objectives by Department">
                <div className="space-y-5">
                  {departments.map((d) => {
                    const value = record[deptColumn(d.slug)]
                    if (!value) return null
                    return (
                      <div key={d.slug}>
                        <p className="text-sm font-semibold text-ink-800 mb-1.5">{d.name}</p>
                        <ShowcaseAnswer value={value} />
                      </div>
                    )
                  })}
                </div>
              </Section>
            </Reveal>
          )}

          {record.schedule && (
            <Reveal>
              <Section variant="showcase" title="Schedule & Timeline">
                <ShowcaseAnswer value={record.schedule} />
              </Section>
            </Reveal>
          )}

          {record.case_topics && (
            <Reveal>
              <Section variant="showcase" title="Assigned Case Topics">
                <ShowcaseAnswer value={record.case_topics} />
              </Section>
            </Reveal>
          )}

          {record.learning_goals && (
            <Reveal>
              <Section variant="showcase" title="Group Learning Goals">
                <ShowcaseAnswer value={record.learning_goals} feature />
              </Section>
            </Reveal>
          )}
        </div>
      ) : (
        status === 'ready' && (
          <p className="text-sm text-ink-400 italic">
            Rotation objectives and schedule will appear here once the group adds them.
          </p>
        )
      )}
    </div>
  )
}
