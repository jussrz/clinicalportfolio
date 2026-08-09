import PageHero from '../../components/PageHero'
import ShowcaseDepartmentPrompts from '../../components/ShowcaseDepartmentPrompts'

const skillsPrompts = [
  { key: 'clinical_skills.confident_skills', label: 'Skills our group is becoming confident in' },
  { key: 'clinical_skills.skills_to_practice', label: 'Skills our group needs to practice more before clerkship' },
  { key: 'clinical_skills.improvement_plan', label: 'Plan to improve these skills', feature: true },
]

export default function ClinicalSkills() {
  return (
    <div>
      <PageHero
        eyebrow="Clinical Skills & Readiness"
        title="Clinical Skills & Clerkship Readiness"
        description="How our clinical skills developed across the rotation, by department."
      />

      <ShowcaseDepartmentPrompts prompts={skillsPrompts} />
    </div>
  )
}
