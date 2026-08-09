import PageHero from '../../components/PageHero'
import ShowcaseDepartmentPrompts from '../../components/ShowcaseDepartmentPrompts'

const presentationPrompts = [
  { key: 'case_presentation.qna_questions', label: 'What questions were raised during the Q&A?' },
  { key: 'case_presentation.strong_parts', label: 'Which parts of our presentation were strong?' },
  { key: 'case_presentation.needs_improvement', label: 'Which parts needed improvement?' },
  { key: 'case_presentation.corrections_learned', label: 'What corrections or additional learning points did we gain after faculty feedback?' },
  { key: 'case_presentation.next_improvements', label: 'How will we improve our next case presentation?', feature: true },
]

export default function CasePresentation() {
  return (
    <div>
      <PageHero
        eyebrow="Case Presentation"
        title="Case Presentation"
        description="Reflections on presenting our selected cases to faculty and peers, by department."
      />

      <ShowcaseDepartmentPrompts prompts={presentationPrompts} />
    </div>
  )
}
