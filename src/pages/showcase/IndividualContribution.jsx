import { Link } from 'react-router-dom'
import PageHero from '../../components/PageHero'
import Reveal from '../../components/Reveal'
import { LoadState } from '../../components/ui'
import { useSupabaseTable } from '../../lib/useSupabaseTable'
import { initials } from '../../lib/avatar'
import { GROUP_NAME, studentFullName } from '../../data/group'

/** Cards only show a name and photo — the actual contribution content (cases
 * logged plus any written reflection) lives on that student's own detail
 * page, same click-through-to-a-page pattern as Selected Case Reflections. */
function MemberCard({ name, photoUrl, to }) {
  return (
    <Link
      to={to}
      className="w-full text-left rounded-2xl border border-ink-200/70 bg-white card-shadow card-shadow-hover p-5 sm:p-6 block"
    >
      <div className="flex items-center gap-3">
        {photoUrl ? (
          <img src={photoUrl} alt="" className="shrink-0 w-11 h-11 rounded-full object-cover" />
        ) : (
          <div className="shrink-0 w-11 h-11 grid place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white font-display font-semibold">
            {initials(name)}
          </div>
        )}
        <p className="font-display text-base font-semibold text-ink-900">{name}</p>
      </div>
    </Link>
  )
}

export default function IndividualContribution() {
  const { rows, status, error } = useSupabaseTable('individual_contributions', { orderBy: 'created_at', ascending: true })

  return (
    <div>
      <PageHero
        eyebrow="Individual Contribution"
        title="Individual Contribution"
        description={`What each student in ${GROUP_NAME} contributed to this rotation.`}
      />

      <LoadState status={status} error={error}>
        {rows.length === 0 ? (
          <p className="text-sm text-ink-400 italic">
            Individual contributions will appear here once the group adds them.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rows.map((row, i) => (
              <Reveal key={row.id} delay={i * 50}>
                <MemberCard
                  name={row.student_name ? studentFullName(row.student_name) : 'Unnamed student'}
                  photoUrl={row.photo_url}
                  to={`/individual-contribution/${row.id}`}
                />
              </Reveal>
            ))}
          </div>
        )}
      </LoadState>
    </div>
  )
}
