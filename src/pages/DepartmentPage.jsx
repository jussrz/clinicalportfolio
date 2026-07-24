import { Navigate, useParams } from 'react-router-dom'
import { Area, EditBar, LoadState, PageActions, Section } from '../components/ui'
import PageHero from '../components/PageHero'
import Reveal from '../components/Reveal'
import { departmentBySlug } from '../data/departments'
import { useDepartmentNotes } from '../lib/useDepartmentNotes'
import { useEditableFields } from '../lib/useEditableFields'

const fields = [
  { key: 'objectives', title: 'Department-Specific Objectives', minRows: 4 },
  { key: 'cases', title: 'Cases Seen or Discussed', minRows: 3 },
  { key: 'conditions', title: 'Common Conditions Encountered', minRows: 3 },
  { key: 'skills', title: 'Skills Observed or Practiced', minRows: 3 },
  { key: 'learning_points', title: 'Key Learning Points', minRows: 3 },
  { key: 'reflection', title: 'Department-Specific Reflection', minRows: 4 },
]
const sectionKeys = fields.map((f) => f.key)

export default function DepartmentPage() {
  const { slug } = useParams()
  const dept = departmentBySlug(slug)
  if (!dept) return <Navigate to="/" replace />
  // Key forces a full remount on slug change so hook state never leaks
  // stale content from the previously-viewed department.
  return <DepartmentPageContent key={slug} slug={slug} dept={dept} />
}

function DepartmentPageContent({ slug, dept }) {
  const { values, status, saveState, setSection, flush } = useDepartmentNotes(slug, sectionKeys)
  const { editing, draft, start, cancel, set, save, saving } = useEditableFields(values, setSection, flush)
  const shown = editing ? draft : values

  return (
    <div>
      <PageHero
        eyebrow="Department"
        title={dept.name}
        description={dept.blurb}
        image={dept.image}
        actions={<PageActions editing={editing} onEdit={start} />}
      />

      <LoadState status={status} error="Couldn't load this department's notes.">
        <div className="space-y-6">
          {fields.map((f, i) => (
            <Reveal key={f.key} delay={i * 40}>
              <Section variant="showcase" title={f.title}>
                {editing ? (
                  <Area
                    value={draft[f.key] ?? ''}
                    onChange={(e) => set(f.key, e.target.value)}
                    minRows={f.minRows}
                  />
                ) : shown[f.key] ? (
                  <p className="text-[15px] leading-relaxed text-ink-700 whitespace-pre-line">{shown[f.key]}</p>
                ) : (
                  <p className="text-sm text-ink-300 italic">Not filled in yet.</p>
                )}
              </Section>
            </Reveal>
          ))}
          <EditBar editing={editing} onCancel={cancel} onSave={save} saving={saving} saveState={saveState} />
        </div>
      </LoadState>
    </div>
  )
}
