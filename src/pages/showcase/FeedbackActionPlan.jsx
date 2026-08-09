import PageHero from '../../components/PageHero'
import ShowcaseDepartmentPrompts from '../../components/ShowcaseDepartmentPrompts'

const promptLabel = 'What feedback was most helpful to our group, and what specific changes did we make after receiving it?'
const prompts = [{ key: 'feedback_action_plan.reflection', label: promptLabel, feature: true }]

export default function FeedbackActionPlan() {
  return (
    <div>
      <PageHero
        eyebrow="Feedback & Action Plan"
        title="Feedback & Action Plan"
        description="Feedback we received during the rotation, and the changes we made in response, by department."
      />

      <ShowcaseDepartmentPrompts prompts={prompts} />
    </div>
  )
}
