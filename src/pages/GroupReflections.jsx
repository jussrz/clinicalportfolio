import PageHero from '../components/PageHero'
import DepartmentPromptCards from '../components/DepartmentPromptCards'

const prompts = [
  { key: 'group_reflections.meaningful_experience', label: 'What was our most meaningful clinical learning experience?', feature: true },
  { key: 'group_reflections.patients_caregivers', label: 'What did we learn about working with patients and caregivers?' },
  { key: 'group_reflections.healthcare_team', label: 'What did we learn about working with the healthcare team?' },
  { key: 'group_reflections.workflows', label: 'What did we learn about hospital or community health workflows?' },
  { key: 'group_reflections.clinical_reasoning', label: 'What clinical reasoning skills improved in our group?' },
  { key: 'group_reflections.challenges', label: 'What challenged us as a group?' },
  { key: 'group_reflections.task_management', label: 'How did we manage group tasks and responsibilities?' },
  { key: 'group_reflections.improvements', label: 'What should we improve before clerkship?' },
]
const numberedPrompts = prompts.map((p, i) => ({ ...p, label: `${i + 1}. ${p.label}` }))

export default function GroupReflections() {
  return (
    <div>
      <PageHero
        size="compact"
        eyebrow="Group Reflections"
        title="Group Reflections"
        description="Structured reflections across the rotation, answered separately by each department."
      />

      <DepartmentPromptCards
        prompts={numberedPrompts}
        pdfTitle={(deptName) => `${deptName} — Group Reflections`}
        filenamePrefix="group_reflections"
      />
    </div>
  )
}
