import PageHero from '../../components/PageHero'
import Reveal from '../../components/Reveal'
import CaseStudyCard from '../../components/CaseStudyCard'
import { LoadState } from '../../components/ui'
import { useCaseStudies } from '../../lib/useCaseStudies'

export default function CaseReflections() {
  const { caseStudies, status, error } = useCaseStudies()

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
    </div>
  )
}
