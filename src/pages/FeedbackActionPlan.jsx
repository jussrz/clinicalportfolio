import PageHero from '../components/PageHero'
import DepartmentPromptCards from '../components/DepartmentPromptCards'

const promptLabel = 'What feedback was most helpful to our group, and what specific changes did we make after receiving it?'
const prompts = [{ key: 'feedback_action_plan.reflection', label: promptLabel, feature: true }]

export default function FeedbackActionPlan() {
  return (
    <div>
      <PageHero
        size="compact"
        eyebrow="Feedback and Action Plan"
        title="Feedback & Action Plan"
        description="Feedback received and the group's response, answered separately by each department."
      />

      <DepartmentPromptCards
        prompts={prompts}
        pdfTitle={(deptName) => `${deptName} — Feedback & Action Plan`}
        filenamePrefix="feedback_action_plan"
      />
    </div>
  )
}
