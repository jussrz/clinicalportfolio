import PageHero from '../components/PageHero'
import DepartmentPromptCards from '../components/DepartmentPromptCards'

const prompts = [
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
        size="compact"
        eyebrow="Case Presentation"
        title="Case Presentation"
        description="Post-presentation reflection on the group's formal case presentation, answered separately by each department."
      />

      <DepartmentPromptCards
        prompts={prompts}
        pdfTitle={(deptName) => `${deptName} — Case Presentation`}
        filenamePrefix="case_presentation"
      />
    </div>
  )
}
