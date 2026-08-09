import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import CaseLogTable from '../../components/CaseLogTable'
import { Icon } from '../../components/Icon'
import { LoadState, Notice } from '../../components/ui'
import { DepartmentReflectionCard } from '../../components/DepartmentReflectionCard'
import { useSupabaseTable } from '../../lib/useSupabaseTable'
import { useIndividualCases } from '../../lib/useIndividualCases'
import { initials } from '../../lib/avatar'
import { departments } from '../../data/departments'
import { studentFullName } from '../../data/group'

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

/** Split-card profile hero: a photo pane on one side, name/badge on the
 * other, on a plain white surface — reads as an editorial masthead rather
 * than a cropped photo forced into a dark banner. Photo pane comes first in
 * markup (left on desktop, on top when stacked on mobile). */
function ProfileHero({ name, subtitle, photoUrl }) {
  return (
    <div className="relative rounded-2xl border border-ink-200/70 bg-white overflow-hidden mb-6 card-shadow">
      <div className="grid sm:grid-cols-[1fr_1.15fr]">
        <div className="relative min-h-[220px] sm:min-h-[260px]">
          {photoUrl ? (
            <img src={photoUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-brand-500 to-brand-700 text-white font-display text-4xl font-semibold">
              {initials(name)}
            </div>
          )}
        </div>
        <div className="p-6 sm:p-9 flex flex-col justify-center">
          <div className="inline-flex items-center gap-2 self-start rounded-full bg-brand-50 border border-brand-200 px-3 py-1 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-600" />
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-700">Individual Contribution</p>
          </div>
          <h1 className="font-display font-semibold text-ink-900 tracking-tight text-2xl sm:text-3xl">{name}</h1>
          {subtitle && <p className="mt-3 text-[15px] text-ink-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  )
}

export default function IndividualContributionDetail() {
  const { id } = useParams()
  const { rows, status, error } = useSupabaseTable('individual_contributions', { orderBy: 'created_at', ascending: true })
  const { rows: reflectionRows, status: reflectionsStatus } = useSupabaseTable('individual_contribution_reflections', { orderBy: 'department', ascending: true })
  const [openDept, setOpenDept] = useState(null)
  const row = rows.find((r) => r.id === id)
  const { cases } = useIndividualCases(row?.student_name)
  const reflections = row ? reflectionRows.filter((r) => r.contribution_id === row.id) : []

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
            <ProfileHero
              name={row.student_name ? studentFullName(row.student_name) : 'Unnamed student'}
              subtitle={row.year_level_section}
              photoUrl={row.photo_url}
            />

            <div className="space-y-6">
              {cases.length > 0 ? (
                <CaseLogTable rows={cases} title={`Case Logs (${cases.length} ${cases.length === 1 ? 'entry' : 'entries'})`} />
              ) : (
                <p className="text-sm text-ink-400 italic">No cases logged for this student yet.</p>
              )}

              <div className="rounded-2xl border border-ink-200/70 bg-white card-shadow p-5 sm:p-6 space-y-4">
                <p className="font-display text-base font-semibold text-ink-900">Student Reflection</p>
                {reflectionsStatus === 'loading' ? (
                  <p className="text-sm text-ink-400 animate-pulse">Loading…</p>
                ) : (
                  <div className="space-y-2">
                    {departments.map((dept) => (
                      <DepartmentReflectionCard
                        key={dept.slug}
                        dept={dept}
                        reflection={reflections.find((r) => r.department === dept.slug)}
                        editable={false}
                        open={openDept === dept.slug}
                        onToggle={() => setOpenDept(openDept === dept.slug ? null : dept.slug)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </LoadState>
    </div>
  )
}
