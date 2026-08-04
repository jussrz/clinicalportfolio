import { useMemo } from 'react'
import PageHero from '../../components/PageHero'
import Reveal from '../../components/Reveal'
import CaseStudyCard from '../../components/CaseStudyCard'
import CaseLogTable from '../../components/CaseLogTable'
import { LoadState } from '../../components/ui'
import { useCaseStudies } from '../../lib/useCaseStudies'
import { useSupabaseTable } from '../../lib/useSupabaseTable'

export default function CaseReflections() {
  const { caseStudies, status, error } = useCaseStudies()
  const { rows: caseLog, status: caseLogStatus } = useSupabaseTable('case_log_entries', { orderBy: 'date_seen', ascending: false })

  // case_log_entry id -> reflection id, so the full log table below can link
  // straight from a logged case to its Selected Case Reflection, if it has one.
  const selectionMap = useMemo(
    () =>
      Object.fromEntries(
        caseStudies.filter((cs) => cs.caseEntry).map((cs) => [cs.caseEntry.id, cs.reflection.id])
      ),
    [caseStudies]
  )

  return (
    <div>
      <PageHero
        eyebrow="Selected Case Reflections"
        title="Selected Case Reflections"
        description="Cases we chose from the census for deeper group discussion — our reasoning, and what we took away from each one."
      />

      <LoadState status={status} error={error}>
        {caseStudies.length === 0 ? (
          <p className="text-sm text-ink-400 italic mb-10">
            Selected case reflections will appear here once the group completes them.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            {caseStudies.map(({ reflection, caseEntry }, i) => (
              <Reveal key={reflection.id} delay={i * 50}>
                <CaseStudyCard reflection={reflection} caseEntry={caseEntry} />
              </Reveal>
            ))}
          </div>
        )}
      </LoadState>

      {caseLogStatus === 'ready' && caseLog.length > 0 && (
        <CaseLogTable rows={caseLog} selectionMap={selectionMap} />
      )}
    </div>
  )
}
