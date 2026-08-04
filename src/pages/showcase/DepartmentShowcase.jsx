import { useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import PageHero from '../../components/PageHero'
import Reveal from '../../components/Reveal'
import { Icon } from '../../components/Icon'
import { LoadState, Modal } from '../../components/ui'
import ShowcaseAnswer from '../../components/ShowcaseAnswer'
import { departmentBySlug } from '../../data/departments'
import { useDepartmentNotes } from '../../lib/useDepartmentNotes'
import { useDepartmentCases } from '../../lib/useDepartmentCases'

const fields = [
  { key: 'objectives', title: 'Department-Specific Objectives', icon: 'compass' },
  { key: 'cases', title: 'Cases Seen or Discussed', icon: 'table' },
  { key: 'conditions', title: 'Common Conditions Encountered', icon: 'activity' },
  { key: 'skills', title: 'Skills Observed or Practiced', icon: 'presentation' },
  { key: 'learning_points', title: 'Key Learning Points', icon: 'list' },
  { key: 'reflection', title: 'Department-Specific Reflection', icon: 'message', feature: true },
]
// "cases" is excluded from department_notes — it's derived live from the
// Group Case Log Census (see useDepartmentCases) instead of hand-typed.
const sectionKeys = fields.filter((f) => f.key !== 'cases').map((f) => f.key)

export default function DepartmentShowcase() {
  const { slug } = useParams()
  const dept = departmentBySlug(slug)
  if (!dept) return <Navigate to="/" replace />
  // Key forces a full remount on slug change so hook state never leaks
  // stale content from the previously-viewed department.
  return <DepartmentShowcaseContent key={slug} slug={slug} dept={dept} />
}

/** One section per card, always rendered — even with no content yet, so the
 * page always communicates the full shape of what this department covers,
 * rather than collapsing to a single "nothing yet" line. Cards with content
 * are clickable (teaser preview, full text in a modal), same interaction as
 * the Schedule/Case-Topics cards on the Rotation Overview page; empty cards
 * aren't clickable since there's nothing to expand. */
function DepartmentCard({ field, value, delay, onOpen }) {
  const header = (
    <div className="flex items-center gap-3 mb-4">
      <div className="shrink-0 w-10 h-10 grid place-items-center rounded-xl bg-brand-50 text-brand-700">
        <Icon name={field.icon} className="w-5 h-5" />
      </div>
      <p className="font-display text-base font-semibold text-ink-900">{field.title}</p>
    </div>
  )

  return (
    <Reveal delay={delay} className="h-full">
      {value ? (
        <button
          type="button"
          onClick={onOpen}
          className="relative h-full w-full text-left rounded-2xl border border-ink-200/70 bg-white card-shadow card-shadow-hover overflow-hidden p-5 sm:p-6"
        >
          <span className="accent-bar-top" />
          {header}
          <p className="text-sm text-ink-600 leading-relaxed line-clamp-4 whitespace-pre-line break-words">{value}</p>
        </button>
      ) : (
        <div className="relative h-full rounded-2xl border border-ink-200/70 bg-white card-shadow overflow-hidden p-5 sm:p-6">
          <span className="accent-bar-top" />
          {header}
          <p className="text-sm text-ink-400 italic">Not yet added.</p>
        </div>
      )}
    </Reveal>
  )
}

function DepartmentShowcaseContent({ slug, dept }) {
  const { values, status } = useDepartmentNotes(slug, sectionKeys)
  const { cases } = useDepartmentCases(dept.logDepartment)
  const [openKey, setOpenKey] = useState(null)
  const openField = fields.find((f) => f.key === openKey)

  const casesText = cases
    .map((c) => `${c.date_seen ? `${c.date_seen} — ` : ''}${c.working_diagnosis}`)
    .join('\n')
  const displayValues = { ...values, cases: casesText }

  return (
    <div>
      <PageHero eyebrow="Department" title={dept.name} description={dept.blurb} image={dept.image} />

      <LoadState status={status} error="Couldn't load this department's notes.">
        <div className="grid sm:grid-cols-2 gap-4">
          {fields.map((f, i) => (
            <DepartmentCard key={f.key} field={f} value={displayValues[f.key]} delay={i * 40} onOpen={() => setOpenKey(f.key)} />
          ))}
        </div>
      </LoadState>

      <Modal open={Boolean(openField)} onClose={() => setOpenKey(null)} title={openField?.title}>
        <ShowcaseAnswer value={openField ? displayValues[openField.key] : ''} feature={openField?.feature} />
      </Modal>
    </div>
  )
}
