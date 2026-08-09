import PageHero from '../../components/PageHero'
import ShowcaseDepartmentPrompts from '../../components/ShowcaseDepartmentPrompts'

const groupPrompts = [
  { key: 'group_reflections.meaningful_experience', label: 'Our most meaningful clinical learning experience', feature: true },
  { key: 'group_reflections.patients_caregivers', label: 'What we learned about working with patients and caregivers' },
  { key: 'group_reflections.healthcare_team', label: 'What we learned about working with the healthcare team' },
  { key: 'group_reflections.workflows', label: 'What we learned about hospital or community health workflows' },
  { key: 'group_reflections.clinical_reasoning', label: 'How our clinical reasoning skills improved' },
  { key: 'group_reflections.challenges', label: 'What challenged us as a group' },
  { key: 'group_reflections.task_management', label: 'How we managed group tasks and responsibilities' },
  { key: 'group_reflections.improvements', label: 'What we should improve before clerkship' },
]

export default function GroupReflections() {
  return (
    <div>
      <PageHero
        eyebrow="Group Reflections"
        title="Group Reflections"
        description="Structured reflections across the whole rotation, by department."
      />

      <ShowcaseDepartmentPrompts prompts={groupPrompts} />
    </div>
  )
}
