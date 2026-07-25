import PageHero from '../../components/PageHero'
import Reveal from '../../components/Reveal'
import { LoadState, Section } from '../../components/ui'
import ShowcaseAnswer from '../../components/ShowcaseAnswer'
import { useSupabaseTable } from '../../lib/useSupabaseTable'
import { useSupabaseRecord } from '../../lib/useSupabaseRecord'
import { GROUP_NAME } from '../../data/group'

const groupPrompts = [
  { key: 'meaningful_experience', label: 'Our most meaningful clinical learning experience', feature: true },
  { key: 'patients_caregivers', label: 'What we learned about working with patients and caregivers' },
  { key: 'healthcare_team', label: 'What we learned about working with the healthcare team' },
  { key: 'workflows', label: 'What we learned about hospital or community health workflows' },
  { key: 'clinical_reasoning', label: 'How our clinical reasoning skills improved' },
  { key: 'challenges', label: 'What challenged us as a group' },
  { key: 'task_management', label: 'How we managed group tasks and responsibilities' },
  { key: 'improvements', label: 'What we should improve before clerkship' },
]

function initials(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  return parts.slice(0, 2).map((p) => p[0].toUpperCase()).join('')
}

function MemberCard({ name, bio }) {
  return (
    <div className="rounded-2xl border border-ink-200/70 bg-white card-shadow p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <div className="shrink-0 w-11 h-11 grid place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white font-display font-semibold">
          {initials(name)}
        </div>
        <p className="font-display text-base font-semibold text-ink-900">{name}</p>
      </div>
      <p className="text-sm text-ink-600 mt-3 leading-relaxed whitespace-pre-line">
        {bio || <span className="text-ink-400 italic">Contribution summary coming soon.</span>}
      </p>
    </div>
  )
}

export default function Team() {
  const { rows, status, error } = useSupabaseTable('individual_contributions', { orderBy: 'created_at', ascending: true })
  const { record: groupReflections, status: groupStatus } = useSupabaseRecord('group_reflections', 1)
  const hasGroup = groupStatus === 'ready' && groupPrompts.some((p) => groupReflections[p.key])

  return (
    <div>
      <PageHero
        eyebrow="Team"
        title="Meet the Team"
        description={`The students of ${GROUP_NAME} and what each contributed to this rotation.`}
      />

      <div className="mb-10">
        <LoadState status={status} error={error}>
          {rows.length === 0 ? (
            <p className="text-sm text-ink-400 italic">
              Team bios will appear here once the group adds their contributions.
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {rows.map((row, i) => (
                <Reveal key={row.id} delay={i * 50}>
                  <MemberCard name={row.student_name || 'Unnamed student'} bio={row.contribution_summary} />
                </Reveal>
              ))}
            </div>
          )}
        </LoadState>
      </div>

      {hasGroup && (
        <Reveal>
          <Section variant="showcase" title="Group Reflections">
            <div className="space-y-7">
              {groupPrompts.map((p) => (
                <ShowcaseAnswer key={p.key} label={p.label} value={groupReflections[p.key]} feature={p.feature} />
              ))}
            </div>
          </Section>
        </Reveal>
      )}
    </div>
  )
}
