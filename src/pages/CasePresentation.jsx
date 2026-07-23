import { Area, Field, FieldRow, PageHeader, Section } from '../components/ui'
import { useLocalStorage } from '../lib/useLocalStorage'

export default function CasePresentation() {
  const [title, setTitle] = useLocalStorage('presentation.title', '')
  const [date, setDate] = useLocalStorage('presentation.date', '')
  const [presenters, setPresenters] = useLocalStorage('presentation.presenters', '')
  const [qna, setQna] = useLocalStorage('presentation.qna', '')
  const [strengths, setStrengths] = useLocalStorage('presentation.strengths', '')
  const [improvements, setImprovements] = useLocalStorage('presentation.improvements', '')
  const [corrections, setCorrections] = useLocalStorage('presentation.corrections', '')
  const [nextSteps, setNextSteps] = useLocalStorage('presentation.nextSteps', '')

  return (
    <div>
      <PageHeader
        eyebrow="Case Presentation"
        title="Case Presentation"
        description="This page documents the group's formal case presentation and the reflection that followed."
      />

      <div className="space-y-6">
        <Section title="Presentation Details">
          <div className="space-y-4">
            <Field label="Case / Topic Presented" placeholder="e.g., A case of community-acquired pneumonia" value={title} onChange={(e) => setTitle(e.target.value)} />
            <FieldRow>
              <Field label="Date Presented" placeholder="DD/MM/YYYY" value={date} onChange={(e) => setDate(e.target.value)} />
              <Field label="Presenters" placeholder="Names of group members who presented" value={presenters} onChange={(e) => setPresenters(e.target.value)} />
            </FieldRow>
          </div>
        </Section>

        <Section title="Post-Presentation Reflection">
          <div className="space-y-5">
            <Area label="What questions were raised during the Q&A?" value={qna} onChange={(e) => setQna(e.target.value)} minRows={3} />
            <Area label="Which parts of our presentation were strong?" value={strengths} onChange={(e) => setStrengths(e.target.value)} minRows={3} />
            <Area label="Which parts needed improvement?" value={improvements} onChange={(e) => setImprovements(e.target.value)} minRows={3} />
            <Area label="What corrections or additional learning points did we gain after faculty feedback?" value={corrections} onChange={(e) => setCorrections(e.target.value)} minRows={3} />
            <Area label="How will we improve our next case presentation?" value={nextSteps} onChange={(e) => setNextSteps(e.target.value)} minRows={3} />
          </div>
        </Section>
      </div>
    </div>
  )
}
