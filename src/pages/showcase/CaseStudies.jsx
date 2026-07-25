import PageHero from '../../components/PageHero'
import Reveal from '../../components/Reveal'
import { Section, Table } from '../../components/ui'
import CaseStudyCard from '../../components/CaseStudyCard'
import ShowcaseAnswer from '../../components/ShowcaseAnswer'
import { useCaseStudies } from '../../lib/useCaseStudies'
import { useSupabaseRecord } from '../../lib/useSupabaseRecord'
import { useSupabaseTable } from '../../lib/useSupabaseTable'
import { roleLabel } from '../../lib/caseLog'

const presentationPrompts = [
  { key: 'qna_questions', label: 'What questions were raised during the Q&A?' },
  { key: 'strong_parts', label: 'Which parts of our presentation were strong?' },
  { key: 'needs_improvement', label: 'Which parts needed improvement?' },
  { key: 'corrections_learned', label: 'What corrections or additional learning points did we gain after faculty feedback?' },
  { key: 'next_improvements', label: 'How will we improve our next case presentation?', feature: true },
]

export default function CaseStudies() {
  const { caseStudies, status } = useCaseStudies()
  const { record: presentation, status: presentationStatus } = useSupabaseRecord('case_presentation', 1)
  const { rows: caseLog, status: caseLogStatus } = useSupabaseTable('case_log_entries', { orderBy: 'date_seen', ascending: false })

  const hasPresentationContent = presentationStatus === 'ready' && presentationPrompts.some((p) => presentation[p.key])

  return (
    <div>
      <PageHero
        eyebrow="Case Studies"
        title="Case Studies"
        description="Clinical cases we chose to explore in depth — the presentation, our reasoning, and what we took away from each one."
      />

      {status === 'ready' && caseStudies.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {caseStudies.map(({ reflection, caseEntry }, i) => (
            <Reveal key={reflection.id} delay={i * 50}>
              <CaseStudyCard reflection={reflection} caseEntry={caseEntry} />
            </Reveal>
          ))}
        </div>
      ) : (
        status === 'ready' && (
          <p className="text-sm text-ink-400 italic mb-10">
            Case studies will appear here once the group completes their case reflections.
          </p>
        )
      )}

      {hasPresentationContent && (
        <Reveal className="mb-6">
          <Section variant="showcase" title="Presenting Our Cases" subtitle="Reflections on presenting to faculty and peers">
            <div className="space-y-6">
              {presentationPrompts.map((p) => (
                <ShowcaseAnswer key={p.key} label={p.label} value={presentation[p.key]} feature={p.feature} />
              ))}
            </div>
          </Section>
        </Reveal>
      )}

      {caseLogStatus === 'ready' && caseLog.length > 0 && (
        <Reveal>
          <details className="group rounded-2xl border border-ink-200/70 bg-white card-shadow overflow-hidden">
            <summary className="cursor-pointer select-none px-5 sm:px-7 py-4 font-display text-base font-semibold text-ink-900 flex items-center justify-between">
              Full Case Log ({caseLog.length} {caseLog.length === 1 ? 'entry' : 'entries'})
              <span className="text-ink-400 text-sm font-normal group-open:hidden">Show</span>
              <span className="text-ink-400 text-sm font-normal hidden group-open:inline">Hide</span>
            </summary>
            <div className="px-5 sm:px-7 pb-6 border-t border-ink-100 pt-5">
              <Table minWidth="880px">
                <thead>
                  <tr>
                    <th>No.</th>
                    <th>Date Seen</th>
                    <th>Department</th>
                    <th>Clinical Area</th>
                    <th>Chief Complaint</th>
                    <th>Working Diagnosis</th>
                    <th>Student Role</th>
                  </tr>
                </thead>
                <tbody>
                  {caseLog.map((row, i) => (
                    <tr key={row.id}>
                      <td className="text-ink-400">{i + 1}</td>
                      <td className="whitespace-nowrap">{row.date_seen || '—'}</td>
                      <td>{row.department || '—'}</td>
                      <td>{row.clinical_area || '—'}</td>
                      <td>{row.chief_complaint || '—'}</td>
                      <td>{row.working_diagnosis || '—'}</td>
                      <td>{roleLabel(row) || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </details>
        </Reveal>
      )}
    </div>
  )
}
