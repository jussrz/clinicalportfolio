import PageHero from '../../components/PageHero'
import Reveal from '../../components/Reveal'
import { Section } from '../../components/ui'
import ShowcaseAnswer from '../../components/ShowcaseAnswer'
import { useSupabaseRecord } from '../../lib/useSupabaseRecord'

const skillsPrompts = [
  { key: 'confident_skills', label: 'Skills our group is becoming confident in' },
  { key: 'skills_to_practice', label: 'Skills our group needs to practice more before clerkship' },
  { key: 'improvement_plan', label: 'Plan to improve these skills', feature: true },
]

export default function GrowthReflections() {
  const { record: skills, status: skillsStatus } = useSupabaseRecord('clinical_skills', 1)
  const { record: feedback, status: feedbackStatus } = useSupabaseRecord('feedback_action_plan', 1)

  const hasSkills = skillsStatus === 'ready' && skillsPrompts.some((p) => skills[p.key])
  const hasFeedback = feedbackStatus === 'ready' && Boolean(feedback.reflection)
  const isEmpty = skillsStatus === 'ready' && feedbackStatus === 'ready' && !hasSkills && !hasFeedback

  return (
    <div>
      <PageHero
        eyebrow="Growth & Reflections"
        title="Growth & Reflections"
        description="How our clinical skills developed and the feedback that shaped us along the way."
      />

      <div className="space-y-6">
        {hasSkills && (
          <Reveal>
            <Section variant="showcase" title="Clinical Skills & Clerkship Readiness">
              <div className="space-y-6">
                {skillsPrompts.map((p) => (
                  <ShowcaseAnswer key={p.key} label={p.label} value={skills[p.key]} feature={p.feature} />
                ))}
              </div>
            </Section>
          </Reveal>
        )}

        {hasFeedback && (
          <Reveal>
            <Section variant="showcase" title="Feedback & Action Plan">
              <ShowcaseAnswer
                label="Feedback that was most helpful, and how we responded to it"
                value={feedback.reflection}
                feature
              />
            </Section>
          </Reveal>
        )}

        {isEmpty && (
          <p className="text-sm text-ink-400 italic">
            Reflections will appear here once the group starts adding them.
          </p>
        )}
      </div>
    </div>
  )
}
