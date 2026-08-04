import PageHero from '../../components/PageHero'
import { LoadState, Section } from '../../components/ui'
import ShowcaseAnswer from '../../components/ShowcaseAnswer'
import { useSupabaseRecord } from '../../lib/useSupabaseRecord'

export default function FeedbackActionPlan() {
  const { record, status, error } = useSupabaseRecord('feedback_action_plan', 1)
  const hasContent = status === 'ready' && Boolean(record.reflection)

  return (
    <div>
      <PageHero
        eyebrow="Feedback & Action Plan"
        title="Feedback & Action Plan"
        description="Feedback we received during the rotation, and the changes we made in response."
      />

      <LoadState status={status} error={error}>
        {!hasContent ? (
          <p className="text-sm text-ink-400 italic">
            Our feedback and action plan will appear here once the group adds it.
          </p>
        ) : (
          <Section variant="showcase">
            <ShowcaseAnswer
              label="Feedback that was most helpful, and how we responded to it"
              value={record.reflection}
              feature
            />
          </Section>
        )}
      </LoadState>
    </div>
  )
}
