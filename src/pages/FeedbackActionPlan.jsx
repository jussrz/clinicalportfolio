import { Area, LoadState, PageHeader, SaveStatus, Section } from '../components/ui'
import { useSupabaseRecord } from '../lib/useSupabaseRecord'

export default function FeedbackActionPlan() {
  const { record, status, saveState, setField } = useSupabaseRecord('feedback_action_plan', 1)

  return (
    <div>
      <PageHeader
        eyebrow="Feedback and Action Plan"
        title="Feedback & Action Plan"
        description="Feedback received by the group and the group's response."
      />

      <Section>
        <LoadState status={status === 'error' ? 'error' : 'ready'} error="Couldn't load this page's data.">
          <div className="space-y-6">
            <Area
              label="What feedback was most helpful to our group, and what specific changes did we make after receiving it?"
              value={record.reflection ?? ''}
              onChange={(e) => setField('reflection', e.target.value)}
              minRows={4}
            />
            <div className="h-4"><SaveStatus state={saveState} /></div>
          </div>
        </LoadState>
      </Section>
    </div>
  )
}
