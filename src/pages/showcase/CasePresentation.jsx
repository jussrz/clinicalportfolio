import PageHero from '../../components/PageHero'
import { LoadState, Section } from '../../components/ui'
import ShowcaseAnswer from '../../components/ShowcaseAnswer'
import { useSupabaseRecord } from '../../lib/useSupabaseRecord'

const presentationPrompts = [
  { key: 'qna_questions', label: 'What questions were raised during the Q&A?' },
  { key: 'strong_parts', label: 'Which parts of our presentation were strong?' },
  { key: 'needs_improvement', label: 'Which parts needed improvement?' },
  { key: 'corrections_learned', label: 'What corrections or additional learning points did we gain after faculty feedback?' },
  { key: 'next_improvements', label: 'How will we improve our next case presentation?', feature: true },
]

export default function CasePresentation() {
  const { record, status, error } = useSupabaseRecord('case_presentation', 1)
  const hasContent = status === 'ready' && presentationPrompts.some((p) => record[p.key])

  return (
    <div>
      <PageHero
        eyebrow="Case Presentation"
        title="Case Presentation"
        description="Reflections on presenting our selected cases to faculty and peers."
      />

      <LoadState status={status} error={error}>
        {!hasContent ? (
          <p className="text-sm text-ink-400 italic">
            Our case presentation reflection will appear here once the group adds it.
          </p>
        ) : (
          <Section variant="showcase">
            <div className="space-y-6">
              {presentationPrompts.map((p) => (
                <ShowcaseAnswer key={p.key} label={p.label} value={record[p.key]} feature={p.feature} />
              ))}
            </div>
          </Section>
        )}
      </LoadState>
    </div>
  )
}
