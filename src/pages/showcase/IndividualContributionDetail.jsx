import { Link, useParams } from 'react-router-dom'
import PageHero from '../../components/PageHero'
import CaseLogTable from '../../components/CaseLogTable'
import { Icon } from '../../components/Icon'
import { LoadState, Notice } from '../../components/ui'
import { useSupabaseTable } from '../../lib/useSupabaseTable'
import { useIndividualCases } from '../../lib/useIndividualCases'
import { studentFullName } from '../../data/group'

const REFLECTION_PROMPTS = [
  ['common_cases', 'Most common cases/conditions encountered'],
  ['skills_observed', 'Skills I was able to observe or practice'],
  ['lesson_learned', 'One clinical lesson I learned from this rotation'],
  ['area_to_improve', 'One area I need to improve before clerkship'],
]

/** Top-left back navigation, above the page's own title — same placement
 * convention as the Case Study detail page's BackLink. */
function BackLink() {
  return (
    <Link
      to="/individual-contribution"
      className="inline-flex items-center gap-1.5 mb-4 text-sm font-medium text-ink-500 hover:text-brand-700 transition-colors"
    >
      <Icon name="chevron" className="w-4 h-4 rotate-180" />
      Back to Individual Contribution
    </Link>
  )
}

export default function IndividualContributionDetail() {
  const { id } = useParams()
  const { rows, status, error } = useSupabaseTable('individual_contributions', { orderBy: 'created_at', ascending: true })
  const row = rows.find((r) => r.id === id)
  const { cases } = useIndividualCases(row?.student_name)

  const hasReflection = row && (row.year_level_section || REFLECTION_PROMPTS.some(([key]) => row[key]))

  return (
    <div>
      <BackLink />
      <LoadState status={status} error={error}>
        {!row ? (
          <Notice tone="amber" title="Student not found">
            This student's contribution card may have been removed, or the link is incorrect.
          </Notice>
        ) : (
          <>
            <PageHero
              eyebrow="Individual Contribution"
              title={row.student_name ? studentFullName(row.student_name) : 'Unnamed student'}
              description={row.year_level_section || undefined}
              image={row.photo_url || undefined}
            />

            <div className="space-y-6">
              {cases.length > 0 ? (
                <CaseLogTable rows={cases} title={`Case Logs (${cases.length} ${cases.length === 1 ? 'entry' : 'entries'})`} />
              ) : (
                <p className="text-sm text-ink-400 italic">No cases logged for this student yet.</p>
              )}

              {hasReflection && (
                <div className="rounded-2xl border border-ink-200/70 bg-white card-shadow p-5 sm:p-6 space-y-5">
                  <p className="font-display text-base font-semibold text-ink-900">Student Reflection</p>
                  {REFLECTION_PROMPTS.map(([key, label]) => row[key] && (
                    <div key={key}>
                      <p className="text-sm font-semibold text-ink-800">{label}</p>
                      <p className="text-sm text-ink-600 whitespace-pre-line mt-0.5 break-words">{row[key]}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </LoadState>
    </div>
  )
}
