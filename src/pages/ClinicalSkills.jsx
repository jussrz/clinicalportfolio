import PageHero from '../components/PageHero'
import DepartmentPromptCards from '../components/DepartmentPromptCards'

const prompts = [
  { key: 'clinical_skills.confident_skills', label: 'Skills our group is becoming confident in' },
  { key: 'clinical_skills.skills_to_practice', label: 'Skills our group needs to practice more before clerkship' },
  { key: 'clinical_skills.improvement_plan', label: 'Plan to improve these skills', feature: true },
]

export default function ClinicalSkills() {
  return (
    <div>
      <PageHero
        size="compact"
        eyebrow="Clinical Skills and Clerkship Readiness"
        title="Clinical Skills & Clerkship Readiness"
        description="Exposure to core clinical skills across the rotation, reflected on separately by each department."
      />

      <DepartmentPromptCards
        prompts={prompts}
        pdfTitle={(deptName) => `${deptName} — Clinical Skills & Clerkship Readiness`}
        filenamePrefix="clinical_skills"
      />
    </div>
  )
}
