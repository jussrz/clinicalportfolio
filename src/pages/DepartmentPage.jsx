import { Navigate, useParams } from 'react-router-dom'
import { EditBar, LoadState, PageActions, Section } from '../components/ui'
import PageHero from '../components/PageHero'
import Reveal from '../components/Reveal'
import PromptGroup from '../components/PromptGroup'
import { departmentBySlug } from '../data/departments'
import { useDepartmentNotes } from '../lib/useDepartmentNotes'
import { useDepartmentCases } from '../lib/useDepartmentCases'
import { useEditableFields } from '../lib/useEditableFields'

// "Cases Seen or Discussed" isn't in here — it's rendered separately, always
// read-only, sourced live from the Group Case Log Census instead of typed by
// hand (see CasesSeenSection below).
const fieldsBeforeCases = [
  { key: 'objectives', label: 'Department-Specific Objectives', minRows: 4 },
]
const fieldsAfterCases = [
  { key: 'conditions', label: 'Common Conditions Encountered', minRows: 3 },
  { key: 'skills', label: 'Skills Observed or Practiced', minRows: 3 },
  { key: 'learning_points', label: 'Key Learning Points', minRows: 3 },
  { key: 'reflection', label: 'Department-Specific Reflection', minRows: 4 },
]
const sectionKeys = [...fieldsBeforeCases, ...fieldsAfterCases].map((f) => f.key)

function CasesSeenSection({ cases }) {
  return (
    <div>
      <p className="flex items-baseline gap-2 font-display text-[15px] font-semibold text-ink-900 mb-2.5">
        <span className="w-4 h-[3px] shrink-0 rounded-full bg-brand-500 translate-y-[-3px]" />
        Cases Seen or Discussed
      </p>
      {cases.length > 0 ? (
        <ul className="max-w-2xl space-y-1 text-[15px] leading-relaxed text-ink-700 list-disc list-inside">
          {cases.map((c) => (
            <li key={c.id}>{c.date_seen ? `${c.date_seen} — ` : ''}{c.working_diagnosis}</li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-ink-300 italic">No cases logged for this department yet.</p>
      )}
    </div>
  )
}

export default function DepartmentPage() {
  const { slug } = useParams()
  const dept = departmentBySlug(slug)
  if (!dept) return <Navigate to="/studio" replace />
  // Key forces a full remount on slug change so hook state never leaks
  // stale content from the previously-viewed department.
  return <DepartmentPageContent key={slug} slug={slug} dept={dept} />
}

function DepartmentPageContent({ slug, dept }) {
  const { values, status, saveState, setSection, flush } = useDepartmentNotes(slug, sectionKeys)
  const { editing, draft, start, cancel, set, save, saving } = useEditableFields(values, setSection, flush)
  const { cases } = useDepartmentCases(dept.logDepartment)

  return (
    <div>
      <PageHero
        eyebrow="Department"
        title={dept.name}
        description={dept.blurb}
        image={dept.image}
        actions={<PageActions editing={editing} onEdit={start} />}
      />

      <Reveal>
        <Section variant="showcase">
          <LoadState status={status} error="Couldn't load this department's notes.">
            <div className="space-y-8">
              <PromptGroup prompts={fieldsBeforeCases} values={editing ? draft : values} editing={editing} onChange={set} />
              <CasesSeenSection cases={cases} />
              <PromptGroup prompts={fieldsAfterCases} values={editing ? draft : values} editing={editing} onChange={set} />
              <EditBar editing={editing} onCancel={cancel} onSave={save} saving={saving} saveState={saveState} />
            </div>
          </LoadState>
        </Section>
      </Reveal>
    </div>
  )
}
