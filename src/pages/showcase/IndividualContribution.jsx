import { useState } from 'react'
import PageHero from '../../components/PageHero'
import Reveal from '../../components/Reveal'
import { LoadState, Modal } from '../../components/ui'
import { useSupabaseTable } from '../../lib/useSupabaseTable'
import { GROUP_NAME } from '../../data/group'

function initials(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  return parts.slice(0, 2).map((p) => p[0].toUpperCase()).join('')
}

/** Clickable when there's a bio to expand (opens the full text in a modal,
 * same click-to-expand pattern as the Department page's cards); static
 * otherwise, since there's nothing to expand into. */
function MemberCard({ name, bio, onOpen }) {
  const header = (
    <div className="flex items-center gap-3">
      <div className="shrink-0 w-11 h-11 grid place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white font-display font-semibold">
        {initials(name)}
      </div>
      <p className="font-display text-base font-semibold text-ink-900">{name}</p>
    </div>
  )

  if (!bio) {
    return (
      <div className="rounded-2xl border border-ink-200/70 bg-white card-shadow p-5 sm:p-6">
        {header}
        <p className="text-sm text-ink-400 italic mt-3">Contribution summary coming soon.</p>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full text-left rounded-2xl border border-ink-200/70 bg-white card-shadow card-shadow-hover p-5 sm:p-6"
    >
      {header}
      <p className="text-sm text-ink-600 mt-3 leading-relaxed line-clamp-4 whitespace-pre-line break-words">{bio}</p>
    </button>
  )
}

export default function IndividualContribution() {
  const { rows, status, error } = useSupabaseTable('individual_contributions', { orderBy: 'created_at', ascending: true })
  const [openRow, setOpenRow] = useState(null)

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
                  name={row.student_name || 'Unnamed student'}
                  bio={row.contribution_summary}
                  onOpen={() => setOpenRow(row)}
                />
              </Reveal>
            ))}
          </div>
        )}
      </LoadState>

      <Modal
        open={Boolean(openRow)}
        onClose={() => setOpenRow(null)}
        title={openRow?.student_name || 'Unnamed student'}
      >
        <p className="text-sm text-ink-700 leading-relaxed whitespace-pre-line break-words">
          {openRow?.contribution_summary}
        </p>
      </Modal>
    </div>
  )
}
